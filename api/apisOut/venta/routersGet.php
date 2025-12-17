<?php

$ver = $_GET['ver'] ?? '';

$segments = $ver !== '' ? array_filter(explode("/", $ver)) : [];
$apiRoute = $segments[2] ?? null;

if ($apiRoute === 'datosusuario') {
    echo json_encode(["success" => "prueba exito"], JSON_UNESCAPED_UNICODE);
}
