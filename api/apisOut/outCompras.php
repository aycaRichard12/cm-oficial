<?php
require_once "apiTokens.php";
class outCompras
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
    private $compra;
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
        $this->compra = new compras();
        $this->numceros = 4;
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        
    }
    
    public function registroproveedor($nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto, $idmd5)
    {}
    public function proveedor($data,$idmdE5,$idempresa){

        $obligatorios = ['nombre','codigo', 'nit'];
        foreach ($obligatorios as $campo) {
            if (!isset($data[$campo]) || empty(trim($data[$campo]))) {
                return 0; // o puedes lanzar una excepción si prefieres
            }
        }
        $sql = "SELECT id_proveedor FROM proveedor WHERE nit = ? AND codigo = ? AND id_empresa = ?;";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("ssi", $data['nit'],$data['codigo'],$idempresa);
        $stmt->execute();
        $stmt->bind_result($id_proveedor);
        $stmt->fetch();
        $stmt->close();

        if ($id_proveedor) {

            $res = $id_proveedor;

        } else {

            $TIPORESPUESTA = 1;
            $nombre=$data['nombre'] ?? '';
            $codigo=$data['codigo'] ?? ''; 
            $nit=$data['nit'] ?? '';
            $detalle=$data['detalle'] ?? '';
            $direccion=$data['direccion'] ?? '';
            $telefono=$data['telefono'] ?? '';
            $mobil=$data['mobil'] ?? '';
            $email=$data['email'] ?? '';
            $web=$data['web'] ?? '';
            $pais=$data['pais'] ?? '';
            $ciudad=$data['ciudad'] ?? '';
            $zona=$data['zona'] ?? '';
            $contacto=$data['contacto'] ?? '';
            $res =  $this->compra->registroproveedor($nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto, $idmdE5, $TIPORESPUESTA);
        }
        return $res;
    }
     public function idProducto($idmd5P){
        $consulta = $this->cm->query("select id_productos_almacen from productos_almacen WHERE MD5(id_productos_almacen) = '$idmd5P'");
        if ($consulta->num_rows > 0) {
            $fila = $this->cm->fetch($consulta);
            $id = $fila[0];
            return $id;
        } else {
            return "false";
        }

    }
     public function ordenar_listaProductos($dataproductos){
        $listaProductos = [];
        
        foreach ($dataproductos as $producto) {
            $idproducto =  $this->idProducto($producto['id']);
            $Lp = [
                "idproductoalmacen"=> $idproducto,
                "cantidad"=> $producto['cantidad'],
                "precio_unitario"=> $producto['precioUnitario'],
                "idstock"=> $producto['codigoStock'],
    
            ];
            
            
            array_push($listaProductos,$Lp );
        }
        $r = array("Productos" => $listaProductos);
        return $r;
    }
    public function registrarCompra($data){
        
        

        if(isset($data['proveedor']) && isset($data['idusuario']) && isset($data['codigoAlmacen']) && isset($data['fecha_ingreso']) && isset($data['Lote']) && isset($data['codigoCompra']) && isset($data['nfactura']) && isset($data['detalle'])){
                $provedor = $data['proveedor'];
                $md5U = $data['idusuario'];
                $codigoAlmacen = $data['codigoAlmacen'];
                $fecha_ingreso = $data['fecha_ingreso'];
                $nombre = $data['Lote'];
                $codigo = $data['codigoCompra'];
                $nfactura = $data['nfactura'];
                $detalle = $data['detalle'];

                $PEDIDO = 0;
                $autorizacion = 2;
                $pedidos_id_pedidos = 0;
                $estado = 1;
                $tipocompra = 1;
                $datostoken = $this->token->autenticarPeticion();
                $id_empresa = $datostoken->data->id_empresa;
                $factura = $datostoken->data->tipo;
                $idmd5 = $datostoken->data->md5;


                $idusuario = $this->verificar->verificarIDUSERMD5($md5U);
                $id_proveedor = $this->proveedor($provedor,$idmd5,$id_empresa);
                $almacen = $this->configuracion->listaAlmacenesResponsable($idmd5,1,$codigoAlmacen,$idusuario);
                $idalmacen = $almacen[0]['idalmacen'];
                $TIPORESPUESTACOMPRA = 1;
                $TIPORESPUESTADETALLE = 1;
                $TIPORESPUESTAESTADO = 1;

                $idcompra = $this->compra->registroCompra($nombre,$codigo,$id_proveedor,$PEDIDO,$nfactura,$tipocompra,$idalmacen,$idmd5,$TIPORESPUESTACOMPRA);


                foreach ($detalle as $producto){
                     $idproducto =  $this->idProducto($producto['id']);
                    $this->compra->registroDetalleCompra($producto['precioUnitario'],$producto['cantidad'],$idcompra,$idproducto,$TIPORESPUESTADETALLE);
                }


                $this->compra->cambiarestadoCompra($idcompra, 1, null, $idalmacen,$TIPORESPUESTAESTADO);
                
                
        }
        
    }
    

    
}
