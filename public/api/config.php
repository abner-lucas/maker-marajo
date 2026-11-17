<?php
/**
 * Configuração compartilhada pelos endpoints do site (não gera saída).
 * URL do "App da Web" publicado a partir de apps-script/ReservasLabMaker.gs (termina em /exec).
 */

declare(strict_types=1);

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhrMRbA872Lz1kTFQ1nl9fBUkZK0_4OMFEhplpMGzl1oOCO3OeXjmw_0dSfZ1U60EgFQ/exec';

/** GET/POST ao Apps Script seguindo o redirecionamento que ele sempre devolve */
function chamar_apps_script(string $url, ?string $corpo = null, int $timeout = 25): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $op = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => $timeout,
        ];
        if ($corpo !== null) {
            $op[CURLOPT_POST] = true;
            $op[CURLOPT_POSTFIELDS] = $corpo;
            $op[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
        }
        curl_setopt_array($ch, $op);
        $resp = curl_exec($ch);
        curl_close($ch);
        return is_string($resp) ? $resp : null;
    }
    $http = ['timeout' => $timeout, 'ignore_errors' => true, 'follow_location' => 1];
    if ($corpo !== null) {
        $http += ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => $corpo];
    }
    $resp = @file_get_contents($url, false, stream_context_create(['http' => $http]));
    return is_string($resp) ? $resp : null;
}
