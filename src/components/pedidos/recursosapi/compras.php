<?php
use App\Config\Config;
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "productoUnico.php";
class compras
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $prod;
    private $enpointCT;
    private $productoUnico;
    public function __construct()
    {
        $this->conexion = Conexion::getInstance();
        $this->verificar = new funciones();
        $this->productoUnico = new ProductoUnico();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->prod = $this->conexion->prod;
        $this->em = $this->conexion->em;
        $this->enpointCT = new Config();
    }
    public function importar_excel_proveedor($file, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
    
        if (!$idempresa) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
    
        if (!file_exists($file)) {
            echo json_encode(["estado" => "error", "mensaje" => "El archivo no se encontró en la ruta: " . $file]);
            return;
        }
    
        $handle = fopen($file, "r"); // Abrir el archivo en modo lectura
        if ($handle === false) {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo abrir el archivo CSV"]);
            return;
        }
    
        $proveedores = []; // Guardará los proveedores
        $contador = 0;
    
        while (($data = fgetcsv($handle, 1000, ",")) !== false) {
            if ($contador == 0) { // Ignorar la primera fila (encabezados)
                $contador++;
                continue;
            }
    
            // Asignar datos (asegúrate de que coincidan con las columnas de tu CSV)
            $proveedores[] = [
                "nombre" => $data[0],
                "codigo" => $data[1],
                "nit" => $data[2],
                "detalle" => $data[3],
                "direccion" => $data[4],
                "telefono" => $data[5],
                "movil" => $data[6],
                "email" => $data[7],
                "web" => $data[8],
                "pais" => $data[9],
                "ciudad" => $data[10],
                "zona" => $data[11],
                "contacto" => $data[12],
            ];
            $contador++;
        }
    
        fclose($handle); // Cerrar archivo
    
        // Ahora recorremos los proveedores y los registramos en la base de datos
        foreach ($proveedores as $proveedor) {
            $this->registroproveedor(
                $proveedor["nombre"],
                $proveedor["codigo"],
                $proveedor["nit"],
                $proveedor["detalle"],
                $proveedor["direccion"],
                $proveedor["telefono"],
                $proveedor["movil"],
                $proveedor["email"],
                $proveedor["web"],
                $proveedor["pais"],
                $proveedor["ciudad"],
                $proveedor["zona"],
                $proveedor["contacto"],
                $idmd5
            );
        }
    
        echo json_encode(["estado" => "exito", "mensaje" => "Proveedores importados correctamente"]);
    }
    public function importar_excel_proveedor2($file, $idmd5)
    {
        // 1. Desactivar salida de errores para no romper el JSON
        error_reporting(0);
        ini_set('display_errors', 0);

        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if (!$idempresa) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }

        if (!file_exists($file)) {
            echo json_encode(["estado" => "error", "mensaje" => "Archivo no encontrado"]);
            return;
        }

        $handle = fopen($file, "r");
        if ($handle === false) {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo abrir el archivo"]);
            return;
        }

        $importados = 0;
        $omitidos = 0;
        $contador = 0;

        // Usar un buffer para capturar posibles echos accidentales de la función registroproveedor
        ob_start(); 

        while (($data = fgetcsv($handle, 1000, ",")) !== false) {
            if ($contador == 0) { $contador++; continue; }

            // VALIDACIÓN DE COLUMNAS: Usamos el operador null coalescing (??) 
            // para evitar el "Undefined array key" si el Excel viene incompleto.
            $prov = [
                "nombre"    => $data[0] ?? '',
                "codigo"    => $data[1] ?? '',
                "nit"       => $data[2] ?? '',
                "detalle"   => $data[3] ?? '',
                "direccion" => $data[4] ?? '',
                "telefono"  => $data[5] ?? '',
                "movil"     => $data[6] ?? '',
                "email"     => $data[7] ?? '',
                "web"       => $data[8] ?? '',
                "pais"      => $data[9] ?? '',
                "ciudad"    => $data[10] ?? '',
                "zona"      => $data[11] ?? '',
                "contacto"  => $data[12] ?? '',
            ];

            // Llamar al registro. 
            // NOTA: Si registroproveedor ya hace echos, ob_start los atrapará.
            $this->registroproveedor(
                $prov["nombre"], $prov["codigo"], $prov["nit"], $prov["detalle"],
                $prov["direccion"], $prov["telefono"], $prov["movil"], $prov["email"],
                $prov["web"], $prov["pais"], $prov["ciudad"], $prov["zona"],
                $prov["contacto"], $idmd5
            );
            
            $importados++;
            $contador++;
        }

        fclose($handle);
        
        // Limpiar cualquier eco basura que haya quedado en el buffer
        ob_end_clean(); 

        // ENVIAR UNA SOLA RESPUESTA FINAL
        echo json_encode([
            "estado" => "exito", 
            "mensaje" => "Proceso finalizado. Total filas: " . ($contador - 1),
            "detalles" => "Se procesaron $importados registros."
        ]);
    }
    
    public function listarProveedores($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $res = "";
        $provee = $this->cm->query("select * from proveedor where id_empresa='$idempresa'");
        while ($qwe = $this->cm->fetch($provee)) {
            $res = array("id" => $qwe['id_proveedor'], "nombre" => $qwe['nombre'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function registroproveedor($nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto, $idmd5, $TIPORESPUESTA = NULL)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consultaCod = $this->cm->query("SELECT * FROM proveedor p WHERE p.id_empresa = '$idempresa' AND LOWER(p.codigo) = LOWER('$codigo')");
        if ($consultaCod) {
            if ($consultaCod->num_rows > 0) {
                echo json_encode(array("estado" => "existe", "mensaje" => "El código del proveedor ya existe"));
                return;
            }
        }
        $res = "";
        $registro = $this->cm->query("insert into proveedor(id_proveedor,nombre,codigo,nit,detalle,direccion,telefono,mobil,email,web,pais,ciudad,zona,contacto,id_empresa)value(NULL,'$nombre','$codigo','$nit','$detalle','$direccion','$telefono','$mobil','$email','$web','$pais','$ciudad','$zona','$contacto','$idempresa')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        $proveedorID = $this->cm->insert_id;
        if($TIPORESPUESTA == null){
            echo json_encode($res);
        }elseif($TIPORESPUESTA == 1){
            return $proveedorID;
        }
        
    }

    public function verificarIdproveedor($id)
    {
        $res = "";

        $consulta = $this->cm->query("select * from proveedor where id_proveedor = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe['id_proveedor'], "nombre" => $qwe['nombre'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto']);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarregistroproveedor($idproveedor, $nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto)
    {
        $res = "";
        $registro = $this->cm->query("update proveedor SET nombre='$nombre',codigo='$codigo',nit='$nit',detalle='$detalle',direccion='$direccion',telefono='$telefono',mobil='$mobil',email='$email',web='$web',pais='$pais',ciudad='$ciudad',zona='$zona',contacto='$contacto' where id_proveedor='$idproveedor' ");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarproveedor_($dato)
    {
        $res = "";
        $registro = $this->cm->query("delete from proveedor where id_proveedor='$dato'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Eliminado exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarproveedor($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de almacen no válido");
            }


            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'ingreso' => 'proveedor_id_proveedor',
            ];
            $mensaje = [
                'ingreso' => 'No se puede eliminar porque hay registros en Ingreso.',
                
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el producto
            $query = "DELETE FROM proveedor WHERE id_proveedor = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el cliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function listaPedidosProduccion($idmd5)
    {
        // 1. Verificación temprana
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(["error" => "El id de empresa no existe"]);
            return;
        }

        // 2. SQL preparado con alias explícitos + filtro tipopedido = 3 (Producción)
        $sql = "SELECT 
                    p.id_pedidos,
                    p.fecha_pedido,
                    p.autorizacion,
                    p.observacion,
                    p.codigo,
                    p.almacen_id_almacen,
                    a.nombre         AS almacen,
                    p.estado,
                    p.tipopedido,
                    p.almacen_origen,
                    a1.nombre        AS almacen_origen,
                    p.usuario,
                    p.nropedido,
                    p.ruta_recibo
                FROM pedidos p
                LEFT JOIN almacen a  ON p.almacen_id_almacen = a.id_almacen
                LEFT JOIN almacen a1 ON p.almacen_origen     = a1.id_almacen
                WHERE a.idempresa = ?
                AND p.tipopedido = 3
                ORDER BY p.id_pedidos DESC";

        $stmt = $this->cm->prepare($sql);

        if (!$stmt) {
            echo json_encode(["error" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // 3. Vincular parámetro (s = string)
        $stmt->bind_param("s", $idempresa);

        // 4. Ejecutar
        if (!$stmt->execute()) {
            echo json_encode(["error" => "Error al ejecutar la consulta"]);
            $stmt->close();
            return;
        }

        // 5. Resultado asociativo
        $resultado = $stmt->get_result();
        $lista = [];

        while ($r = $resultado->fetch_assoc()) {
            $lista[] = [
                "id"              => $r['id_pedidos'],
                "fecha"           => $r['fecha_pedido'],
                "autorizacion"    => $r['autorizacion'],
                "observacion"     => $r['observacion'],
                "codigo"          => $r['codigo'],
                "idalmacen"       => $r['almacen_id_almacen'],
                "almacen"         => $r['almacen'],
                "estado"          => $r['estado'],
                "tipopedido"      => $r['tipopedido'],
                "idalmacenorigen" => $r['almacen_origen'],
                "almacenorigen"   => $r['almacen_origen'],
                "idusuario"       => $r['usuario'],
                "nropedido"       => $r['nropedido'],
                "ruta"            => $r['ruta_recibo'],
            ];
        }

        // 6. Liberar recursos
        $resultado->free();
        $stmt->close();

        // 7. Salida
        echo json_encode($lista);
    }
    public function listaPedidos($idmd5)
    {
        // 1. Verificación temprana
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(["error" => "El id de empresa no existe"]);
            return;
        }

        // 2. SQL preparado con alias explícitos (evita colisión de los dos "nombre")
        $sql = "SELECT 
                    p.id_pedidos,
                    p.fecha_pedido,
                    p.autorizacion,
                    p.observacion,
                    p.codigo,
                    p.almacen_id_almacen,
                    a.nombre         AS almacen,
                    p.estado,
                    p.tipopedido,
                    p.almacen_origen,
                    a1.nombre        AS almacen_origen,
                    p.usuario,
                    p.nropedido,
                    p.ruta_recibo
                FROM pedidos p
                LEFT JOIN almacen a  ON p.almacen_id_almacen = a.id_almacen
                LEFT JOIN almacen a1 ON p.almacen_origen     = a1.id_almacen
                WHERE a.idempresa = ?
                ORDER BY p.id_pedidos DESC";

        $stmt = $this->cm->prepare($sql);

        if (!$stmt) {
            echo json_encode(["error" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // 3. Vincular parámetro (s = string)
        $stmt->bind_param("s", $idempresa);

        // 4. Ejecutar
        if (!$stmt->execute()) {
            echo json_encode(["error" => "Error al ejecutar la consulta"]);
            $stmt->close();
            return;
        }

        // 5. Resultado asociativo
        $resultado = $stmt->get_result();
        $lista = [];

        while ($r = $resultado->fetch_assoc()) {
            $lista[] = [
                "id"              => $r['id_pedidos'],
                "fecha"           => $r['fecha_pedido'],
                "autorizacion"    => $r['autorizacion'],
                "observacion"     => $r['observacion'],
                "codigo"          => $r['codigo'],
                "idalmacen"       => $r['almacen_id_almacen'],
                "almacen"         => $r['almacen'],
                "estado"          => $r['estado'],
                "tipopedido"      => $r['tipopedido'],
                "idalmacenorigen" => $r['almacen_origen'],
                "almacenorigen"   => $r['almacen_origen'],
                "idusuario"       => $r['usuario'],
                "nropedido"       => $r['nropedido'],
                "ruta"            => $r['ruta_recibo'],
            ];
        }

        // 6. Liberar recursos
        $resultado->free();
        $stmt->close();

        // 7. Salida
        echo json_encode($lista);
    }

    public function listaPedidosProduccion2($idmd5)
    {
        $lista = [];

        // 1. Verificación temprana (retorno rápido)
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(["error" => "El id de empresa no existe"]);
            return;
        }

        // 2. SQL preparado (evita inyección SQL y permite reutilización/caché del plan)
        $sql = "SELECT 
                    p.id_pedidos,
                    p.fecha_pedido,
                    p.autorizacion,
                    p.observacion,
                    p.codigo,
                    p.almacen_id_almacen,
                    a.nombre         AS almacen,
                    p.estado,
                    p.tipopedido,
                    p.almacen_origen,
                    a1.nombre        AS almacen_origen,
                    p.usuario,
                    p.nropedido,
                    p.ruta_recibo
                FROM pedidos p
                LEFT JOIN almacen a  ON p.almacen_id_almacen = a.id_almacen
                LEFT JOIN almacen a1 ON p.almacen_origen     = a1.id_almacen
                WHERE a.idempresa = ? 
                AND p.autorizacion = 1 
                AND p.estado = 2
                ORDER BY p.id_pedidos DESC";

        $stmt = $this->cm->prepare($sql);

        if (!$stmt) {
            echo json_encode(["error" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // 3. Vincular parámetros (evita concatenación y escapa automáticamente)
        $stmt->bind_param("s", $idempresa);

        // 4. Ejecutar
        if (!$stmt->execute()) {
            echo json_encode(["error" => "Error al ejecutar la consulta"]);
            $stmt->close();
            return;
        }

        // 5. Obtener resultados de forma asociativa (más legible y seguro ante cambios de orden de columnas)
        $resultado = $stmt->get_result();

        while ($row = $resultado->fetch_assoc()) {
            $lista[] = [
                "id"               => $row['id_pedidos'],
                "fecha"            => $row['fecha_pedido'],
                "autorizacion"     => $row['autorizacion'],
                "observacion"      => $row['observacion'],
                "codigo"           => $row['codigo'],
                "idalmacen"        => $row['almacen_id_almacen'],
                "almacen"          => $row['almacen'],
                "estado"           => $row['estado'],
                "tipopedido"       => $row['tipopedido'],
                "idalmacenorigen"  => $row['almacen_origen'],
                "almacenorigen"    => $row['almacen_origen_nombre'] ?? $row['almacen_origen'],
                "idusuario"        => $row['usuario'],
                "nropedido"        => $row['nropedido'],
                "ruta"             => $row['ruta_recibo'],
            ];
        }

        // 6. Liberar recursos (clave para escalabilidad)
        $resultado->free();
        $stmt->close();

        // 7. Salida JSON
        echo json_encode($lista);
    }
    public function lista_estados_pedido($idmd5)
    {
    //      ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);
    
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, p.almacen_id_almacen, a.nombre, p.estado, p.tipopedido, p.almacen_origen, a1.nombre, p.usuario, p.nropedido , p.ruta_recibo
        FROM pedidos p
        LEFT JOIN almacen a ON p.almacen_id_almacen=a.id_almacen
        LEFT JOIN almacen a1 ON p.almacen_origen=a1.id_almacen
        WHERE a.idempresa='$idempresa' and p.autorizacion = 1 and (p.estado = 1 or p.estado = 3 or p.estado = 4) 
        ORDER BY p.id_pedidos DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "autorizacion" => $qwe[2], "observacion" => $qwe[3], "codigo" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "estado" => $qwe[7], "tipopedido" => $qwe[8], "idalmacenorigen" => $qwe[9], "almacenorigen" => $qwe[10], "idusuario" => $qwe[11], "nropedido" => $qwe[12],"ruta" => $qwe['ruta_recibo']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listaProductoPedido($idpedido, $idalmacen) {
        // error_reporting(E_ALL);
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        $lista = [];
        // Consulta parametrizada con marcadores '?'
        $sql = "SELECT  pa.id_productos_almacen,
                        p.codigo,
                        p.cod_barras,
                        p.nombre,
                        p.descripcion,
                        pa.pais,
                        p.caracteristicas,
                        pa.stock_minimo,
                        s.cantidad,
                        pa.fecha_registro,
                        al.id_almacen,
                        pa.estado,
                        pa.stock_maximo,
                        p.id_productos
                FROM productos_almacen AS pa
                LEFT JOIN almacen AS al ON pa.almacen_id_almacen = al.id_almacen
                LEFT JOIN productos AS p ON pa.productos_id_productos = p.id_productos
                LEFT JOIN stock AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen
                                    AND s.estado = '1'
                WHERE pa.almacen_id_almacen = ?
                AND pa.estado = '1'
                AND pa.id_productos_almacen NOT IN (
                        SELECT dp.productos_almacen_id_productos_almacen
                        FROM detalles_pedidos dp
                        WHERE dp.pedidos_id_pedidos = ?
                        AND dp.productos_almacen_id_productos_almacen IS NOT NULL
                        AND (dp.idvalores IS NULL OR dp.idvalores = '')
                )
                ORDER BY pa.id_productos_almacen DESC";

        // Preparar la consulta
        if ($stmt = $this->cm->prepare($sql)) {
            // Vincular los parámetros (asumiendo que ambos son enteros)
            $stmt->bind_param('ii', $idalmacen, $idpedido);

            // Ejecutar
            $stmt->execute();

            // Obtener el resultado
            $resultado = $stmt->get_result();

            // Recorrer y construir el arreglo
            while ($fila = $resultado->fetch_array(MYSQLI_NUM)) {
                $res = [
                    "idproductoalmacen" => $fila[0],
                    "codigo"            => $fila[1],
                    "codbarras"         => $fila[2],
                    "nombre"            => $fila[3],
                    "descripcion"       => $fila[4],
                    "pais"              => $fila[5],
                    "caracteristica"    => $fila[6],
                    "stockMin"          => $fila[7],
                    "stock"             => $fila[8],
                    "fecha"             => $fila[9],
                    "idalmacen"         => $fila[10],
                    "estado"            => $fila[11],
                    "stockMax"          => $fila[12],
                    "idproducto"          => $fila[13],
                ];

                $lista[] = $res;
            }

            // Liberar recursos
            $stmt->close();
        } else {
            // Manejo de error (opcional)
            error_log("Error al preparar la consulta: " . $this->cm->error);
        }

        echo json_encode($lista);
    }

    public function registroPedido($fecha,$observacion,$almacen,$tipo,$almacenorigen,$idmd5,$idmd5em){
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5em);
        
        $codigo="AL-".rand(1,100).date("Ymd");
        $res="";

        $nropedido = $this->cm->query("select count(p.id_pedidos) as cantidad_pedido from pedidos p inner join almacen a on a.id_almacen=p.almacen_id_almacen where a.idempresa='$idempresa' and p.tipopedido='$tipo'");
        $resp = $this->cm->fetch($nropedido);
        $nro = $resp[0] + 1;

        $registro=$this->cm->query("insert into pedidos(id_pedidos,fecha_pedido,autorizacion,observacion,codigo,almacen_id_almacen,estado,tipopedido,almacen_origen,usuario,nropedido)value(NULL,'$fecha','2','$observacion','$codigo','$almacen','2',$tipo,$almacenorigen,$idusuario,$nro)");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacenorigen" => $almacen, "tipo" => $tipo);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarPedido($dato){
        $res="";
        $registro=$this->cm->query("delete from pedidos where id_pedidos='$dato'");
        if($registro !== null){
            $registro=$this->cm->query("delete from detalles_pedidos where pedidos_id_pedidos='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIDpedido($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, p.almacen_id_almacen, a.nombre, p.estado, p.tipopedido, p.almacen_origen, a1.nombre, p.usuario, p.nropedido FROM pedidos p
        LEFT JOIN almacen a ON p.almacen_id_almacen=a.id_almacen
        LEFT JOIN almacen a1 ON p.almacen_origen=a1.id_almacen
        WHERE p.id_pedidos='$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "autorizacion" => $qwe[2], "observacion" => $qwe[3], "codigo" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "estado" => $qwe[7], "tipopedido" => $qwe[8], "idalmacenorigen" => $qwe[9], "almacenorigen" => $qwe[10], "idusuario" => $qwe[11], "nropedido" => $qwe[12]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarPedido($idpedido,$fecha,$observacion,$almacen, $tipo,$almacenorigen){
        $res="";
        $registro=$this->cm->query("update pedidos SET fecha_pedido='$fecha', observacion='$observacion', almacen_id_almacen='$almacen', tipopedido='$tipo', almacen_origen='$almacenorigen' where id_pedidos='$idpedido'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacenorigen" => $almacen, "tipo" => $tipo);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoPedido($idpedido,$autorizar){
        $res="";

        $registro=$this->cm->query("update pedidos SET autorizacion='$autorizar' where id_pedidos='$idpedido'");
        if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }
    public function concluir_pedido($idpedido,$estado){
        $res="";

        $registro=$this->cm->query("UPDATE pedidos SET estado='$estado' where id_pedidos='$idpedido'");
        if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }
    public function cancelarPedido($id){
        try {
            $registro = $this->cm->query("delete from detalles_pedidos where pedidos_id_pedidos='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listaDetallePedido($id)
    {
        $lista = [];

        $sql = "SELECT dp.id_detalle_pedido, dp.cantidad, dp.observacion, 
                    dp.pedidos_id_pedidos, dp.productos_almacen_id_productos_almacen, 
                    p.codigo, p.descripcion, dp.idProductoVariante, p.id_productos
                FROM detalles_pedidos dp
                LEFT JOIN productos_almacen pa 
                    ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                LEFT JOIN productos p 
                    ON pa.productos_id_productos = p.id_productos
                WHERE dp.pedidos_id_pedidos = ?
                ORDER BY dp.id_detalle_pedido DESC";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(["error" => "Error al preparar consulta"]);
            return;
        }

        $stmt->bind_param("i", $id);

        if (!$stmt->execute()) {
            $stmt->close();
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(["error" => "Error al ejecutar consulta"]);
            return;
        }

        $result = $stmt->get_result();
        $idsProductosVariantes = [];

        while ($row = $result->fetch_assoc()) {
            $detalle = [
                "id"                 => $row['id_detalle_pedido'],
                "cantidad"           => $row['cantidad'],
                "observacion"        => $row['observacion'],
                "idpedido"           => $row['pedidos_id_pedidos'],
                "idproductoalmacen"  => $row['productos_almacen_id_productos_almacen'],
                "idproducto"         => $row['id_productos'],
                "codigo"             => $row['codigo'],
                "descripcion"        => $row['descripcion'],
                "idProductoVariante" => $row['idProductoVariante'],
                "sku"                => '',
                "atributos"          => []
            ];

            if (!empty($row['idProductoVariante'])) {
                $idsProductosVariantes[(int)$row['idProductoVariante']] = true;
            }

            $lista[] = $detalle;
        }

        $stmt->close();

        $atributos = [];

        if (!empty($idsProductosVariantes)) {
            $ids = array_keys($idsProductosVariantes);
            $atributos = $this->armarAtributosPedidos($ids);
        }

        foreach ($lista as &$detalle) {
            if (!empty($detalle['idProductoVariante'])) {
                $idVal = (int)$detalle['idProductoVariante'];

                if (isset($atributos[$idVal])) {
                    $detalle['atributos'] = $atributos[$idVal]['valores'];
                    $detalle['sku']       = $atributos[$idVal]['sku'];
                }
            }
        }
        unset($detalle);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($lista);
    }

    public function armarAtributosPedidos(array $ids)
    {
        // Limpiar, convertir a entero y quitar duplicados
        $ids = array_values(array_unique(array_filter(array_map('intval', $ids))));

        if (empty($ids)) {
            return [];
        }

        $lista = [];
        $idsVariantes = [];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        // 1. Obtener variantes que NO estén en serie_producto_variante
        $sqlVariantes = "SELECT 
                            pv.id_Producto_Variante,
                            pv.sku
                        FROM Producto_Variante pv
                        WHERE pv.id_Producto_Variante IN ($placeholders)
                        AND NOT EXISTS (
                            SELECT 1 
                            FROM serie_producto_variante spv 
                            WHERE spv.id_Producto_Variante = pv.id_Producto_Variante
                        )
                        ORDER BY pv.id_Producto_Variante DESC";

        $stmt = $this->prod->prepare($sqlVariantes);
        if (!$stmt) {
            return [];
        }

        $types = str_repeat('i', count($ids));
        $stmt->bind_param($types, ...$ids);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $row['valores'] = [];
            $lista[$row['id_Producto_Variante']] = $row;
            $idsVariantes[] = $row['id_Producto_Variante'];
        }
        $stmt->close();

        if (empty($idsVariantes)) {
            return [];
        }

        // 2. Obtener todos los valores de atributos para las variantes encontradas
        $placeholders2 = implode(',', array_fill(0, count($idsVariantes), '?'));

        $sqlValores = "SELECT 
                vv.id_Producto_Variante,
                vv.id_Valor_Atributo,
                va.valor,
                ap.nombre AS atributo
            FROM Variante_Valor vv
            JOIN Valor_Atributo va 
                ON vv.id_Valor_Atributo = va.id_Valor_Atributo
            JOIN Atributo_producto ap 
                ON va.id_Atributo_producto = ap.id_Atributo_producto
            WHERE vv.id_Producto_Variante IN ($placeholders2)
            ORDER BY vv.id_Producto_Variante, ap.nombre
        ";

        $stmt = $this->dbp->prepare($sqlValores);
        if (!$stmt) {
            return [];
        }

        $types2 = str_repeat('i', count($idsVariantes));
        $stmt->bind_param($types2, ...$idsVariantes);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($fila = $result->fetch_assoc()) {
            $idVariante = $fila['id_Producto_Variante'];

            if (isset($lista[$idVariante])) {
                $lista[$idVariante]['valores'][] = [
                    'id_Valor_Atributo' => $fila['id_Valor_Atributo'],
                    'valor'             => $fila['valor'],
                    'atributo'          => $fila['atributo']
                ];
            }
        }
        $stmt->close();

        // Devolver array asociativo: clave = id_Producto_Variante
        return $lista;
    }

    public function obtenerPedidoCompleto($idPedido)
    {
        header('Content-Type: application/json; charset=utf-8');

        if (!is_numeric($idPedido)) {
            echo json_encode(["error" => "ID de pedido no válido"]);
            return;
        }
        $idPedido = (int)$idPedido;

        // 1. Obtener datos del pedido
        $sqlPedido = "SELECT 
                        p.id_pedidos,
                        p.fecha_pedido,
                        p.autorizacion,
                        p.observacion,
                        p.codigo,
                        p.almacen_id_almacen,
                        a.nombre AS almacen_destino,
                        p.estado,
                        p.tipopedido,
                        p.almacen_origen AS id_almacen_origen,
                        a1.nombre AS almacen_origen,
                        p.usuario,
                        p.nropedido,
                        p.ruta_recibo
                    FROM pedidos p
                    LEFT JOIN almacen a  ON p.almacen_id_almacen = a.id_almacen
                    LEFT JOIN almacen a1 ON p.almacen_origen    = a1.id_almacen
                    WHERE p.id_pedidos = ? 
                        AND p.autorizacion = 1";

        $stmtPedido = $this->cm->prepare($sqlPedido);
        if (!$stmtPedido) {
            echo json_encode(["error" => "Error al preparar consulta de pedido"]);
            return;
        }

        $stmtPedido->bind_param("i", $idPedido);
        if (!$stmtPedido->execute()) {
            $stmtPedido->close();
            echo json_encode(["error" => "Error al ejecutar consulta de pedido"]);
            return;
        }

        $resultPedido = $stmtPedido->get_result();
        $pedidoData   = $resultPedido->fetch_assoc();
        $stmtPedido->close();

        if (!$pedidoData) {
            echo json_encode(["error" => "Pedido no encontrado"]);
            return;
        }

        $pedido = [
            "id"              => $pedidoData['id_pedidos'],
            "fecha"           => $pedidoData['fecha_pedido'],
            "autorizacion"    => $pedidoData['autorizacion'],
            "observacion"     => $pedidoData['observacion'],
            "codigo"          => $pedidoData['codigo'],
            "idalmacen"       => $pedidoData['almacen_id_almacen'],
            "almacen"         => $pedidoData['almacen_destino'],
            "estado"          => $pedidoData['estado'],
            "tipopedido"      => $pedidoData['tipopedido'],
            "idalmacenorigen" => $pedidoData['id_almacen_origen'],
            "almacenorigen"   => $pedidoData['almacen_origen'],
            "idusuario"       => $pedidoData['usuario'],
            "nropedido"       => $pedidoData['nropedido'],
            "ruta"            => $pedidoData['ruta_recibo']
        ];

        // 2. Obtener detalles del pedido
        $sqlDetalle = "SELECT 
                        dp.id_detalle_pedido,
                        dp.cantidad,
                        dp.observacion,
                        dp.pedidos_id_pedidos,
                        dp.productos_almacen_id_productos_almacen,
                        p.codigo,
                        p.descripcion,
                        dp.idProductoVariante,
                        p.id_productos
                    FROM detalles_pedidos dp
                    LEFT JOIN productos_almacen pa 
                        ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    LEFT JOIN productos p 
                        ON pa.productos_id_productos = p.id_productos
                    WHERE dp.pedidos_id_pedidos = ?
                    ORDER BY dp.id_detalle_pedido DESC";

        $stmtDetalle = $this->cm->prepare($sqlDetalle);
        if (!$stmtDetalle) {
            echo json_encode(["error" => "Error al preparar consulta de detalle"]);
            return;
        }

        $stmtDetalle->bind_param("i", $idPedido);
        if (!$stmtDetalle->execute()) {
            $stmtDetalle->close();
            echo json_encode(["error" => "Error al ejecutar consulta de detalle"]);
            return;
        }

        $resultDetalle = $stmtDetalle->get_result();
        $detalles      = [];
        $idsProductosVariantes = [];

        while ($row = $resultDetalle->fetch_assoc()) {
            $detalle = [
                "id"                 => $row['id_detalle_pedido'],
                "cantidad"           => $row['cantidad'],
                "observacion"        => $row['observacion'],
                "idpedido"           => $row['pedidos_id_pedidos'],
                "idproductoalmacen"  => $row['productos_almacen_id_productos_almacen'],
                "idproducto"         => $row['id_productos'],
                "codigo"             => $row['codigo'],
                "descripcion"        => $row['descripcion'],
                "idProductoVariante" => $row['idProductoVariante'],
                "sku"                => '',
                "atributos"          => []
            ];

            if (!empty($row['idProductoVariante'])) {
                $idsProductosVariantes[(int)$row['idProductoVariante']] = true;
            }

            $detalles[] = $detalle;
        }
        $stmtDetalle->close();

        // 3. Obtener atributos en una sola consulta
        $atributos = [];
        if (!empty($idsProductosVariantes)) {
            $ids       = array_keys($idsProductosVariantes);
            $atributos = $this->armarAtributosPedidos($ids);
        }

        // 4. Asignar atributos y sku a cada detalle
        foreach ($detalles as &$detalle) {
            if (!empty($detalle['idProductoVariante'])) {
                $idVal = (int)$detalle['idProductoVariante'];

                if (isset($atributos[$idVal])) {
                    $detalle['atributos'] = $atributos[$idVal]['valores'];
                    $detalle['sku']       = $atributos[$idVal]['sku'];
                }
            }
        }
        unset($detalle);

        // 5. Responder
        echo json_encode([
            "pedido"   => $pedido,
            "detalles" => $detalles
        ]);
    }

    public function getPedido_($id, $idmd5)
    {
        // Obtener idempresa desde idmd5
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Obtener detalle de productos del pedido
        $lista = [];
        $detalles = $this->cm->query("SELECT 
                dp.id_detalle_pedido, 
                p.codigo,
                p.nombre, 
                p.descripcion, 
                dp.cantidad, 
                dp.observacion,
                u.nombre AS unidad
            FROM detalles_pedidos dp
            LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
            LEFT JOIN unidad u on p.unidad_id_unidad = u.id_unidad 
            WHERE dp.pedidos_id_pedidos = '$id'
            ORDER BY p.nombre DESC
        ");
        while ($row = $this->cm->fetch($detalles)) {
            $lista[] = [
                "id" => $row['id_detalle_pedido'],
                "codigo" => $row['codigo'],
                "producto" => $row['nombre'],
                "descripcion" => $row['descripcion'],
                "cantidad" => $row['cantidad'],
                "observacion" => $row['observacion'],
                "unidad" => $row['unidad']
            ];
        }

        // Obtener usuarios asociados a la empresa (como en detalleVenta)
        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");
        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = [
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            ];
        }

        // Obtener info empresa
        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion = '$idempresa'");
        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = [
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            ];
        }

        // Consulta info general del pedido, con joins para almacen y usuario
        
        $pedido = $this->cm->query("SELECT 
                        p.id_pedidos,
                        p.fecha_pedido,
                        p.autorizacion,
                        p.observacion,
                        p.codigo,
                        p.almacen_id_almacen,
                        ad.nombre AS almacen,
                        p.almacen_origen as idalmacenorigen,
                        ao.nombre AS almacen_origen,
                        p.estado,
                        p.tipopedido,
                        p.usuario,
                        p.nropedido
                    FROM pedidos p
                    LEFT JOIN almacen ad 
                        ON p.almacen_id_almacen = ad.id_almacen
                    LEFT JOIN almacen ao 
                        ON p.almacen_origen = ao.id_almacen
                    WHERE p.id_pedidos = '$id';

        ");

        $lista2 = [];
        while ($q = $this->cm->fetch($pedido)) {
            $res = [
                "id" => $q['id_pedidos'],
                "fecha" => $q['fecha_pedido'],
                "autorizacion" => $q['autorizacion'],
                "observacion" => $q['observacion'],
                "codigo" => $q['codigo'],
                "idalmacen" => $q['almacen_id_almacen'],
                "estado" => $q['estado'],
                "tipopedido" => $q['tipopedido'],
                "idalmacenorigen" => $q['idalmacenorigen'],
                "almacen_origen" => $q['almacen_origen'],
                "idusuario" => $q['usuario'],
                "nropedido" => $q['nropedido'],
                "almacen" => $q['almacen'],
                "detalle" => $lista,
                "usuarios" => isset($usuarioInfo[$q['usuario']]) ? array([$usuarioInfo[$q['usuario']]]): [],
                "empresa" => $empresaInfo[$idempresa] ?? []
            ];
            $lista2[] = $res;
        }

        echo json_encode($lista2);
    }

    public function verificarDetallePedido($id)
    {
        // Consulta si existen detalles para el pedido
        $consulta = $this->cm->query("
            SELECT COUNT(*) as total
            FROM detalles_pedidos
            WHERE pedidos_id_pedidos = '$id'
        ");

        $resultado = $this->cm->fetch($consulta);
        $tieneDetalle = $resultado && $resultado['total'] > 0;

        echo json_encode([
            "idpedido" => $id,
            "tieneDetalle" => $tieneDetalle,
            "totalDetalles" => (int)$resultado['total']
        ]);
    }


    public function generarMensajePedidoWhatsapp($id) 
    {
        // Obtener los datos del pedido
        $pedidoConsulta = $this->cm->query("
            SELECT p.nropedido, p.fecha_pedido, p.codigo, a.nombre AS almacen
            FROM pedidos p
            LEFT JOIN almacen a ON p.almacen_id_almacen = a.id_almacen
            WHERE p.id_pedidos = '$id'
        ");
        
        $pedido = $this->cm->fetch($pedidoConsulta);
        if (!$pedido) {
            echo json_encode(["error" => "Pedido no encontrado"]);
            return;
        }

        $nropedido = $pedido[0];
        $fecha = $pedido[1];
        $codigo = $pedido[2];
        $almacen = $pedido[3];

        // Obtener productos del pedido
        $productosConsulta = $this->cm->query("
            SELECT dp.cantidad, p.codigo, p.descripcion
            FROM detalles_pedidos dp
            LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
            WHERE dp.pedidos_id_pedidos = '$id'
            ORDER BY dp.id_detalle_pedido ASC
        ");

        $productosTexto = "";
        $contador = 1;
        while ($prod = $this->cm->fetch($productosConsulta)) {
            $cantidad = $prod[0];
            $codigoProd = $prod[1];
            $descripcion = $prod[2];
            $productosTexto .= "$contador. $descripcion (Cod: $codigoProd) - Cant: $cantidad\n";
            $contador++;
        }

        // Construir mensaje
        $mensaje = "📦 *Pedido N° $nropedido*\n";
        $mensaje .= "📅 Fecha: $fecha\n";
        $mensaje .= "🏬 Almacén: $almacen\n";
        $mensaje .= "🧾 Código: $codigo\n\n";
        $mensaje .= "🛒 *Lista de productos:*\n";
        $mensaje .= $productosTexto;

        // Devolver el mensaje
        echo json_encode(["mensaje" => $mensaje]);
    }

    public function registroDetallePedido($idpedido, $cantidad, $productoalmacen, $idProductoVariante) {
        //     error_reporting(E_ALL);
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        $res = "";

        
        $sql = "INSERT INTO detalles_pedidos (cantidad, observacion, pedidos_id_pedidos, productos_almacen_id_productos_almacen, idProductoVariante) 
                VALUES (?, '0', ?, ?, ?)";


        if ($stmt = $this->cm->prepare($sql)) {
            $stmt->bind_param("iiii", $cantidad, $idpedido, $productoalmacen, $idProductoVariante);

            if ($stmt->execute()) {
                $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }

            $stmt->close();
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al preparar la consulta.");
        }

        echo json_encode($res);
    }

    public function verificarIDdetallepedido($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT dp.id_detalle_pedido, dp.cantidad, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalles_pedidos dp 
        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON dp.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND dp.id_detalle_pedido = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "idproductoalmacen" => $qwe[2], "codigo" => $qwe[3], "descripcion" => $qwe[4], "stock" => $qwe[5]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarDetallePedido($id,$cantidad,$productoalmacen)
    {
        $res = "";
        
        $query_sql = "UPDATE detalles_pedidos SET cantidad='$cantidad', productos_almacen_id_productos_almacen='$productoalmacen' WHERE id_detalle_pedido='$id'";

        $registro = $this->cm->query($query_sql);

        
        if ($registro === true) {
           
            $res = array("estado" => "exito", "mensaje" => "Detalle actualizado correctamente");
        } else {
           
            $res = array("estado" => "error", "mensaje" => "Error al actualizar el detalle. Por favor, inténtalo de nuevo.");
        }
        echo json_encode($res);
    }

    public function eliminarDetallePedido($dato){
        $res="";
        $registro=$this->cm->query("delete from detalles_pedidos where id_detalle_pedido='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function listaCompra($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT 
        i.id_ingreso,
        pr.nombre ,
        i.nombre as lote,i.codigo,
        i.nfactura,
        i.fecha_ingreso,
        i.autorizacion,
         i.estado, 
         i.pedidos_id_pedidos,
         i.almacen_id_almacen,
         i.tipocompra, 
         i.proveedor_id_proveedor, 
         (SELECT SUM(di2.precio_unitario * di2.cantidad) FROM detalle_ingreso di2 WHERE di2.ingreso_id_ingreso = i.id_ingreso) as total,
         i.usuario
        from ingreso as i
        left join proveedor pr on i.proveedor_id_proveedor=pr.id_proveedor
        where pr.id_empresa='$idempresa'
        order by i.fecha_ingreso desc, i.id_ingreso desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array(
                "id"=>$qwe["id_ingreso"],
                "proveedor"=>$qwe["nombre"],
                "lote"=>$qwe["lote"],
                "codigo"=>$qwe["codigo"],
                "nfactura"=>$qwe["nfactura"],
                "fecha"=>$qwe["fecha_ingreso"],
                "autorizacion"=>$qwe["autorizacion"],
                "estado"=>$qwe["estado"],
                "idpedido"=>$qwe["pedidos_id_pedidos"],
                "idalmacen"=>$qwe["almacen_id_almacen"],
                "tipocompra"=>$qwe["tipocompra"],
                "idproveedor"=>$qwe["proveedor_id_proveedor"], 
                "idusuario_md5"=>md5($qwe["usuario"]), 
                "total" => $qwe["total"]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listaLotesxProductoProveedor($idmd5)
    {
        $lista = [];

        // Verificar empresa
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode([
                "success" => false,
                "error" => "El ID de empresa no existe"
            ]);
            return;
        }

        $estado = 1;
        $consulta = "SELECT 
                i.id_ingreso, 
                pr.id_proveedor,
                di.productos_almacen_id_productos_almacen, 
                pr.nombre AS proveedor,
                i.nombre AS lote,
                i.codigo,
                i.nfactura
            FROM ingreso AS i
            LEFT JOIN proveedor pr ON i.proveedor_id_proveedor = pr.id_proveedor
            LEFT JOIN detalle_ingreso di ON di.ingreso_id_ingreso = i.id_ingreso
            WHERE pr.id_empresa = ? AND i.estado = ?
            ORDER BY i.fecha_ingreso DESC, i.id_ingreso DESC
        ";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);
        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "error" => "Error al preparar la consulta SQL: " . $this->cm->error
            ]);
            return;
        }

        // Enlazar parámetros
        $stmt->bind_param('ii', $idempresa, $estado);

        // Ejecutar y obtener resultados
        if (!$stmt->execute()) {
            echo json_encode([
                "success" => false,
                "error" => "Error al ejecutar la consulta: " . $stmt->error
            ]);
            $stmt->close();
            return;
        }

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode([
                "success" => true,
                "data" => []
            ]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($row = $result->fetch_assoc()) {
            $lista[] = [
                "idingreso"   => $row['id_ingreso'],
                "idproveedor" => $row['id_proveedor'],
                "idproducto"  => $row['productos_almacen_id_productos_almacen'],
                "proveedor"   => $row['proveedor'],
                "lote"        => $row['lote'],
                "codigo"      => $row['codigo'],
                "nfactura"    => $row['nfactura'],
            ];
        }

        // Cerrar recursos
        $stmt->close();

        // Respuesta final
        echo json_encode([
            "success" => true,
            "data" => $lista
        ]);
    }


    
    public function listaProductoCompra($idpedido, $idalmacen) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT 
        pa.id_productos_almacen,
        p.codigo,
        p.cod_barras,
        p.nombre,
        p.descripcion,
        pa.pais,
        p.caracteristicas,
        pa.stock_minimo,
        s.cantidad,
        pa.fecha_registro,
        al.id_almacen,
        pa.estado,
        pa.stock_maximo,
        u.nombre
        FROM productos_almacen AS pa
        LEFT JOIN almacen AS al ON pa.almacen_id_almacen=al.id_almacen
        LEFT JOIN productos AS p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock AS s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        LEFT JOIN unidad AS u ON u.id_unidad = p.unidad_id_unidad
        where pa.almacen_id_almacen='$idalmacen' and pa.id_productos_almacen not in (select dp.productos_almacen_id_productos_almacen from detalle_ingreso dp where dp.ingreso_id_ingreso='$idpedido')
        order by pa.id_productos_almacen desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = [
                "idproductoalmacen" => $qwe[0], 
                "codigo" => $qwe[1], 
                "codbarras" => $qwe[2], 
                "nombre" => $qwe[3], 
                "descripcion" => $qwe[4], 
                "pais" => $qwe[5], 
                "caracteristica" => $qwe[6], 
                "stockMin" => $qwe[7], 
                "stock" => $qwe[8], 
                "fecha" => $qwe[9], 
                "idalmacen" => $qwe[10], 
                "estado" => $qwe[11], 
                "stockMax" => $qwe[12],
                "unidad" => $qwe[13],
            ];
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

   
    public function registroCompra($data) {

        date_default_timezone_set('America/La_Paz');
        $nombre     = $data['nombre'] ?? null;
        $codigo     = $data['codigo'] ?? null;
        $proveedor  = $data['proveedor'] ?? null;
        $pedido     = $data['pedido'] ?? 0;
        $factura    = $data['factura'] ?? null;
        $tipocompra = $data['tipocompra'] ?? null;
        $idalmacen  = $data['almacen'] ?? null;
        $idmd5      = $data['idusuario'] ?? null;
        $cajaBanco  = $data['cajabanco'] ?? null;
        $almacen    = $data['nombrealmacen']??null;
        $TIPORESPUESTA = $data['tipoRespuesta'] ?? null;
        $md5empresa = $data['md5empresa'] ?? null;
        $fecha = $data['fecha'] ?? null;
        // $idsvalores = $data['idsvalores'] ?? null;
        
        
        $res = "";
        $idempresa = 0;
        $count = 0;
        
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        
        // 1. Obtener Empresa
        $sql = "SELECT idempresa FROM usuario WHERE idusuario = ?";
        $stmt = $this->rh->prepare($sql);
        $stmt->bind_param("i", $idusuario);
        $stmt->execute();
        $stmt->bind_result($idempresa);

        if ($stmt->fetch()) {
            $stmt->close();
            
            // 2. Verificar duplicados
            $verificarQuery = "SELECT COUNT(*) FROM ingreso i
                            INNER JOIN proveedor p ON i.proveedor_id_proveedor = p.id_proveedor
                            WHERE p.id_empresa = ? AND i.codigo = ?";
            
            $stmt = $this->cm->prepare($verificarQuery);
            $stmt->bind_param("is", $idempresa, $codigo);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();

            if ($count > 0) {
                $res = array("estado" => "error", "mensaje" => "Error: Código duplicado.");
            } else {
                $fecha_creacion = date("Y-m-d");
                
                // 3. Insertar Ingreso (Caso General)
                $queryInsert = "INSERT INTO ingreso(id_ingreso, fecha_ingreso, nombre, codigo, autorizacion, proveedor_id_proveedor, pedidos_id_pedidos, estado, nfactura, tipocompra, almacen_id_almacen, usuario, fecha_creacion) 
                                VALUES (NULL,'$fecha','$nombre','$codigo','2','$proveedor','$pedido','1','$factura','$tipocompra','$idalmacen','$idusuario', '$fecha_creacion')";
                
                $registro = $this->cm->query($queryInsert);
                
                // CAPTURA INMEDIATA DEL ID
                // Si usas PDO: $ultimoId = $this->cm->lastInsertId();
                // Si usas MySQLi: $ultimoId = $this->cm->insert_id;
                $consingreso = $this->cm->query("select i.id_ingreso from ingreso i where i.pedidos_id_pedidos='$pedido' order by i.id_ingreso desc limit 1");

                     $fetchcon = $this->cm->fetch($consingreso);
                     $idingreso = $fetchcon[0];
                $ultimoId = $idingreso;

                if ($registro) {
                    // 4. Si viene de un pedido, registrar detalles
                    if ($pedido != 0) {
                        $lista = $this->cm->query("SELECT dp.cantidad, dp.productos_almacen_id_productos_almacen, pb.precio 
                                                FROM detalles_pedidos dp 
                                                INNER JOIN precio_base pb ON dp.productos_almacen_id_productos_almacen = pb.productos_almacen_id_productos_almacen
                                                WHERE dp.pedidos_id_pedidos = '$pedido' AND pb.estado = '1'");
                        
                        while ($qwe = $this->cm->fetch($lista)) {
                            $precio = $qwe[2];
                            $cantidad = $qwe[0];
                            $idProd = $qwe[1];
                            $this->cm->query("INSERT INTO detalle_ingreso(id_detalle_ingreso, precio_unitario, cantidad, ingreso_id_ingreso, productos_almacen_id_productos_almacen) 
                                            VALUES (NULL, '$precio', '$cantidad', '$ultimoId', '$idProd' )");
                        }
                    }
                    $resultadocajabancos = "";
                    // 5. Registro en Caja/Bancos vía API (si aplica)
                    if ($cajaBanco != null && (int)$tipocompra == 2) {
                        $resultadocajabancos = $this->registrar_caja_bancos_comercial($almacen,$proveedor, $ultimoId, $factura,"contado_compra_comercial","contado_compra_comercial",$cajaBanco,0,"no_autorizado", $md5empresa,"egreso");
                    }

                    $res = [
                                "estado" => "exito",
                                "mensaje" => "Registro exitoso",
                                "almacen" => $idalmacen,
                                "id" => $ultimoId,
                                "resultadocajabancos"=>$resultadocajabancos,
                            ];
                } else {
                    $res = [
                                "estado" => "error",
                                "mensaje" => "Error al ejecutar el insert.",
                                "resultadocajabancos"=>$resultadocajabancos,
                            ];
                }
            }
        } else {
            $res =[
                "estado" => "error",
                "mensaje" => "Usuario no encontrado.",
                "resultadocajabancos"=>$resultadocajabancos,
            ]; 
        }
        return $res;
       
    }
    
    public function registrar_caja_bancos_comercial(
        $lugar,
        $cliente_proveedor,
        $id_documento,
        $nro_documento,
        $registro_desde,
        $concepto,
        $idcaja_bancos,
        $monto,
        $estado,
        $md5,
        $tipoOperacion
    ){
        try {
            date_default_timezone_set('America/La_Paz');
            $fecha = date("Y-m-d H:i:s");

            $url = Config::VITE_URL_APIC;

            $data = [
                "ver"=> "registrar_comprobantes_caja_bancos_comercial",
                "fecha"=> $fecha,
                "lugar"=> $lugar,
                "cliente_proveedor"=> $cliente_proveedor,
                "id_documento"=> $id_documento,
                "nro_documento"=> $nro_documento,
                "registro_desde"=> $registro_desde,
                "concepto"=> $concepto,
                "idcaja_bancos"=> $idcaja_bancos,
                "monto"=> $monto,
                "estado"=> $estado,
                "empresa"=> $md5,
                "ingreso_egreso"=>$tipoOperacion
            ];

            // 🔍 DEBUG: ver qué envías
            error_log("DATA ENVIADA: " . json_encode($data));

            $jsonData = json_encode($data);

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $jsonData,
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($ch);

            // ❌ Error de cURL
            if ($response === false) {
                throw new Exception("Error cURL: " . curl_error($ch));
            }

            // 🔍 Código HTTP
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            curl_close($ch);

            // 🔍 DEBUG respuesta cruda
            error_log("RESPUESTA CRUDA: " . $response);
            error_log("HTTP CODE: " . $httpCode);

            // ❌ Error HTTP
            if ($httpCode != 200) {
                throw new Exception("Error HTTP: " . $httpCode . " - " . $response);
            }

            $result = json_decode($response, true);

            // ❌ JSON inválido
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Error JSON: " . json_last_error_msg());
            }

            return [
                    "response_api"=>$result,
                    "ver"=> "registrar_comprobantes_caja_bancos_comercial",
                    "fecha"=> $fecha,
                    "lugar"=> $lugar,
                    "cliente_proveedor"=> $cliente_proveedor,
                    "id_documento"=> $id_documento,
                    "nro_documento"=> $nro_documento,
                    "registro_desde"=> $registro_desde,
                    "concepto"=> $concepto,
                    "idcaja_bancos"=> $idcaja_bancos,
                    "monto"=> $monto,
                    "estado"=> $estado,
                    "empresa"=> $md5,
                    "ingreso_egreso"=>$tipoOperacion
                ];

        } catch (Exception $e) {
            error_log("ERROR GENERAL: " . $e->getMessage());

            return [
                "estado" => "error",
                "mensaje" => $e->getMessage()
            ];
        }
    }
    public function autorizar_caja_bancos_comercial(
        
        $id_documento,
        $registro_desde,
        $monto,
        $estado,
        
    ){
        try {
            date_default_timezone_set('America/La_Paz');
            $fecha = date("Y-m-d H:i:s");

            $url = Config::VITE_URL_APIC;

            $data = [
                "ver"=> "autorizacion_caja_bancos_comercial",
                "id_documento"=> $id_documento,
                "registro_desde"=> $registro_desde,
                "monto"=> $monto,
                "estado"=> $estado,
            ];

            // 🔍 DEBUG: ver qué envías
            error_log("DATA ENVIADA: " . json_encode($data));

            $jsonData = json_encode($data);

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $jsonData,
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($ch);

            // ❌ Error de cURL
            if ($response === false) {
                throw new Exception("Error cURL: " . curl_error($ch));
            }

            // 🔍 Código HTTP
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            curl_close($ch);

            // 🔍 DEBUG respuesta cruda
            error_log("RESPUESTA CRUDA: " . $response);
            error_log("HTTP CODE: " . $httpCode);

            // ❌ Error HTTP
            if ($httpCode != 200) {
                throw new Exception("Error HTTP: " . $httpCode . " - " . $response);
            }

            $result = ["response_api"=>json_decode($response, true),"ver"=> "autorizacion_caja_bancos_comercial  ",
                "id_documento"=> $id_documento,
                "registro_desde"=> $registro_desde,
                "monto"=> $monto,
                "estado"=> $estado
                ];

            // ❌ JSON inválido
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Error JSON: " . json_last_error_msg());
            }

            return $result;

        } catch (Exception $e) {
            error_log("ERROR GENERAL: " . $e->getMessage());

            return [
                "estado" => "error",
                "mensaje" => $e->getMessage(),
                "id_documento"=> $id_documento,
                "registro_desde"=> $registro_desde,
                "monto"=> $monto,
                "estado"=> $estado
            ];
        }
    }
    public function eliminarCompra($dato){
        $res="";
        $responsable=$this->cm->query("delete from ingreso where id_ingreso='$dato'");
        if($responsable !== null){
            $registro=$this->cm->query("delete from detalle_ingreso where ingreso_id_ingreso='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIDCompra($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select i.id_ingreso,pr.nombre ,i.nombre,i.codigo,i.nfactura,i.fecha_ingreso,i.autorizacion,i.pedidos_id_pedidos,i.almacen_id_almacen,i.tipocompra, i.proveedor_id_proveedor 
        from ingreso as i
        left join proveedor pr on i.proveedor_id_proveedor=pr.id_proveedor
        where i.id_ingreso='$id'");
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id"=>$qwe[0],"proveedor"=>$qwe[1],"lote"=>$qwe[2],"codigo"=>$qwe[3],"nfactura"=>$qwe[4],"fecha"=>$qwe[5],"autorizacion"=>$qwe[6],"idpedido"=>$qwe[7],"idalmacen"=>$qwe[8],"tipocompra"=>$qwe[9],"idproveedor"=>$qwe[10]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarCompra($idingreso, $nombre, $codigo, $proveedor, $factura)
    {
        try {
            $res = "";
            $registro = $this->cm->query("update ingreso SET nombre='$nombre', codigo='$codigo', proveedor_id_proveedor='$proveedor', nfactura='$factura' where id_ingreso='$idingreso'");
            if ($registro !== null) {
                $almacen = $this->cm->fetch($this->cm->query("SELECT almacen_id_almacen FROM ingreso WHERE id_ingreso='$idingreso'"));
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacen" => $almacen[0], "ingreso" => $idingreso);
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function cambiarestadoCompra_($idingreso,$estado,$idpedido,$idalmacen){
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");
        $codigo = "MIC";
        $con = 0;
        $res="";
        $registro=$this->cm->query("update ingreso SET autorizacion='$estado' where id_ingreso='$idingreso'");
        $estadopedido=$this->cm->query("update pedidos SET estado=1 where id_pedidos='$idpedido'");
        $nuevostock=$this->cm->query("select di.productos_almacen_id_productos_almacen, (di.cantidad + s.cantidad) as nuevo, di.id_detalle_ingreso from detalle_ingreso as di inner join stock as s on di.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen where di.ingreso_id_ingreso='$idingreso' and s.estado=1");
        while($stock=$this->cm->fetch($nuevostock)){
            $cambioestado = $this->cm->query("update stock set estado=2 where productos_almacen_id_productos_almacen='$stock[0]' and estado=1");
            if($cambioestado === TRUE){
                $registrostock=$this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen,idorigen) value(null,'$stock[1]','$fecha','$codigo',1,'$stock[0]','$stock[2]')");
            }
        }
            
        if($registro===TRUE){
            $verificarnuevopb = $this->cm->query("select di.precio_unitario, di.productos_almacen_id_productos_almacen from detalle_ingreso as di where di.ingreso_id_ingreso='$idingreso' and not exists(select * from precio_base as pb where pb.productos_almacen_id_productos_almacen=di.productos_almacen_id_productos_almacen)");
            if($verificarnuevopb != 0){
                while($qwe=$this->cm->fetch($verificarnuevopb)){
                    $registropb = $this->cm->query("insert into precio_base(id_precio_base,precio,fecha,estado,productos_almacen_id_productos_almacen) value(null,'$qwe[0]','$fecha',1,'$qwe[1]')");
                    $con++;
                }

                $categoriafil = $this->cm->query("select p.id_porcentajes, p.tipo, p.porcentaje from porcentajes p where p.almacen_id_almacen='$idalmacen'");
                if($categoriafil != 0){
                    $verificarnuevops = $this->cm->query("select di.precio_unitario, di.productos_almacen_id_productos_almacen from detalle_ingreso as di where di.ingreso_id_ingreso='$idingreso' and not exists(select * from precio_sugerido as ps where ps.productos_almacen_id_productos_almacen=di.productos_almacen_id_productos_almacen)");
                    if($verificarnuevops != 0){
                        while($zxc = $this->cm->fetch($verificarnuevops)){
                            $categoria = $this->cm->query("select p.id_porcentajes, p.tipo, p.porcentaje from porcentajes p where p.almacen_id_almacen='$idalmacen'");
                            while($xcv = $this->cm->fetch($categoria)){
                                $precio = (($zxc[0] * $xcv[2]) / 100) + $zxc[0];
                                $idproducto = $zxc[1];
                                $idporcentaje = $xcv[0];
                                $respuesta = $this->cm->query("insert into precio_sugerido (id_precio_sugerido,precio,productos_almacen_id_productos_almacen,porcentajes_id_porcentajes) values(null,'$precio','$idproducto','$idporcentaje')");
                            }
                        }
                    }
                }
            }
            $res = array("success" => $con, "Se Actualizo Correctamente y se registro nuevos precios base y precio sugerido");
            
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }

    public function cambiarestadoCompra($ingresoId, $estadoNuevo, $pedidoId, $almacenId,$TIPORESPUESTAESTADO = NULL) {
        // Inicializar el array de respuesta
        $response = [
            'status' => 'error',
            'message' => 'Ocurrió un error desconocido.',
            'new_prices_registered' => 0,
            'new_suggested_prices_registered' => 0
        ];

        // Obtener la fecha actual para registros
        $fechaActual = date("Y-m-d H:i:s"); // Usar H:i:s para incluir la hora si es relevante para registros
        $codigoStock = "MIC"; // Código para el registro de stock

        // Iniciar transacción para asegurar atomicidad de las operaciones
        $this->cm->begin_transaction();

        try {
            // 1. Actualizar estado del ingreso
            $stmtIngreso = $this->cm->prepare("UPDATE ingreso SET autorizacion = ? WHERE id_ingreso = ?");
            if (!$stmtIngreso) {
                throw new Exception("Error al preparar la consulta de actualización de ingreso: " . $this->cm->error);
            }
            $stmtIngreso->bind_param("ii", $estadoNuevo, $ingresoId);
            if (!$stmtIngreso->execute()) {
                throw new Exception("Error al actualizar el estado del ingreso: " . $stmtIngreso->error);
            }
            $stmtIngreso->close();

            if($pedidoId !== null){
                // 2. Actualizar estado del pedido
                $stmtPedido = $this->cm->prepare("UPDATE pedidos SET estado = 1 WHERE id_pedidos = ?");
                if (!$stmtPedido) {
                    throw new Exception("Error al preparar la consulta de actualización de pedido: " . $this->cm->error);
                }
                $stmtPedido->bind_param("i", $pedidoId);
                if (!$stmtPedido->execute()) {
                    throw new Exception("Error al actualizar el estado del pedido: " . $stmtPedido->error);
                }
                $stmtPedido->close();
            }
            

            // // 3. Actualizar stock: Obtener y procesar el nuevo stock
            // $stmtDetalleIngresoStock = $this->cm->prepare(
            //     "SELECT di.productos_almacen_id_productos_almacen, (di.cantidad + s.cantidad) AS nuevo_stock_cantidad, di.id_detalle_ingreso
            //      FROM detalle_ingreso AS di
            //      INNER JOIN stock AS s ON di.productos_almacen_id_productos_almacen = s.productos_almacen_id_productos_almacen
            //      WHERE di.ingreso_id_ingreso = ? AND s.estado = 1"
            // );
            // =========================================================================
            // 3. ACTUALIZACIÓN DE STOCK (PASOS SEPARADOS)
            // =========================================================================

            // Consulta A: Obtener la suma acumulada de cantidades por producto en este ingreso
            $sqlAgrupado = "SELECT 
                                di.productos_almacen_id_productos_almacen, 
                                SUM(di.cantidad) AS cantidad_ingreso, 
                                MAX(di.id_detalle_ingreso) AS id_detalle_ingreso
                            FROM detalle_ingreso AS di
                            WHERE di.ingreso_id_ingreso = ?
                            GROUP BY di.productos_almacen_id_productos_almacen";

            $stmtAgrupado = $this->cm->prepare($sqlAgrupado);
            if (!$stmtAgrupado) {
                throw new Exception("Error al preparar agrupar ingreso: " . $this->cm->error);
            }
            $stmtAgrupado->bind_param("i", $ingresoId);
            if (!$stmtAgrupado->execute()) {
                throw new Exception("Error al ejecutar agrupar ingreso: " . $stmtAgrupado->error);
            }
            
            $resAgrupado = $stmtAgrupado->get_result();
            $productosIngreso = [];
            while ($row = $resAgrupado->fetch_assoc()) {
                $productosIngreso[] = $row;
            }
            $stmtAgrupado->close();

            // Preparación de consultas para iterar producto por producto
            $stmtStockActual = $this->cm->prepare(
                "SELECT cantidad FROM stock WHERE productos_almacen_id_productos_almacen = ? AND estado = 1 LIMIT 1"
            );
            $stmtDesactivarStock = $this->cm->prepare(
                "UPDATE stock SET estado = 2 WHERE productos_almacen_id_productos_almacen = ? AND estado = 1"
            );
            $stmtRegistrarStock = $this->cm->prepare(
                "INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen, idorigen) VALUES (?, ?, ?, ?, ?, ?)"
            );



            foreach ($productosIngreso as $item) {
                $productoAlmacenId = $item['productos_almacen_id_productos_almacen'];
                $cantidadIngresada = (float)$item['cantidad_ingreso'];
                $idorigen = $item['id_detalle_ingreso'];

                // Consulta B: Obtener únicamente el stock actual activo del producto
                $stmtStockActual->bind_param("i", $productoAlmacenId);
                $stmtStockActual->execute();
                $resStockActual = $stmtStockActual->get_result();

                $stockActual = 0;
                if ($rowStock = $resStockActual->fetch_assoc()) {
                    $stockActual = (float)$rowStock['cantidad'];
                }

                // Cálculo en PHP
                $nuevaCantidadStock = $stockActual + $cantidadIngresada;

                // Consulta C: Desactivar el stock anterior
                $stmtDesactivarStock->bind_param("i", $productoAlmacenId);
                if (!$stmtDesactivarStock->execute()) {
                    throw new Exception("Error al desactivar stock anterior para el producto " . $productoAlmacenId);
                }

                // Consulta D: Registrar nuevo registro de stock
                $estadoStockNuevo = 1;
                $stmtRegistrarStock->bind_param("dssiii", $nuevaCantidadStock, $fechaActual, $codigoStock, $estadoStockNuevo, $productoAlmacenId, $idorigen);
                if (!$stmtRegistrarStock->execute()) {
                    throw new Exception("Error al registrar nuevo stock para el producto " . $productoAlmacenId);
                }
            }

            $stmtStockActual->close();
            $stmtDesactivarStock->close();
            $stmtRegistrarStock->close();
            

            // Después de procesar stock general (tabla 'stock') y antes de commit:

            // Procesar stock de variantes
            $sqlVariantes = "SELECT di.id_detalle_ingreso, di.cantidad, di.productos_almacen_id_productos_almacen, di.idProductoVariante
                            FROM detalle_ingreso di
                            WHERE di.ingreso_id_ingreso = ? AND di.idProductoVariante IS NOT NULL";
            $stmtVariantes = $this->cm->prepare($sqlVariantes);
            $stmtVariantes->bind_param("i", $ingresoId);
            $stmtVariantes->execute();
            $resultVariantes = $stmtVariantes->get_result();

            while ($rowVariante = $resultVariantes->fetch_assoc()) {
                $idDetalle = $rowVariante['id_detalle_ingreso'];
                $cantidad = (int)$rowVariante['cantidad'];
                $productoAlmacenId = (int)$rowVariante['productos_almacen_id_productos_almacen'];
                $productoVarianteId = (int)$rowVariante['idProductoVariante'];

                // Verificar si existe stock_variante
                $sqlCheck = "SELECT idstock_variante, cantidad FROM stock_variante 
                            WHERE producto_variante_idproducto_variante = ? AND producto_almacen_idproducto_almacen = ?";
                $stmtCheck = $this->cm->prepare($sqlCheck);
                $stmtCheck->bind_param("ii", $productoVarianteId, $productoAlmacenId);
                $stmtCheck->execute();
                $resultCheck = $stmtCheck->get_result();

                if ($rowStock = $resultCheck->fetch_assoc()) {
                    // Actualizar stock existente
                    $nuevoStock = $rowStock['cantidad'] + $cantidad;
                    $sqlUpdate = "UPDATE stock_variante SET cantidad = ? WHERE idstock_variante = ?";
                    $stmtUpdate = $this->cm->prepare($sqlUpdate);
                    $stmtUpdate->bind_param("ii", $nuevoStock, $rowStock['idstock_variante']);
                    $stmtUpdate->execute();
                    $idStockVariante = $rowStock['idstock_variante'];
                } else {
                    // Insertar nuevo stock_variante
                    $sqlInsertStock = "INSERT INTO stock_variante (cantidad, producto_variante_idproducto_variante, producto_almacen_idproducto_almacen) 
                                    VALUES (?, ?, ?)";
                    $stmtInsertStock = $this->cm->prepare($sqlInsertStock);
                    $stmtInsertStock->bind_param("iii", $cantidad, $productoVarianteId, $productoAlmacenId);
                    $stmtInsertStock->execute();
                    $idStockVariante = $this->cm->insert_id;
                }

                // Registrar operación
                $fechaOperacion = date("Y-m-d H:i:s");
                $sqlOperacion = "INSERT INTO operaciones_producto_variante 
                                (stock_variante_idstock_variante, cantidad, operacion, idoperacion, fecha) 
                                VALUES (?, ?, 'COMPRA', ?, ?)";
                $stmtOper = $this->cm->prepare($sqlOperacion);
                $stmtOper->bind_param("iiis", $idStockVariante, $cantidad, $idDetalle, $fechaOperacion);
                $stmtOper->execute();
            }

            // 4. Registrar nuevos precios base si no existen
            $stmtVerificarPrecioBase = $this->cm->prepare(
                "SELECT di.precio_unitario, di.productos_almacen_id_productos_almacen
                 FROM detalle_ingreso AS di
                 WHERE di.ingreso_id_ingreso = ?
                 AND NOT EXISTS (SELECT 1 FROM precio_base AS pb WHERE pb.productos_almacen_id_productos_almacen = di.productos_almacen_id_productos_almacen)"
            );
            if (!$stmtVerificarPrecioBase) {
                throw new Exception("Error al preparar la consulta de verificación de precio base: " . $this->cm->error);
            }
            $stmtVerificarPrecioBase->bind_param("i", $ingresoId);
            if (!$stmtVerificarPrecioBase->execute()) {
                throw new Exception("Error al ejecutar la consulta de verificación de precio base: " . $stmtVerificarPrecioBase->error);
            }
            $resultadoVerificarPrecioBase = $stmtVerificarPrecioBase->get_result();

            $preciosBaseRegistrados = 0;
            while ($filaPrecioBase = $resultadoVerificarPrecioBase->fetch_assoc()) {
                $precioUnitario = $filaPrecioBase['precio_unitario'];
                $productoAlmacenId = $filaPrecioBase['productos_almacen_id_productos_almacen'];

                $stmtRegistrarPrecioBase = $this->cm->prepare("INSERT INTO precio_base (precio, fecha, estado, productos_almacen_id_productos_almacen) VALUES (?, ?, ?, ?)");
                if (!$stmtRegistrarPrecioBase) {
                    throw new Exception("Error al preparar la consulta de registro de precio base: " . $this->cm->error);
                }
                $estadoPrecioBase = 1; // Estado activo para precio base
                $stmtRegistrarPrecioBase->bind_param("dsii", $precioUnitario, $fechaActual, $estadoPrecioBase, $productoAlmacenId);
                if (!$stmtRegistrarPrecioBase->execute()) {
                    throw new Exception("Error al registrar precio base para producto " . $productoAlmacenId . ": " . $stmtRegistrarPrecioBase->error);
                }
                $stmtRegistrarPrecioBase->close();
                $preciosBaseRegistrados++;
            }
            $stmtVerificarPrecioBase->close();
            $response['new_prices_registered'] = $preciosBaseRegistrados;

            // 5. Registrar nuevos precios sugeridos si no existen
            // Obtener porcentajes de categorías para el almacén
            $stmtPorcentajes = $this->cm->prepare("SELECT id_porcentajes, porcentaje FROM porcentajes WHERE almacen_id_almacen = ?");
            if (!$stmtPorcentajes) {
                throw new Exception("Error al preparar la consulta de porcentajes: " . $this->cm->error);
            }
            $stmtPorcentajes->bind_param("i", $almacenId);
            if (!$stmtPorcentajes->execute()) {
                throw new Exception("Error al ejecutar la consulta de porcentajes: " . $stmtPorcentajes->error);
            }
            $resultadoPorcentajes = $stmtPorcentajes->get_result();
            $porcentajes = [];
            while ($filaPorcentaje = $resultadoPorcentajes->fetch_assoc()) {
                $porcentajes[] = $filaPorcentaje;
            }
            $stmtPorcentajes->close();

            if (!empty($porcentajes)) {
                $stmtVerificarPrecioSugerido = $this->cm->prepare(
                    "SELECT di.precio_unitario, di.productos_almacen_id_productos_almacen
                     FROM detalle_ingreso AS di
                     WHERE di.ingreso_id_ingreso = ?
                     AND NOT EXISTS (SELECT 1 FROM precio_sugerido AS ps WHERE ps.productos_almacen_id_productos_almacen = di.productos_almacen_id_productos_almacen)"
                );
                if (!$stmtVerificarPrecioSugerido) {
                    throw new Exception("Error al preparar la consulta de verificación de precio sugerido: " . $this->cm->error);
                }
                $stmtVerificarPrecioSugerido->bind_param("i", $ingresoId);
                if (!$stmtVerificarPrecioSugerido->execute()) {
                    throw new Exception("Error al ejecutar la consulta de verificación de precio sugerido: " . $stmtVerificarPrecioSugerido->error);
                }
                $resultadoVerificarPrecioSugerido = $stmtVerificarPrecioSugerido->get_result();

                $preciosSugeridosRegistrados = 0;
                while ($filaPrecioSugerido = $resultadoVerificarPrecioSugerido->fetch_assoc()) {
                    $precioUnitarioBase = $filaPrecioSugerido['precio_unitario'];
                    $productoAlmacenId = $filaPrecioSugerido['productos_almacen_id_productos_almacen'];

                    foreach ($porcentajes as $porcentajeData) {
                        $idPorcentaje = $porcentajeData['id_porcentajes'];
                        $porcentajeValor = $porcentajeData['porcentaje'];
                        $precioSugeridoCalculado = (($precioUnitarioBase * $porcentajeValor) / 100) + $precioUnitarioBase;

                        $stmtRegistrarPrecioSugerido = $this->cm->prepare("INSERT INTO precio_sugerido (precio, productos_almacen_id_productos_almacen, porcentajes_id_porcentajes) VALUES (?, ?, ?)");
                        if (!$stmtRegistrarPrecioSugerido) {
                            throw new Exception("Error al preparar la consulta de registro de precio sugerido: " . $this->cm->error);
                        }
                        $stmtRegistrarPrecioSugerido->bind_param("dii", $precioSugeridoCalculado, $productoAlmacenId, $idPorcentaje);
                        if (!$stmtRegistrarPrecioSugerido->execute()) {
                            throw new Exception("Error al registrar precio sugerido para producto " . $productoAlmacenId . " y porcentaje " . $idPorcentaje . ": " . $stmtRegistrarPrecioSugerido->error);
                        }
                        $stmtRegistrarPrecioSugerido->close();
                        $preciosSugeridosRegistrados++;
                    }
                }
                $stmtVerificarPrecioSugerido->close();
                $response['new_suggested_prices_registered'] = $preciosSugeridosRegistrados;
            }

            // Si todas las operaciones fueron exitosas, confirmar la transacción
            
            $sqlTotalIngreso = "SELECT 
                        ROUND(SUM(cantidad * precio_unitario), 2) AS total
                    FROM detalle_ingreso
                    WHERE ingreso_id_ingreso = ?";

            $stmtTotalIngreso = $this->cm->prepare($sqlTotalIngreso);

            if (!$stmtTotalIngreso) {
                throw new Exception("Error al preparar la consulta: " . $this->cm->error);
            }

            $stmtTotalIngreso->bind_param("i", $ingresoId);

            if (!$stmtTotalIngreso->execute()) {
                throw new Exception("Error al ejecutar: " . $stmtTotalIngreso->error);
            }
            $resultadocajabancos="";    
            // 🔥 Obtener resultado
            $stmtTotalIngreso->bind_result($TotalIngreso);
            $stmtTotalIngreso->fetch();
            $stmtTotalIngreso->close();
            if((float)$TotalIngreso>0){
                $resultadocajabancos = $this->autorizar_caja_bancos_comercial($ingresoId,"contado_compra_comercial",$TotalIngreso,"autorizado");
            }
            
            
            $this->cm->commit();
            $response['status'] = 'ok';
            $response['message'] = 'Compra procesada exitosamente. Se registraron ' . $response['new_prices_registered'] . ' nuevos precios base y ' . $response['new_suggested_prices_registered'] . ' nuevos precios sugeridos.';
            $response['resultadocajabancos'] = $resultadocajabancos;

        } catch (Exception $e) {
            // Si ocurre algún error, revertir la transacción
            $this->cm->rollback();
            $response['status'] = 'error';
            $response['message'] = 'Error al procesar la venta: ' . $e->getMessage();
            // Opcional: registrar el error en un log para depuración
            error_log("Error en cambiarestadoCompra: " . $e->getMessage());
        } finally {
            // Asegurarse de que cualquier statement abierto se cierre si no se hizo explícitamente
            // (aunque con close() explícito, esto es más una medida de seguridad)
            // if (isset($stmtIngreso) && $stmtIngreso->num_rows > 0) $stmtIngreso->close();
            // ... y así para todos los statements si no se cierran dentro del try
        }

        // Devolver la respuesta en formato JSON
        echo json_encode($response);
    }

    public function cancelarCompra($id){
        try {
            $registro = $this->cm->query("delete from detalle_ingreso where ingreso_id_ingreso='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listaDetalleCompra2($id) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT dp.id_detalle_ingreso, dp.cantidad, dp.ingreso_id_ingreso, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, dp.precio_unitario FROM detalle_ingreso dp
        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE dp.ingreso_id_ingreso = '$id'
        ORDER BY dp.id_detalle_ingreso DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "cantidad" => $qwe[1], "idingreso" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5], "precio" => $qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listaDetalleCompra3($id) {
        $lista = [];

        // Usamos prepare para seguridad y unimos toda la lógica en una sola consulta
        $query = "SELECT 
                    dp.id_detalle_ingreso, 
                    dp.cantidad, 
                    dp.ingreso_id_ingreso, 
                    dp.productos_almacen_id_productos_almacen, 
                    p.codigo, 
                    p.descripcion, 
                    dp.precio_unitario,
                    -- Agrupamos los códigos únicos en un objeto JSON limpio
                    JSON_ARRAYAGG(
                        IF(pu.idproducto_unico IS NOT NULL,
                            JSON_OBJECT(
                                'id', pu.idproducto_unico, 
                                'codigo', pu.codigo_unico,
                                'serie', pu.codigo_unico
                            ),
                            NULL
                        )
                        ORDER BY pu.idproducto_unico ASC
                    ) AS productos_detallados,
                    COUNT(pu.idproducto_unico) AS total_codigos_vinculados
                FROM detalle_ingreso dp
                LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
                -- Join con historial usando el ID del detalle (referencia_id)
                LEFT JOIN historial_producto_unico hpu ON hpu.referencia_id = dp.id_detalle_ingreso 
                    AND hpu.tipo_evento = 'COMPRA'
                LEFT JOIN producto_unico pu ON pu.idproducto_unico = hpu.id_producto_unico
                WHERE dp.ingreso_id_ingreso = ?
                GROUP BY dp.id_detalle_ingreso
                ORDER BY dp.id_detalle_ingreso DESC";

        $stmt = $this->cm->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        while ($row = $resultado->fetch_assoc()) {
            // Decodificamos el JSON que viene de la base de datos para que sea un array real en PHP
            $detallados = json_decode($row['productos_detallados'], true);
            
            // Limpiamos el array de nulos (en caso de que el detalle no tenga productos únicos)
            $detalladosLimpio = is_array($detallados) ? array_values(array_filter($detallados)) : [];

            $res = array(
                "id" => $row['id_detalle_ingreso'],
                "cantidad" => $row['cantidad'],
                "idingreso" => $row['ingreso_id_ingreso'],
                "idproductoalmacen" => $row['productos_almacen_id_productos_almacen'],
                "codigo" => $row['codigo'],
                "descripcion" => $row['descripcion'],
                "precio" => $row['precio_unitario'],
                "productos_detallados" => $detalladosLimpio,
                "total_unicos" => $row['total_codigos_vinculados']
            );
            array_push($lista, $res);
        }

        header('Content-Type: application/json');
        echo json_encode($lista);
    }
    public function listaDetalleCompra($id) {
        $lista = [];

        // Incluir idProductoVariante en la consulta
        $query = "SELECT 
                    dp.id_detalle_ingreso, 
                    dp.cantidad, 
                    dp.ingreso_id_ingreso, 
                    dp.productos_almacen_id_productos_almacen, 
                    p.codigo, 
                    p.descripcion, 
                    dp.precio_unitario,
                    dp.idProductoVariante,
                    JSON_ARRAYAGG(
                        IF(pu.idproducto_unico IS NOT NULL,
                            JSON_OBJECT(
                                'id', pu.idproducto_unico, 
                                'codigo', pu.codigo_unico,
                                'serie', pu.codigo_unico
                            ),
                            NULL
                        )
                        ORDER BY pu.idproducto_unico ASC
                    ) AS productos_detallados,
                    COUNT(pu.idproducto_unico) AS total_codigos_vinculados
                FROM detalle_ingreso dp
                LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
                LEFT JOIN historial_producto_unico hpu ON hpu.referencia_id = dp.id_detalle_ingreso 
                    AND hpu.tipo_evento = 'COMPRA'
                LEFT JOIN producto_unico pu ON pu.idproducto_unico = hpu.id_producto_unico
                WHERE dp.ingreso_id_ingreso = ?
                GROUP BY dp.id_detalle_ingreso, dp.idProductoVariante
                ORDER BY dp.id_detalle_ingreso DESC";

        $stmt = $this->cm->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        $variantIds = [];
        while ($row = $resultado->fetch_assoc()) {
            $detallados = json_decode($row['productos_detallados'], true);
            $detalladosLimpio = is_array($detallados) ? array_values(array_filter($detallados)) : [];

            $res = array(
                "id" => $row['id_detalle_ingreso'],
                "cantidad" => $row['cantidad'],
                "idingreso" => $row['ingreso_id_ingreso'],
                "idproductoalmacen" => $row['productos_almacen_id_productos_almacen'],
                "codigo" => $row['codigo'],
                "descripcion" => $row['descripcion'],
                "precio" => $row['precio_unitario'],
                "productos_detallados" => $detalladosLimpio,
                "total_unicos" => $row['total_codigos_vinculados'],
                "idProductoVariante" => $row['idProductoVariante'] // Puede ser null
            );

            if ($row['idProductoVariante'] !== null) {
                $variantIds[] = $row['idProductoVariante'];
            }

            $lista[] = $res;
        }
        $stmt->close();

        // Obtener información de variantes desde prod si hay IDs
        if (!empty($variantIds)) {
            $variantIds = array_unique(array_map('intval', $variantIds));
            $placeholders = implode(',', array_fill(0, count($variantIds), '?'));

            $sqlVariantes = "SELECT 
                                pv.id_Producto_Variante,
                                pv.sku,
                                pv.precio_base,
                                pv.codigo_barras,
                                va.valor,
                                ap.nombre AS atributo,
                                va.id_Valor_Atributo
                            FROM Producto_Variante pv
                            LEFT JOIN Variante_Valor vv ON vv.id_Producto_Variante = pv.id_Producto_Variante
                            LEFT JOIN Valor_Atributo va ON va.id_Valor_Atributo = vv.id_Valor_Atributo
                            LEFT JOIN Atributo_producto ap ON ap.id_Atributo_producto = va.id_Atributo_producto
                            WHERE pv.id_Producto_Variante IN ($placeholders)";

            $stmtProd = $this->prod->prepare($sqlVariantes);
            $types = str_repeat('i', count($variantIds));
            $stmtProd->bind_param($types, ...$variantIds);
            $stmtProd->execute();
            $resultProd = $stmtProd->get_result();

            $variantesInfo = [];
            while ($rowProd = $resultProd->fetch_assoc()) {
                $idVar = (int)$rowProd['id_Producto_Variante'];
                if (!isset($variantesInfo[$idVar])) {
                    $variantesInfo[$idVar] = [
                        'id_Producto_Variante' => $idVar,
                        'sku' => $rowProd['sku'],
                        'precio_base' => $rowProd['precio_base'],
                        'codigo_barras' => $rowProd['codigo_barras'],
                        'atributos' => []
                    ];
                }
                // Agregar atributo si existe
                if ($rowProd['id_Valor_Atributo'] !== null) {
                    $variantesInfo[$idVar]['atributos'][] = [
                        'id_Valor_Atributo' => (int)$rowProd['id_Valor_Atributo'],
                        'valor' => $rowProd['valor'],
                        'atributo' => $rowProd['atributo']
                    ];
                }
            }
            $stmtProd->close();

            // Asignar variante a cada item correspondiente
            foreach ($lista as &$item) {
                if ($item['idProductoVariante'] !== null && isset($variantesInfo[(int)$item['idProductoVariante']])) {
                    $item['variante'] = $variantesInfo[(int)$item['idProductoVariante']];
                } else {
                    $item['variante'] = null;
                }
                // Quitar el campo temporal si no se desea exponerlo (opcional)
                // unset($item['idProductoVariante']);
            }
            unset($item);
        } else {
            // Si no hay variantes, aseguramos que la clave exista
            foreach ($lista as &$item) {
                $item['variante'] = null;
            }
            unset($item);
        }

        header('Content-Type: application/json');
        echo json_encode($lista);
    }

    public function registroDetalleCompra2($precio,$cantidad,$idingreso,$productoalmacen,$TIPORESPUESTA = null, $registrarProUnico = NULL){
        $sqlProd = $this->cm->query("SELECT p.codigo FROM productos p 
                                 JOIN productos_almacen pa ON p.id_productos = pa.productos_id_productos 
                                 WHERE pa.id_productos_almacen = '$productoalmacen'");
        $rowProd = $sqlProd->fetch_assoc();
        $codProducto = $rowProd['codigo'];

        // B. Obtener el código del ingreso (compra)
        $sqlIng = $this->cm->query("SELECT codigo FROM ingreso WHERE id_ingreso = '$idingreso'");
        $rowIng = $sqlIng->fetch_assoc();
        $codCompra = $rowIng['codigo'];

        $sqlUSUARIO = $this->cm->query("SELECT usuario FROM ingreso WHERE id_ingreso = '$idingreso'");
        $rowUs = $sqlUSUARIO->fetch_assoc();
        $idUsuario = $rowUs['usuario'];

        $res="";
        $registro=$this->cm->query("insert into detalle_ingreso(id_detalle_ingreso,precio_unitario,cantidad,ingreso_id_ingreso,productos_almacen_id_productos_almacen)value(NULL,'$precio','$cantidad','$idingreso','$productoalmacen')");
        if($registro !== null){
            // 2. Generar los Códigos Únicos Correlativos
            $listaCodigos = [];
            for ($i = 1; $i <= $cantidad; $i++) {
                // Ejemplo: LAP-ING001-1
                $listaCodigos[] = $codProducto . "-" . $codCompra . "-" . $i;
            }

            // Estructura idéntica a la que espera ingresoPorCompra(array $data)
            $dataParaEnvio = [
                "compra_id"  => (int)$idingreso,
                "id_usuario" => (int)$idUsuario,
                "productos"  => [
                    [
                        "productos_almacen_id" => (int)$productoalmacen,
                        "cantidad"             => (int)$cantidad,
                        "codigos"              => $listaCodigos
                    ]
                ]
            ];

            // 3. LLAMAR A LA FUNCIÓN DE REGISTRO DE CÓDIGOS ÚNICOS
            // Suponiendo que está en la misma clase ($this)
            $registrarProUnicoBool = filter_var($registrarProUnico, FILTER_VALIDATE_BOOLEAN);
            $resProUnico = "Ningun Producto Unico Registrado";
            if($registrarProUnico != null && $registrarProUnicoBool){
                $resultadoUnicos = $this->productoUnico->ingresoPorCompra($dataParaEnvio);
                $resProUnico = json_decode($resultadoUnicos, true);
            }
            
            
            // Decodificamos la respuesta para manejarla aquí
           
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "registroProUnico"=>$resProUnico, "productoUnico"=>$registrarProUnico, "idIngreso"=>$idingreso);

        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        if($TIPORESPUESTA == null){
            echo json_encode($res);
        }elseif($TIPORESPUESTA == 1){
            return ;
        }
        
    }
    public function registroDetalleCompra3($precio, $cantidad, $idingreso, $productoalmacen, $TIPORESPUESTA = null, $registrarProUnico = NULL, $idProductoVariante = null) {
        // 1. Obtener código del producto y almacén (Sentencia preparada)
        $stmtProd = $this->cm->prepare("SELECT p.codigo FROM productos p 
                                    JOIN productos_almacen pa ON p.id_productos = pa.productos_id_productos 
                                    WHERE pa.id_productos_almacen = ?");
        $stmtProd->bind_param("i", $productoalmacen); // "i" para integer
        $stmtProd->execute();
        $rowProd = $stmtProd->get_result()->fetch_assoc();
        $codProducto = $rowProd['codigo'] ?? 'S-COD';

        // 2. Obtener código del ingreso y usuario
        $stmtIng = $this->cm->prepare("SELECT codigo, usuario FROM ingreso WHERE id_ingreso = ?");
        $stmtIng->bind_param("i", $idingreso);
        $stmtIng->execute();
        $rowIng = $stmtIng->get_result()->fetch_assoc();
        $codCompra = $rowIng['codigo'] ?? 'S-COMP';
        $idUsuario = $rowIng['usuario'] ?? 0;

        // 3. Insertar detalle_ingreso (Sentencia preparada)
        // El orden de tipos en bind_param debe coincidir con las columnas: d (double/float), d (double), i (int), i (int)
        $stmtIns = $this->cm->prepare("INSERT INTO detalle_ingreso (id_detalle_ingreso, precio_unitario, cantidad, ingreso_id_ingreso, productos_almacen_id_productos_almacen, idProductoVariante) VALUES (NULL, ?, ?, ?, ?, ?)");
        $stmtIns->bind_param("ddiii", $precio, $cantidad, $idingreso, $productoalmacen, $idProductoVariante);
        
        if ($stmtIns->execute()) {
            // Capturamos el ID del detalle recién insertado para la trazabilidad exacta
            $idDetalleInsertado = $this->cm->insert_id;

            // 4. Generar los Códigos Únicos Correlativos
            $listaCodigos = [];
            for ($i = 1; $i <= $cantidad; $i++) {
                $listaCodigos[] = $codProducto . "-" . $codCompra . "-" . $i;
            }

            // Estructura para el envío
            $dataParaEnvio = [
                "compra_id"    => (int)$idDetalleInsertado,
                "id_usuario"   => (int)$idUsuario,
                "productos"    => [
                    [
                        "productos_almacen_id" => (int)$productoalmacen,
                        "cantidad"             => (int)$cantidad,
                        "codigos"              => $listaCodigos
                    ]
                ]
            ];

            // 5. Registro de Códigos Únicos
            $registrarProUnicoBool = filter_var($registrarProUnico, FILTER_VALIDATE_BOOLEAN);
            $resProUnico = "Ningun Producto Unico Registrado";

            if ($registrarProUnico !== null && $registrarProUnicoBool) {
                $resultadoUnicos = $this->productoUnico->ingresoPorCompra($dataParaEnvio);
                $resProUnico = json_decode($resultadoUnicos, true);
            }

            $res = [
                "estado" => "exito", 
                "mensaje" => "Registro exitoso", 
                "registroProUnico" => $resProUnico, 
                "idIngreso" => $idingreso,
                "idDetalle" => $idDetalleInsertado
            ];

        } else {
            $res = ["estado" => "error", "mensaje" => "Error al intentar registrar: " . $this->cm->error];
        }

        // Respuesta
        if ($TIPORESPUESTA === null) {
            header('Content-Type: application/json');
            echo json_encode($res);
        } else {
            return $res;
        }
    }
    public function registroDetalleCompra(array $data, $TIPORESPUESTA = null) {
        // Extraer valores del arreglo $data con valores por defecto
        $precio            = $data['precio'] ?? null;
        $cantidad          = $data['cantidad'] ?? null;
        $idingreso         = $data['idingreso'] ?? null;
        $productoalmacen   = $data['productoalmacen'] ?? null;
        $registrarProUnico = $data['registrarProUnico'] ?? null;
        $idProductoVariante = $data['idProductoVariante'] ?? null;

        // Validar datos requeridos (opcional pero recomendado)
        if ($precio === null || $cantidad === null || $idingreso === null || $productoalmacen === null) {
            $res = ["estado" => "error", "mensaje" => "Faltan datos obligatorios en el arreglo \$data"];
            return $this->responder($TIPORESPUESTA, $res);
        }

        // 1. Obtener código del producto y almacén (Sentencia preparada)
        $stmtProd = $this->cm->prepare("SELECT p.codigo FROM productos p 
                                        JOIN productos_almacen pa ON p.id_productos = pa.productos_id_productos 
                                        WHERE pa.id_productos_almacen = ?");
        $stmtProd->bind_param("i", $productoalmacen);
        $stmtProd->execute();
        $rowProd = $stmtProd->get_result()->fetch_assoc();
        $codProducto = $rowProd['codigo'] ?? 'S-COD';

        // 2. Obtener código del ingreso y usuario
        $stmtIng = $this->cm->prepare("SELECT codigo, usuario FROM ingreso WHERE id_ingreso = ?");
        $stmtIng->bind_param("i", $idingreso);
        $stmtIng->execute();
        $rowIng = $stmtIng->get_result()->fetch_assoc();
        $codCompra = $rowIng['codigo'] ?? 'S-COMP';
        $idUsuario = $rowIng['usuario'] ?? 0;

        // 3. Insertar detalle_ingreso (Sentencia preparada)
        $sqlBase = "INSERT INTO detalle_ingreso (id_detalle_ingreso, precio_unitario, cantidad, ingreso_id_ingreso, productos_almacen_id_productos_almacen";
        $tipos = "ddii";
        $params = [$precio, $cantidad, $idingreso, $productoalmacen];
        if ($idProductoVariante !== null) {
            $sqlBase .= ", idProductoVariante) VALUES (NULL, ?, ?, ?, ?, ?)";
            $tipos .= "i";
            $params[] = $idProductoVariante;
        } else {
            $sqlBase .= ") VALUES (NULL, ?, ?, ?, ?)";
        }
        $stmtIns = $this->cm->prepare($sqlBase);
        $stmtIns->bind_param($tipos, ...$params);
        
        if ($stmtIns->execute()) {
            $idDetalleInsertado = $this->cm->insert_id;

            // 4. Generar los Códigos Únicos Correlativos
            $listaCodigos = [];
            for ($i = 1; $i <= $cantidad; $i++) {
                $listaCodigos[] = $codProducto . "-" . $codCompra . "-" . $i;
            }

            $dataParaEnvio = [
                "compra_id"    => (int)$idDetalleInsertado,
                "id_usuario"   => (int)$idUsuario,
                "productos"    => [
                    [
                        "productos_almacen_id" => (int)$productoalmacen,
                        "cantidad"             => (int)$cantidad,
                        "codigos"              => $listaCodigos
                    ]
                ]
            ];

            // 5. Registro de Códigos Únicos
            $registrarProUnicoBool = filter_var($registrarProUnico, FILTER_VALIDATE_BOOLEAN);
            $resProUnico = "Ningun Producto Unico Registrado";

            if ($registrarProUnico !== null && $registrarProUnicoBool) {
                $resultadoUnicos = $this->productoUnico->ingresoPorCompra($dataParaEnvio);
                $resProUnico = json_decode($resultadoUnicos, true);
            }

            $res = [
                "estado" => "exito", 
                "mensaje" => "Registro exitoso", 
                "registroProUnico" => $resProUnico, 
                "idIngreso" => $idingreso,
                "idDetalle" => $idDetalleInsertado
            ];
        } else {
            $res = ["estado" => "error", "mensaje" => "Error al intentar registrar: " . $this->cm->error];
        }

        return $this->responder($TIPORESPUESTA, $res);
    }

    /**
     * Método auxiliar para manejar la respuesta según el tipo.
     */
    private function responder($TIPORESPUESTA, $res) {
        if ($TIPORESPUESTA === null) {
            header('Content-Type: application/json');
            echo json_encode($res);
            exit;
        }
        return $res;
    }
    public function verificarIDdetallecompra($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT di.id_detalle_ingreso, di.precio_unitario, di.cantidad, di.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalle_ingreso di 
        LEFT JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON di.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND di.id_detalle_ingreso = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "precio" => $qwe[1], "cantidad" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5], "stock" => $qwe[6]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editardetalleCompra($id, $precio, $cantidad, $idproducto)
    {
        try {
            $res = "";
            $fecha = date("Y-m-d");
            $registro = $this->cm->query("update detalle_ingreso SET precio_unitario='$precio', cantidad='$cantidad', productos_almacen_id_productos_almacen='$idproducto' where id_detalle_ingreso='$id'");
            if ($registro !== null) {
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function eliminarDetalleCompra($id_detalle_ingreso){
        $res = [];

        try {
            $this->cm->begin_transaction();

            $sql = "DELETE pu
                    FROM producto_unico pu
                    INNER JOIN historial_producto_unico hu 
                        ON hu.id_producto_unico = pu.idproducto_unico
                    WHERE hu.tipo_evento = 'COMPRA'
                    AND hu.referencia_id = ?";
            
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_detalle_ingreso);
            $stmt->execute();

            $filasProductos = $stmt->affected_rows;

            // 2. Eliminar detalle
            $sql = "DELETE FROM detalle_ingreso WHERE id_detalle_ingreso = ?";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_detalle_ingreso);
            $stmt->execute();

            $filasDetalle = $stmt->affected_rows;

            $this->cm->commit();

            $res = [
                "estado" => "exito",
                "mensaje" => "Eliminación exitosa",
                    "productos_eliminados" => $filasProductos,
                    "detalle_eliminado" => $filasDetalle
                ];

        } catch (Exception $e) {
            $this->cm->rollback();

            $res = [
                "estado" => "error",
                "mensaje" => $e->getMessage()
            ];
        }

        echo json_encode($res);
    }
    public function uploadRecibo()
    {
        $res = array();
        // 1. Validar datos de entrada
        $idpedido = isset($_POST['idpedido']) ? $_POST['idpedido'] : null;
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        if (!isset($_FILES['recibo']) || $_FILES['recibo']['error'] !== UPLOAD_ERR_OK) {
            $res = array("estado" => "error", "mensaje" => "No se envió ningún archivo o hubo un error de subida.");
            echo json_encode($res);
            return;
        }

        $file = $_FILES['recibo'];

        // 2. Validar tipo de archivo y tamaño (CRUCIAL para seguridad)
        $allowedImageTypes = ['image/jpeg', 'image/png'];
        $allowedPdfType = 'application/pdf';
        $maxFileSize = 5 * 1024 * 1024; // 5 MB

        if ($file['size'] > $maxFileSize) {
            $res = array("estado" => "error", "mensaje" => "El archivo es demasiado grande. Máximo 5MB.");
            echo json_encode($res);
            return;
        }

        $isImage = in_array($file['type'], $allowedImageTypes);
        $isPdf = ($file['type'] === $allowedPdfType);

        if (!$isImage && !$isPdf) {
            $res = array("estado" => "error", "mensaje" => "Tipo de archivo no permitido. Solo JPG, PNG, PDF.");
            echo json_encode($res);
            return;
        }

        // 3. Definir directorio de subida y ruta pública
        $uploadDir = 'uploads/recibos/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Crear si no existe (asegura permisos adecuados)
        }

        $newFileNameBase = uniqid('recibo_') . '_' . $idpedido; // Nombre base único
        $destinationPath = ''; // Ruta donde se guardará el archivo en el servidor
        $publicPath = '';      // URL pública para acceder al archivo

        // 4. Procesar el archivo: Convertir a WebP o guardar como PDF
        if ($isImage) {
            $quality = 80; // Calidad para WebP (0-100)
            $newFileName = $newFileNameBase . '.webp';
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // AJUSTA TU URL BASE REAL

            $image = null;
            if ($file['type'] === 'image/jpeg') {
                $image = imagecreatefromjpeg($file['tmp_name']);
            } elseif ($file['type'] === 'image/png') {
                $image = imagecreatefrompng($file['tmp_name']);
                imagealphablending($image, false); // Mantener transparencia si es PNG
                imagesavealpha($image, true);
            }

            if ($image) {
                // Eliminar imagen anterior si existe (antes de guardar la nueva)
                $this->deleteOldReciboFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pasa la URL base
                
                if (imagewebp($image, $destinationPath, $quality)) {
                    imagedestroy($image); // Liberar memoria
                    // Continuar para actualizar la DB
                } else {
                    imagedestroy($image);
                    $res = array("estado" => "error", "mensaje" => "Error al convertir y guardar la imagen en formato WebP.");
                    echo json_encode($res);
                    return;
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "No se pudo cargar la imagen para conversión.");
                echo json_encode($res);
                return;
            }

        } elseif ($isPdf) {
            $originalExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = $newFileNameBase . '.' . $originalExtension;
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // AJUSTA TU URL BASE REAL

            // Eliminar archivo anterior si existe (antes de mover el nuevo)
            $this->deleteOldReciboFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pasa la URL base

            if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
                $res = array("estado" => "error", "mensaje" => "No se pudo mover el archivo PDF subido.");
                echo json_encode($res);
                return;
            }
            // Continuar para actualizar la DB
        }

        // 5. Actualizar la base de datos con la nueva ruta
        $query_update = "UPDATE pedidos SET ruta_recibo = '$publicPath' WHERE id_pedidos = '$idpedido'";
        $registro = $this->cm->query($query_update);

        if ($registro !== null) { // Asumiendo que $this->cm->query devuelve no-nulo en éxito para UPDATE
            $res = array(
                "estado" => "exito",
                "mensaje" => "Recibo subido/actualizado exitosamente.",
                "ruta_recibo" => $publicPath // Devolver la URL pública
            );
        } else {
            // Si la actualización en la DB falla, intenta eliminar el archivo que acabas de subir para evitar huérfanos
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Recibo subido, pero falló el registro en la base de datos.");
        }

        echo json_encode($res);
    }

    // NUEVA FUNCIÓN HELPER para eliminar el archivo viejo
    // Debería estar en tu clase o en un lugar accesible.
    private function deleteOldReciboFile($idpedido, $uploadDir, $baseUrl)
    {
        // Primero, recupera la ruta actual de la base de datos
        $query_select_old = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = '$idpedido'";
        $old_recibo_result = $this->cm->query($query_select_old);
        $old_recibo_data = $this->cm->fetch($old_recibo_result);
        $old_recibo_full_url = $old_recibo_data ? $old_recibo_data['ruta_recibo'] : null;

        if ($old_recibo_full_url && strpos($old_recibo_full_url, $baseUrl) === 0) { // Asegura que es una URL de tu servidor
            // Extraer la ruta local del archivo de la URL pública
            $local_old_path = str_replace($baseUrl, '', $old_recibo_full_url);
            // Asegúrate de que la ruta local sea correcta y esté dentro de tu directorio de uploads
            if (strpos($local_old_path, $uploadDir) === 0 && file_exists($local_old_path)) {
                unlink($local_old_path); // Eliminar el archivo antiguo
            }
        }
    }

    // Puedes aplicar una lógica similar a tu función `uploadFotoMovimiento`
    // public function uploadFotoMovimiento() { /* ... */ }
    // Y para `deleteRecibo` asegúrate de que el `unlink` se aplique al archivo con la extensión correcta (.webp, .pdf, .png, .jpg)
    public function deleteRecibo($idpedido) 
    {
        $res = array();

        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        $query_select = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = '$idpedido'";
        $result = $this->cm->query($query_select);
        $data = $this->cm->fetch($result);
        $current_recibo_url = $data ? $data['ruta_recibo'] : null;

        $deleted_file = false;
        if ($current_recibo_url) {
            // Asumiendo que la ruta guardada en DB es la URL completa
            $baseUrl = 'https://mistersofts.com/app/cmv1/api/'; // AJUSTA TU URL BASE REAL
            if (strpos($current_recibo_url, $baseUrl) === 0) {
                $local_file_path = str_replace($baseUrl, '', $current_recibo_url); // Obtener la ruta relativa
                if (file_exists($local_file_path)) {
                    if (unlink($local_file_path)) {
                        $deleted_file = true;
                    } else {
                        $res = array("estado" => "error", "mensaje" => "No se pudo eliminar el archivo físico del recibo.");
                        echo json_encode($res);
                        return;
                    }
                } else {
                    // Si el archivo no se encuentra en disco, pero la ruta existe en la DB, asumimos que se "borró"
                    $deleted_file = true;
                }
            }
        } else {
            // No hay ruta en DB, nada que borrar físicamente
            $deleted_file = true;
        }

        // 2. Limpiar la ruta de la base de datos
        $query_update = "UPDATE pedidos SET ruta_recibo = NULL WHERE id_pedidos = '$idpedido'";
        $registro = $this->cm->query($query_update);

        if ($registro !== null && $deleted_file) {
            $res = array("estado" => "exito", "mensaje" => "Recibo eliminado correctamente.");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al eliminar el registro del recibo en la base de datos.");
        }

        echo json_encode($res);
    }
    public function getRecibo($idpedido) 
    {
        $res = array();

        // 1. Basic Validation for ID
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        // 2. Prepare and Execute the Database Query
        // --- IMPORTANT: Use prepared statements to prevent SQL Injection ---
        // Assuming $this->cm->prepare and $this->cm->execute work similarly to PDO/MySQLi
        $query = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = ?";
        $stmt = $this->cm->prepare($query); // Prepare the query

        if (!$stmt) {
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la consulta.");
            echo json_encode($res);
            return;
        }

        // Bind the parameter (assuming 's' for string if id_pedidos is varchar, or 'i' for integer)
        // Adjust 'i'/'s' based on your 'id_pedidos' column type. If it's INT, use 'i'.
        $stmt->bind_param("i", $idpedido); // 'i' for integer, 's' for string
        $stmt->execute();
        $result = $stmt->get_result(); // Get the result set

        // 3. Process the Result
        $data = $result->fetch_assoc(); // Fetch as an associative array

        if ($data && isset($data['ruta_recibo']) && $data['ruta_recibo'] !== null) {
            $ruta_recibo = $data['ruta_recibo'];

            // Optional: Basic URL validation if you want to be extra careful
            // filter_var($ruta_recibo, FILTER_VALIDATE_URL)
            // However, if you control the upload process, the URL should be valid.

            $res = array("estado" => "exito", "ruta_recibo" => $ruta_recibo);
        } else {
            // If no data or ruta_recibo is NULL, it means no receipt is attached or pedido not found
            $res = array("estado" => "error", "mensaje" => "No hay recibo adjunto para este pedido o el pedido no existe.");
        }

        // 4. Send JSON Response
        echo json_encode($res);

        // Optional: Close the statement (depending on your $this->cm implementation)
        $stmt->close();
    }
    public function uploadFotoMovimiento() 
    {
        $res = array();

        // 1. Validate incoming data
        $idpedido = isset($_POST['idpedido']) ? $_POST['idpedido'] : null;
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado para la foto del movimiento.");
            echo json_encode($res);
            return;
        }

        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            $res = array("estado" => "error", "mensaje" => "No se envió ningún archivo de foto o hubo un error de subida.");
            echo json_encode($res);
            return;
        }

        $file = $_FILES['foto']; // Assuming the frontend sends the file under the name 'foto'

        // 2. File Validation (Crucial for security)
        $allowedImageTypes = ['image/jpeg', 'image/png'];
        $maxFileSize = 5 * 1024 * 1024; // 5 MB (Adjust as needed)

        if (!in_array($file['type'], $allowedImageTypes)) {
            $res = array("estado" => "error", "mensaje" => "Tipo de archivo no permitido. Solo JPG, PNG.");
            echo json_encode($res);
            return;
        }

        if ($file['size'] > $maxFileSize) {
            $res = array("estado" => "error", "mensaje" => "La foto es demasiado grande. Máximo 5MB.");
            echo json_encode($res);
            return;
        }

        // 3. Define Upload Directory and Public Path
        $uploadDir = 'uploads/fotos_movimientos/'; // Specific directory for movement photos
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create if it doesn't exist (ensure proper permissions)
        }

        $newFileNameBase = uniqid('foto_movimiento_') . '_' . $idpedido; // Unique name + pedido ID
        $destinationPath = ''; // Path where the file will be saved on the server
        $publicPath = '';      // Public URL to access the file

        // 4. Process the image: Convert to WebP
        $quality = 80; // WebP quality (0-100)
        $newFileName = $newFileNameBase . '.webp';
        $destinationPath = $uploadDir . $newFileName;
        $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // **ADJUST TO YOUR ACTUAL BASE URL**

        $image = null;
        if ($file['type'] === 'image/jpeg') {
            $image = imagecreatefromjpeg($file['tmp_name']);
        } elseif ($file['type'] === 'image/png') {
            $image = imagecreatefrompng($file['tmp_name']);
            imagealphablending($image, false); // Maintain transparency for PNGs
            imagesavealpha($image, true);
        }

        if ($image) {
            // Delete old photo file if replacing
            $this->deleteOldMovementPhotoFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pass base URL
            
            if (imagewebp($image, $destinationPath, $quality)) {
                imagedestroy($image); // Free up memory
                // Continue to update the DB
            } else {
                imagedestroy($image);
                $res = array("estado" => "error", "mensaje" => "Error al convertir y guardar la foto de movimiento en formato WebP.");
                echo json_encode($res);
                return;
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "No se pudo cargar la foto para conversión.");
            echo json_encode($res);
            return;
        }

        // 5. Update database with the new path
        // Assuming you have a column named 'ruta_foto_pedido' in your 'pedidos' table for this
        $query_update = "UPDATE pedidos SET ruta_foto_pedido = ? WHERE id_pedidos = ?";
        $stmt = $this->cm->prepare($query_update);

        if (!$stmt) {
            // If DB update fails, attempt to delete the file you just uploaded to avoid orphans
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la actualización de la foto.");
            echo json_encode($res);
            return;
        }

        // Bind parameters: 's' for string (URL), 'i' for integer (id_pedidos)
        $stmt->bind_param("si", $publicPath, $idpedido);
        $registro = $stmt->execute();

        if ($registro) { // $stmt->execute() returns true on success, false on failure
            $res = array(
                "estado" => "exito",
                "mensaje" => "Foto de movimiento subida y registrada exitosamente.",
                "ruta_foto" => $publicPath // Return the public URL
            );
        } else {
            // If DB update fails, attempt to delete the file you just uploaded to avoid orphans
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Foto subida, pero falló el registro en la base de datos: " . $stmt->error);
        }

        echo json_encode($res);
        $stmt->close(); // Close the statement
    }

    // NEW HELPER FUNCTION to delete the old movement photo file
    // Should be within your class or an accessible helper.
    private function deleteOldMovementPhotoFile($idpedido, $uploadDir, $baseUrl)
    {
        // First, retrieve the current path from the database
        $query_select_old = "SELECT ruta_foto_pedido FROM pedidos WHERE id_pedidos = ?";
        $stmt_select = $this->cm->prepare($query_select_old);
        if (!$stmt_select) return; // Handle prepare error silently for helper
        
        $stmt_select->bind_param("i", $idpedido);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $old_photo_data = $result->fetch_assoc();
        $old_photo_full_url = $old_photo_data ? $old_photo_data['ruta_foto_pedido'] : null;
        $stmt_select->close();

        if ($old_photo_full_url && strpos($old_photo_full_url, $baseUrl) === 0) { // Ensure it's a URL from your listaCompra
            // Extract the local file path from the public URL
            $local_old_path = str_replace($baseUrl, '', $old_photo_full_url);
            // Ensure the local path is correct and within your uploads directory
            if (strpos($local_old_path, $uploadDir) === 0 && file_exists($local_old_path)) {
                unlink($local_old_path); // Delete the old file
            }
        }
    }

    public function reporteProveedorCompras($idmd5, $fechainicio, $fechafin){
        
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idalmacenes = $this->arrayIDalmacenEmpresa($idmd5);
        $consulta = "SELECT 
                        prv.codigo AS codigo_proveedor, 
                        prv.nombre AS proveedor,
                        i.id_ingreso,
                        i.fecha_ingreso,
                        i.nombre AS nombre_ingreso,
                        i.codigo AS codigo_ingreso,
                        i.autorizacion AS autorizacion_ingreso,
                        i.proveedor_id_proveedor AS id_proveedor,
                        i.pedidos_id_pedidos AS id_pedidos,
                        i.estado AS estado_ingreso,
                        i.nfactura,
                        i.tipocompra,
                        i.almacen_id_almacen,
                        i.usuario,
                        a.codigo AS codigo_almacen, 
                        a.nombre AS almacen,
                        COALESCE(
                            SUM(
                            COALESCE(di.precio_unitario, 0) * COALESCE(di.cantidad, 0)
                            ), 
                            0
                        ) AS total_ingreso
                    FROM proveedor prv
                    LEFT JOIN ingreso i 
                        ON i.proveedor_id_proveedor = prv.id_proveedor
                    LEFT JOIN almacen a 
                        ON a.id_almacen = i.almacen_id_almacen
                    LEFT JOIN detalle_ingreso di 
                        ON di.ingreso_id_ingreso = i.id_ingreso
                    WHERE prv.id_empresa = ?
                    AND DATE(i.fecha_ingreso) BETWEEN ? AND ?
                    AND i.almacen_id_almacen IN ($idalmacenes)
                    GROUP BY i.id_ingreso;";

        $stmt = $this->cm->prepare($consulta);

        if(!$stmt){
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la consulta.");
            echo json_encode($res);
            return;
        }

        $stmt->bind_param("iss", $idempresa, $fechainicio, $fechafin);
        $stmt->execute();
        $result = $stmt->get_result();
        $lista = [];
        while ($qwe = $result->fetch_assoc()) {
            $res = array(
                "codigoProveedor" => $qwe['codigo_proveedor'],
                "proveedor" => $qwe['proveedor'],
                "idIngreso" => $qwe['id_ingreso'],
                "fechaIngreso" => $qwe['fecha_ingreso'],
                "nombreIngreso" => $qwe['nombre_ingreso'],
                "codigoIngreso" => $qwe['codigo_ingreso'],
                "autorizacion" => $qwe['autorizacion_ingreso'],
                "idProveedor" => $qwe['id_proveedor'],
                "idPedidos" => $qwe['id_pedidos'],
                "estado" => $qwe['estado_ingreso'],
                "nFactura" => $qwe['nfactura'],
                "tipoCompra" => $qwe['tipocompra'],
                "idalmacen" => $qwe['almacen_id_almacen'],
                "usuario" => $qwe['usuario'],
                "codigoAlmacen" => $qwe['codigo_almacen'],
                "nombreAlmacen" => $qwe['almacen'],
                "totalIngreso" => $qwe['total_ingreso']
            );
            array_push($lista, $res);
        }
         echo json_encode($lista);
         $stmt->close();
    }

    public function reporteProductoProveedoresCompras($idproducto, $fechainicio, $fechafin){
 
        $consulta = "SELECT 
                        ROW_NUMBER() OVER (ORDER BY i.id_ingreso) AS indice, 
                        i.fecha_ingreso AS fechaIngreso,
                        i.id_ingreso AS idIngreso,
                        prv.nombre AS proveedor, 
                        prv.codigo AS codigoProveedor,
                        i.nombre AS nombreIngreso,
                        i.codigo AS codigoCompra,
                        i.nfactura AS nFactura,
                        i.pedidos_id_pedidos AS idPedido,
                        i.estado AS estadoIngreso,
                        i.autorizacion,
                        i.tipocompra AS tipoCompra,
                        i.almacen_id_almacen AS idAlmacen,
                        a.nombre AS almacen,
                        di.cantidad,
                        di.precio_unitario AS precioUnitario,
                        (di.cantidad*di.precio_unitario) AS total
                    FROM detalle_ingreso di 
                    LEFT JOIN ingreso i ON i.id_ingreso = di.ingreso_id_ingreso
                    LEFT JOIN proveedor prv ON prv.id_proveedor = i.proveedor_id_proveedor
                    LEFT JOIN almacen a ON a.id_almacen = i.almacen_id_almacen
                    LEFT JOIN productos_almacen pra ON pra.id_productos_almacen = di.productos_almacen_id_productos_almacen
                    LEFT JOIN productos pro ON pro.id_productos = pra.productos_id_productos
                    WHERE pro.id_productos = ? AND DATE(i.fecha_ingreso) BETWEEN ? AND ?
                    ORDER BY i.fecha_ingreso DESC, i.id_ingreso DESC;";

        $stmt = $this->cm->prepare($consulta);

        if(!$stmt){
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la consulta.");
            echo json_encode($res);
            return;
        }

        $stmt->bind_param("iss", $idproducto, $fechainicio, $fechafin);
        $stmt->execute();
        $result = $stmt->get_result();
        $lista = [];
        while ($qwe = $result->fetch_assoc()) {
            $res = array(
                "indice" => $qwe['indice'],
                "fechaIngreso" => $qwe['fechaIngreso'],
                "idIngreso" => $qwe['idIngreso'],
                "proveedor" => $qwe['proveedor'],
                "codigoProveedor" => $qwe['codigoProveedor'],
                "nombreIngreso" => $qwe['nombreIngreso'],
                "codigoCompra" => $qwe['codigoCompra'],
                "nFactura" => $qwe['nFactura'],
                "idPedido" => $qwe['idPedido'],
                "estadoIngreso" => $qwe['estadoIngreso'],
                "autorizacion" => $qwe['autorizacion'],
                "tipoCompra" => $qwe['tipoCompra'],
                "idAlmacen" => $qwe['idAlmacen'],
                "almacen" => $qwe['almacen'],
                "cantidad" => $qwe['cantidad'],
                "precioUnitario" => $qwe['precioUnitario'],
                "total" => $qwe['total']
            );
            array_push($lista, $res);
        }
         echo json_encode($lista);
         $stmt->close();
    }


    public function arrayIDalmacen($idmd5)
    {
        $lista = array();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $consulta = $this->cm->query("SELECT 
        
        ra.idresponsablealmacen, 
        ra.responsable_id_responsable, 
        ra.almacen_id_almacen, 
        a.nombre , 
        ra.fecha, 
        MD5(r.id_usuario), 
        MD5(ra.almacen_id_almacen),
         a.idsucursal 
         FROM responsablealmacen ra
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
    public function arrayIDalmacenEmpresa($idmd5)
    {
        $lista = array();
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $consulta = $this->cm->query("SELECT id_almacen FROM almacen a WHERE a.idempresa = '$idempresa'");

        while ($qwe = $this->cm->fetch($consulta)) {
            $idalmacen = $qwe['id_almacen']; 
            $lista[] = $idalmacen;
        }
        $resultado = implode(',', $lista);
        return $resultado;
    }

    public function detalleCompra($id, $idmd5)
    {
        // 1. Verificar la empresa
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $idprodVariantes = []; // Clave = id, valor = true (deduplica y evita comas)

        // ==================== DETALLE DE COMPRA (cm) ====================
        $sqlDetalle = "SELECT di.id_detalle_ingreso,
                            pa.id_productos_almacen,
                            p.nombre,
                            p.descripcion,
                            p.caracteristicas,
                            di.cantidad,
                            di.precio_unitario,
                            p.codigo,
                            p.codigosin,
                            p.unidadsin,
                            p.actividadsin,
                            u.nombre AS unidad,
                            di.idProductoVariante
                    FROM detalle_ingreso di
                    LEFT JOIN ingreso i          ON di.ingreso_id_ingreso = i.id_ingreso
                    LEFT JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    LEFT JOIN productos p        ON pa.productos_id_productos = p.id_productos
                    LEFT JOIN unidad u           ON p.unidad_id_unidad = u.id_unidad
                    WHERE di.ingreso_id_ingreso = ?
                    ORDER BY p.nombre DESC";

        $stmtDetalle = $this->cm->prepare($sqlDetalle);
        $stmtDetalle->bind_param("i", $id);
        $stmtDetalle->execute();
        $resultadoDetalle = $stmtDetalle->get_result();

        while ($qwe = $resultadoDetalle->fetch_assoc()) {
            $idVar = isset($qwe['idProductoVariante']) && $qwe['idProductoVariante'] !== null
                ? (int) $qwe['idProductoVariante']
                : null;

            if ($idVar !== null && $idVar > 0) {
                $idprodVariantes[$idVar] = true;
            }

            $lista[] = [
                "id"                 => $qwe['id_detalle_ingreso'],
                "idproducto"         => $qwe['id_productos_almacen'],
                "producto"           => $qwe['nombre'],
                "descripcion"        => $qwe['descripcion'],
                "caracteristica"     => $qwe['caracteristicas'],
                "cantidad"           => $qwe['cantidad'],
                "precio"             => $qwe['precio_unitario'],
                "unidad"             => $qwe['unidad'],
                "codigo"             => $qwe['codigo'],
                "codigosin"          => $qwe['codigosin'],
                "unidadsin"          => $qwe['unidadsin'],
                "actividadsin"       => $qwe['actividadsin'],
                "subTotal"           => floatval($qwe['cantidad']) * floatval($qwe['precio_unitario']),
                "idProductoVariante" => $idVar,
                "valores"            => []
            ];
        }
        $stmtDetalle->close();

        // ==================== VALORES DE VARIANTES ====================
        if (!empty($idprodVariantes)) {
            $ids          = array_keys($idprodVariantes);
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $types        = str_repeat('i', count($ids));
            

            $sqlValores = "SELECT vv.id_Producto_Variante, va.valor, ap.nombre 
                        FROM Variante_Valor vv
                        LEFT JOIN Valor_Atributo va ON va.id_Valor_Atributo = vv.id_Valor_Atributo
                         LEFT JOIN Atributo_producto ap ON va.id_Atributo_producto = ap.id_Atributo_producto
                        WHERE vv.id_Producto_Variante IN ($placeholders)";

            $stmtValores = $this->prod->prepare($sqlValores);
            $stmtValores->bind_param($types, ...$ids);
            $stmtValores->execute();
            $resultadoValores = $stmtValores->get_result();

            // Indexamos por id_variante → asignación O(1) y sin re-iterar el cursor
            $valoresPorVariante = [];
            while ($v = $resultadoValores->fetch_assoc()) {
                $valoresPorVariante[(int) $v['id_Producto_Variante']][] =$v['nombre'] .":".$v['valor'];
            }
            $stmtValores->close();

            foreach ($lista as &$item) {
                $idVar = $item['idProductoVariante'];
                if ($idVar !== null && isset($valoresPorVariante[$idVar])) {
                    $item['valores'] = $valoresPorVariante[$idVar];
                    $textoVariantes = implode(', ', $valoresPorVariante[$idVar]);
                    $item['descripcion'] = trim($item['descripcion'] . ' ' . $textoVariantes);

                }
            }
            unset($item);
        }

        // ==================== USUARIOS ====================
        $sqlUsuarios = "SELECT u.idusuario, u.nombre, c.cargo
                        FROM usuario u
                        LEFT JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                        LEFT JOIN cargos c     ON t.cargos_idcargos = c.idcargos
                        WHERE u.idempresa = ?";

        $stmtUsuarios = $this->rh->prepare($sqlUsuarios);
        $stmtUsuarios->bind_param("i", $idempresa);
        $stmtUsuarios->execute();
        $resultadoUsuarios = $stmtUsuarios->get_result();

        $usuarioInfo = [];
        while ($usuario = $resultadoUsuarios->fetch_assoc()) {
            $usuarioInfo[(int) $usuario['idusuario']] = [
                "idusuario" => $usuario['idusuario'],
                "usuario"   => $usuario['nombre'],
                "cargo"     => $usuario['cargo']
            ];
        }
        $stmtUsuarios->close();

        // ==================== EMPRESA ====================
        $sqlEmpresas = "SELECT * FROM organizacion WHERE idorganizacion = ?";
        $stmtEmpresas = $this->em->prepare($sqlEmpresas);
        $stmtEmpresas->bind_param("i", $idempresa);
        $stmtEmpresas->execute();
        $resultadoEmpresas = $stmtEmpresas->get_result();

        $empresaInfo = [];
        
        while ($empresa = $resultadoEmpresas->fetch_assoc()) {
            $empresaInfo[(int) $empresa['idorganizacion']] = [
                "nombre"        => $empresa['nombreo'],
                "nit"           => $empresa['nit'],
                "direccion"     => $empresa['direccion'],
                "email"         => $empresa['emailo'],
                "logo"          => $empresa['logo'],
                "ocelular"      => $empresa['celular'],
                "telefono"      => $empresa['telefono'],
                "ocierrefiscal" => $empresa['cierrefiscal'],
                "ociudad"       => $empresa['ciudad'],
                "oestado"       => $empresa['estado'],
                "opais"         => $empresa['pais'],
                "ositioweb"     => $empresa['sitioweb'],
                "md5"           => md5($empresa['idorganizacion']),
            ];
        }
        $stmtEmpresas->close();

        // ==================== COMPRA ====================
        $lista2 = [];
        $sqlCompra = "SELECT i.id_ingreso,
                            i.fecha_ingreso,
                            i.nombre AS nombre_ingreso,
                            i.codigo AS codigo_ingreso,
                            i.autorizacion,
                            i.estado,
                            i.nfactura,
                            i.tipocompra,
                            a.nombre AS almacen,
                            i.usuario,
                            prv.nombre AS nombre_proveedor,
                            prv.codigo AS codigo_proveedor,
                            i.almacen_id_almacen,
                            ps.codigo  AS codigoPedido
                    FROM ingreso i
                    LEFT JOIN proveedor prv ON i.proveedor_id_proveedor = prv.id_proveedor
                    LEFT JOIN almacen a     ON a.id_almacen = i.almacen_id_almacen
                    LEFT JOIN pedidos ps    ON i.pedidos_id_pedidos = ps.id_pedidos
                    WHERE i.id_ingreso = ?";

        $stmtCompra = $this->cm->prepare($sqlCompra);
        $stmtCompra->bind_param("i", $id);
        $stmtCompra->execute();
        $resultadoCompra = $stmtCompra->get_result();

        while ($qwe = $resultadoCompra->fetch_assoc()) {
            $idUsuario = isset($qwe['usuario']) ? (int) $qwe['usuario'] : 0;

            $lista2[] = [
                "idIngreso"     => $qwe['id_ingreso'],
                "fechaIngreso"  => $qwe['fecha_ingreso'],
                "nombreIngreso" => $qwe['nombre_ingreso'],
                "codigoIngreso" => $qwe['codigo_ingreso'],
                "autorizacion"  => $qwe['autorizacion'],
                "estado"        => $qwe['estado'],
                "nfactura"      => $qwe['nfactura'],
                "tipocompra"    => $qwe['tipocompra'],
                "almacen"       => $qwe['almacen'],
                "idAlmacen"     => $qwe['almacen_id_almacen'],
                "CodigoPedido"  => $qwe['codigoPedido'] ?? "Sin Pedido",
                "proveedor"     => [
                    "nombre" => $qwe['nombre_proveedor'],
                    "codigo" => $qwe['codigo_proveedor']
                ],
                "detalle"       => $lista,
                "usuario"       => ($idUsuario && isset($usuarioInfo[$idUsuario]))
                                        ? $usuarioInfo[$idUsuario]
                                        : null,
                "empresa"       => $empresaInfo[(int) $idempresa] ?? null
            ];
        }
        $stmtCompra->close();

        echo json_encode($lista2);
    }

    
}
/**probando */