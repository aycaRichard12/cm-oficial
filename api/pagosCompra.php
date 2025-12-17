<?php

class PagosCompra
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;
    private $venta;
    private $funcionesVenta;
    private $token;
    private $configuracion;
    private $numceros;

    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();
        $this->venta = new UseVEnta();
        $this->funcionesVenta = new ventas();
        $this->configuracion = new configuracion();
        $this->numceros = 4;
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = null; // Simulado
        $this->em = null; // Simulado
    }

    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN DE PAGOS                  ==
    // =================================================================
    public function registrarCompraCredito($data){
        echo $this->crearPago($data['compra_id'],$data['monto_total'],$data['nro_cuotas'],$data['fecha_inicio'],$data['pago_cada_ciertos_dias']);
    }

    /**
     * Funcion para verificar si se creo el credito de una compra 
     */
    public function inabilitarParaRegistrarCredito($compra_id){
        $sql = "UPDATE ingreso SET estado = 2 WHERE id_ingreso = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $compra_id);
        $stmt->execute();
    }
    /**
     * Crea un nuevo registro de pago a crédito y genera sus cuotas.
     */
    public function crearPago($compra_id, $monto_total, $nro_cuotas, $fecha_inicio, $pago_cada_ciertos_dias)
    {
        // Validación básica
        if (empty($compra_id) || !is_numeric($monto_total) || !is_numeric($nro_cuotas) || empty($fecha_inicio) || !is_numeric($pago_cada_ciertos_dias)) {
            return json_encode(["estado" => "error", "mensaje" => "Todos los campos son obligatorios y deben tener el formato correcto."]);
        }
        
        $fecha_fin_estimada = date('Y-m-d', strtotime($fecha_inicio . ' + ' . (($nro_cuotas -1) * $pago_cada_ciertos_dias) . ' days'));
        $estado = 2; // 2: Activo, 0: Cancelado, 1: Finalizado
        
        $sql = "INSERT INTO pagos (compra_id, monto_total, saldo_actual, nro_cuotas, fecha_inicio, pago_cada_ciertos_dias, fecha_fin_estimada, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $this->cm->begin_transaction();

            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de pago: " . $this->cm->error);
            }

            $stmt->bind_param("iddisisi", $compra_id, $monto_total, $monto_total, $nro_cuotas, $fecha_inicio, $pago_cada_ciertos_dias, $fecha_fin_estimada, $estado);

            if ($stmt->execute()) {
                $id_pago = $this->cm->insert_id;
                // Generar las cuotas asociadas a este pago
                $this->generarCuotas($id_pago, $nro_cuotas, $monto_total, $fecha_inicio, $pago_cada_ciertos_dias);
                $this->inabilitarParaRegistrarCredito($compra_id);
                $this->cm->commit();
                return json_encode(["estado" => "exito", "mensaje" => "Pago creado y cuotas generadas correctamente.", "id_pago" => $id_pago]);
            } else {
                throw new Exception("No se pudo registrar el pago.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage()); // Opcional: registrar el error
            return json_encode(["estado" => "error", "mensaje" => "Error al crear el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Edita los datos de un pago existente.
     */
    public function editarPago($id_pago, $data)
    {
        // Construcción dinámica de la consulta
        $fields = [];
        $params = [];
        $types = "";

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $params[] = $value;
            // Asume tipos de datos (mejora según tu lógica)
            $types .= is_int($value) ? 'i' : (is_float($value) ? 'd' : 's');
        }
        $params[] = $id_pago;
        $types .= 'i';

        $sql = "UPDATE pagos SET " . implode(", ", $fields) . " WHERE id_pago = ?";

        try {
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de edición: " . $this->cm->error);
            }
            
            $stmt->bind_param($types, ...$params);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    return json_encode(["estado" => "exito", "mensaje" => "Pago actualizado correctamente."]);
                }
                return json_encode(["estado" => "info", "mensaje" => "No se realizaron cambios."]);
            } else {
                throw new Exception("No se pudo actualizar el pago.");
            }
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al actualizar el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Elimina un pago y sus cuotas y transacciones asociadas (eliminado lógico).
     */
    public function eliminarPago($id_pago)
    {
        $sql = "UPDATE pagos SET estado = 0 WHERE id_pago = ?"; // 0: Anulado/Cancelado
        
        try {
            $this->cm->begin_transaction();
            
            // Inactivar el pago principal
            $stmtPago = $this->cm->prepare($sql);
            $stmtPago->bind_param("i", $id_pago);
            $stmtPago->execute();

            // Inactivar cuotas asociadas
            $stmtCuotas = $this->cm->prepare("UPDATE cuotas SET estado = 0 WHERE pago_id = ?");
            $stmtCuotas->bind_param("i", $id_pago);
            $stmtCuotas->execute();

            $this->cm->commit();
            return json_encode(["estado" => "exito", "mensaje" => "Pago y sus cuotas han sido anulados."]);

        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al anular el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Obtiene una lista de todos los pagos.
     */
    public function obtenerPagos()
    {
        $sql = "SELECT * FROM pagos ORDER BY fecha_inicio DESC";
        try {
            $result = $this->cm->query($sql);
            if ($result) {
                return json_encode($result->fetch_all(MYSQLI_ASSOC));
            }
            return json_encode([]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    /**
     * Obtiene un pago específico por su ID.
     */
    public function obtenerPagoPorId($compra_id)
    {
        $sql = "SELECT * FROM pagos WHERE compra_id = ?";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $compra_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return json_encode($result->fetch_assoc());
            }
            return json_encode(["estado" => "info", "mensaje" => "Pago no encontrado."]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN DE CUOTAS                 ==
    // =================================================================

    /**
     * Genera las cuotas para un pago recién creado.
     */
    public function generarCuotas($id_pago, $nro_cuotas, $monto_total, $fecha_inicio, $pago_cada_ciertos_dias)
    {
        $monto_cuota = round($monto_total / $nro_cuotas, 2);
        // Ajuste para la última cuota por si hay decimales
        $monto_ultima_cuota = $monto_total - ($monto_cuota * ($nro_cuotas - 1));

        $sql = "INSERT INTO cuotas (pago_id, nro_cuota, monto_cuota, fecha_vencimiento, estado) VALUES (?, ?, ?, ?, ?)";
        
        try {
            $stmt = $this->cm->prepare($sql);
            $fecha_vencimiento = $fecha_inicio;
            $estado = 2; // 0: Pendiente, 1: Pagada, 0: Anulada

            for ($i = 1; $i <= $nro_cuotas; $i++) {
                $monto_a_insertar = ($i == $nro_cuotas) ? $monto_ultima_cuota : $monto_cuota;
                
                if($i > 1) {
                    $fecha_vencimiento = date('Y-m-d', strtotime($fecha_vencimiento . " + $pago_cada_ciertos_dias days"));
                }
                
                $stmt->bind_param("iidss", $id_pago, $i, $monto_a_insertar, $fecha_vencimiento, $estado);
                $stmt->execute();
            }
            return true;
        } catch (Exception $e) {
            // Si falla, la transacción principal en `crearPago` hará rollback
            throw new Exception("Error al generar las cuotas: " . $e->getMessage());
        }
    }

  
    
    /**
     * Obtiene todas las cuotas asociadas a un ID de pago.
     */
    public function obtenerCuotasPorPago($id_pago)
    {
        $sql = "SELECT * FROM cuotas WHERE pago_id = ? ORDER BY nro_cuota ASC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_pago);
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    /**
     * Actualiza el estado de las cuotas vencidas (ej: de Pendiente a Vencida).
     */
    public function actualizarEstadoCuotas()
    {
        // 3: Vencido
        $sql = "UPDATE cuotas SET estado = 3 WHERE fecha_vencimiento < CURDATE() AND estado = 1";
        try {
            $this->cm->query($sql);
            $filas_afectadas = $this->cm->affected_rows;
            return json_encode(["estado" => "exito", "mensaje" => "$filas_afectadas cuotas actualizadas a 'Vencida'."]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    // =================================================================
    // ==               SECCIÓN DE GESTIÓN DE TRANSACCIONES             ==
    // =================================================================


    /**
     * Obtiene todas las transacciones de una cuota específica.
     */
    public function obtenerTransaccionesPorCuota($id_cuota)
    {
        $sql = "SELECT * FROM transacciones_pago WHERE cuota_id = ? ORDER BY fecha_pago DESC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_cuota);
            $stmt->execute();
            $result = $stmt->get_result();
            return json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    /**
     * Obtiene todas las transacciones de un pago general (a través de sus cuotas).
     */
    public function obtenerTransaccionesPorPago($id_pago)
    {
        $sql = "SELECT tp.* FROM transacciones_pago tp
                JOIN cuotas c ON tp.cuota_id = c.id_cuota
                WHERE c.pago_id = ? 
                ORDER BY tp.fecha_pago DESC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_pago);
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    // =================================================================
    // ==                      SECCIÓN DE REPORTES                    ==
    // =================================================================

    /**
     * Genera un reporte consolidado de pagos, cuotas y transacciones.
     */
    public function generarReportePagos($fecha_desde, $fecha_hasta, $idmd5)
    {

        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $sql = "SELECT 
                i.nfactura as 'nrofactura',
                a.id_almacen as 'idalmacen',
                a.nombre as 'almacen',
                i.id_ingreso as 'idingreso',
                i.fecha_ingreso as 'fecha',
                i.codigo, 
                i.proveedor_id_proveedor as 'idproveedor',
                prb.nombre as 'proveedor',
                p.id_pago, 
                p.monto_total, 
                p.saldo_actual,
                p.nro_cuotas, 
                p.fecha_inicio, 
                p.fecha_fin_estimada,
                p.estado AS estado_pago
                from almacen a 
                left join ingreso i on a.id_almacen = i.almacen_id_almacen
                left join detalle_ingreso di on i.id_ingreso = di.ingreso_id_ingreso
                left join proveedor prb on prb.id_proveedor = i.proveedor_id_proveedor
                inner join pagos p on p.compra_id = i.id_ingreso";

        // Lógica de filtros (ejemplo)
        $where = [];
        $params = [];
        $types = "";
        if (!empty($fecha_desde)) {
            $where[] = "p.fecha_inicio >= ?";
            $params[] = $fecha_desde;
            $types .= 's';
        }
        if (!empty($fecha_hasta)) {
            $where[] = "p.fecha_inicio <= ?";
            $params[] = $fecha_hasta;
            $types .= 's';
        }
        
        if (isset($idempresa)) {
            $where[] = "a.idempresa = ?";
            $params[] = $idempresa;
            $types .= 'i';
        }

        
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY p.id_pago DESC";

        try {
            $stmt = $this->cm->prepare($sql);
            if (!empty($params)) {
                 $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            echo json_encode(["estado" => "error", "mensaje" => "Error al generar el reporte: " . $e->getMessage()]);
        }
    }
    public function reportesComprasCredito($idmd5){
        $sql = "SELECT 
                i.nfactura AS 'nrofactura',
                a.id_almacen AS 'idalmacen',
                a.nombre As 'almacen',
                i.id_ingreso AS 'idingreso',
                i.fecha_ingreso AS 'fecha',
                i.codigo, 
                i.proveedor_id_proveedor AS 'idproveedor',
                prb.nombre AS 'proveedor',
                p.id_pago AS 'idpago',
                p.monto_total,
                p.saldo_actual
                FROM almacen a 
                LEFT JOIN ingreso i ON a.id_almacen = i.almacen_id_almacen
                LEFT JOIN detalle_ingreso di ON i.id_ingreso = di.ingreso_id_ingreso
                LEFT JOIN proveedor prb ON prb.id_proveedor = i.proveedor_id_proveedor
                INNER JOIN pagos p ON p.compra_id = i.id_ingreso
                WHERE a.id_almacen = ?";
        
    }

    /**
     * Manejador principal de la petición POST.
     * Lee $_POST y $_FILES, valida y llama a la lógica de negocio.
     */
    public function handleRegistrarPago(int $id_cuota): void
    {
        try {
            // Validaciones de entrada
            if (empty($_POST['monto_pagado']) || !is_numeric($_POST['monto_pagado']) || $_POST['monto_pagado'] <= 0) {
                http_response_code(400);
                echo json_encode(['estado' => 'error', 'mensaje' => 'El campo monto_pagado es requerido y debe ser un número positivo.']);
                return;
            }
            

            $monto_pagado = (float)$_POST['monto_pagado'];
            $idUSmd5 = (int)$_POST['usuario_id'];
            $usuario_id = $this->verificar->verificarIDUSERMD5($idUSmd5);
            $referencia = isset($_POST['referencia']) ? trim($_POST['referencia']) : null;
            $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : null;
            
            $comprobante_path = null;
            if (isset($_FILES['comprobante']) && $_FILES['comprobante']['error'] === UPLOAD_ERR_OK) {
                // Si se subió un archivo, lo procesamos
                $comprobante_path = $this->guardarComprobanteUpload($id_cuota);
            }

            // Llamar al método principal de negocio
            $resultado = $this->registrarPagoCuota($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path);

            http_response_code(200);
            echo json_encode($resultado);

        } catch (Exception $e) {
            // Capturar excepciones específicas para códigos HTTP claros
            switch ($e->getCode()) {
                case 400: // Bad Request
                case 404: // Not Found
                    http_response_code($e->getCode());
                    break;
                case 413: // Payload Too Large
                case 415: // Unsupported Media Type
                    http_response_code($e->getCode());
                    break;
                default:
                    http_response_code(500); // Internal Server Error
            }
            error_log("Error al procesar pago: " . $e->getMessage()); // Logueo
            echo json_encode(['estado' => 'error', 'mensaje' => $e->getMessage()]);
        }
    }

    /**
     * Guarda el archivo de comprobante subido.
     *
     * @param array $file El array de $_FILES['comprobante']
     * @return string El path relativo del archivo guardado.
     * @throws Exception Si hay un error de validación o al mover el archivo.
     */
    private function guardarComprobanteUpload($id_cuota): string
    {
        if (!isset($_FILES['comprobante'])) {
            echo json_encode(["estado" => "error", "mensaje" => "No se envió ningún archivo."]);
            return '';
        }

        $file = $_FILES['comprobante'];

        // 1. Verificar errores de subida
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE   => "El archivo excede el tamaño permitido por el servidor.",
                UPLOAD_ERR_FORM_SIZE  => "El archivo excede el tamaño máximo permitido (formulario).",
                UPLOAD_ERR_PARTIAL    => "El archivo se subió parcialmente.",
                UPLOAD_ERR_NO_FILE    => "No se seleccionó archivo para subir.",
                UPLOAD_ERR_NO_TMP_DIR => "No hay carpeta temporal en el servidor.",
                UPLOAD_ERR_CANT_WRITE => "No se pudo escribir el archivo en el disco.",
                UPLOAD_ERR_EXTENSION  => "Una extensión de PHP detuvo la subida del archivo."
            ];
            $mensaje = $errorMessages[$file['error']] ?? "Error desconocido al subir el archivo.";
            echo json_encode(["estado" => "error", "mensaje" => $mensaje]);
            return '';
        }

        // 2. Validar tipo de archivo y tamaño
        $allowedImageTypes = ['image/jpeg', 'image/png'];
        $allowedPdfType = 'application/pdf';
        $maxFileSize = 5 * 1024 * 1024; // 5 MB

        if ($file['size'] > $maxFileSize) {
            echo json_encode(["estado" => "error", "mensaje" => "El archivo es demasiado grande. Máximo 5MB."]);
            return '';
        }

        $isImage = in_array($file['type'], $allowedImageTypes);
        $isPdf   = ($file['type'] === $allowedPdfType);

        if (!$isImage && !$isPdf) {
            echo json_encode(["estado" => "error", "mensaje" => "Tipo de archivo no permitido. Solo JPG, PNG, PDF."]);
            return '';
        }

        // 3. Directorio de subida
        $uploadDir = 'uploads/recibos/';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo crear el directorio de subida."]);
            return '';
        }

        $newFileNameBase = uniqid('recibo_') . '_' . intval($id_cuota);
        $destinationPath = '';
        $publicPath      = '';

        // 4. Procesar archivo
        if ($isImage) {
            $newFileName = $newFileNameBase . '.webp';
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath;

            $image = null;
            if ($file['type'] === 'image/jpeg') {
                $image = @imagecreatefromjpeg($file['tmp_name']);
            } elseif ($file['type'] === 'image/png') {
                $image = @imagecreatefrompng($file['tmp_name']);
                if ($image) {
                    imagealphablending($image, false);
                    imagesavealpha($image, true);
                }
            }

            if (!$image) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo procesar la imagen."]);
                return '';
            }

            if (!imagewebp($image, $destinationPath, 80)) {
                imagedestroy($image);
                echo json_encode(["estado" => "error", "mensaje" => "Error al guardar la imagen en WebP."]);
                return '';
            }
            imagedestroy($image);

        } elseif ($isPdf) {
            $newFileName = $newFileNameBase . '.pdf';
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath;

            if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo guardar el archivo PDF."]);
                return '';
            }
        }

        return $publicPath;
    }


    /**
     * Inserta un registro en la tabla de transacciones de pagos.
     */
    private function insertarTransaccion($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path)
    {
        $fecha_pago = date("Y-m-d H:i:s");  // Ejemplo: 2025-09-03 14:35:22
        $estado = 2;
        $sql = "INSERT INTO transacciones_pago (cuota_id, fecha_pago, monto, referencia, comprobante_path, estado, usuario_id,observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->cm->prepare($sql);
        if ($stmt === false) {
            throw new Exception("Error al preparar la inserción de transacción: " . $this->cm->error, 500);
        }
        $stmt->bind_param("isdssiis", $id_cuota,$fecha_pago, $monto_pagado, $referencia, $comprobante_path,$estado, $usuario_id, $observaciones);
        
        if (!$stmt->execute()) {
             throw new Exception("Error al ejecutar la inserción de transacción: " . $stmt->error, 500);
        }
        $stmt->close();
        return $this->cm->insert_id;
    }

    /**
     * Lógica de negocio principal para registrar el pago de una cuota.
     * Orquesta la validación, inserción y actualización dentro de una transacción.
     */
    public function registrarPagoCuota($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path = null)
    {
        $this->cm->begin_transaction();

        try {
            // 1. Obtener datos de la cuota y el pago asociado (con bloqueo para evitar concurrencia)
            $sql_cuota = "SELECT c.pago_id, c.monto_cuota, c.monto_pagado as monto_pagado_acumulado, p.saldo_actual
                          FROM cuotas c
                          JOIN pagos p ON c.pago_id = p.id_pago
                          WHERE c.id_cuota = ? FOR UPDATE";
            $stmt = $this->cm->prepare($sql_cuota);
            $stmt->bind_param("i", $id_cuota);
            $stmt->execute();
            $result = $stmt->get_result();
            $cuota = $result->fetch_assoc();
            $stmt->close();

            if (!$cuota) {
                throw new Exception("La cuota con ID $id_cuota no existe.", 404);
            }

            // 2. Validar que el monto a pagar no exceda el saldo de la cuota
            $saldo_cuota = $cuota['monto_cuota'] - $cuota['monto_pagado_acumulado'];
            if ($monto_pagado > $saldo_cuota) {
                throw new Exception("El monto a pagar ($monto_pagado) excede el saldo pendiente de la cuota ($saldo_cuota).", 400);
            }

            // 3. Insertar la transacción (ahora incluye el path del comprobante)
            $this->insertarTransaccion($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path);
            
            // 4. Actualizar la cuota
            $nuevo_monto_pagado_cuota = $cuota['monto_pagado_acumulado'] + $monto_pagado;
            // Si el pago cubre o supera el monto total de la cuota, se marca como pagada (estado 2)
            $estado_cuota = ($nuevo_monto_pagado_cuota >= $cuota['monto_cuota']) ? 1 : 2; // 1: Pagada, 2: Parcial

            $sql_update_cuota = "UPDATE cuotas SET monto_pagado = ?, estado = ?, fecha_pago = NOW() WHERE id_cuota = ?";
            $stmt = $this->cm->prepare($sql_update_cuota);
            $stmt->bind_param("dii", $nuevo_monto_pagado_cuota, $estado_cuota, $id_cuota);
            $stmt->execute();
            $stmt->close();

            // 5. Actualizar el saldo del pago general
            $nuevo_saldo_pago = $cuota['saldo_actual'] - $monto_pagado;
            // Si el saldo es cero o menos, el pago general se marca como finalizado (estado 2)
            $estado_pago = ($nuevo_saldo_pago <= 0) ? 1 : 2; // 1: Finalizado, 2: En Proceso

            $sql_update_pago = "UPDATE pagos SET saldo_actual = ?, estado = ? WHERE id_pago = ?";
            $stmt = $this->cm->prepare($sql_update_pago);
            $stmt->bind_param("dii", $nuevo_saldo_pago, $estado_pago, $cuota['pago_id']);
            $stmt->execute();
            $stmt->close();

            // Si todo fue bien, confirmamos la transacción
            $this->cm->commit();

            return [
                "estado" => "exito",
                "mensaje" => "Pago de cuota registrado correctamente.",
                "data" => [
                    "id_cuota" => $id_cuota,
                    "monto_pagado" => $monto_pagado,
                    "comprobante_path" => $comprobante_path
                ]
            ];

        } catch (Exception $e) {
            // Si algo falló, revertimos todos los cambios
            $this->cm->rollback();
            // Re-lanzamos la excepción para que el handler la capture y envíe la respuesta HTTP correcta
            throw $e;
        }
    }
}