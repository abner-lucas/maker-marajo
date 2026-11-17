<?php
/**
 * Recebe o formulário de agendamento do site e repassa ao Apps Script da conta
 * labmaker.breves@ifpa.edu.br, que cria o evento na Google Agenda do LabMaker.
 * Nenhuma senha ou chave do Google fica neste servidor.
 */

declare(strict_types=1);

require __DIR__ . '/config.php';

const MAX_POR_IP_HORA = 6;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder(int $status, array $dados): void
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'motivo' => 'metodo']);
}
if (APPS_SCRIPT_URL === '') {
    responder(503, ['ok' => false, 'motivo' => 'nao-configurado']);
}

// Só aceita envios do próprio site
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem !== '' && !preg_match('#^https://(www\.)?makermarajo\.com$#', $origem)) {
    responder(403, ['ok' => false, 'motivo' => 'origem']);
}

// Limite por IP (janela de 1 hora)
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$ip = trim(explode(',', $ip)[0]);
$arq = sys_get_temp_dir() . '/labmaker-reservas-' . md5($ip) . '.json';
$agora = time();
$envios = is_file($arq) ? (json_decode((string) file_get_contents($arq), true) ?: []) : [];
$envios = array_values(array_filter($envios, fn($t) => $t > $agora - 3600));
if (count($envios) >= MAX_POR_IP_HORA) {
    responder(429, ['ok' => false, 'motivo' => 'limite']);
}

$entrada = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($entrada)) {
    responder(400, ['ok' => false, 'motivo' => 'invalido']);
}

// Repassa só os campos esperados, com tamanho limitado
// dias = dias da semana da repetição ("3,4" = qua e qui); ate = último dia (AAAA-MM-DD)
$campos = ['alvo', 'servico', 'nome', 'email', 'vinculo', 'descricao', 'inicio', 'fim', 'dias', 'ate', 'site'];
$dados = [];
foreach ($campos as $c) {
    $dados[$c] = mb_substr(trim((string) ($entrada[$c] ?? '')), 0, $c === 'descricao' ? 1500 : 200);
}

$corpo = json_encode($dados, JSON_UNESCAPED_UNICODE);
$resp = chamar_apps_script(APPS_SCRIPT_URL, $corpo);
$json = is_string($resp) ? json_decode($resp, true) : null;
if (!is_array($json)) {
    responder(502, ['ok' => false, 'motivo' => 'falha-google']);
}

$envios[] = $agora;
@file_put_contents($arq, json_encode($envios), LOCK_EX);

if (!empty($json['ok'])) {
    // a agenda pública muda: descarta o cache do leitor para o site mostrar já
    @unlink(sys_get_temp_dir() . '/labmaker-agenda-' . md5('labmaker.breves@ifpa.edu.br') . '.json');
}
responder(!empty($json['ok']) ? 200 : 409, $json);
