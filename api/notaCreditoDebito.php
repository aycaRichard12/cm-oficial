<?php

class Nota_Debito_Credito
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

    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const MAX_INTENTOS_NRO_FACTURA = 1000;
       private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN

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
        $this->rh = $this->conexion->rh; // Simulado
        $this->em = $this->conexion->em; // Simulado
    }
    public function getNota($id_venta, $idmd5){ 
        $sql = "SELECT * FROM nota_debito_credito WHERE id_venta = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id_venta);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $nota = $resultado->fetch_assoc();
        if ($nota) {
            // Obtener detalles asociados
            $sqlDetalles = "SELECT dndc.*, pa.nombre AS nombre_producto 
                            FROM detalle_nota_debito_credito dndc
                            LEFT JOIN productos_almacen pa ON dndc.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                            WHERE dndc.id_nota_debito_credito = ?";
            $stmtDetalles = $this->cm->prepare($sqlDetalles);
            $stmtDetalles->bind_param("i", $nota['id_nota_debito_credito']);
            $stmtDetalles->execute();
            $resultadoDetalles = $stmtDetalles->get_result();
            $detalles = [];
            while ($fila = $resultadoDetalles->fetch_assoc()) {
                $detalles[] = $fila;
            }
            $nota['detalles'] = $detalles;
            $stmtDetalles->close();
        }
        $stmt->close();
        return json_encode(["estado" => "exito", "nota" => $nota]);
    }

    public function detalleVenta($id, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("SELECT dndc.id_detalle_nota_debito_credito, p.nombre, p.descripcion, p.caracteristicas, dndc.cantidad, dndc.precio_unitario, dndc.sub_total, dndc.monto_descuento , p.codigo, p.codigosin, p.unidadsin, p.actividadsin FROM detalle_nota_debito_credito dndc 
        LEFT JOIN nota_debito_credito ndc ON ndc.id_nota_debito_credito = dndc.id_nota_debito_credito
        LEFT JOIN venta ve on ndc.id_venta = ve.id_venta
        LEFT JOIN productos_almacen pa on dve.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT join productos p on pa.productos_id_productos=p.id_productos
        where ve.id_venta = '$id'
        order by p.nombre DESC");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array(
                "id" => $qwe['id_detalle_venta'],
                "producto" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion'], 
                "caracteristica" => $qwe['caracteristicas'], 
                "cantidad" => $qwe['cantidad'], 
                "precio" => $qwe['precio_unitario'],
                "codigo" => $qwe['codigo'],
                "codigosin" => $qwe['codigosin'],
                "unidadsin" => $qwe['unidadsin'],
                "actividadsin" => $qwe['actividadsin'],
                "subTotal" => floatval($qwe['cantidad']) * floatval($qwe['precio_unitario']),
            );
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
        $alma = $this->cm->query("SELECT ve.id_venta, c.id_cliente, c.nombre AS cliente, c.codigo AS codigoCliente, c.tipodocumento, c.nombrecomercial, s.nombre AS sucursal, ve.fecha_venta, c.direccion, c.nit, c.email, ve.monto_total, ve.descuento, ve.id_usuario, ve.tipo_pago, di.nombre AS divisa, ve.nfactura , vf.ack_ticket, vf.cuf, vf.fechaEmission, vf.numeroFactura, ve.punto_venta, pv.codigosin AS puntoVentaSin, l.idleyendas, l.codigosin AS leyendaSin FROM venta ve
        INNER JOIN cliente c ON ve.cliente_id_cliente1=c.id_cliente
        INNER JOIN sucursal s ON ve.idsucursal=s.id_sucursal
        INNER JOIN divisas di ON ve.divisas_id_divisas=di.id_divisas
        INNER JOIN nota_debito_credito ndc ON ve.id_venta = ndc.id_venta
        
        LEFT JOIN ventas_facturadas vf ON vf.venta_id_venta = ve.id_venta
        LEFT JOIN punto_venta pv ON pv.idpunto_venta = ve.punto_venta
        LEFT JOIN leyendas l ON l.idleyendas = ve.leyenda
        
        where ve.id_venta='$id'");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array(
                "id" => $qwe['id_venta'],
                "id_cliente" => $qwe['id_cliente'],
                "cliente" => $qwe['cliente'],
                "codigoCliente" => $qwe['codigoCliente'],
                "tipodocumento" => $qwe['tipodocumento'],
                "nombrecomercial" => $qwe['nombrecomercial'],
                "sucursal" => $qwe['sucursal'],
                "fecha" => $qwe['fecha_venta'], 
                "direccion" => $qwe['direccion'], 
                "nit" => $qwe['nit'], 
                "email" => $qwe['email'], 
                "montototal" => $qwe['monto_total'], 
                "descuento" => $qwe['descuento'], 
                "tipopago" => $qwe['tipo_pago'], 
                "divisa" => $qwe['divisa'], 
                "nfactura" => $qwe['nfactura'], 
                "ack_ticket" => $qwe['ack_ticket'], 
                "cuf" => $qwe['cuf'], 
                "fechaEmission" => $qwe['fechaEmission'], 
                "numeroFactura" => $qwe['numeroFactura'], 
                "punto_venta" => $qwe['punto_venta'], 
                "puntoVentaSin" => $qwe['puntoVentaSin'],
                "idleyendas" => $qwe['idleyendas'],
                "leyendaSin" => $qwe['leyendaSin'],
                "detalle" => array($lista), 
                "usuario" => array($usuarioInfo[$qwe['id_usuario']]), 
                "empresa" => array($empresaInfo[$idempresa])
            );
            array_push($lista2, $res);
        }

        echo json_encode($lista2);
    }
    private function obtenerNumeroNotaDisponible($idempresa, $tipoventa)
    {
        $nroFactura = null;
        $contadorIntentos = 0;

        // Bucle para asegurar que el número de factura no exista
        while ($nroFactura === null) {
            // 1. Contar ventas existentes para proponer un número inicial
            $sqlConteo = "SELECT COUNT(ndc.id_nota_debito_credito) 
                          FROM nota_debito_credito ndc
                          LEFT JOIN venta v ON ndc.id_venta = v.id_venta
                          LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                          WHERE c.idempresa = ? AND v.tipo_venta = ?";
            $stmtConteo = $this->cm->prepare($sqlConteo);
            $stmtConteo->bind_param("is", $idempresa, $tipoventa);
            $stmtConteo->execute();
            $resultado = $stmtConteo->get_result()->fetch_row();
            $nroFactura = $resultado[0] + 1 + $contadorIntentos;
            $stmtConteo->close();

            // 2. Verificar si el número propuesto ya existe
            $sqlVerificacion = "SELECT ndc.numNota 
                                FROM nota_debito_credito ndc
                                LEFT JOIN venta v ON ndc.id_venta = v.id_venta
                                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                                WHERE c.idempresa = ? AND v.tipo_venta = ? AND ndc.numNota  = ?";
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
                throw new Exception("No se pudo encontrar un número de nota disponible después de " . self::MAX_INTENTOS_NRO_FACTURA . " intentos.");
            }
        }

        return $nroFactura;
    }
    public function obtenerSucursal($idalmacen, $idmd5)
    {
        try {
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

            if ($idempresa === "false") {
                echo json_encode(["estado" => "error", "mensaje" => "El id de empresa no existe"]);
                return;
            }

            // Obtener sucursales de la empresa
            $sucursales = $this->em->query("
                SELECT idsucursalcontable, nombre, codigosucursal 
                FROM sucursalcontable 
                WHERE idorganizacion='$idempresa'
            ");

            $sucursalInfo = [];
            if ($this->em->rows($sucursales) > 0) {
                while ($sucursal = $this->em->fetch($sucursales)) {
                    $sucursalInfo[$sucursal['idsucursalcontable']] = [
                        "idsucursal" => $sucursal['idsucursalcontable'],
                        "nombre"     => $sucursal['nombre'],
                        "codigosin"  => $sucursal['codigosucursal']
                    ];
                }
            }

            // Buscar la sucursal del almacén con bind_result
            $sql = "SELECT a.idsucursal 
                    FROM almacen a
                    WHERE a.id_almacen = ?";

            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $idalmacen);
            $stmt->execute();
            $stmt->bind_result($idsucursal);

            if ($stmt->fetch()) {
                if ($idsucursal == 0 || !isset($sucursalInfo[$idsucursal])) {
                    return [
                        "idsucursal" => 0,
                        "nombre"     => "Sin sucursales",
                        "codigosin"  => "Sin sucursales"
                    ];
                } else {
                    return $sucursalInfo[$idsucursal];
                }
            } else {
                // Si no encontró el almacén
                return [
                    "idsucursal" => 0,
                    "nombre"     => "Sin sucursales",
                    "codigosin"  => "Sin sucursales"
                ];
            }

        } catch (Exception $e) {
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }


    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN NOTAS                 ==
    // =================================================================
    public function registrarNotaCreditoDebito($data){
         echo $this->CrearNota($data['numNota'], $data['id_punto_venta'], $data['id_cliente'], $data['id_leyenda'], $data['id_usuario'], $data['monto_total_devuelto'], $data['monto_descuento_credito_debito'], $data['monto_efectivo_credito_debito'], $data['id_venta'],$data['detalle'],$data['notaCreditoDebito'],$data['token'],$data['tipo'], $data['md5E'],$data['idalmacen'], $data['motivo']);
    }
   
    /**
     * Crea un nuevo registro de pago a crédito y genera sus cuotas.
     */
    public function CrearNota($numNota, $id_punto_venta, $id_cliente, $id_leyenda, $id_usuario, $monto_total_devuelto, $monto_descuento_credito_debito, $monto_efectivo_credito_debito, $id_venta, $detalle, $jsonEmizor, $token, $tipo_factura, $md5E, $idalmacen, $motivo)
    {
        // $sqlControlVenta = "select count(id_venta) as cant from nota_debito_credito where id_venta = ?";
        // $stmt = $this->cm->prepare($sqlControlVenta);
        // $stmt->bind_param("i", $id_venta);
        // $stmt->execute();
        // $stmt->bind_result($cant);
        // $stmt->fetch();

        // $stmt->close();
        // if ($cant > 0) {
        //     return json_encode(["estado" => "error", "mensaje" => "Ya existe una nota de débito/crédito para esta venta."]);
        // }
        // Validación básica
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($md5E); 
        $sucursa = $this->obtenerSucursal($idalmacen, $md5E);

        
        $sql = "INSERT INTO nota_debito_credito (numNota, id_punto_venta, id_cliente, id_leyenda, id_usuario, monto_total_devuelto, monto_descuento_credito_debito, monto_efectivo_credito_debito, id_venta, cuf, ack_ticket, urlSin, emision_type_code, fechaEmision, numeroFactura, shortLink, codigoEstado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?)";
        $numNota = $this->obtenerNumeroNotaDisponible($idempresa, $tipo_factura);
        $jsonEmizor['numeroNota'] = $numNota;
        // $t = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJmYzFkMjZmYTljOGZkNmUxNmI4YjBiMDk5MDdiNGJmNWJmMWFlMGNjZGIwNzMwYjZmZTM4Y2YyNTA2ZTA0ZWMzOTc5MWYyMTIyNzgxNWEwYyIsImlhdCI6MTY4NzQ1OTkxOSwibmJmIjoxNjg3NDU5OTE5LCJleHAiOjE3MTkwODIzMTksInN1YiI6IiIsInNjb3BlcyI6W119.XtGten29n35cbNq-C3e2PekjIYykrBAgY9HZHH7GCtyw_8eUwXdAlx_PFa7aIuuBDMjBBjEMU7Wb7cfMAFiqKWNIOgJSe5-iliID6MceSN8HEJbO-Rj-34nDkBwtEgwwqf3EygZTiqQlXX2xOPsgbqXVo5wZVZV7xXV-zKMjBiATT5K0mZR_OX88HTu9TAMaiWBgJgmDm2a-NQEwQpoqBjgzftjE_QjsdpHXUHnuVk5lJLSQZdoaule-nb1mqWVyH7qCXGF25S0s0IB7v2EinzbgmvRiIjUeK1udUxyEn1G4RMcoJixmCzsgcpl1O67jXdpnzusxZOZGMiwT5Vf-SH61W-pfgV3y8wQ3n0f0HzrR43JMwDuQFhJhBcDg_R2tmW8oUUDNy7huSm2AjYkLyAJvw_IhL6QZNPIEMEPDXLi_Ttao9gtGT-0r52huQOEGuBGyVv230hqQrGDLgF_2LGzkaDofmPUWDIUZvBkHjWHPC98_4ksuBUviLvHAmVPWDevlf5IiwCb_ireMvLU09fdn9ke0A1pA7MkUDTMIHkqWjVqj1oaan6-rcuVnBC3EPLX-ahr9qkeIA0LnsP74QX2-ejT_ZGAEdhB1s8MjcJiUb1LX3Z97vsyS5_DirCQJ7d7oAq35EymnpEJgLheskcBsN2Ncnoj621mqslKWjcc';

        $cuf = null;
        $ack_ticket = null;
        $urlSin = null;
        $emision_type_code = null;

        $fechaEmision = null;
        $numeroFactura = null;
        $shortLink = null;
        $codigoEstado = null;
        $respuestaFinal = [];
        // $cuf= "1553FC196BEDE0BBCB02CABF81EC1EE09B53878AD79C721CF9EB12F74" ;
        // $ack_ticket= "68d597bf1d6b5" ;
        // $urlSin= "https://pilotosiat.impuestos.gob.bo/consulta/QR?nit=311710026&cuf=1553FC196BEDE0BBDD637C309257D1D8B6F3878AD69C721CF9EB12F74&numero=1" ;
        // $emision_type_code= 1;
        // $fechaEmision= "2025-09-25 17:24:59" ;
        // $numeroFactura= 1;
        // $shortLink= "https://sinfel.emizor.com/inv/68d5b32bc9f15" ;
        // $codigoEstado= "609";
        // $respuestaEmizor = [];
        $respuestaEmizor = $this->factura->crearfactura($jsonEmizor,24, $token, $tipo_factura, $sucursa['codigosin']);
        if ($respuestaEmizor->status === "success") {
                    $estadoFactura = null;
            for ($i = 0; $i < self::MAX_INTENTOS_CONSULTA_FACTURA; $i++) {
                $estadoFactura = $this->factura->estadofactura($respuestaEmizor->data->cuf, $token,$tipo_factura, 2);
                if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA && $estadoFactura->data->errores == null) {
                    break; // Factura validada, salir del bucle
                }
                sleep(1); // Esperar 1 segundo antes de reintentar
            }
            

            if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA) {

                    $cuf= $respuestaEmizor->data->cuf ;
                    $ack_ticket= $respuestaEmizor->data->ack_ticket ;
                    $urlSin= $respuestaEmizor->data->urlSin ;
                    $emision_type_code= $respuestaEmizor->data->emission_type_code;
                    $fechaEmision= $respuestaEmizor->data->fechaEmision ;
                    $numeroFactura= $respuestaEmizor->data->numeroFactura;
                    $shortLink= $respuestaEmizor->data->shortLink ;
                    $codigoEstado= $respuestaEmizor->data->codigoEstado;
                    
            } else {
                $respuestaFinal = ["estado" => "error", "mensaje" => "La factura no pudo ser validada por el SIN.", "detalles" => $estadoFactura];
            }

        } else {
            return json_encode(["estado" => "error", "mensaje" => "Error al crear la Nota Credito Debito: " , "detalles" => $respuestaEmizor, "respuesta Final" => $respuestaFinal]);
        }
        try {

            $this->cm->begin_transaction();

            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de pago: " . $this->cm->error);
            }

            $stmt->bind_param("iiiiidddisssisisi", $numNota, $id_punto_venta, $id_cliente, $id_leyenda, $id_usuario, $monto_total_devuelto, $monto_descuento_credito_debito, $monto_efectivo_credito_debito, $id_venta, $cuf, $ack_ticket, $urlSin, $emision_type_code, $fechaEmision, $numeroFactura, $shortLink, $codigoEstado);

            if ($stmt->execute()) {
                $id_nota = $this->cm->insert_id;
                //$this->registrarDetalleNota($detalle,$id_nota);
                $iddevolucion = $this->funcionesVenta->registrodevolucion($motivo, $id_venta, $md5E, 1, $detalle, 'VE');
                $res = $this->funcionesVenta->cambiarestadodevolucion($iddevolucion, 1, $id_usuario, 1);
                $this->cm->commit();
                return json_encode(["estado" => "exito", "mensaje" => "Nota Credito Debito creado correctamente.", "idNota" => $id_nota,"respuestaEmizor"=>$respuestaEmizor, "sucursal"=>$sucursa, "tipo"=>$tipo_factura]);
            } else {
                throw new Exception("No se pudo registrar el pago.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            return json_encode(["estado" => "error", "mensaje" => "Error al crear el pago: " . $e->getMessage()]);
        }
    }
    private function registrarDetalleNota($detalle,$id_nota){

        $sql = "INSERT INTO detalle_nota_debito_credito (productos_almacen_id_productos_almacen, cantidad, precio_unitario, sub_total, monto_descuento,id_nota_debito_credito) VALUES (?, ?, ?, ?, ?,?)";
        try {
            $stmt = $this->cm->prepare($sql);
           
            foreach($detalle as $item){
                $stmt->bind_param("iidddi", $item['id'], $item['cantidad'],$item['precioUnitario'],$item['subTotal'],$item['montoDescuento'],$id_nota);
                $stmt->execute();
            }
            return true;
        } catch (Exception $e) {
            // Si falla, la transacción principal en `crearPago` hará rollback
            throw new Exception("Error al generar las cuotas: " . $e->getMessage());
        }
    }

}