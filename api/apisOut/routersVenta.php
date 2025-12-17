<?php
   
    
    $method = $_SERVER['REQUEST_METHOD'];
    $request = $_SERVER['REQUEST_URI'];  

    if($method == "POST"){
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        $controlador = new outVenta(); 
         
        $controlador->registrarVenta($data);

        if ($controlador === null) {
            // Acción por defecto si no se encuentra una ruta válida producto sendEmail editaralmacen registroProducto use
            echo json_encode("El formulario ".$_POST['ver']." no existe");
        }
        return;
    }
    

    // 1. GET /api/venta/{cuf}
    if ($method === "GET" && preg_match('#/api/out/venta/([A-Za-z0-9]+)$#', $request, $m)) {
        $cuf = $m[1];
        $controlador = new outVenta(); 

        $controlador->detalleFactura($cuf);
        exit;
    }
    if ($method === "GET" && preg_match('#/api/out/venta/motivo-anulacion$#', $request)) {
        $controlador = new outVenta();
        $result = $controlador->getmotivoAnulacion();
        exit;

    }

    // 2. GET /api/venta/{cuf}/estado
    if ($method === "GET" && preg_match('#/api/out/venta/([A-Za-z0-9]+)/estado$#', $request, $m)) {
        $cuf = $m[1];
        $controlador = new outVenta(); 
        $controlador->estadoFactura($cuf);
        exit;
    }

    // 3. POST /api/venta/{cuf}/anular  (pero esto será en routersVenta.php)
    if ($_SERVER['REQUEST_METHOD'] === "DELETE" &&
        preg_match('#([A-Za-z0-9]+)/anular$#', $request, $m)
    ) {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        $controlador = new outVenta(); 
        $cuf = $m[1];
        $controlador->anularFactura($cuf, $data);
        exit;
    }
    
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Ruta no encontrada",
        "ruta" => $request
    ]);

    exit;

?>
   
