<?php
require_once "apiTokens.php";
date_default_timezone_set("America/La_Paz");
class outVenta
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

    // --- CONSTANTES DE CLASE ---
    private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN
    private const MAX_INTENTOS_NRO_FACTURA = 1000;

    /**
     * Constructor de la clase Ventas.
     */
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();
        $this->venta = new UseVEnta();
        $this->funcionesVenta = new ventas();
        $this->token = new ApiTokens();
        $this->configuracion = new configuracion();
        $this->numceros = 4;
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        
    }
    public function getidAlmacen($codigo,$idempresa){
        $id_almacen = null;
        $sql = "SELECT id_almacen FROM almacen WHERE codigo = ? AND idempresa = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("si", $codigo,$idempresa);
        $stmt->execute();
        $stmt->bind_result($id_almacen);  // vinculas la salida a una variable
        $stmt->fetch();                   // obtienes el valor
        $stmt->close();
        return $id_almacen;               // retorna el id directamente
    }
     
    public function verificarCliente($datosCliente, $idmd5E, $token, $factura) {
        if (($factura == 2 || $factura == 1) && $datosCliente['tipoDocumento'] == 5) {

            ob_start();  
            $this->factura->validarNIT($datosCliente['nit'], $token, $factura);
            $res = ob_get_clean();  

            $data = json_decode($res); // objeto stdClass

            if ($data->data->descripcion != "NIT ACTIVO") {
                // solo responde en Postman si NO está activo
                echo $res;  
                return null;
            }

            // si está activo, simplemente no haces echo
        }

        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5E);
        $res = [];

        //  Validar campos obligatorios
        $obligatorios = ['nombre','tipoDocumento', 'nit'];
        foreach ($obligatorios as $campo) {
            if (!isset($datosCliente[$campo]) || empty(trim($datosCliente[$campo]))) {
                return 0; // o puedes lanzar una excepción si prefieres
            }
        }
        $id_cliente = 0;
        $codigo = '';
        $tipodocumento = '';
        $nit = '';
        $nombrecomercial = '';
        $id_sucursal = 0;
        $sql = "SELECT id_cliente, codigo, tipodocumento, nit, nombrecomercial FROM cliente  WHERE nit = ? AND idempresa = ?;";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("si", $datosCliente['nit'],$idempresa);
        $stmt->execute();
        $stmt->bind_result($id_cliente, $codigo, $tipodocumento, $nit, $nombrecomercial);
        $stmt->fetch();
        $stmt->close();
        //  Verificar si ya existe cliente con el mismo NIT
        

        if ($id_cliente) {
            
            $sql = "SELECT s.id_sucursal FROM sucursal s WHERE s.cliente_id_cliente = ?;";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_cliente);
            $stmt->execute();
            $stmt->bind_result($id_sucursal);
            $stmt->fetch();
            $stmt->close();

            $res = [    
                        "idcliente" => $id_cliente,
                        "idsucursal"=>$id_sucursal,
                        "tipoDocumento" => $tipodocumento,
                        "NroDocumento" => $nit,
                        "nombreComercial" => $nombrecomercial,
                        "codigo" => $codigo
                    ];

        } else {
            
            //  Registrar cliente nuevo
            $res = $this->funcionesVenta->registrocliente(
                $datosCliente['nombre'] ?? '',
                $datosCliente['nombreComercial'] ?? $datosCliente['nombre'],
                $datosCliente['codigoCanal']      ?? '',
                $datosCliente['codigoTipoCliente']?? '',
                $datosCliente['tipoDocumento'],
                $datosCliente['nit'],
                $datosCliente['detalle']          ?? '',
                $datosCliente['direccion']        ?? '',
                $datosCliente['telefono']         ?? '',
                $datosCliente['mobil']            ?? '',
                $datosCliente['email']            ?? '',
                $datosCliente['web']              ?? '',
                $datosCliente['pais']             ?? '',
                $datosCliente['ciudad']           ?? '',
                $datosCliente['zona']             ?? '',
                $datosCliente['contacto']         ?? '',
                $idmd5E,
                1
            );
            
           
        }
        

        
       
        //echo json_encode([ "cliente" => $res]);
        return $res;
    }

   
    public function canal_venta($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT * from canalventa where idempresa='$idempresa' and estado = 1 order by idcanalventa desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("codigo" => $qwe[0], "canal" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    
    public function usuario($idempresa,$idusuario){
        $nombre = null;
        $cargo = null;
        try {
            $sql = "SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
            LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
            LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
            WHERE u.idempresa=? AND u.idusuario = ?";
            $stmt = $this->rh->prepare($sql);
            $stmt->bind_param("ii", $idempresa,$idusuario);
            $stmt->execute();
            $stmt->bind_result($idusuario, $nombre, $cargo);
            $stmt->fetch();
            $stmt->close();
            return [
                "idusuario" => $idusuario,
                "nombre" => $nombre,
                "cargo" => $cargo,
            ];
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    public function obtenerDatosProductoPorMD5($idmd5P)
    {
        // Consulta uniendo productos_almacen con productos
        $sql = "
            SELECT 
                pa.id_productos_almacen,
                p.id_productos,
                p.actividadsin,
                p.codigosin,
                p.unidadsin,
                p.nombre,
                p.codigo,
                p.descripcion
            FROM productos_almacen pa
            INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
            WHERE MD5(pa.id_productos_almacen) = '$idmd5P'
            LIMIT 1;
        ";

        $consulta = $this->cm->query($sql);

        if ($consulta && $consulta->num_rows > 0) {
            $fila = $this->cm->fetch($consulta);
            return [
                'id_productos_almacen' => $fila['id_productos_almacen'],
                'actividadsin' => $fila['actividadsin'],
                'codigosin' => $fila['codigosin'],
                'unidadsin' => $fila['unidadsin'],
                'nombre' => $fila['nombre'],
                'codigo' => $fila['codigo'],
                'descripcion' => $fila['descripcion']
            ];
        } else {
            return null; // más limpio que devolver "false"
        }
    }

    public function getDivisa(){
        $datostoken = $this->token->autenticarPeticion();
        $idempresa = $datostoken->data->id_empresa;
        $codigoDivisa = null;
        $codigoDivisaSin = null;
        $divisa = null;
         try {
            $sql = "SELECT id_divisas AS codigoDivisa, monedasin AS codigoDivisaSin, nombre AS divisa FROM divisas WHERE idempresa = ? AND estado = 1;";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $idempresa);
            $stmt->execute();
            $stmt->bind_result($codigoDivisa,$codigoDivisaSin,$divisa);
            $stmt->fetch();
            $stmt->close();
            echo json_encode([ 
                
                    "divisa" => $divisa,
                    "codigoDivisa" => $codigoDivisa,
                
            ]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    public function sin_divisa($iddivisa){
        $monedasin = null;
         try {
            $sql = "SELECT  monedasin FROM divisas WHERE id_divisas = ?";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $iddivisa);
            $stmt->execute();
            $stmt->bind_result($monedasin);
            $stmt->fetch();
            $stmt->close();
            return $monedasin;
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return  0;
        }
    }

    public function ordenar_listaProductos($dataproductos,$factura){
        $listaProductos = [];
        $listaProductosFactura =[];
        $detalles = [];
        foreach ($dataproductos as $producto) {
            $prod =  $this->obtenerDatosProductoPorMD5($producto['id']);
            $Lp = [
                "idproductoalmacen"=> $prod['id_productos_almacen'],
                "cantidad"=> $producto['cantidad'],
                "precio"=> $producto['precioUnitario'],
                "idstock"=> $producto['codigoStock'],
                "idporcentaje"=> $producto['codigoPorcentaje'],
                "candiponible"=> $producto['stock'],
                "descripcion"=> $prod['descripcion'],
                "codigo"=> $prod['codigo'],
                "subtotal"=> $producto['subTotal'],
                "datosAdicionales"=> '',
                "despachado"=> 1, 
            ];
            if($factura != 0){
                $LPF =[
                    "codigoProducto"=> $prod['codigo'],
                    "codigoActividadSin"=> $prod['actividadsin'],
                    "codigoProductoSin"=> $prod['codigosin'],
                    "descripcion"=> $prod['descripcion'],
                    "unidadMedida"=> $prod['unidadsin'],
                    "precioUnitario"=> $producto['precioUnitario'],
                    "subTotal"=> $producto['subTotal'],
                    "cantidad"=> $producto['cantidad'],
                    "numeroSerie"=> $producto['numeroSerie']??"",
                    "montoDescuento"=> $producto['montoDescuento'],
                    "numeroImei"=> $producto['numeroImei'] ?? "",
                    "codigoNandina"=> $producto['codigoNandina']??"",
                ];

                $d = [
                    "codigoProducto"=> $prod['codigo'],
                    "codigoActividadSin"=> $prod['actividadsin'],
                    "codigoProductoSin"=> $prod['codigosin'],
                    "descripcion"=>  $prod['descripcion'],
                    "unidadMedida"=>  $prod['unidadsin'],
                    "precioUnitario"=> $producto['precioUnitario'],
                    "subTotal"=> $producto['subTotal'],
                    "cantidad"=> $producto['cantidad'],
                    "numeroSerie"=> $producto['numeroSerie']??"",
                    "montoDescuento"=>  $producto['montoDescuento'],
                    "numeroImei"=> $producto['numeroImei'] ?? "",
                    "codigoNandina"=> $producto['codigoNandina']??"",
                ];
                array_push($listaProductosFactura,$LPF );
                array_push($detalles,$d);
            }
            
            array_push($listaProductos,$Lp );
            

        }
        $r = array("listaProductos" => $listaProductos,"listaProductosFactura" => $listaProductosFactura, "detalles" => $detalles);
        return $r;
    }
    public function getFormularioVenta(){
        $datos = [ 
            "jsonDetalles"=> [
                "ver" => "registrarVenta",
                "codigoAlmacen"=> "AAAW",
                "idusuario" => "a8f15eda80c50adb0e71943adc8015cf",
                "cliente" =>[
                    "nombre" => "",
                    "tipoDocumento" => "",
                    "nit" => "",
                    "nombreComercial" => "",
                    "codigoCanal" => "",
                    "codigoTipoCliente" => "",
                    "direccion" => "",
                    "telefono" => "",
                    "mobil" => "",
                    "email" => "",
                    "web" => "",
                    "pais" => "",
                    "ciudad" => "",
                    "zona" => "",
                    "contacto" => "",

                ],
                "listaFactura"=> [
                    "codigosinsucursal" => "",
                    "codigoDivisa" => "",
                    
                    "codigoPuntoVenta"=> "1",
                    "codigoCanal" => "null",
                    "fechaEmision"=> "2025-08-22T16=>29=>05.799Z",
                    "cafc"=> "",
                    "codigoExcepcion"=> "",
                    "descuentoAdicional"=> 0,
                    "montoGiftCard"=> 0,
                    "complemento"=> "",
                    "periodoFacturado"=> "",
                    "codigoMetodoPago"=> "21",
                    "numeroTarjeta"=> "",
                    "montoTotal"=> "90.00",
                    "codigoMoneda"=> 1,
                    "montoTotalMoneda"=> "90.00",
                    "extras"=> [
                        "facturaTicket"=> ""
                    ],
                    "montoTotalSujetoIva"=> "90.00",
                    "tipoCambio"=> 1,
                    "detalles"=> [
                        [
                            "id"=> "b17c0907e67d868b4e0feb43dbbe6f11",
                            "codigoPorcentaje"=> "212",
                            "codigoProducto"=> "MV-001",
                            "codigoActividadSin"=> "620100",
                            "codigoProductoSin"=> "991009",
                            "descripcion"=> "Producido con harina nacional.",
                            "unidadMedida"=> "4",
                            "precioUnitario"=> "90",
                            "subTotal"=> "90.00",
                            "cantidad"=> 1,
                            "numeroSerie"=> "",
                            "montoDescuento"=> 0,
                            "numeroImei"=> "",
                            "codigoNandina"=> ""
                        ]
                    ]
                ],
            ]
        ];


        return $datos;
    }
    public function sin_metodo_pago($id_metodo){
        $codigosin = 0;
         try {
            $sql = "SELECT codigosin FROM metodopago WHERE idmetodopago = ?;";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_metodo);
            $stmt->execute();
            $stmt->bind_result($codigosin);
            $stmt->fetch();
            $stmt->close();

            return $codigosin;

        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return 0;
        }
    }

    /**
     
     *
     * @param array $data
     */
    public function registrarVenta($data){
        $fecha_venta = date("Y-m-d");
        $fechaEmision = date('Y-m-d\TH:i:s.000');
        $COD_SIN_METODO_PAGO = 0;
        $COD_SIN_DIVISA = 0;
        $TIPO_VENTA = 0;

        /** DATOS DE EMPRESA POR EL TOKEN */
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $idmd5 = $datostoken->data->md5;
        $tokenEmizor = "";
        if($factura == 1 || $factura == 2){
            $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
            $COD_SIN_METODO_PAGO = $this->sin_metodo_pago($data['codigoMetodoPago']);
            $COD_SIN_DIVISA = $this->sin_divisa($data['codigoDivisa']);;
            $TIPO_VENTA =1;
        }

        $idusuario = $this->verificar->verificarIDUSERMD5($data['idusuario']);
        
        $emailCliente = "factura@yofinanciero.com";
        
        $c = $this->verificarCliente($data['datosCliente'], $idmd5, $tokenEmizor, $factura);
        $usuario = $this->usuario($id_empresa, $idusuario);
        $almacen = $this->configuracion->listaAlmacenesResponsable($idmd5,1,$data['codigoAlmacen'],$idusuario);
        
        
        $r = $this->ordenar_listaProductos($data['detalle'],$factura);
        $jsonDetalles = [
            "listaProductos" => $r['listaProductos'],
            "listaProductosFactura" => $r['listaProductosFactura'],
            "listaFactura" => [
                "numeroFactura"=>"",
                "nombreRazonSocial"=>$c['nombreComercial'],
                "codigoPuntoVenta"=> $data['codigoPuntoVentaSin'],
                "fechaEmision"=>$fechaEmision,
                "cafc" =>"",
                "codigoExcepcion"=>"",
                "descuentoAdicional"=>$data['descuentoAdicional'],
                "montoGiftCard"=>'',
                "codigoTipoDocumentoIdentidad"=>$c['tipoDocumento'],
                "numeroDocumento"=>$c['NroDocumento'],
                "complemento"=>$data['complemento'],
                "codigoCliente"=>$c['codigo'],
                "periodoFacturado"=>"",
                "codigoMetodoPago"=>$COD_SIN_METODO_PAGO,
                "numeroTarjeta"=>$data['numeroTarjeta'],
                "montoTotal"=>$data['montoTotal'],
                "codigoMoneda"=>$COD_SIN_DIVISA,
                "montoTotalMoneda"=>$data['montoTotal'],
                "usuario"=>$usuario['nombre'],
                "emailCliente"=>$emailCliente,
                "telefonoCliente"=>'',
                "extras"=>[ "facturaTicket" => ''],
                "montoTotalSujetoIva"=>$data['montoTotal'],
                "tipoCambio"=>1,
                "detalles"=>$r['detalles'],
                
            ],
            "idalmacen" => $almacen[0]['idalmacen'],
            "codigosinsucursal" => $almacen[0]['sucursales'][0]['codigosin'],
            "token" => $tokenEmizor,
            "tipo" => $factura,
            "iddivisa" => $data['codigoDivisa'],
            "idcampana" => 0,
            "ventatotal" => $data['montoTotal'],
            "subtotal" => floatval($data['montoTotal']) - floatval($data['descuentoAdicional']),
            "descuento" => $data['descuentoAdicional'],
            "nropagos" => 0,
            "valorpagos" => 0,
            "dias" => null,
            "fechalimite" => '',
            "pagosDivididos" => [
                [
                    "metodoPago" => [
                        "value" => $data['codigoMetodoPago'],
                    ],
                    "monto" => $data['montoTotal'],
                    "porcentaje" => 100,
                ]
            ],
            "variablePago" => "dividido",
            "puntoVenta" => 0,
        ];
        //$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles
        // echo json_encode(["fecha venta"=> $fecha_venta," TIPO_VENTA"=> $TIPO_VENTA,"idcliente"=> $c['idcliente'],"idsucursal"=> $c['idsucursal'],"id_empresa"=> $idmd5,"idusuario"=> $data['idusuario'],"jsonDetalles"=> $jsonDetalles]);
       $this->venta->registroVenta($fecha_venta,$TIPO_VENTA,'contado',$c['idcliente'],$c['idsucursal'],'0',$idmd5,$data['idusuario'],$jsonDetalles);    
        
    }
    function tipo_documentos() {
        // Validar método permitido
        try {
            // Código que puede fallar
            $datostoken = $this->token->autenticarPeticion();
                if (!$datostoken || empty($datostoken->data->id_empresa)) {
                    http_response_code(401); // No autorizado
                    echo json_encode([
                        "estado" => "error",
                        "codigo" => 401,
                        "mensaje" => "Token inválido o no autorizado."
                    ], JSON_UNESCAPED_UNICODE);
                    return;
                }
                $documentos = [
                    ["documento" => "CI",  "codigo" => 1],
                    ["documento" => "CEX", "codigo" => 2],
                    ["documento" => "PAS", "codigo" => 3],
                    ["documento" => "OD",  "codigo" => 4],
                    ["documento" => "NIT", "codigo" => 5],
                ];

                echo json_encode(
                    $documentos
                , JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function verificarToken($token){
        try {
            

        
            $tokenEmizor = $this->token->obtenerverifcatoken($token);
             //echo json_encode(['tokeemizor'=>$tokenEmizor, 'idm5' =>$idmd5,'tipo'=>$factura]);
           // $this->configuracion->listaMetodoPagoFactura($idmd5,$tokenEmizor,$factura);
       
            
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function metodos_pago(){
        try {
            // Código que puede fallar
            $datostoken = $this->token->autenticarPeticion();
            $id_empresa = $datostoken->data->id_empresa;
            $factura = $datostoken->data->tipo;
            $idmd5 = $datostoken->data->md5;

            if($factura == 2 || $factura == 1){
                $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
               // echo json_encode([ "token" => $tokenEmizor]);
                //echo json_encode(['tokeemizor'=>$tokenEmizor, 'idm5' =>$idmd5,'tipo'=>$factura]);
                $this->configuracion->listaMetodoPagoFactura($idmd5,$tokenEmizor,$factura,1);
            }else{
                $this->configuracion->listaMetodoPagoFactura($idmd5,"",0,1);
            }
            
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function puntos_venta($idmd5){
        try {
            // Código que puede fallar encontrada
            $datostoken = $this->token->autenticarPeticion();
            $factura = $datostoken->data->tipo;
            if($factura == 2 || $factura == 1){
                $this->funcionesVenta->listaPuntoVentaFactura($idmd5,1);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    
    public function detalleFactura($cuf){
       $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $idmd5 = $datostoken->data->md5;
        $tokenEmizor = "";
        if($factura == 1 || $factura == 2){
            $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
          
        }
        echo json_encode(["cuf"=>$cuf, "datosToken"=> $datostoken, "token" => $tokenEmizor]);
    }
    public function estadoFactura($cuf){
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $idmd5 = $datostoken->data->md5;
        $tokenEmizor = "";
        if($factura == 1 || $factura == 2){
            $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
          
        }

        $controler = $this->factura->estadofactura($cuf,$tokenEmizor,$factura, null);
        if($controler){
            echo json_encode($controler);

        }

    }
    public function anularFactura($cuf, $data){
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $idmd5 = $datostoken->data->md5;
        $tokenEmizor = "";
        if($factura == 1 || $factura == 2){
            $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
          
        }

        $sql = "SELECT venta_id_venta FROM ventas_facturadas WHERE cuf = ?";
        $stmt = $this->cm->prepare($sql);

       
        $stmt->bind_param("s", $cuf);
        $stmt->execute();

        // 6. **Obtener el Resultado**
        $result = $stmt->get_result();
        $id_venta = 0;
        if ($result->num_rows > 0) {
            // 7. **Recorrer los resultados (solo debería haber uno si el CUF es único)**
            $row = $result->fetch_assoc();
            $id_venta = $row["venta_id_venta"];
        } 
        $motivo = $data['codigoMotivoAnulacion'];
        $idusuario = $data['idusuario'];

        $controler = $this->funcionesVenta->cambiarestadoventa($id_venta,2,$motivo,$idusuario,$tokenEmizor,$factura);
        //echo json_encode(["cuf" => $cuf, "motivo"=>$motivo, "token"=>$tokenEmizor, "tipo" => $factura]);
        // $controler = $this->factura->anularFactura($cuf,$motivo,$tokenEmizor,$factura);
        if($controler){
            echo json_encode($controler);

        }

    }
    public function getmotivoAnulacion(){
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $idmd5 = $datostoken->data->md5;
        $tokenEmizor = "";
        if($factura == 1 || $factura == 2){
            $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
          
        }
        $controler = $this->factura->listadoConfigParametricas('motivoanulacion',$tokenEmizor,$factura,null);
        if($controler){
            echo json_encode($controler);

        }

    }
    
}
