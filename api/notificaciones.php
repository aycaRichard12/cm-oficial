<?php
require_once "../db/conexion.php";
require_once "funciones.php";

class Notificaciones
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        $this->em = $this->conexion->em;
    }

    public function arrayIDalmacen($idmd5)
    {
        $lista = array();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
                LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
                LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
                WHERE r.id_usuario='$idusuario'");

        while ($qwe = $this->cm->fetch($consulta)) {
            $idalmacen = $qwe[2];
            $lista[] = $idalmacen;
        }
        $resultado = implode(',', $lista);
        return $resultado;
    }

    /**
     * @param string $idmd5
     * @return void
     */
    public function getNotificaciones($idmd5,$idempresa)
    {
        // Obtener notificaciones de ventas no despachadas
        $ventasNoDespachadas = $this->getVentasNoDespachadasAsNotificaciones($idempresa);
        
        // Obtener notificaciones de pedidos pendientes
        $pedidosPendientes = $this->getPedidos($idmd5);

        $cuentasxcobrarRetrasadas = $this->getCuentasAtrasadasAsNotificaciones($idempresa);
        
        // Combinar ambas listas de notificaciones en un solo array
        $lista_notificaciones = array_merge($cuentasxcobrarRetrasadas, $ventasNoDespachadas, $pedidosPendientes);
        
        // Devolver el array combinado en formato JSON
        echo json_encode($lista_notificaciones);
    }
    public function getCuentasAtrasadasAsNotificaciones($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista_notificaciones = [];

        // Consulta para obtener las cuentas por cobrar con estado = 3 (retrasadas)
        $sql = "SELECT
                    ec.id_estado_cobro,
                    v.nfactura,
                    ec.fecha_limite,
                    v.fecha_venta,
                    concat(c.nombre, ' | ', c.nombrecomercial) as cliente,
                    ec.saldo
                FROM estado_cobro ec
                LEFT JOIN venta v ON ec.venta_id_venta = v.id_venta
                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
                WHERE c.idempresa = ? AND ec.estado = 3
                ORDER BY ec.fecha_limite ASC"; // Ordenamos por fecha límite para mostrar las más antiguas primero

        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();

        // Procesar los resultados y crear el array de notificaciones
        while ($row = $result->fetch_assoc()) {
            $fechaLimite = new DateTime($row['fecha_limite']);
            $hoy = new DateTime();
            $diasAtraso = $hoy->diff($fechaLimite)->days;

            $mensaje = "La factura #{$row['nfactura']} del cliente '{$row['cliente']}' '\n' está atrasada por {$diasAtraso} días. Saldo pendiente: {$row['saldo']}.";

            $notificacion = [
                "id" => $row['id_estado_cobro'],
                "title" => "Cuenta por Cobrar Atrasada",
                "message" => $mensaje,
                "fecha" => $row['fecha_limite'],
                "type" => "error", // Usamos 'error' para las cuentas con un retraso significativo
                "data" => [
                    "id_factura" => $row['nfactura'],
                    "cliente" => $row['cliente'],
                ], 
                "codigo" => "cxc"
            ]; 
            array_push($lista_notificaciones, $notificacion);
        }

        $stmt->close();
        return $lista_notificaciones;
    }
    /**
     * @param string $idmd5
     * @return array
     */
    public function getVentasNoDespachadasAsNotificaciones($idmd5)
    {
        // Obtener el ID de la empresa del usuario
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista_notificaciones = [];

        // Consulta para obtener las ventas no despachadas
        $sqlVenta = "SELECT
                     vnd.id_ventas_no_despachadas,
                     vnd.id_venta,
                     CONCAT(p.codigo, ' - ', p.descripcion) AS producto,
                     al.nombre AS almacen,
                     vnd.cantidad_pendiente,
                     vnd.fecha_venta
                 FROM ventas_no_despachadas vnd
                 LEFT JOIN productos_almacen pa ON pa.id_productos_almacen = vnd.productos_almacen_id_productos_almacen
                 LEFT JOIN almacen al ON al.id_almacen = pa.almacen_id_almacen
                 LEFT JOIN productos p ON p.id_productos = pa.productos_id_productos
                 WHERE al.idempresa = ? AND vnd.estado = 2";
        
        // Preparar y ejecutar la consulta
        $stmtVenta = $this->cm->prepare($sqlVenta);
        $stmtVenta->bind_param("i", $idempresa);
        $stmtVenta->execute();
        $result = $stmtVenta->get_result();

        // Procesar los resultados y crear un array de notificaciones
        while ($row = $result->fetch_assoc()) {
            $mensaje = "Venta #{$row['id_venta']} tiene {$row['cantidad_pendiente']} '\n' unidades de '{$row['producto']}' pendientes por despachar del almacén '{$row['almacen']}'.";
            $notificacion = [
                "id" => $row['id_ventas_no_despachadas'],
                "title" => "Venta Pendiente de Despacho",
                "message" => $mensaje,
                "fecha" => $row['fecha_venta'],
                "type" => "warning",
                "data" => [
                    "id_venta" => $row['id_venta'],
                    "almacen" => $row['almacen'],
                    "producto" => $row['producto'],
                ],
                "codigo" => "vnd"

            ];
            array_push($lista_notificaciones, $notificacion);
        }
        
        $stmtVenta->close();

        return $lista_notificaciones;
    }

    /**
     * @param string $idmd5
     * @return array
     */
    public function getPedidos($idmd5)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];

        $sql = "SELECT
                    p.id_pedidos,
                    p.fecha_pedido,
                    p.observacion,
                    p.almacen_id_almacen,
                    a.nombre AS nombre_almacen,
                    p.nropedido
                FROM
                    pedidos p
                LEFT JOIN
                    almacen a ON p.almacen_id_almacen = a.id_almacen
                WHERE
                    p.almacen_id_almacen IN ($arrayid)
                    AND p.estado = 2
                ORDER BY
                    p.fecha_pedido DESC";

        $rep = $this->cm->query($sql);

        while ($qwe = $this->cm->fetch($rep)) {
            $mensaje = "Pedido #{$qwe[5]} necesita tu autorización.";

            $res = [
                "id" => $qwe[0],
                "title" => "Pedido Pendiente",
                "message" => $mensaje,
                "fecha" => $qwe[1],
                "type" => "warning",
                "almacen_id" => $qwe[3],
                "almacen" => $qwe[4],
                "codigo" => "pedido"
            ];
            array_push($lista, $res);
        }
        return $lista;
    }

   function getLogoBase64($carpeta, $logoPath) {
        // Ruta base donde guardas las imágenes
        $baseDir = __DIR__ . "/../../em/";

        // Normaliza y crea la ruta final
        $rutaImagen = realpath($baseDir . $carpeta . '/' . $logoPath);

        // Verifica que realmente está dentro de la carpeta base
        if ($rutaImagen === false || strpos($rutaImagen, realpath($baseDir)) !== 0) {
            return null;
        }

        // Verifica que el archivo existe
        if (!file_exists($rutaImagen)) {
            return null;
        }

        // Convierte a Base64
        $tipo = pathinfo($rutaImagen, PATHINFO_EXTENSION);
        $datos = file_get_contents($rutaImagen);

        return 'data:image/' . strtolower($tipo) . ';base64,' . base64_encode($datos);
    }
   function getComercialImagenProducto($carpeta, $logoPath) {
    
    $rutaBaseImagenes = realpath(__DIR__); 

    

    if ($rutaBaseImagenes === false) {
        // La ruta base no existe. Error de configuración.
        return null; 
    }

    // Usa DIRECTORY_SEPARATOR para compatibilidad con sistemas operativos.
    $rutaFinal = $rutaBaseImagenes . DIRECTORY_SEPARATOR . trim($carpeta, '/\\') . DIRECTORY_SEPARATOR . $logoPath;
    
   
    // Esta normalización es crucial para eliminar '..'
    $rutaImagen = realpath($rutaFinal); 

   
    if ($rutaImagen === false) {
        return null;
    }

    if (strpos($rutaImagen, $rutaBaseImagenes) !== 0) {
         // El archivo está fuera de la carpeta base de imágenes definida.
        return null; 
    }

   
    if (!file_exists($rutaImagen)) {
        return null;
    }

    
    
    $tipo = pathinfo($rutaImagen, PATHINFO_EXTENSION);
    $datos = file_get_contents($rutaImagen);

   
    if ($datos === false) {
        return null;
    }

    return 'data:image/' . strtolower($tipo) . ';base64,' . base64_encode($datos);
}

}