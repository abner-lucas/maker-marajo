<?php
/**
 * Leitor da Google Agenda pública do LabMaker Marajó.
 *
 * - Busca SOMENTE a agenda fixa abaixo (não aceita endereço vindo do navegador).
 * - Guarda em cache por 15 s para não sobrecarregar o Google.
 * - Devolve apenas título, horário, local e "dia inteiro". A descrição dos eventos
 *   NÃO é repassada, porque pode conter nome e e-mail de quem reservou.
 * - Expande eventos recorrentes (diário, semanal, mensal, anual) numa janela de
 *   45 dias para trás e 180 dias para frente.
 */

declare(strict_types=1);

require __DIR__ . '/config.php';

const AGENDA_ID = 'labmaker.breves@ifpa.edu.br';
const FUSO = 'America/Belem';
const CACHE_SEG = 15;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
header('X-Content-Type-Options: nosniff');

$fuso = new DateTimeZone(FUSO);
$cacheArq = sys_get_temp_dir() . '/labmaker-agenda-' . md5(AGENDA_ID) . '.json';

function responder(array $dados): void
{
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Cache fresco: responde direto
if (is_file($cacheArq) && (time() - filemtime($cacheArq)) < CACHE_SEG) {
    readfile($cacheArq);
    exit;
}

/*
 * 1º caminho: o Apps Script da própria conta do LabMaker. Ele enxerga também as reservas
 * privadas (que o arquivo público do Google omite) e só devolve horário e título público.
 */
if (APPS_SCRIPT_URL !== '') {
    $hojeAS = new DateTimeImmutable('today', $fuso);
    $q = http_build_query([
        'acao' => 'agenda',
        'de' => $hojeAS->modify('-45 days')->format(DATE_ATOM),
        'ate' => $hojeAS->modify('+181 days')->format(DATE_ATOM),
    ]);
    $resp = chamar_apps_script(APPS_SCRIPT_URL . '?' . $q, null, 12);
    $dadosAS = is_string($resp) ? json_decode($resp, true) : null;
    if (is_array($dadosAS) && !empty($dadosAS['ok']) && isset($dadosAS['eventos']) && is_array($dadosAS['eventos'])) {
        $lista = [];
        foreach ($dadosAS['eventos'] as $ev) {
            if (!is_array($ev) || empty($ev['inicio']) || empty($ev['fim'])) {
                continue;
            }
            $lista[] = [
                'id' => substr((string) ($ev['id'] ?? md5($ev['inicio'])), 0, 16),
                'titulo' => mb_substr((string) ($ev['titulo'] ?? 'Ocupado'), 0, 120),
                'local' => isset($ev['local']) ? mb_substr((string) $ev['local'], 0, 160) : null,
                'inicio' => (string) $ev['inicio'],
                'fim' => (string) $ev['fim'],
                'diaInteiro' => !empty($ev['diaInteiro']),
            ];
        }
        $json = json_encode([
            'ok' => true,
            'agenda' => AGENDA_ID,
            'atualizadoEm' => (new DateTimeImmutable('now', $fuso))->format(DATE_ATOM),
            'eventos' => $lista,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        @file_put_contents($cacheArq, $json, LOCK_EX);
        echo $json;
        exit;
    }
}

/* 2º caminho (reserva): arquivo público .ics do Google */
$url = 'https://calendar.google.com/calendar/ical/' . rawurlencode(AGENDA_ID) . '/public/basic.ics';
$ctx = stream_context_create([
    'http' => ['timeout' => 8, 'ignore_errors' => true, 'header' => "User-Agent: LabMakerMarajo-Agenda/1.0\r\n"],
]);
$ics = @file_get_contents($url, false, $ctx);
$status = 0;
foreach ($http_response_header ?? [] as $h) {
    if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
        $status = (int) $m[1];
    }
}

if ($ics === false || $status !== 200 || strpos($ics, 'BEGIN:VCALENDAR') === false) {
    // Falhou agora: se houver cache antigo, usa-o (melhor que tela vazia)
    if (is_file($cacheArq)) {
        $antigo = json_decode((string) file_get_contents($cacheArq), true) ?: [];
        $antigo['desatualizado'] = true;
        responder($antigo);
    }
    responder([
        'ok' => false,
        'motivo' => ($status === 404 || $status === 401 || $status === 403) ? 'agenda-nao-publica' : 'falha-ao-buscar',
        'agenda' => AGENDA_ID,
    ]);
}

/* ------------------------------------------------------------------ leitura do ICS */

$linhas = preg_split("/\r\n|\n|\r/", $ics);
$desdobradas = [];
foreach ($linhas as $l) {
    if ($l !== '' && ($l[0] === ' ' || $l[0] === "\t") && $desdobradas) {
        $desdobradas[count($desdobradas) - 1] .= substr($l, 1);
    } else {
        $desdobradas[] = $l;
    }
}

/** Agenda publicada como "livre/ocupado" manda "Busy" no lugar do título */
function titulo_publico(string $t): string
{
    $t = trim($t);
    return ($t === '' || in_array(strtolower($t), ['busy', 'ocupado', 'ocupada'], true)) ? 'Ocupado' : $t;
}

function texto(string $v): string
{
    return trim(str_replace(['\\n', '\\N', '\\,', '\\;', '\\\\'], ["\n", "\n", ',', ';', '\\'], $v));
}

/** Converte valor de data do ICS em [DateTimeImmutable, diaInteiro] */
function data(string $params, string $valor, DateTimeZone $fuso): ?array
{
    $valor = trim($valor);
    if (stripos($params, 'VALUE=DATE') !== false && strlen($valor) === 8) {
        $d = DateTimeImmutable::createFromFormat('!Ymd', $valor, $fuso);
        return $d ? [$d, true] : null;
    }
    if (substr($valor, -1) === 'Z') {
        $d = DateTimeImmutable::createFromFormat('Ymd\THis\Z', $valor, new DateTimeZone('UTC'));
        return $d ? [$d->setTimezone($fuso), false] : null;
    }
    $tz = $fuso;
    if (preg_match('/TZID=([^;:]+)/i', $params, $m)) {
        try {
            $tz = new DateTimeZone(trim($m[1], '"'));
        } catch (Exception $e) {
            $tz = $fuso;
        }
    }
    $d = DateTimeImmutable::createFromFormat('Ymd\THis', $valor, $tz);
    return $d ? [$d->setTimezone($fuso), false] : null;
}

$eventos = [];
$atual = null;
foreach ($desdobradas as $l) {
    if ($l === 'BEGIN:VEVENT') {
        $atual = ['exdate' => [], 'convidados' => 0];
        continue;
    }
    if ($l === 'END:VEVENT') {
        if ($atual !== null) {
            $eventos[] = $atual;
        }
        $atual = null;
        continue;
    }
    if ($atual === null || strpos($l, ':') === false) {
        continue;
    }
    [$chaveParams, $valor] = explode(':', $l, 2);
    $partes = explode(';', $chaveParams, 2);
    $chave = strtoupper($partes[0]);
    $params = $partes[1] ?? '';
    switch ($chave) {
        case 'UID':
            $atual['uid'] = $valor;
            break;
        case 'SUMMARY':
            $atual['titulo'] = texto($valor);
            break;
        case 'LOCATION':
            $atual['local'] = texto($valor);
            break;
        case 'STATUS':
            $atual['status'] = strtoupper(trim($valor));
            break;
        case 'DTSTART':
            $atual['inicio'] = data($params, $valor, $fuso);
            break;
        case 'DTEND':
            $atual['fim'] = data($params, $valor, $fuso);
            break;
        case 'ATTENDEE':
            // O Google lista a própria agenda como convidada; só conta gente de fora
            if (stripos($valor, AGENDA_ID) === false) {
                $atual['convidados']++;
            }
            break;
        case 'RRULE':
            $atual['rrule'] = $valor;
            break;
        case 'RECURRENCE-ID':
            $atual['recId'] = data($params, $valor, $fuso);
            break;
        case 'EXDATE':
            foreach (explode(',', $valor) as $v) {
                $d = data($params, $v, $fuso);
                if ($d) {
                    $atual['exdate'][] = $d[0]->format('Ymd\THi');
                }
            }
            break;
    }
}

/* ------------------------------------------------------------------ recorrência */

$hoje = new DateTimeImmutable('now', $fuso);
$janelaIni = $hoje->modify('-45 days')->setTime(0, 0);
$janelaFim = $hoje->modify('+180 days')->setTime(23, 59);

// Ocorrências alteradas individualmente (RECURRENCE-ID) substituem a original
$substituidas = [];
foreach ($eventos as $e) {
    if (!empty($e['recId']) && !empty($e['uid'])) {
        $substituidas[$e['uid'] . '|' . $e['recId'][0]->format('Ymd\THi')] = true;
    }
}

$DIAS = ['SU' => 0, 'MO' => 1, 'TU' => 2, 'WE' => 3, 'TH' => 4, 'FR' => 5, 'SA' => 6];

function ocorrencias(array $e, DateTimeImmutable $ini, DateTimeImmutable $fim, array $DIAS): array
{
    $inicio = $e['inicio'][0];
    if (empty($e['rrule'])) {
        return [$inicio];
    }
    $r = [];
    foreach (explode(';', $e['rrule']) as $p) {
        $kv = explode('=', $p, 2);
        if (count($kv) === 2) {
            $r[strtoupper($kv[0])] = $kv[1];
        }
    }
    $freq = $r['FREQ'] ?? '';
    $intervalo = max(1, (int) ($r['INTERVAL'] ?? 1));
    $contagem = isset($r['COUNT']) ? (int) $r['COUNT'] : PHP_INT_MAX;
    $ate = $fim;
    if (isset($r['UNTIL'])) {
        $u = data(strlen($r['UNTIL']) === 8 ? 'VALUE=DATE' : '', $r['UNTIL'], $inicio->getTimezone());
        if ($u) {
            $ate = min($fim, $u[1] ? $u[0]->setTime(23, 59, 59) : $u[0]);
        }
    }
    $saida = [];
    $n = 0;
    $guarda = 0;

    if ($freq === 'WEEKLY') {
        $dias = isset($r['BYDAY'])
            ? array_values(array_filter(array_map(fn($d) => $DIAS[substr($d, -2)] ?? null, explode(',', $r['BYDAY'])), fn($x) => $x !== null))
            : [(int) $inicio->format('w')];
        sort($dias);
        $semana = $inicio->modify('-' . $inicio->format('w') . ' days');
        while ($semana <= $ate && $n < $contagem && $guarda++ < 2000) {
            foreach ($dias as $d) {
                $oc = $semana->modify("+$d days");
                if ($oc < $inicio || $oc > $ate || $n >= $contagem) {
                    continue;
                }
                $n++;
                if ($oc >= $ini) {
                    $saida[] = $oc;
                }
            }
            $semana = $semana->modify('+' . (7 * $intervalo) . ' days');
        }
        return $saida;
    }

    $passo = ['DAILY' => 'day', 'MONTHLY' => 'month', 'YEARLY' => 'year'][$freq] ?? null;
    if ($passo === null) {
        return [$inicio];
    }
    $oc = $inicio;
    while ($oc <= $ate && $n < $contagem && $guarda++ < 2000) {
        $n++;
        if ($oc >= $ini) {
            $saida[] = $oc;
        }
        $oc = $inicio->modify('+' . ($intervalo * $n) . " $passo");
    }
    return $saida;
}

$saida = [];
foreach ($eventos as $e) {
    if (empty($e['inicio']) || ($e['status'] ?? '') === 'CANCELLED') {
        continue;
    }
    [$ini, $diaInteiro] = $e['inicio'];
    $fimEv = $e['fim'][0] ?? ($diaInteiro ? $ini->modify('+1 day') : $ini->modify('+1 hour'));
    $duracao = $fimEv->getTimestamp() - $ini->getTimestamp();

    foreach (ocorrencias($e, $janelaIni, $janelaFim, $DIAS) as $oc) {
        $chave = $oc->format('Ymd\THi');
        if (empty($e['recId']) && (in_array($chave, $e['exdate'], true) || isset($substituidas[($e['uid'] ?? '') . '|' . $chave]))) {
            continue;
        }
        $fimOc = $oc->modify("+$duracao seconds");
        if ($fimOc < $janelaIni || $oc > $janelaFim) {
            continue;
        }
        $saida[] = [
            'id' => substr(md5(($e['uid'] ?? '') . $chave), 0, 16),
            // Reservas feitas pela página de agendamento têm convidados (nome/e-mail de quem
            // reservou): no site aparecem só como "Reservado"
            'titulo' => $e['convidados'] > 0 ? 'Reservado' : titulo_publico($e['titulo'] ?? ''),
            'local' => $e['local'] ?? null,
            'inicio' => $oc->format(DATE_ATOM),
            'fim' => $fimOc->format(DATE_ATOM),
            'diaInteiro' => $diaInteiro,
        ];
    }
}

usort($saida, fn($a, $b) => strcmp($a['inicio'], $b['inicio']));

$json = json_encode([
    'ok' => true,
    'agenda' => AGENDA_ID,
    'atualizadoEm' => $hoje->format(DATE_ATOM),
    'eventos' => $saida,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

@file_put_contents($cacheArq, $json, LOCK_EX);
echo $json;
