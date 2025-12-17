<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class WebFactura
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
    public function verificarFactura($id_empresa)
    {
        

        if ($id_empresa === null) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'ID de empresa no válido']);
            return;
        }

        $sql = "SELECT * FROM factura ft
                INNER JOIN facturatoken ftk ON ftk.idfactura = ft.idfactura
                WHERE  ft.idempresa = ? AND ftk.tipo = 2";
        $stmt = $this->ad->prepare($sql);
        $stmt->bind_param("i", $id_empresa);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    }

    public function autenticarPeticion($idempresa)
    {

        // 1. Obtener el encabezado Authorization
        $headers = apache_request_headers();

        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['estado' => 'error', 'mensaje' => 'Token no enviado']);
            exit;
        }

        // 2. Extraer el token (Formato: "Bearer <token>")
        $authHeader = $headers['Authorization'];
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['estado' => 'error', 'mensaje' => 'Formato de token inválido']);
            exit;
        }

        $jwt = $matches[1]; // Aquí está el token puro

        // 3. Validar el token con la clave secreta
        try {
            $secret_key = 'mistersofts2025cm';
            $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));

            // 4. Verificar también en la BD si el hash existe y está activo
            $token_hash = hash('sha256', $jwt);
            $sql = "SELECT * FROM auth_tokens WHERE token_hash = ? AND activo = 1 AND expira_en > NOW() AND id_empresa = ?";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("si", $token_hash, $idempresa);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(401);
                echo json_encode(['estado' => 'error', 'mensaje' => 'Token inválido o expirado']);
                exit;
            }

            // 5. Retornar los datos decodificados (payload del token)
            return $decoded;

        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['estado' => 'error', 'mensaje' => 'Token inválido', 'detalle' => $e->getMessage()]);
            exit;
        }
    }

    public function getProductosWeb($idmd5, $codigo )
    {
        $id_empresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if ($id_empresa === null) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'ID de empresa no válido']);
            return;
        }
        $verificacion = $this->autenticarPeticion($id_empresa);

        if ($verificacion === null) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'Token no válido o expirado']);
            return;
        }
        $factura = $this->verificarFactura($id_empresa);
        
        if($factura){
            $sql = "SELECT 
                    pa.id_productos_almacen AS id,
                    p.nombre AS nombre_producto,
                    p.descripcion AS descripcion_producto,
                    p.codigosin AS codigo_sin,
                    p.actividadsin AS actividad_sin,
                    p.unidadsin AS unidad_sin,
                    p.codigonandina AS codigo_nandina,
                    p.imagen AS url_imagen,
                    s.cantidad AS stock_actual,
                    p.cod_barras AS codigo_barras,
                    COALESCE(ca.nombre, sca_padre.nombre) AS categoria,
                    COALESCE(sca.nombre, '') AS subcategoria,
                    me.nombre_medida AS origen_producto,
                    ep.tipos_estado AS estado_producto,
                    un.nombre AS unidad_medida,
                    p.caracteristicas AS caracteristicas_extra
                FROM productos p
                LEFT JOIN productos_almacen pa ON pa.productos_id_productos = p.id_productos
                LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
                LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
                LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
                LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
                LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
                LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
                LEFT JOIN stock s ON s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                WHERE p.codigosin IS NOT NULL 
                AND p.codigosin <> 0 
                AND p.codigosin <> '' 
                AND p.idempresa = ? 
                AND s.estado = 1 
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
            array_push($productos,$verificacion);
            $stmt->close();
            // Retornar en formato JSON
            echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }else{
            $sql = "SELECT 
                    pa.id_productos_almacen AS id,
                    p.nombre AS nombre_producto,
                    p.descripcion AS descripcion_producto,
                    p.codigosin AS codigo_sin,
                    p.actividadsin AS actividad_sin,
                    p.unidadsin AS unidad_sin,
                    p.codigonandina AS codigo_nandina,
                    p.imagen AS url_imagen,
                    s.cantidad AS stock_actual,
                    p.cod_barras AS codigo_barras,
                    COALESCE(ca.nombre, sca_padre.nombre) AS categoria,
                    COALESCE(sca.nombre, '') AS subcategoria,
                    me.nombre_medida AS origen_producto,
                    ep.tipos_estado AS estado_producto,
                    un.nombre AS unidad_medida,
                    p.caracteristicas AS caracteristicas_extra
                FROM productos p
                LEFT JOIN productos_almacen pa ON pa.productos_id_productos = p.id_productos
                LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
                LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
                LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
                LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
                LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
                LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
                LEFT JOIN stock s ON s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                WHERE p.idempresa = ? 
                AND s.estado = 1 
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
            array_push($productos,$verificacion);
            $stmt->close();
            // Retornar en formato JSON
            echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
        
    }
    public function getProductosWebById($idmd5, $idproducto){

    }


    public function generarTokenJWT( $idmd5,  $tiempoExpiracionSegundos, $tipo)
    {
        $id_empresa = $this->verificar->verificarIDUSERMD5($idmd5);

        if ($id_empresa === null) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'ID de empresa no válido']);
            return;
        }
        // Clave secreta para firmar el token.
        // **IMPORTANTE**: Guarda esta clave en un lugar seguro y no la expongas públicamente.
        // Puedes usar una variable de entorno, por ejemplo.
        if ($tipo == 0) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'Tipo de token no válido']); ;
            return;
        }
        if ($tipo == 1) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'Tipo de token no válido']); ;
            return;
        }

        $secret_key = 'mistersofts2025cm';

        // 1. Definir el payload del token
        $payload = [
            'iss' => 'mistersofts.com', // Emisor (issuer)
            'aud' => 'modulocm', // Audiencia
            'iat' => time(), // Hora en que el token fue emitido
            'exp' => time() + $tiempoExpiracionSegundos, // Hora de expiración
            'data' => [
                'id_empresa' => $id_empresa
            ]
        ];

        // 2. Generar el token JWT
        $token = JWT::encode($payload, $secret_key, 'HS256');

        // 3. Calcular un hash SHA256 del token para guardar en la base de datos
        $token_hash = hash('sha256', $token);

        // 4. Calcular la fecha de expiración para la base de datos
        $expira_en = date('Y-m-d H:i:s', time() + $tiempoExpiracionSegundos);

        // 5. Insertar el hash y los datos en la tabla `auth_tokens`
        // Supongamos que $this->cm es un objeto de conexión a la base de datos
        try {
            $sql = "INSERT INTO auth_tokens (id_empresa, token_hash, creado_en, expira_en, activo) 
                    VALUES (?, ?, NOW(), ?, 2)";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("iss", $id_empresa, $token_hash, $expira_en);
            $stmt->execute();
            $stmt->close();

            // 6. Retornar el token generado
            echo json_encode(['estado' => 'success', 'token' => $token]);
        } catch (\Exception $e) {
            // Manejo de errores en caso de fallo en la base de datos
            // Puedes registrar el error, lanzar una excepción, etc.
             echo json_encode(["estado" => "error","mensaje"=>"Error al insertar token en la base de datos: " . $e->getMessage()]);
        }

   
       
    }
       
}

//listaPuntoVentaFactura