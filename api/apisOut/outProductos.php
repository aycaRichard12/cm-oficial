<?php

require_once "apiTokens.php";

class OutProductos
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
    private $token;
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
        $this->token = new ApiTokens();
    }
    

   

    public function productos( $codigo )
    {
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;

        if($factura == 2 || $factura == 1){
            $sql = "SELECT 
                        MD5(pa.id_productos_almacen) AS id,
                        p.nombre AS nombreProducto,
                        p.descripcion AS descripcionProducto,
                        p.codigo AS codigoProducto,
                        p.codigosin AS codigoProductoSin,
                        p.actividadsin AS codigoActividadSin,
                        p.unidadsin AS unidadSin,
                        p.codigonandina AS codigoNandina,
                        p.imagen AS urlImagen,
                        s.id_stock AS codigoStock,
                        s.cantidad AS stock,
                        p.cod_barras AS codigoBarra,
                        COALESCE(ca.nombre, sca_padre.nombre) AS categoria,
                        COALESCE(sca.nombre, '') AS subCategoria,
                        me.nombre_medida AS origenProducto,
                        ep.tipos_estado AS estadoProducto,
                        un.nombre AS unidadMedida,
                        p.caracteristicas AS caracteristicaExtra,
                        po.id_porcentajes AS codigoPorcentaje,
                        po.tipo AS CategoriaPrecio, 
                        ps.precio AS precioUnitario
                    FROM productos_almacen pa
                    LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
                    LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
                    LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
                    LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
                    LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
                    LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
                    LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
                    LEFT JOIN precio_sugerido ps ON ps.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    LEFT join porcentajes AS po ON ps.porcentajes_id_porcentajes=po.id_porcentajes
                    LEFT JOIN (
                        SELECT id_stock, estado, productos_almacen_id_productos_almacen, cantidad, ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                        FROM
                            stock
                        WHERE
                            estado = '1' 
                    ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1 
                    WHERE p.codigosin IS NOT NULL 
                    AND p.codigosin <> 0 
                    AND p.codigosin <> '' 
                    AND p.idempresa = ? 
                    AND s.cantidad <> 0
                    AND a.codigo = ?
                    ";


            // Preparar consulta
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("ii", $id_empresa, $codigo);
            $stmt->execute();
            $result = $stmt->get_result();

            $productos = [];
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
            array_push($productos);
            $stmt->close();
            // Retornar en formato JSON
            echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }else{
            $sql = "SELECT 
                        MD5(pa.id_productos_almacen) AS id,
                        p.nombre AS nombreProducto,
                        p.descripcion AS descripcionProducto,
                        p.codigo AS codigoProducto,
                        p.codigosin AS codigoProductoSin,
                        p.actividadsin AS codigoActividadSin,
                        p.unidadsin AS unidadSin,
                        p.codigonandina AS codigoNandina,
                        p.imagen AS urlImagen,
                        s.id_stock AS codigoStock,
                        s.cantidad AS stock,
                        p.cod_barras AS codigoBarra,
                        COALESCE(ca.nombre, sca_padre.nombre) AS categoria,
                        COALESCE(sca.nombre, '') AS subCategoria,
                        me.nombre_medida AS origenProducto,
                        ep.tipos_estado AS estadoProducto,
                        un.nombre AS unidadMedida,
                        p.caracteristicas AS caracteristicaExtra,
                        po.id_porcentajes AS codigoPorcentaje,
                        po.tipo AS CategoriaPrecio, 
                        ps.precio AS precioUnitario
                    FROM productos_almacen pa
                    LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
                    LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
                    LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
                    LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
                    LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
                    LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
                    LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
                    LEFT JOIN precio_sugerido ps ON ps.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    LEFT join porcentajes AS po ON ps.porcentajes_id_porcentajes=po.id_porcentajes
                    LEFT JOIN (
                        SELECT id_stock, estado, productos_almacen_id_productos_almacen, cantidad, ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                        FROM
                            stock
                        WHERE
                            estado = '1' 
                    ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1 
                    WHERE p.idempresa = ? 
                    AND s.cantidad <> 0
                    AND a.codigo = ?";


            // Preparar consulta
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("ii", $id_empresa, $codigo);
            $stmt->execute();
            $result = $stmt->get_result();

            $productos = [];
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
            array_push($productos);
            $stmt->close();
            // Retornar en formato JSON encontrada
            echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
        
    }
    


    
       
}

//listaPuntoVentaFactura