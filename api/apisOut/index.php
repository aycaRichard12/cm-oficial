<?php
    error_reporting(E_ALL);          // Reporta todos los errores y advertencias
    ini_set("display_errors", 1);    // Muestra los errores en pantalla
    ini_set("display_startup_errors", 1);


    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Content-Type: application/json; charset=UTF-8");


    $method = $_SERVER['REQUEST_METHOD'];
    $rutas = array_filter(explode("/",$uri));
    require_once "outProductos.php";
    require_once "outVenta.php";
    require_once "outCompras.php";
    if ($rutas[1] == "venta") {
            require_once "routersVenta.php";
            return;
    }
    if($method == "GET"){
        
            require_once "routersGet.php";
            return;
        
    }

    if($method == "POST"){
        
            require_once  "routersPost.php";
            return;
        
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
        "method" => $method,
        "rutas" => $rutas
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>
   






