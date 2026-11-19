<?php
/**
 * Feriados e datas especiais para os calendários do site.
 *
 * Fonte: agenda pública "Feriados no Brasil" do Google (.ics), guardada por 12 h.
 * O Google chama de "Feriado" também alguns pontos facultativos (Carnaval, Cinzas,
 * Corpus Christi, Dia do Servidor, vésperas), por isso a classificação é refeita aqui:
 *   feriado            — feriado nacional (Lei 662/1949 e alterações) ou estadual/municipal listado abaixo
 *   ponto-facultativo  — dia em que órgãos públicos costumam não funcionar ou funcionar meio período
 *   comemorativa       — data comemorativa (não altera o funcionamento)
 */

declare(strict_types=1);

const FERIADOS_ICS = 'https://calendar.google.com/calendar/ical/pt-br.brazilian%23holiday%40group.v.calendar.google.com/public/basic.ics';
const FERIADOS_CACHE_SEG = 43200;

/** Feriados nacionais oficiais (o resto que o Google chama de "Feriado" vira ponto facultativo) */
const FERIADOS_NACIONAIS = [
    'ano novo', 'paixão de cristo', 'tiradentes', 'dia do trabalho', 'independência',
    'nossa senhora de aparecida', 'finados', 'proclamação da república',
    'dia da consciência negra', 'natal',
];

/**
 * Feriados locais que o Google não traz (repetem todo ano). Formato 'MM-DD' => [nome, tipo].
 * Para incluir feriados municipais de Breves ou recessos do IFPA, acrescente aqui
 * ou crie um evento de dia inteiro na agenda do LabMaker.
 */
const FERIADOS_LOCAIS = [
    '08-15' => ['Adesão do Pará à Independência (feriado estadual)', 'feriado'],
];

function tipo_feriado(string $nome, string $descricao): string
{
    $n = mb_strtolower(trim(preg_replace('/\s*\(.*\)\s*/u', '', $nome)));
    if (in_array($n, FERIADOS_NACIONAIS, true)) {
        return 'feriado';
    }
    return stripos($descricao, 'Feriado') === 0 ? 'ponto-facultativo' : 'comemorativa';
}

/** Lista [ 'AAAAMMDD' => [nome, tipo] ] vinda do Google (com cache) */
function feriados_google(): array
{
    $arq = sys_get_temp_dir() . '/labmaker-feriados.json';
    if (is_file($arq) && time() - filemtime($arq) < FERIADOS_CACHE_SEG) {
        return json_decode((string) file_get_contents($arq), true) ?: [];
    }
    $ics = function_exists('chamar_apps_script') ? chamar_apps_script(FERIADOS_ICS, null, 10) : null;
    if (!is_string($ics) || strpos($ics, 'BEGIN:VCALENDAR') === false) {
        return is_file($arq) ? (json_decode((string) file_get_contents($arq), true) ?: []) : [];
    }
    $ics = preg_replace("/\r?\n[ \t]/", '', $ics);
    $lista = [];
    preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $ics, $blocos);
    foreach ($blocos[1] as $b) {
        $campo = function (string $k) use ($b): string {
            return preg_match('/^' . $k . '[^:\r\n]*:(.*)$/m', $b, $m) ? trim($m[1]) : '';
        };
        $dia = substr(preg_replace('/\D/', '', $campo('DTSTART')), 0, 8);
        $nome = str_replace(['\\,', '\\;'], [',', ';'], $campo('SUMMARY'));
        if (strlen($dia) !== 8 || $nome === '') {
            continue;
        }
        $lista[$dia] = [$nome, tipo_feriado($nome, $campo('DESCRIPTION'))];
    }
    if ($lista) {
        @file_put_contents($arq, json_encode($lista, JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
    return $lista;
}

/** Eventos de dia inteiro no formato da API, entre $de e $ate */
function eventos_feriados(DateTimeImmutable $de, DateTimeImmutable $ate, DateTimeZone $fuso): array
{
    $dias = feriados_google();
    for ($ano = (int) $de->format('Y'); $ano <= (int) $ate->format('Y'); $ano++) {
        foreach (FERIADOS_LOCAIS as $md => $info) {
            $dias[$ano . str_replace('-', '', $md)] = $info;
        }
    }
    $saida = [];
    foreach ($dias as $dia => [$nome, $tipo]) {
        $ini = DateTimeImmutable::createFromFormat('!Ymd', (string) $dia, $fuso);
        if (!$ini || $ini < $de->setTime(0, 0) || $ini > $ate) {
            continue;
        }
        $saida[] = [
            'id' => 'fer-' . $dia,
            'titulo' => $nome,
            'local' => null,
            'inicio' => $ini->format(DATE_ATOM),
            'fim' => $ini->modify('+1 day')->format(DATE_ATOM),
            'diaInteiro' => true,
            'tipo' => $tipo,
        ];
    }
    return $saida;
}
