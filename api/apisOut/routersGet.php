<?php

$ver = $_GET['ver'] ?? '';

$segments = $ver !== '' ? array_filter(explode("/", $ver)) : [];
$apiRoute = $segments[1] ?? null;

if ($apiRoute === 'datosusuario') {
    echo json_encode(["success" => "prueba exito"], JSON_UNESCAPED_UNICODE);
}
elseif($apiRoute== "productos"){
    $controlador = new OutProductos();
    $controlador->productos($segments[2]); // idventaND, idproductoalmacen, cantidad encontrada
} 
elseif($apiRoute== "tipos-documento"){
    
    $controlador = new outVenta();
    $controlador->tipo_documentos(); 
} 
elseif($apiRoute== "metodos-pago"){
    
    $controlador = new outVenta();
    $controlador->metodos_pago(); 
} 
elseif($apiRoute== "verificarToken"){
    
    $controlador = new outVenta();
    $controlador->verificarToken($segments[2]); 
} 
elseif($apiRoute== "puntos-venta"){
    
    $controlador = new outVenta();
    $controlador->puntos_venta($segments[2]); 
} 
elseif($apiRoute== "obtenerTokenEmizor_"){
    
    $controlador = new ApiTokens();
    $controlador->obtenerTokenEmizor_($segments[2]); 
} 
elseif($apiRoute == "divisa"){
    
    $controlador = new outVenta();
    $controlador->getDivisa(); 
} 
elseif($apiRoute == "divisa"){
    
    $controlador = new outVenta();
    $controlador->getDivisa(); 
} 
 
elseif($apiRoute == "autenticarPeticion"){
    
    $controlador = new ApiTokens();
    $controlador->autenticarPeticionPrueba(); 
} 
elseif($apiRoute == "tokenvalido"){
    
    $controlador = new ApiTokens();
    $controlador->obtenerTokenEmizor($segments[2]); 
} 
 
else {
    http_response_code(404);
    echo json_encode([
        "error" => "La ruta web '{$apiRoute}' no existe",
        "segments" => $segments
    ], JSON_UNESCAPED_UNICODE);
}


