<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";
class ArqueoPuntoVenta
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    private $logger;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        //$this->ad = $this->conexion->ad;
        $this->em = $this->conexion->em;
        $this->logger = new LogErrores();
    }
    function getImagenProduct($carpeta, $logoPath) {
        // Ruta base donde guardas las imágenes
        $baseDir = __DIR__ . "/../../cm/api/";

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

    function verificacion($token){
        
    }
    function productosValidos($empresa_id, $almacen_id) {


    }
    

    public function registrarCierre($idmd5E, $idmd5U, $fechaInicio, $fechaFin, $idPuntoVenta, $caja, $metodosPago, $metodosPagoCotizacion, $denominaciones, $observacion)
    {
        // En tu archivo principal o donde inicies la aplicación
        date_default_timezone_set('America/La_Paz');

        // ...dentro de tu función registrarCierre
        $creadoEn = date('Y-m-d H:i:s');
        // 1. Validación inicial de datos
        if (empty($caja) || empty($metodosPago) || empty($denominaciones)) {
            echo json_encode(["estado" => "error", "mensaje" => "Los datos de caja, métodos de pago o denominaciones están incompletos."]);
            return;
        }

        try {
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5E);
            $idUsuario = $this->verificar->verificarIDUSERMD5($idmd5U);

            if (!$idempresa) {
                throw new Exception("El ID de la empresa no existe.");
            }
            if (!$idUsuario) {
                throw new Exception("El ID de usuario no existe.");
            }

            // 2. Iniciar transacción
            $this->cm->begin_transaction();

            // Preparar las sentencias SQL (se pueden preparar una sola vez fuera de los bucles)
            $sqlCierre = "INSERT INTO cierre_puntoVenta (id_usuario, fecha_inicio, fecha_fin, observacion, creado_en, estado, autorizado, id_punto_venta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtCierre = $this->cm->prepare($sqlCierre);
            if (!$stmtCierre) {
                throw new Exception("Error al preparar la sentencia de cierre: " . $this->cm->error);
            }

            $sqlConcepto = "INSERT INTO cierre_conceptos (id_cierre, concepto, sistema, contado, diferencia) VALUES (?, ?, ?, ?, ?)";
            $stmtConcepto = $this->cm->prepare($sqlConcepto);
            if (!$stmtConcepto) {
                throw new Exception("Error al preparar la sentencia de conceptos: " . $this->cm->error);
            }

            $sqlMetodo = "INSERT INTO cierre_metodos_pago (id_cierre, id_metodo, metodo, total_sistema, total_contado, diferencia, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmtMetodo = $this->cm->prepare($sqlMetodo);
            if (!$stmtMetodo) {
                throw new Exception("Error al preparar la sentencia de métodos de pago: " . $this->cm->error);
            }

            $sqlArqueo = "INSERT INTO cierre_arqueo_fisico (id_cierre, valor_moneda, cantidad, label) VALUES (?, ?, ?, ?)";
            $stmtArqueo = $this->cm->prepare($sqlArqueo);
            if (!$stmtArqueo) {
                throw new Exception("Error al preparar la sentencia de arqueo: " . $this->cm->error);
            }

            // 3. Ejecutar las inserciones en orden
            $estado = 1;
            $autorizado = 2;
            $stmtCierre->bind_param("issssiii", $idUsuario, $fechaInicio, $fechaFin, $observacion, $creadoEn, $estado, $autorizado, $idPuntoVenta);
            $stmtCierre->execute();
            $idCierre = $this->cm->insert_id;
            $stmtCierre->close();

            // 4. Insertar conceptos
            foreach ($caja as $c) {
                $stmtConcepto->bind_param("isddd", $idCierre, $c['campo'], $c['sistema'], $c['totalContado'], $c['diferencia']);
                $stmtConcepto->execute();
            }
            $stmtConcepto->close();

            // 5. Insertar métodos de pago
            $tipoVenta = 'venta';
            foreach ($metodosPago as $m) {
                $stmtMetodo->bind_param("iisddds", $idCierre, $m['metodo'], $m['label'], $m['totalSistema'], $m['totalContado'], $m['diferencia'], $tipoVenta);
                $stmtMetodo->execute();
            }

            $tipoCotizacion = 'cotizacion';
            foreach ($metodosPagoCotizacion as $m) {
                $stmtMetodo->bind_param("iisddds", $idCierre, $m['metodo'], $m['label'], $m['totalSistema'], $m['totalContado'], $m['diferencia'], $tipoCotizacion);
                $stmtMetodo->execute();
            }
            $stmtMetodo->close();

            // 6. Insertar arqueo físico
            foreach ($denominaciones as $a) {
                $stmtArqueo->bind_param("idis", $idCierre, $a['valor'], $a['cantidad'], $a['label']);
                $stmtArqueo->execute();
            }
            $stmtArqueo->close();

            // 7. Confirmar transacción
            $this->cm->commit();

            echo json_encode(["estado" => "exito", "mensaje" => "Cierre registrado exitosamente", "id_cierre" => $idCierre]);

        } catch (Exception $e) {
            // 8. Revertir en caso de error y mostrar un mensaje más detallado
            $this->cm->rollback();
            echo json_encode(["estado" => "error", "mensaje" => "Error al registrar cierre: " . $e->getMessage()]);
        }
    }

    public function AutorizacionCierre($datos)
    {
        date_default_timezone_set('America/La_Paz');
        $creadoEn = date('Y-m-d H:i:s');   
        $idcierre = $datos['id_cierre'];
        $autorizado = 1;
        // Supongamos que $conn es tu conexión mysqli
        $stmt = $this->cm->prepare("UPDATE cierre_puntoVenta SET autorizado = ? WHERE id_cierre = ?");
        $stmt->bind_param("ii",$autorizado, $idcierre); // "i" indica que es un entero
        if ($stmt->execute()) {
            echo json_encode(["estado" => "exito", "mensaje" => "Cierre autorizado exitosamente"]);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo autorizar el cierre"]);
        }
        $stmt->close();
    }

    public function cierres_registrados($idmd5E, $idmd5U){
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5E);
        $idUsuario = $this->verificar->verificarIDUSERMD5($idmd5U);

        if (!$idempresa) {
            echo json_encode(["estado" => "error", "mensaje" => "El ID de la empresa no existe."]);
            return;
        }
        if (!$idUsuario) {
            echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario no existe."]);
            return;
        }
        $datos_usuario = $this->verificar->obtenerDatosUsuario($idUsuario, 1);
        if (!$datos_usuario) {
            echo json_encode(["estado" => "error", "mensaje" => "No se encontraron datos del usuario."]);
            return;
        }

        $stmt = $this->cm->prepare("SELECT cpv.id_cierre,cpv.fecha_inicio, cpv.fecha_fin, cpv.observacion,cpv.creado_en,cpv.estado,cpv.autorizado,cpv.id_punto_venta,  pv.nombre as punto_venta FROM cierre_puntoVenta cpv LEFT JOIN responsable r ON r.id_usuario = cpv.id_usuario LEFT JOIN punto_venta pv ON cpv.id_punto_venta = pv.idpunto_venta WHERE  r.id_empresa = ? AND r.id_usuario = ?;");
        $stmt->bind_param("ii", $idempresa, $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();  
        $cierres = [];
        while ($row = $result->fetch_assoc()) {
            $cierres[] = [ 
                'id_cierre' => $row['id_cierre'],
                'fecha_inicio' => $row['fecha_inicio'],
                'fecha_fin' => $row['fecha_fin'],
                'observacion' => $row['observacion'],
                'creado_en' => $row['creado_en'],
                'estado' => $row['estado'],
                'autorizado' => $row['autorizado'],
                'id_punto_venta' => $row['id_punto_venta'],
                'punto_venta' => $row['punto_venta'],
                'usuario' => $datos_usuario
            ];
        }   
        $stmt->close();
        if (count($cierres) > 0) {
            echo json_encode(["estado" => "exito", "datos" => $cierres]);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "No se encontraron cierres registrados."]);
        }
    }

    public function reporteCierrePorId($idCierre, $idmd5U) 
    {
        $idUsuario = $this->verificar->verificarIDUSERMD5
         ($idmd5U);
        if (!$idUsuario) {
            echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario no existe."]);
            return;
        }

        $datos_usuario = $this->verificar->obtenerDatosUsuario($idUsuario, 1);

        $sql = "SELECT 
                    c.id_cierre, c.fecha_inicio, c.fecha_fin, c.observacion, 
                    c.creado_en, c.estado, c.autorizado, c.id_punto_venta,
                    pv.nombre AS punto_venta
                FROM cierre_puntoVenta c
                LEFT JOIN punto_venta pv ON c.id_punto_venta = pv.idpunto_venta
                WHERE c.id_cierre = ?";

        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $idCierre);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {

            // Subconsulta conceptos
            $conceptos = [];
            $repConceptos = $this->cm->query("SELECT id_concepto, concepto, sistema, contado, diferencia 
                                            FROM cierre_conceptos 
                                            WHERE id_cierre = $idCierre");
            while ($c = $repConceptos->fetch_assoc()) {
                $conceptos[] = $c;
            }

            // Subconsulta métodos de pago
            $metodos = [];
            $repMetodos = $this->cm->query("SELECT id_cierre_metodos_pago, id_metodo, metodo, total_sistema, total_contado, diferencia, tipo 
                                            FROM cierre_metodos_pago 
                                            WHERE id_cierre = $idCierre");
            while ($m = $repMetodos->fetch_assoc()) {
                $metodos[] = $m;
            }

            // Subconsulta arqueo físico
            $arqueo = [];
            $repArqueo = $this->cm->query("SELECT id_arqueo, valor_moneda, cantidad, label 
                                        FROM cierre_arqueo_fisico 
                                        WHERE id_cierre = $idCierre");
            while ($a = $repArqueo->fetch_assoc()) {
                $arqueo[] = $a;
            }

            // Estructura final del JSON
            $res = [
                "id_cierre" => $row['id_cierre'],
                "fecha_inicio" => $row['fecha_inicio'],
                "fecha_fin" => $row['fecha_fin'],
                "observacion" => $row['observacion'],
                "creado_en" => $row['creado_en'],
                "estado" => $row['estado'],
                "autorizado" => $row['autorizado'],
                "punto_venta" => $row['punto_venta'],
                "usuario" => $datos_usuario,
                "conceptos" => $conceptos,
                "metodos_pago" => $metodos,
                "arqueo_fisico" => $arqueo
            ];

            echo json_encode([
                "estado" => "exito",
                "datos" => $res
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "No se encontró el cierre con ID $idCierre"
            ]);
        }
    }

}

//listaPuntoVentaFactura