<?php
require_once __DIR__ . "/../db/conexion.php";
require_once __DIR__ . "/../funcionesGenerales.php";
class Atributo_conf extends FuncionesGenerales{

    private Conexion $conexion;

    public function __construct() {
        $this->conexion = Conexion::getInstance();
    }

    // Permite seguir usando $this->dbp, $this->dbe, etc.
    public function __get(string $name) {
        return $this->conexion->$name;
    }
    


    function sincronizar_con_comercial($empresa) {
        $idempresa = $this->getidempresa($empresa);
        $sql = "SELECT id_productos, nombre, codigo, descripcion, cod_barras, fecha_registro, imagen, categorias_id_categorias, medida_id_medida, estados_productos_id_estados_productos, unidad_id_unidad, idempresa FROM productos WHERE idempresa = ?";
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare($sql);
        if (!$stmt) {
            echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta en comercial", "function" => "sincronizar_con_comercial"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $check_sql = "SELECT idproducto FROM producto WHERE idproduct_comercial = ?";
                $stmt_check = $this->dbp->prepare($check_sql);
        
                if (!$stmt_check) {
                    echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta SELECT", "function" => "sincronizar_con_comercial"));
                    return;
                }
        
                $stmt_check->bind_param("i", $row['id_productos']);
                $stmt_check->execute();
                $check_result = $stmt_check->get_result();
                $stmt_check->close(); 
        
                if ($check_result && $check_result->num_rows == 0) { 
                    $insert_sql = "INSERT INTO producto (idproduct_comercial, estado, cantidad, tiempo_produccion, rubro_idrubro, Unidad_tiempo_idUnidad_tiempo) VALUES (?, ?, ?, ?, ?, ?)";
                    $stmt_insert = $this->dbp->prepare($insert_sql);
                    if (!$stmt_insert) {
                        echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta INSERT", "function" => "sincronizar_con_comercial"));
                        return;
                    }
    
                    // Variables para el bind_param
                    $estado = 0; 
                    $cantidad = 0;
                    $tiempo = 0;
                    $idunidadtiempo = 1;
    
                    // Obtener rubro_idrubro
                    $stmtRubro = $this->dbp->prepare("SELECT idrubro FROM rubro WHERE empresa_idempresa = ? LIMIT 1");
                    $stmtRubro->bind_param("i", $idempresa);
                    $stmtRubro->execute();
                    $resRubro = $stmtRubro->get_result();
                    $resultado = $resRubro->fetch_assoc();
                    $rubro_idrubro = $resultado['idrubro'] ?? null;
                    $stmtRubro->close();
    
                    // Enlazar y ejecutar la inserción
                    $stmt_insert->bind_param("iiidii", $row['id_productos'], $estado, $cantidad, $tiempo, $rubro_idrubro, $idunidadtiempo);
                    $stmt_insert->execute();
                    $stmt_insert->close(); 
                }
            }
            return;
        } else {
            $res = array("status" => "error", "message" => "No se encontraron productos en la base de datos comercial", "function" => "sincronizar_con_comercial");
        }
        
        $stmt->close(); // Cerrar stmt después de usarlo
        echo json_encode($res);
    }


    
    function listar_productos_variantes_empresa($empresa) {
        $this->sincronizar_con_comercial($empresa);
        $idempresa = $this->getidempresa($empresa);

        // 1. Productos comerciales
        $query1 = "SELECT 
                        p.id_productos,
                        p.nombre,
                        p.codigo,
                        p.descripcion,
                        p.cod_barras,
                        p.fecha_registro,
                        p.imagen,
                        p.caracteristicas,
                        p.idempresa,
                        p.codigosin,
                        p.actividadsin,
                        p.unidadsin,
                        p.codigonandina,
                        p.categorias_id_categorias,
                        p.medida_id_medida,
                        p.estados_productos_id_estados_productos,
                        p.unidad_id_unidad,
                        c.nombre AS categoria_nombre,
                        c.descripcion AS categoria_descripcion,
                        m.nombre_medida AS medida_nombre,
                        m.descripcion AS medida_descripcion,
                        e.tipos_estado AS estado_tipo,
                        e.descripcion AS estado_descripcion,
                        u.nombre AS unidad_nombre,
                        u.descripcion AS unidad_descripcion
                    FROM productos p
                    INNER JOIN categorias c 
                        ON p.categorias_id_categorias = c.id_categorias
                    INNER JOIN medida m 
                        ON p.medida_id_medida = m.id_medida
                    INNER JOIN estados_productos e 
                        ON p.estados_productos_id_estados_productos = e.id_estados_productos
                    INNER JOIN unidad u 
                        ON p.unidad_id_unidad = u.id_unidad
                    WHERE idempresa = ?";
        $stmt1 = $this->dbcm->prepare($query1);
        $stmt1->bind_param("s", $idempresa);
        $stmt1->execute();
        $result1 = $stmt1->get_result();

        $productos_comercial = [];
        $ids = [];
        while ($row = $result1->fetch_assoc()) {
            $ids[] = (int)$row['id_productos'];
            $productos_comercial[$row['id_productos']] = $row;
        }
        $stmt1->close();

        if (empty($ids)) {
            return [];  // o enviar respuesta vacía
        }

        // 2. Variantes de TODOS los productos en un solo viaje
        $ids_placeholder = implode(',', array_fill(0, count($ids), '?'));
        $query2 = "SELECT 
                        p.idproduct_comercial,
                        JSON_OBJECT(
                            'estado', p.estado,
                            'cantidad', p.cantidad,
                            'tiempo_produccion', p.tiempo_produccion,
                            'rubro_idrubro', p.rubro_idrubro,
                            'Unidad_tiempo_idUnidad_tiempo', p.Unidad_tiempo_idUnidad_tiempo,
                            'subproducto', p.subproducto,
                            'Productos_variantes', COALESCE(
                                (SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_Producto_Variante', pv.id_Producto_Variante,
                                        'sku', pv.sku,
                                        'precio_base', pv.precio_base,
                                        'codigo_barras', pv.codigo_barras,
                                        'activo', pv.activo,
                                        'atributos', COALESCE(
                                            (SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'id_Valor_Atributo', vv.id_Valor_Atributo,
                                                    'valor', va.valor,
                                                    'atributo', ap.nombre
                                                )
                                            )
                                            FROM Variante_Valor vv
                                            JOIN Valor_Atributo va ON vv.id_Valor_Atributo = va.id_Valor_Atributo
                                            JOIN Atributo_producto ap ON va.id_Atributo_producto = ap.id_Atributo_producto
                                            WHERE vv.id_Producto_Variante = pv.id_Producto_Variante
                                            ),
                                            JSON_ARRAY()
                                        )
                                    )
                                )
                                FROM Producto_Variante pv
                                WHERE pv.idproducto = p.idproduct_comercial AND pv.activo = 1
                                ),
                                JSON_ARRAY()
                            )
                        ) AS variantes_json
                    FROM producto p
                    WHERE p.idproduct_comercial IN ($ids_placeholder)";

        $stmt2 = $this->dbp->prepare($query2);
        // bind dinámico: ...? con tipos "i"...
        $types = str_repeat('i', count($ids));
        $stmt2->bind_param($types, ...$ids);
        $stmt2->execute();
        $result2 = $stmt2->get_result();

        $variantes_por_producto = [];
        while ($row2 = $result2->fetch_assoc()) {
            $id = $row2['idproduct_comercial'];
            $variantes_por_producto[$id] = json_decode($row2['variantes_json'], true);
        }
        $stmt2->close();

        // 3. Combinar datos
        $salida = [];
        foreach ($productos_comercial as $id => $prod_com) {
            $prod_completo = $prod_com;
            if (isset($variantes_por_producto[$id])) {
                $prod_completo = array_merge($prod_com, $variantes_por_producto[$id]);
            } else {
                // Si no hay variantes, añadir campos vacíos o por defecto
                $prod_completo['estado'] = null;
                $prod_completo['Productos_variantes'] = [];
                // ... (completar según estructura)
            }
            $salida[] = $prod_completo;
        }

        return $salida;  // El controlador hará json_encode
    }

    public function listar_productos_variantes($idproducto) {
        $lista = [];
        $stmt = $this->dbp->prepare("SELECT 
                pv.id_Producto_Variante,
                pv.sku,
                pv.precio_base,
                pv.codigo_barras,
                pv.activo,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id_Valor_Atributo', vv.id_Valor_Atributo,
                            'valor', va.valor,
                            'atributo', ap.nombre
                        )
                    )
                    FROM Variante_Valor vv
                    JOIN Valor_Atributo va ON vv.id_Valor_Atributo = va.id_Valor_Atributo
                    JOIN Atributo_producto ap ON va.id_Atributo_producto = ap.id_Atributo_producto
                    WHERE vv.id_Producto_Variante = pv.id_Producto_Variante
                ) AS valores 
            FROM Producto_Variante pv
            WHERE pv.idproducto = ?
            ORDER BY pv.id_Producto_Variante DESC
        ");
        $stmt->bind_param("i", $idproducto);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            // Decodificar el JSON de valores para enviarlo como array
            $row['valores'] = json_decode($row['valores'] ?? '[]', true);
            $lista[] = $row;
        }
        $stmt->close();
        echo json_encode($lista);
    }
   
   
}
?>