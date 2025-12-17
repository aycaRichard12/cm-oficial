<?php
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Si es JSON, lo uso; si no, uso $_POST encontrada
if (is_array($data) && isset($data['ver'])) {
    $ver = $data['ver'];
} elseif (isset($_POST['ver'])) {
    $ver = $_POST['ver'];
} else {
    $ver = null;
}
$controlador = null;
if ($ver == "generarTokenJWT") {
    $controlador = new ApiTokens(); 
    $controlador->generarTokenJWT($data['idmd5'],$data['fecha_final']);
}
elseif ($ver == "cliente") {
    $controlador = new outVenta(); 
    $controlador->verificarCliente($data, $data['idmd5'],$data['token'],$data['factura']);
}
elseif ($ver == "registrarVenta") {
    // $controlador = new outVenta(); 
    // $controlador->registrarVenta($data);
}
elseif ($ver == "revisarP") {
    $controlador = new outVenta(); 
    $controlador->ordenar_listaProductos($data,$data['tipo']);
}
elseif ($ver == "ordenar_listaProductos") {
    $controlador = new outVenta(); 
    $controlador->ordenar_listaProductos($data["productos"],$data['tipo']);
}
elseif ($ver == "registrarCompra") {
    $controlador = new outCompras(); 
    $controlador->registrarCompra($data);
}

if ($controlador === null) {
    // Acción por defecto si no se encuentra una ruta válida producto sendEmail editaralmacen registroProducto use
    echo json_encode("El formulario out ".$_POST['ver']." no existe");
}