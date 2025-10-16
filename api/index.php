<?php
    // session_start();
    header('Access-Control-Allow-Origin:*');
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

    header("Content-Type: application/json; charset=UTF-8");
    date_default_timezone_set("America/La_Paz");
    
    // $uri = strtok($_SERVER['REQUEST_URI'], '?');    
    $uri=isset($_GET["ver"]) ? $_GET["ver"] : "";
    if($uri) {
        $uri = strtok($uri, '?');
    } 

    $rutas = array_filter(explode("/",$uri));
    
    $my_route = implode(",", $rutas); // string

    // Manejar OPTIONS antes de cualquier lógica
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        exit;
    }


    $method = $_SERVER['REQUEST_METHOD'];
    if (isset($method)) {
      
       

        require_once "../db/conexion.php";
        require_once "funciones.php";
        require_once "logErrores.php";
        require_once 'vendor/autoload.php';
        require_once "facturacion.php";
        require_once "useVenta.php";
        require_once "configuraciones.php";
        require_once "ventas.php";
        require_once "compras.php";
        require_once "pagosCompra.php";
        require_once "notaCreditoDebito.php";
        require_once "kardex.php";
        if ($rutas[0] == "out") {
            require_once "apisOut/index.php";
            return;
        }else{
            if ($method == "GET") {
                require_once "controladorGet.php"; 
                return;
            }
            if ($method == "POST") {
                require_once "controladorPost.php";
                return;
            }
        }
        $archivoControl = __DIR__ . '/ultima_limpieza.txt';
        $ahora = time();
        if (!file_exists($archivoControl) || ($ahora - filemtime($archivoControl)) > 86400) {
            file_put_contents($archivoControl, date("Y-m-d H:i:s"), LOCK_EX);
            include_once(__DIR__ . '/limpiar_pdfs.php');
        }
        

        $response = [
            "message" => "La ruta no existe",
            "route" => $rutas[0]
        ];
        echo json_encode($response, http_response_code(404));
    } else {
        $response = [
            "status" => 400,
            "message" => "No se pudo reconer el método de la petición"
        ];
        echo json_encode($response, http_response_code($response["status"]) | JSON_UNESCAPED_UNICODE);
    }
    //activo-fijo/encontrada
?>