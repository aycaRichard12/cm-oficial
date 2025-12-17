<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";

// Mostrar errores (en desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
/**
 * Clase para gestionar operaciones de Cotización y delegar operaciones de Venta.
 */
class UseCotizacion
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $logger;
    private $factura;
    private $useVenta;


        // --- CONSTANTES DE CLASE ---
    private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN
    private const MAX_INTENTOS_NRO_FACTURA = 1000;
    /**
     * Constructor de la clase.
     */
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->logger = new LogErrores();
        $this->factura = new Facturacion();
        $this->useVenta = new UseVEnta();

        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
    }



    public function anularCotizacion($idcotizacion , $motivo, $idmd5u){
        
        date_default_timezone_set('America/La_Paz');
        $condicion = -1;

        $fecha = date("Y-m-d");
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
        $res = array("estado" => "error", "mensaje" => "Error desconocido.");
        // Desactivar el autocommit para que podamos controlar el COMMIT y ROLLBACK.
        $this->cm->autocommit(FALSE); 

        try {
            // 2. OBTENER ESTADO DE COTIZACIÓN
            $sql = "SELECT c.condicion FROM cotizacion c WHERE c.id_cotizacion = ?";
            $stm = $this->cm->prepare($sql);
            
            // Verifica si la preparación de la consulta fue exitosa
            if (!$stm) {
                throw new Exception("Error al preparar consulta de estado: " . $this->cm->error);
            }

            $stm->bind_param('i', $idcotizacion);
            $stm->execute();
            
            // Asume que solo se debe obtener un resultado
            $stm->bind_result($condicion);
            $stm->fetch();
            $stm->close();

            // 3. LÓGICA DE ANULACIÓN Y RESTOCK
            if($condicion == 1){   
                // COTIZACIÓN ACTIVA: requiere log y reabastecimiento
                $condicionventa = "Venta anulada. Se ha realizado la devolución de stock.";

                // A. Anular Cotización
                $registro = $this->cm->query("update cotizacion SET condicion = 2 where id_cotizacion='$idcotizacion'");
                if (!$registro) {
                    throw new Exception("Error al actualizar estado de cotización.");
                }
                
                // B. Registrar Anulación
                // Es CRUCIAL sanitizar o usar prepared statements aquí (pero siguiendo tu estilo, solo se añade la verificación)
                $motivo_sanitized = $this->cm->real_escape_string($motivo);
                $anulacion = $this->cm->query("insert into anulaciones(idanulaciones, fecha, motivo, venta_id_venta, idusuario,tipo_venta)values(NULL,'$fecha','$motivo_sanitized','$idcotizacion','$idusuario', 'COTIZACION')");
                if (!$anulacion) {
                    throw new Exception("Error al registrar anulación.");
                }

                // C. Obtener Productos para Restock
                $productos = $this->cm->query("SELECT 
                        dc.id_detalle_cotizacion,
                        dc.cantidad, 
                        dc.precio_unitario, 
                        dc.productos_almacen_id_productos_almacen, 
                        dc.cotizacion_id_cotizacion,
                        (dc.cantidad+s.cantidad) as nuevo,
                        s.id_stock
                        from detalle_cotizacion dc 
                        inner join stock s on  dc.productos_almacen_id_productos_almacen = s.productos_almacen_id_productos_almacen
                        where dc.cotizacion_id_cotizacion = '$idcotizacion'  and s.estado = 1");
                
                if (!$productos) {
                    throw new Exception("Error al obtener productos para reabastecimiento.");
                }

                // D. Ejecutar Restock (Reabastecimiento)
                while ($qwe = $this->cm->fetch($productos)) { // Usar fetch_assoc o fetch_array si tienes una función fetch
                    $codigo = "ANC";
                    
                    // 1. Desactivar el stock antiguo
                    $registro_old_stock = $this->cm->query("update stock set estado=2 where id_stock='$qwe[id_stock]'");
                    if (!$registro_old_stock) {
                        throw new Exception("Error al desactivar stock antiguo ID: $qwe[id_stock].");
                    }
                    
                    // 2. Insertar el nuevo stock consolidado
                    $nuevo_stock_valor = $qwe['nuevo'];
                    $id_almacen = $qwe['productos_almacen_id_productos_almacen'];
                    
                    $nuevostock = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen, idorigen) values(NULL,'$nuevo_stock_valor','$fecha','$codigo',1,'$id_almacen', '$idcotizacion')");
                    if (!$nuevostock) {
                        throw new Exception("Error al insertar nuevo stock para producto: $id_almacen.");
                    }
                }                    
                $res = array("estado" => "exito", "mensaje" => "Cotización anulada y stock devuelto correctamente.", "datosFactura" => $condicionventa);

            }elseif($condicion == 0){
                // COTIZACIÓN PENDIENTE: solo anulación
                $registro = $this->cm->query("update cotizacion SET condicion = 2 where id_cotizacion='$idcotizacion'");
                if (!$registro) {
                    throw new Exception("Error al actualizar estado de cotización pendiente.");
                }
                $res = array("estado" => "exito", "mensaje" => "Cotización pendiente anulada correctamente.");

            } else {
                // Estado no válido (ej. ya anulada)
                throw new Exception("La cotización no está en un estado válido (1 o 0) para ser anulada.");
            }

            // 4. COMMIT: Si todo ha ido bien, guardar los cambios en la base de datos
            $this->cm->commit(); 
            $this->cm->autocommit(TRUE); // Volver a activar autocommit

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->cm->autocommit(TRUE); // Volver a activar autocommit
            $res = array("estado" => "error", "mensaje" => "Fallo en la anulación. Se han revertido todos los cambios. Detalle: " . $e->getMessage()); 
        }
        
        echo json_encode($res);
    }


    private function obtenerNumeroComprobanteCotizacion($idempresa, $tipoventa)
    {
        $nroFactura = null;
        $contadorIntentos = 0;

        // Bucle para asegurar que el número de factura no exista
        while ($nroFactura === null) {
            // 1. Contar ventas existentes para proponer un número inicial
            $sqlConteo = "SELECT COUNT(co.id_cotizacion) 
                          FROM cotizacion co
                          LEFT JOIN cliente c ON co.cliente_id_cliente = c.id_cliente 
                          WHERE c.idempresa = ? AND co.estado = ?"; 
            $stmtConteo = $this->cm->prepare($sqlConteo);
            $stmtConteo->bind_param("ii", $idempresa, $tipoventa);
            $stmtConteo->execute();
            $resultado = $stmtConteo->get_result()->fetch_row();
            $nroFactura = $resultado[0] + 1 + $contadorIntentos;
            $stmtConteo->close();

            // 2. Verificar si el número propuesto ya existe
            $sqlVerificacion = "SELECT co.num 
                                FROM cotizacion co 
                                LEFT JOIN cliente c ON co.cliente_id_cliente = c.id_cliente 
                                WHERE c.idempresa = ? AND co.estado = ? AND co.num = ?";
            $stmtVerificacion = $this->cm->prepare($sqlVerificacion);
            $stmtVerificacion->bind_param("iii", $idempresa, $tipoventa, $nroFactura);
            $stmtVerificacion->execute();
            $stmtVerificacion->store_result();

            if ($stmtVerificacion->num_rows > 0) {
                $nroFactura = null; // El número existe, se reinicia para probar el siguiente
                $contadorIntentos++;
            }
            $stmtVerificacion->close();

            // 3. Salvaguarda contra bucles infinitos
            if ($contadorIntentos > self::MAX_INTENTOS_NRO_FACTURA) {
                throw new Exception("No se pudo encontrar un número de factura disponible después de " . self::MAX_INTENTOS_NRO_FACTURA . " intentos.");
            }
        }

        return $nroFactura;
    }

    /**
     * Punto de entrada principal para registrar una Venta o una Cotización.
     *
     * @param int $tipo_operacion 1 para Venta, 2 para Cotización.
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param string $jsonStringDetalles Un string JSON con los detalles de la operación.
     * @return void Imprime una respuesta JSON.
     */
    public function registroCotizacion($tipo_operacion, $idcliente, $idsucursal, $jsonStringDetalles)
    {
        // Decodificar el string JSON que viene del formData
        $detalles = $jsonStringDetalles;

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(["estado" => "error", "mensaje" => "El formato de los productos (JSON) es inválido."]);
            return;
        }

        switch ((int)$tipo_operacion) {
            case 1: // --- FLUJO DE VENTA ---
                // Delegamos la lógica a la clase Ventas, que ya está especializada en eso.
                // Asumimos que la clase Ventas y su método registroCotizacion_enVenta existen.
                try {
                    
                    $this->guardarCotizacionPreferencial($idcliente, $idsucursal, $detalles);
                    
                } catch (Exception $e) {
                     echo json_encode(["estado" => "error", "mensaje" => "Error al procesar la venta: " . $e->getMessage()]);
                }
                break;

            case 2: // --- FLUJO DE COTIZACIÓN ---
                // Usamos un método privado para mantener este archivo limpio.
                $this->guardarCotizacionNormal($idcliente, $idsucursal, $detalles);
                break;

            default:
                echo json_encode(["estado" => "error", "mensaje" => "Tipo de operación no válido."]);
                break;
        }
    }
    /**
     * Guarda la operación como una cotización en la base de datos.
     * No afecta stock ni genera facturas.
     *
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param array $detalles Array con los detalles de la cotización.
     * @return void Imprime una respuesta JSON.
     */
    private function guardarCotizacionPreferencial($idcliente, $idsucursal, $detalles)
    {
        $estado = 1;
         // Extraer IDs de stock para validación
        $idstockArray = array_column($detalles['listaProductos'], 'idstock');
        $idstockPlaceholders = implode(',', array_fill(0, count($idstockArray), '?'));

        // Validar que todos los stocks existan y estén activos (estado = 1) idstock
        $sqlStock = "SELECT id_stock FROM stock WHERE id_stock IN ($idstockPlaceholders) AND estado = 1";
        $stmtStock = $this->cm->prepare($sqlStock);
        $stmtStock->bind_param(str_repeat('i', count($idstockArray)), ...$idstockArray);
        $stmtStock->execute();
        $stmtStock->store_result();
        
        if ($stmtStock->num_rows !== count($idstockArray)) {
            $stmtStock->close();
             echo json_encode( ["estado" => "error", "mensaje" => "Uno o más productos no tienen stock válido o disponible. Por favor, actualice la lista de venta."]);
             return;
        }
        $stmtStock->close();
        try {
            $idusuario = $this->verificar->verificarIDUSERMD5($detalles['idusuario']);
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($detalles['idempresa']);
            $nroFactura = $this->obtenerNumeroComprobanteCotizacion($idempresa, $estado);

            if (!$idusuario) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario proporcionado no es válido."]);
                return;
            }
            if (!$idempresa) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID empresa proporcionado no es válido."]);
                return;
            }
            if ($nroFactura === null) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo generar un número de factura único. Intente nuevamente."]);
                return;
            }
            $this->cm->begin_transaction();
            

            // 1. Insertar la cotización principal
            $sqlCotizacion = "INSERT INTO cotizacion (fecha_cotizacion, monto_total, descuento, cliente_id_cliente, divisas_id_divisas, id_usuario, idsucursal, estado, idpv, num, id_almacen) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            $stmtCotizacion->bind_param(
                "sddiiiiiiii",
                $detalles['fecha'],
                $detalles['ventatotal'],
                $detalles['descuento'],
                $idcliente,
                $detalles['divisa'],
                $idusuario,
                $idsucursal,
                $estado, 
                $detalles['ipv'],
                $nroFactura,
                $detalles['idalmacen'],
            );
            $stmtCotizacion->execute();

            if ($stmtCotizacion->affected_rows > 0) {
                $ultimoIdInsertado = $this->cm->insert_id;
                $stmtCotizacion->close();

                // 2. Insertar los detalles de la cotización "

                if (empty($detalles['listaProductos'])) {
                    throw new Exception("La lista de productos no puede estar vacía.");
                }
                
                
                $sqlDetalle = "INSERT INTO detalle_cotizacion (cantidad, precio_unitario, productos_almacen_id_productos_almacen, cotizacion_id_cotizacion, descripcionAdicional,categoria ) 
                               VALUES (?, ?, ?, ?, ?, ?)";
                $stmtDetalle = $this->cm->prepare($sqlDetalle);

                $sqlGetStock = "SELECT cantidad FROM stock WHERE id_stock = ? AND estado = 1";
                $stmtGetStock = $this->cm->prepare($sqlGetStock);
                
                $sqlUpdateStock = "UPDATE stock SET estado = 2 WHERE id_stock = ? AND estado = 1";
                $stmtUpdateStock = $this->cm->prepare($sqlUpdateStock);

                $sqlNewStock = "INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen, idorigen) 
                                VALUES (?, NOW(), 'COT', 1, ?, ?)";
                $stmtNewStock = $this->cm->prepare($sqlNewStock);

                foreach ($detalles['listaProductos'] as $producto) {
                    if (!isset($producto['idproductoalmacen'])) {
                        throw new Exception("Producto en la lista no tiene 'idproductoalmacen'.");
                    }
                    $stmtDetalle->bind_param("idiisi", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIdInsertado, $producto['descripcionAdicional'], $producto['idporcentaje']);
                    $stmtDetalle->execute();
                    if ((int)$producto['despachado'] == 2) {
                        $this->_registrar_cotizacion_no_despachada($ultimoIdInsertado, $producto);
                    }else{
                        // Obtener cantidad actual del stock
                        $stmtGetStock->bind_param("i", $producto['idstock']);
                        $stmtGetStock->execute();
                        $cantidadActual = $stmtGetStock->get_result()->fetch_row()[0];


                        // Invalidar stock antiguo
                        $stmtUpdateStock->bind_param("i", $producto['idstock']);
                        $stmtUpdateStock->execute();
                        if ($stmtUpdateStock->affected_rows === 0) {
                            throw new Exception("Conflicto al actualizar el stock para id: " . $producto['idstock'] . ". La venta fue cancelada.");
                        }

                        // Crear nuevo registro de stock con la cantidad actualizada
                        $nuevaCantidad = $cantidadActual - $producto['cantidad'];
                        $stmtNewStock->bind_param("dii", $nuevaCantidad, $producto['idproductoalmacen'], $ultimoIdInsertado);
                        $stmtNewStock->execute();
                        if ($stmtNewStock->affected_rows === 0) {
                            throw new Exception("No se pudo crear el nuevo registro de stock para el producto con ID almacén: " . $producto['idproductoalmacen']);
                        }
                    }

                    
                }

                $stmtDetalle->close();
                $stmtGetStock->close();
                $stmtUpdateStock->close();
                $stmtNewStock->close();
                $respuestaFinal = [];
                // --- 5. REGISTRO DE PAGOS DIVIDIDOS ---
                if (isset($detalles['variablePago']) && $detalles['variablePago'] == self::PAGO_VARIABLE_DIVIDIDO) {
                    $respuestaPagos = $this->registrarPagosVentaCotizacion($detalles['pagosDivididos'], $ultimoIdInsertado);
                    $respuestaFinal['pagosDivididos'] = $respuestaPagos;
                }
                if ($detalles['tipopago'] == self::TIPO_PAGO_CREDITO) {
                    $respuestaCredito = $this->registroCuentaXcobrar($detalles['cantidadPagos'], $detalles['montoPagos'], $detalles['periodo'], $ultimoIdInsertado, $detalles['fechaLimite'], $detalles['ventatotal'], 'COT');
                    $respuestaFinal['credito'] = $respuestaCredito;
                }
                

                $this->cm->commit();
                echo json_encode(["estado" => "exito", "mensaje" => "Cotización registrada exitosamente.", "id" => $ultimoIdInsertado, "respuesta final "=> $respuestaFinal, "detalles" => $detalles, "tipopago" => $detalles['tipopago'],"cantidadPagos" => $detalles['cantidadPagos'], "montoPagos" => $detalles['montoPagos'], "fechaLimite" => $detalles['fechaLimite'], "periodo" => $detalles['periodo'],"ventatotal" => $detalles['ventatotal']]);
            
            } else {
                throw new Exception("Error al registrar la cotización principal.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("guardarCotizacion", "error", $e->getMessage(), ['idcliente' => $idcliente, 'detalles' => $detalles]);
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    private function _registrar_cotizacion_no_despachada($idcotizacion, $producto) {
        $tipo = 2;

        $sqlDetalle = "INSERT INTO ventas_no_despachadas (
            id_venta,
            productos_almacen_id_productos_almacen, 
            cantidad_pendiente,
            precio_unitario,
            categoria,
            tipo
        ) VALUES (?, ?, ?, ?, ?, ?)";

        $stmtDetalle = $this->cm->prepare($sqlDetalle);
        if (!$stmtDetalle) {
            return "Error al preparar la consulta: " . $this->cm->error;
        }

        $stmtDetalle->bind_param(
            "iiidii", // Asegúrate que esta cadena de tipos corresponde a tus datos reales
            $idcotizacion,
            $producto['idproductoalmacen'],
            $producto['cantidad'],
            $producto['precio'],
            $producto['idporcentaje'],
            $tipo
        );

        if (!$stmtDetalle->execute()) {
            return "Error al ejecutar la consulta: " . $stmtDetalle->error;
        }

        if ($stmtDetalle->affected_rows === 0) {
            return "No se pudo insertar el detalle para el producto con ID almacén: " . $producto['idproductoalmacen'];
        }

        $stmtDetalle->close();
    }

    /**
     * Guarda la operación como una cotización en la base de datos.
     * No afecta stock ni genera facturas.
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param array $detalles Array con los detalles de la cotización.
     * @return void Imprime una respuesta JSON.
     */
    private function guardarCotizacionNormal($idcliente, $idsucursal, $detalles)
    {
        $estado = 0;
        try {
            $idusuario = $this->verificar->verificarIDUSERMD5($detalles['idusuario']);
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($detalles['idempresa']);
            $nroFactura = $this->obtenerNumeroComprobanteCotizacion($idempresa, $estado);

            if (!$idusuario) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario proporcionado no es válido."]);
                return;
            }
            if (!$idempresa) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID empresa proporcionado no es válido."]);
                return;
            }
            if ($nroFactura === null) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo generar un número de factura único. Intente nuevamente."]);
                return;
            }

            $this->cm->begin_transaction();

            // 1. Insertar la cotización principal
            $sqlCotizacion = "INSERT INTO cotizacion (fecha_cotizacion, monto_total, descuento, cliente_id_cliente, divisas_id_divisas, id_usuario, idsucursal, estado, idpv, num, id_almacen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            $stmtCotizacion->bind_param(
                "sddiiiiiiii",
                $detalles['fecha'],
                $detalles['ventatotal'],
                $detalles['descuento'],
                $idcliente,
                $detalles['divisa'],
                $idusuario,
                $idsucursal,
                $estado, 
                $detalles['ipv'],
                $nroFactura,
                $detalles['idalmacen'],
            );
            $stmtCotizacion->execute();

            if ($stmtCotizacion->affected_rows > 0) {
                $ultimoIdInsertado = $this->cm->insert_id;
                $stmtCotizacion->close();

                // 2. Insertar los detalles de la cotización
                if (empty($detalles['listaProductos'])) {
                    throw new Exception("La lista de productos no puede estar vacía.");
                }
                
                $sqlDetalle = "INSERT INTO detalle_cotizacion (cantidad, precio_unitario, productos_almacen_id_productos_almacen, cotizacion_id_cotizacion, descripcionAdicional, categoria) 
                               VALUES (?, ?, ?, ?, ?, ?)";
                $stmtDetalle = $this->cm->prepare($sqlDetalle);

                foreach ($detalles['listaProductos'] as $producto) {
                    if (!isset($producto['idproductoalmacen'])) {
                        throw new Exception("Producto en la lista no tiene 'idproductoalmacen'.");
                    }
                    $stmtDetalle->bind_param("idiisi", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIdInsertado, $producto['descripcionAdicional'], $producto['idporcentaje']);
                    $stmtDetalle->execute();
                }
                $stmtDetalle->close();

                $this->cm->commit();
                echo json_encode(["estado" => "exito", "mensaje" => "Cotización registrada exitosamente.", "id" => $ultimoIdInsertado]);
            
            } else {
                throw new Exception("Error al registrar la cotización principal.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("guardarCotizacion", "error", $e->getMessage(), ['idcliente' => $idcliente, 'detalles' => $detalles]);
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    public function estadoCotizacion($idcotizacion)
    {
        $condicion = 0;
        $sql = "SELECT condicion FROM cotizacion WHERE id_cotizacion = ?";
        $stm = $this->cm->prepare($sql);

        if (!$stm) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al preparar la consulta",
                "error" => $this->cm->error
            ]);
            return;
        }

        $stm->bind_param('i', $idcotizacion);
        $stm->execute();
        $stm->bind_result($condicion);

        $res = "NO EXISTE"; // valor por defecto

        if ($stm->fetch()) {
            $res = match ((int)$condicion) {
                1 => "VALIDA",
                2 => "ANULADA",
                default => "DESCONOCIDA"
            };
        }

        $stm->close();

        echo json_encode([
            "status" => "success",
            "data" => [
                "id_cotizacion" => $idcotizacion,
                "condicion" => $res
            ]
        ]);
    }


    /**
     * Obtiene y formatea todos los detalles de una cotización específica para su visualización.
     *
     * @param int $id ID de la cotización.
     * @param string $idmd5 Hash MD5 del ID de la empresa.
     * @return void Imprime una respuesta JSON con los detalles completos.
     */
    public function detallecotizacion($id, $idmd5, $tipoConsulta = null)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("select
                    dco.id_detalle_cotizacion,
                    pa.id_productos_almacen as idproductoalmacen,
                    p.nombre,
                    p.descripcion,
                    dco.descripcionAdicional,
                    p.caracteristicas,
                    p.codigo as  codigoProducto,
                    p.codigosin as codigoProductoSin,
                    p.actividadsin as codigoActividadSin,
                    p.unidadsin as unidadMedida,
                    p.codigonandina as codigoNandina,
                    dco.cantidad,
                    dco.precio_unitario,
                    s.id_stock as idstock,
                    s.cantidad as disponible,
                    CASE
                        WHEN dco.categoria = 0 THEN 
                            COALESCE(
                                (SELECT prc.id_porcentajes 
                                FROM porcentajes prc 
                                WHERE prc.almacen_id_almacen = pa.almacen_id_almacen 
                                LIMIT 1),
                                0
                            )
                        ELSE dco.categoria
                    END AS categoria
                from detalle_cotizacion dco 
                LEFT join cotizacion co on dco.cotizacion_id_cotizacion=co.id_cotizacion
                LEFT join productos_almacen pa on dco.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                LEFT join productos p on pa.productos_id_productos=p.id_productos
                LEFT JOIN stock s ON s.productos_almacen_id_productos_almacen = dco.productos_almacen_id_productos_almacen
                AND s.estado = 1
                where dco.cotizacion_id_cotizacion='$id'
                order by p.nombre desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array(
                "id" => $qwe['id_detalle_cotizacion'],
                "idproductoalmacen" => $qwe['idproductoalmacen'],
                "producto" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion'],
                "descripcionAdicional" => $qwe['descripcionAdicional'],
                "categoria" => $qwe['categoria'],
                "caracteristica" => $qwe['caracteristicas'],
                "codigoProducto" => $qwe['codigoProducto'],
                "codigoProductoSin" => $qwe['codigoProductoSin'],
                "codigoActividadSin" => $qwe['codigoActividadSin'],
                "unidadMedida" => $qwe['unidadMedida'],
                "codigoNandina" => $qwe['codigoNandina'],
                "cantidad" => $qwe['cantidad'],
                "precio" => $qwe['precio_unitario'],
                "idstock" => $qwe['idstock'],
                "disponible" => $qwe['disponible']);
            array_push($lista, $res);
        }

        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");

        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = array(
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            );
        }

        

        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion='$idempresa'");

        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = array(
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            );
        }


        $lista2 = [];
        $alma = $this->cm->query("SELECT 
                co.id_cotizacion,
                c.id_cliente AS idcliente,
                c.nombre AS cliente,
                c.nombrecomercial,
                s.id_sucursal AS idsucursal,
                s.nombre AS sucursal,
                co.fecha_cotizacion,
                co.condicion,
                co.estado,
                c.direccion, 
                c.nit, 
                c.email, 
                co.monto_total, 
                co.descuento,
                co.id_usuario,
                d.nombre AS divisa,
                d.monedasin, 
                a.id_almacen AS idalmacen,
                a.nombre AS almacen,
                CASE 
                    WHEN pv.idpunto_venta IS NULL THEN COALESCE((
                        SELECT rpv.idpuntoventa
                        FROM responsable_puntoventa AS rpv
                        LEFT JOIN responsable AS r ON rpv.idresponsable = r.id_responsable
                        WHERE r.id_usuario = co.id_usuario 
                        ORDER BY rpv.idpuntoventa DESC 
                        LIMIT 1
                    ), 0)
                    ELSE pv.idpunto_venta
                END AS idpuntoventa,
                CASE 
                    WHEN pv.idpunto_venta IS NULL THEN COALESCE((
                        SELECT pv2.nombre
                        FROM responsable_puntoventa AS rpv
                        LEFT JOIN responsable AS r ON rpv.idresponsable = r.id_responsable
                        LEFT JOIN punto_venta pv2 ON pv2.idpunto_venta = rpv.idpuntoventa
                        WHERE r.id_usuario = co.id_usuario 
                        ORDER BY rpv.idpuntoventa DESC 
                        LIMIT 1
                    ), 'SIN ASIGNAR')
                    ELSE pv.nombre
                END AS puntoventa,
                CASE 
                    WHEN co.num IS NULL THEN COALESCE((
                        SELECT COUNT(z.id_cotizacion)
                        FROM cotizacion AS z
                        LEFT JOIN cliente c2 ON z.cliente_id_cliente = c2.id_cliente 
                        WHERE c2.idempresa = '$idempresa'
                        AND (
                            z.fecha_cotizacion < co.fecha_cotizacion
                            OR (z.fecha_cotizacion = co.fecha_cotizacion AND z.id_cotizacion <= co.id_cotizacion)
                        )
                    ), 0)
                    ELSE co.num
                END AS num
                FROM cotizacion co
                INNER JOIN cliente c ON co.cliente_id_cliente = c.id_cliente
                INNER JOIN sucursal s ON co.idsucursal = s.id_sucursal
                INNER JOIN divisas d ON co.divisas_id_divisas = d.id_divisas
                INNER JOIN detalle_cotizacion dc ON dc.cotizacion_id_cotizacion = co.id_cotizacion
                INNER JOIN productos_almacen pa ON pa.id_productos_almacen = dc.productos_almacen_id_productos_almacen
                INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                LEFT JOIN punto_venta pv ON pv.idpunto_venta = co.idpv
                WHERE co.id_cotizacion = '$id';");

        while ($qwe = $this->cm->fetch($alma)) {
            $res = array(
                "almacen" => array(
                    "idalmacen" => $qwe['idalmacen'],
                    "almacen" => $qwe['almacen']
                ),
                "cliente" => array(
                    "nombre" => $qwe['cliente'],
                    "idcliente" => $qwe['idcliente'],
                    "nombrecomercial" => $qwe['nombrecomercial'],
                    "idsucursal" =>$qwe['idsucursal'],
                    "sucursal" => $qwe['sucursal'],
                    "direccion" => $qwe['direccion'],
                    "nit" => $qwe['nit'],
                    "email" => $qwe['email'],
                ),
                "cotizacion" => array(
                    "id" => $qwe['id_cotizacion'],
                    "fecha" => $qwe['fecha_cotizacion'],
                    "montototal" => $qwe['monto_total'],
                    "descuento" => $qwe['descuento'],
                    "puntoVenta" => $qwe['puntoventa'],
                    "idpv" => $qwe['idpuntoventa'],
                    "nfactura" => $qwe['num'],
                    "condicion" => $qwe['condicion'],
                    "estado" => $qwe['estado'],
                    

                ),
                "divisa"=> array(
                    "divisa" => $qwe['divisa'],
                    "monedasin" => $qwe['monedasin'],
                ),

                "detalle" =>$lista,
                "usuario" => $usuarioInfo[$qwe['id_usuario']],
                "cargo" => $usuarioInfo[$qwe['id_usuario']]['cargo'],
                "empresa" => $empresaInfo[$idempresa]);
            array_push($lista2, $res);
        }

        echo json_encode($lista2);
    }
    private function eliminarCotizacion($id) { /// solo cambiar el estado a cotizacion normal  
        if (empty($id) || !is_numeric($id)) {
            return ["estado" => "error", "mensaje" => "ID de cotización inválido"];
        }

        $this->cm->begin_transaction();

        try {
            // 1. Eliminar los detalles relacionados a la cotización
            $sqlDetalle = "DELETE FROM detalle_cotizacion WHERE cotizacion_id_cotizacion = ?";
            $stmtDetalle = $this->cm->prepare($sqlDetalle);
            if (!$stmtDetalle) {
                
                 return ["estado" => "error", "mensaje" => $this->cm->error];
            }
            $stmtDetalle->bind_param("i", $id);
            $stmtDetalle->execute();
            $stmtDetalle->close();

            // 2. Eliminar la cotización principal
            $sqlCotizacion = "DELETE FROM cotizacion WHERE id_cotizacion = ?";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            if (!$stmtCotizacion) {
                return ["estado" => "error", "mensaje" => $this->cm->error];
            }
            $stmtCotizacion->bind_param("i", $id);
            $stmtCotizacion->execute();
            $stmtCotizacion->close();

            // 3. Confirmar cambios
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Cotización eliminada correctamente"];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("eliminarCotizacion", "error", $e->getMessage(), $id, null, null);
            return ["estado" => "error", "mensaje" => "Error al eliminar cotización: " . $e->getMessage()];
        }
    }
    private function cambiarEstadoCotizacion($id) { /// solo cambiar el estado a cotizacion normal  
        if (empty($id) || !is_numeric($id)) {
            return ["estado" => "error", "mensaje" => "ID de cotización inválido"];
        }

        $this->cm->begin_transaction();

        try {
            

            // 2. Eliminar la cotización principal
            $sqlCotizacion = "UPDATE cotizacion
                            SET estado = 2
                            WHERE id_cotizacion = ?;";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            if (!$stmtCotizacion) {
                return ["estado" => "error", "mensaje" => $this->cm->error];
            }
            $stmtCotizacion->bind_param("i", $id);
            $stmtCotizacion->execute();
            $stmtCotizacion->close();

            // 3. Confirmar cambios
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Cotización se cambio de estado correctamente"];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("cambiarEstadoCotizacion", "error", $e->getMessage(), $id, null, null);
            return ["estado" => "error", "mensaje" => "Error al eliminar cotización: " . $e->getMessage()];
        }
    }
    public function facturarjson($data){
        $this->facturar(
            $data['idcotizacion'],
            $data['fecha'],
            $data['tipoventa'],
            $data['tipopago'],
            $data['idcliente'],
            $data['idsucursal'],
            $data['canalventa'],
            $data['idempresa'],
            $data['idusuario'],
            $data['jsonDetalles']
        );
    }
    public function facturar($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles){
        $sql = "SELECT co.estado AS estado FROM cotizacion co WHERE co.id_cotizacion = ?";
        $stm = $this->cm->prepare($sql);

        if(!$stm){
            echo json_encode(array("estado" => "error", "mensaje" => "Error al preparar consulta"));
            return;
        }

        $stm->bind_param('i',$idcotizacion);
        $stm->execute();

        $resultado = $stm->get_result();
        if($row = $resultado->fetch_assoc()){
            if($row['estado'] == 1){
                $this->preferenciaAFactura($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles);
            }else{
                $this->cotizaciónAFactura($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles);
            }
        }else{
            echo json_encode(array("estado"=> "error", "mensaje" => "No se pudo encotrar la cotizacion"));
        }
        $stm->close();
    }
    public function cotizaciónAFactura($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles){
        $idempresa = null;
        $idusuario = null;
        $ultimo = 0;
        
        try {
            date_default_timezone_set('America/La_Paz');
            $respuestaFinal = [
                "estado" => "error",
                "mensaje" => "Error inesperado al iniciar el proceso."
            ];

            // --- 1. VALIDACIÓN DE IDENTIDADES (EMPRESA Y USUARIO) ---
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if (!$idempresa) {
                $this->logger->registrar("registroVenta", "error", "ID de empresa inválido", compact('idmd5'), null);
                echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no válido."]);
                return;
            }

            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
            if (!$idusuario) {
                $this->logger->registrar("registroVenta", "error", "ID de usuario inválido", compact('idmd5u'), null, $idempresa);
                echo json_encode(["estado" => "error", "mensaje" => "ID de usuario no válido."]);
                return;
            }

            // --- 2. GENERACIÓN DE CÓDIGOS Y NÚMEROS DE VENTA ---
            $stmt = $this->cm->prepare("
                SELECT COALESCE(MAX(v.nroventa), 0) AS ultimo
                FROM venta v
                INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
                WHERE c.idempresa = ?
                FOR UPDATE
            ");
            $stmt->bind_param("i", $idempresa);
            $stmt->execute();
            $stmt->bind_result($ultimo);
            $stmt->fetch();
            $stmt->close();

            $nroventa = $ultimo + 1;

            $codigoVenta = str_pad($idcliente, 6, '0', STR_PAD_LEFT) .
                           str_replace('-', '', substr($fecha, 0, 10)) .
                           str_pad($nroventa, 6, '0', STR_PAD_LEFT);

            $nroFactura = $this->obtenerNumeroFacturaDisponible($idempresa, $tipoventa);
            if ($nroFactura === null) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo generar un número de factura único. Intente nuevamente."]);
                return;
            }

            // --- 3. PROCESO PRINCIPAL DE VENTA (CON O SIN FACTURA) ---
            $datosVenta = [
                'fecha' => $fecha,
                'tipoventa' => $tipoventa,
                'ventatotal' => $jsonDetalles['ventatotal'],
                'descuento' => $jsonDetalles['descuento'],
                'tipopago' => $tipopago,
                'idcliente' => $idcliente,
                'iddivisa' => $jsonDetalles['iddivisa'],
                'idusuario' => $idusuario,
                'nroFactura' => $nroFactura,
                'idsucursal' => $idsucursal,
                'idcampaña' => $jsonDetalles['idcampana'],
                'nroventa' => $nroventa,
                'canalventa' => $canalventa,
                'codigoVenta' => $codigoVenta,
                'punto_venta' => $jsonDetalles['puntoVenta'],

            ];

            
                // Venta con factura: primero emitir factura, luego registrar en BD
                $jsonDetalles['listaFactura']['numeroFactura'] = $nroFactura;
                $jsonDetalles['listaFactura']['extras']['facturaTicket'] = $codigoVenta;

                $datosEnviadosEmizor = ["jsonlistaFactura" => $jsonDetalles['listaFactura'], "tipoventa" => $tipoventa, "token" => $jsonDetalles['token'], "tipo" => $jsonDetalles['tipo'], "codigosinsucursal" => $jsonDetalles['codigosinsucursal'], "jsonDetalles" => $jsonDetalles];

                $respuestaEmizor = $this->factura->crearfactura($jsonDetalles['listaFactura'], $tipoventa, $jsonDetalles['token'], $jsonDetalles['tipo'], $jsonDetalles['codigosinsucursal']);
                
                

                if ($respuestaEmizor->status === "success") {
                    $estadoFactura = null;
                    for ($i = 0; $i < self::MAX_INTENTOS_CONSULTA_FACTURA; $i++) {
                        $estadoFactura = $this->factura->estadofactura($respuestaEmizor->data->cuf, $jsonDetalles['token'], $jsonDetalles['tipo'], 2);
                        if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA && $estadoFactura->data->errores == null) {
                            break; // Factura validada, salir del bucle
                        }
                        sleep(1); // Esperar 1 segundo antes de reintentar
                    }
                  
                    if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA) {
                        
                        $resultadoDB = $this->useVenta->_registrarVentaDetallesEnDB($datosVenta, $jsonDetalles['listaProductos']);
                       
                        if ($resultadoDB['estado'] == 'exito') {
                            $this->factura->registrarFacturas($respuestaEmizor->data->ack_ticket, $estadoFactura->data->codigoEstado, $respuestaEmizor->data->cuf, $respuestaEmizor->data->emission_type_code, $respuestaEmizor->data->fechaEmision, $respuestaEmizor->data->numeroFactura, $respuestaEmizor->data->shortLink, $respuestaEmizor->data->urlSin, $respuestaEmizor->data->xml_url, $resultadoDB['idventa']);
                            
                            $respuestaFinal = array_merge($resultadoDB, [
                                "tipoventa" => "Facturado",
                                "estadoFactura" => $estadoFactura->data,
                                "datosFactura" => [
                                    "urlEmizor" => $respuestaEmizor->data->shortLink ?? null,
                                    "urlsin" => $respuestaEmizor->data->urlSin ?? $respuestaEmizor->data->urlsin ?? null
                                ]
                            ]);
                            $this->cambiarEstadoCotizacion($idcotizacion);

                        }else{
                           $respuestaFinal = $resultadoDB; // Propagar error de la BD
                        }
                    } else {
                        $respuestaFinal = ["estado" => "error", "mensaje" => "La factura no pudo ser validada por el SIN.", "detalles" => $estadoFactura];
                    }
                } else {
                    $respuestaFinal = ["estado" => "error", "mensaje" => "Error al emitir la factura.", "detalles" => $respuestaEmizor->errors ?? $respuestaEmizor, "datosEnviadosEmizor" => $datosEnviadosEmizor];
                }
            
            
            // Si la venta se registró correctamente, procesar pagos adicionales
            if(isset($respuestaFinal['estado']) && $respuestaFinal['estado'] == 'exito') {
                $ultimoIDventa = $respuestaFinal['idventa'];

                // --- 4. REGISTRO DE CUENTAS POR COBRAR (CRÉDITO) ---
                if ($tipopago == self::TIPO_PAGO_CREDITO) {
                    $respuestaCredito = $this->registroCuentaXcobrar($jsonDetalles['nropagos'], $jsonDetalles['valorpagos'], $jsonDetalles['dias'], $ultimoIDventa, $jsonDetalles['fechalimite'], $jsonDetalles['ventatotal']);
                    $respuestaFinal['credito'] = $respuestaCredito;
                }

                // --- 5. REGISTRO DE PAGOS DIVIDIDOS ---
                if (isset($jsonDetalles['variablePago']) && $jsonDetalles['variablePago'] == self::PAGO_VARIABLE_DIVIDIDO) {
                    $respuestaPagos = $this->registrarPagosVenta($jsonDetalles['pagosDivididos'], $ultimoIDventa);
                    $respuestaFinal['pagosDivididos'] = $respuestaPagos;
                }
            }

            echo json_encode($respuestaFinal);

        } catch (Exception $e) {
            $this->logger->registrar("registroVenta", "error", $e->getMessage(), compact('fecha', 'tipoventa', 'idmd5', 'jsonDetalles'), $idusuario, $idempresa);
            echo json_encode(["estado" => "error", "mensaje" => "Excepción capturada: " . $e->getMessage()]);
        }
    }
    public function preferenciaAFactura($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles)
    {
        $idempresa = null;
        $idusuario = null;
        $ultimo = 0;
        try {
            date_default_timezone_set('America/La_Paz');
            $respuestaFinal = [
                "estado" => "error",
                "mensaje" => "Error inesperado al iniciar el proceso."
            ];

            // --- 1. VALIDACIÓN DE IDENTIDADES (EMPRESA Y USUARIO) --- clienteDisplay
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if (!$idempresa) {
                $this->logger->registrar("registroCotizacion_enVenta", "error", "ID de empresa inválido", compact('idmd5'), null);
                echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no válido."]);
                return;
            }

            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
            if (!$idusuario) {
                $this->logger->registrar("registroCotizacion_enVenta", "error", "ID de usuario inválido", compact('idmd5u'), null, $idempresa);
                echo json_encode(["estado" => "error", "mensaje" => "ID de usuario no válido."]);
                return;
            }

            // --- 2. GENERACIÓN DE CÓDIGOS Y NÚMEROS DE VENTA --- 
              $stmt = $this->cm->prepare("
                SELECT COALESCE(MAX(v.nroventa), 0) AS ultimo
                FROM venta v
                INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
                WHERE c.idempresa = ?
                FOR UPDATE
            ");
            $stmt->bind_param("i", $idempresa);
            $stmt->execute();
            $stmt->bind_result($ultimo);
            $stmt->fetch();
            $stmt->close();

            $nroventa = $ultimo + 1;

            $codigoVenta = str_pad($idcliente, 6, '0', STR_PAD_LEFT) .
                           str_replace('-', '', substr($fecha, 0, 10)) .
                           str_pad($nroventa, 6, '0', STR_PAD_LEFT);

            $nroFactura = $this->obtenerNumeroFacturaDisponible($idempresa, $tipoventa);
            if ($nroFactura === null) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo generar un número de factura único. Intente nuevamente."]);
                return;
            }

            // --- 3. PROCESO PRINCIPAL DE VENTA (CON O SIN FACTURA) ---
            $datosVenta = [
                'fecha' => $fecha,
                'tipoventa' => $tipoventa,
                'ventatotal' => $jsonDetalles['ventatotal'],
                'descuento' => $jsonDetalles['descuento'],
                'tipopago' => $tipopago,
                'idcliente' => $idcliente,
                'iddivisa' => $jsonDetalles['iddivisa'],
                'idusuario' => $idusuario,
                'nroFactura' => $nroFactura,
                'idsucursal' => $idsucursal,
                'idcampaña' => $jsonDetalles['idcampana'],
                'nroventa' => $nroventa,
                'canalventa' => $canalventa,
                'codigoVenta' => $codigoVenta
            ];

            
                // Venta con factura: primero emitir factura, luego registrar en BD
                $jsonDetalles['listaFactura']['numeroFactura'] = $nroFactura;
                $jsonDetalles['listaFactura']['extras']['facturaTicket'] = $codigoVenta;

                $respuestaEmizor = $this->factura->crearfactura($jsonDetalles['listaFactura'], $tipoventa, $jsonDetalles['token'], $jsonDetalles['tipo'], $jsonDetalles['codigosinsucursal']);
                // $respuestaEmizor = json_decode(json_encode([
                //     "status" => "success",
                //     "data" => [
                //         "cuf" => "123",
                //         "ack_ticket" => "abc",
                //         "urlSin" => "url",
                //         "emision_type_code" => 1,
                //         "fechaEmision" => "2025-11-12",
                //         "numeroFactura" => 123,
                //         "shortLink" => "url corta",
                //         "codigoEstado" => 0,
                //         "emission_type_code" => '1',
                //         "xml_url" => "xml url"
                //     ]
                // ]));

                if ($respuestaEmizor->status === "success") {
                    $estadoFactura = null;
                    for ($i = 0; $i < self::MAX_INTENTOS_CONSULTA_FACTURA; $i++) {
                        $estadoFactura = $this->factura->estadofactura($respuestaEmizor->data->cuf, $jsonDetalles['token'], $jsonDetalles['tipo'], 2);
                        if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA && $estadoFactura->data->errores == null) {
                            break; // Factura validada, salir del bucle
                        }
                        sleep(1); // Esperar 1 segundo antes de reintentar
                    }
                    // $estadoFactura = json_decode(json_encode([
                    //     "status"=> "success",
                    //     "data"=> [
                    //         "codigoEstado"=> 690,
                    //         "estado"=> "string"
                    //     ]
                    // ]));
                    if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA) {
                         $resultadoDB = $this->useVenta->_registrarVentaDetallesEnDB($datosVenta, $jsonDetalles['listaProductos'], 1);
                        if ($resultadoDB['estado'] == 'exito') {
                            $this->factura->registrarFacturas($respuestaEmizor->data->ack_ticket, $estadoFactura->data->codigoEstado, $respuestaEmizor->data->cuf, $respuestaEmizor->data->emission_type_code, $respuestaEmizor->data->fechaEmision, $respuestaEmizor->data->numeroFactura, $respuestaEmizor->data->shortLink, $respuestaEmizor->data->urlSin, $respuestaEmizor->data->xml_url, $resultadoDB['idventa']);
                            
                            $respuestaFinal = array_merge($resultadoDB, [
                                "tipoventa" => "Facturado",
                                "estadoFactura" => $estadoFactura->data,
                                "datosFactura" => [
                                    "urlEmizor" => $respuestaEmizor->data->shortLink ?? null,
                                    "urlsin" => $respuestaEmizor->data->urlSin ?? $respuestaEmizor->data->urlsin ?? null
                                ]
                            ]);
                            $this->eliminarCotizacion($idcotizacion);
                        } else {
                           $respuestaFinal = $resultadoDB; // Propagar error de la BD
                        }
                    } else {
                        $respuestaFinal = ["estado" => "error", "mensaje" => "La factura no pudo ser validada por el SIN.", "detalles" => $estadoFactura];
                    }
                } else {
                    $respuestaFinal = ["estado" => "error", "mensaje" => "Error al emitir la factura.", "detalles" => $respuestaEmizor->errors ?? $respuestaEmizor];
                }
            
            
            // Si la venta se registró correctamente, procesar pagos adicionales
            if(isset($respuestaFinal['estado']) && $respuestaFinal['estado'] == 'exito') {
                $ultimoIDventa = $respuestaFinal['idventa'];

                // --- 4. REGISTRO DE CUENTAS POR COBRAR (CRÉDITO) ---
                if ($tipopago == self::TIPO_PAGO_CREDITO) {
                    $respuestaCredito = $this->registroCuentaXcobrar($jsonDetalles['nropagos'], $jsonDetalles['valorpagos'], $jsonDetalles['dias'], $ultimoIDventa, $jsonDetalles['fechalimite'], $jsonDetalles['ventatotal']);
                    $respuestaFinal['credito'] = $respuestaCredito;
                }

                // --- 5. REGISTRO DE PAGOS DIVIDIDOS ---
                if (isset($jsonDetalles['variablePago']) && $jsonDetalles['variablePago'] == self::PAGO_VARIABLE_DIVIDIDO) {
                    $respuestaPagos = $this->registrarPagosVenta($jsonDetalles['pagosDivididos'], $ultimoIDventa);
                    $respuestaFinal['pagosDivididos'] = $respuestaPagos;
                }
            }

            echo json_encode($respuestaFinal);

        } catch (Exception $e) {
            $this->logger->registrar("registroCotizacion_enVenta", "error", $e->getMessage(), compact('fecha', 'tipoventa', 'idmd5', 'jsonDetalles'), $idusuario, $idempresa);
            echo json_encode(["estado" => "error", "mensaje" => "Excepción capturada: " . $e->getMessage()]);
        }
    }
    
    private function obtenerNumeroFacturaDisponible($idempresa, $tipoventa)
    {
        $nroFactura = null;
        $contadorIntentos = 0;

        // Bucle para asegurar que el número de factura no exista
        while ($nroFactura === null) {
            // 1. Contar ventas existentes para proponer un número inicial
            $sqlConteo = "SELECT COUNT(v.id_venta) 
                          FROM venta v 
                          LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                          WHERE c.idempresa = ? AND v.tipo_venta = ?";
            $stmtConteo = $this->cm->prepare($sqlConteo);
            $stmtConteo->bind_param("is", $idempresa, $tipoventa);
            $stmtConteo->execute();
            $resultado = $stmtConteo->get_result()->fetch_row();
            $nroFactura = $resultado[0] + 1 + $contadorIntentos;
            $stmtConteo->close();

            // 2. Verificar si el número propuesto ya existe
            $sqlVerificacion = "SELECT v.nfactura 
                                FROM venta v 
                                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                                WHERE c.idempresa = ? AND v.tipo_venta = ? AND v.nfactura = ?";
            $stmtVerificacion = $this->cm->prepare($sqlVerificacion);
            $stmtVerificacion->bind_param("isi", $idempresa, $tipoventa, $nroFactura);
            $stmtVerificacion->execute();
            $stmtVerificacion->store_result();

            if ($stmtVerificacion->num_rows > 0) {
                $nroFactura = null; // El número existe, se reinicia para probar el siguiente
                $contadorIntentos++;
            }
            $stmtVerificacion->close();

            // 3. Salvaguarda contra bucles infinitos
            if ($contadorIntentos > self::MAX_INTENTOS_NRO_FACTURA) {
                throw new Exception("No se pudo encontrar un número de factura disponible después de " . self::MAX_INTENTOS_NRO_FACTURA . " intentos.");
            }
        }

        return $nroFactura;
    }

    
    

    

    function registroCuentaXcobrar($npagos, $valorpago, $tipocredito, $idventa, $fechalimite, $saldo, $tipo = null)
    {
        $res = "";
        $registro = null;
        if($tipo != null){
            $registro = $this->cm->query("insert into estado_cobro(id_estado_cobro,Ncuotas,valorcuotas,tipo_credito,estado,venta_id_venta,fecha_limite,saldo, tipo_cobro) VALUES(null,'$npagos','$valorpago','$tipocredito',1,'$idventa','$fechalimite','$saldo', '$tipo')");
        }else{
            $registro = $this->cm->query("insert into estado_cobro(id_estado_cobro,Ncuotas,valorcuotas,tipo_credito,estado,venta_id_venta,fecha_limite,saldo) VALUES(null,'$npagos','$valorpago','$tipocredito',1,'$idventa','$fechalimite','$saldo')");
        }
        
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "La cuenta por cobrar de venta se registro con exito");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        return $res;
    }


    /**
     * Registra los diferentes métodos de pago para una venta con pago dividido.
     *
     * @param array $array_pagos Array de objetos de pago.
     * @param int $idventa ID de la venta asociada.
     * @return array Resultado de la operación.
     */
    public function registrarPagosVenta($array_pagos, $idventa)
    {
        $this->cm->begin_transaction();
        $tipo = 1;
        try {
            $sql = "INSERT INTO pagoVenta (id_venta, id_canalventa, porcentaje, monto,tipo) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta para pagos divididos.");
            }

            foreach ($array_pagos as $pago) {
                $stmt->bind_param("iisdi", $idventa, $pago['metodoPago']['value'], $pago['porcentaje'], $pago['monto'].$tipo);
                $execute_result = $stmt->execute();

                if ($execute_result === false) {
                    throw new Exception("Falló la ejecución para registrar un pago dividido: " . $stmt->error);
                }
            }
            $stmt->close();
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Pagos divididos registrados correctamente."];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("registrarPagosVenta", "error", $e->getMessage(), compact('array_pagos', 'idventa'));
            return ["estado" => "error", "mensaje" => $e->getMessage()];
        }
    }
     public function registrarPagosVentaCotizacion($array_pagos, $idventa)
    {
        $this->cm->begin_transaction();
        $tipo = 2;
        try {
            $sql = "INSERT INTO pagoVenta (id_venta, id_canalventa, porcentaje, monto, tipo) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta para pagos divididos.");
            }

            foreach ($array_pagos as $pago) {
                $stmt->bind_param("iisdi", $idventa, $pago['metodoPago']['value'], $pago['porcentaje'], $pago['monto'],$tipo);
                $execute_result = $stmt->execute();

                if ($execute_result === false) {
                    throw new Exception("Falló la ejecución para registrar un pago dividido: " . $stmt->error);
                }
            }
            $stmt->close();
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Pagos divididos registrados correctamente."];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("registrarPagosVenta", "error", $e->getMessage(), compact('array_pagos', 'idventa'));
            return ["estado" => "error", "mensaje" => $e->getMessage()];
        }
    }
}