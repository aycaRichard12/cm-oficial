<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class ApiTokens
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
    private $endpoint;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        $this->ad = $this->conexion->ad;
        $this->em = $this->conexion->em;
        $this->endpoint = $this->conexion->endPoint;
        $this->logger = new LogErrores();
    }

    public function obtenerverifcatoken($token) 
    {
        try {
            echo $token;
            // === Validar parámetro ===
            if ($token === null || trim($token) === '') {
                http_response_code(400); // Bad Request obtenerTokenEmizor
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 400,
                    'mensaje' => 'Token no válido'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // === Query para verificar token ===
            $sql = "SELECT *
                    FROM facturatoken ftk 
                    WHERE ftk.access_token = ?";

            if (!$stmt = $this->ad->prepare($sql)) {
                http_response_code(500);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 500,
                    'mensaje' => 'Error al preparar la consulta: ' . $this->ad->error
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Cambié a "s" porque es un string
            $stmt->bind_param("s", $token);

            if (!$stmt->execute()) {
                http_response_code(500);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 500,
                    'mensaje' => 'Error al ejecutar la consulta: ' . $stmt->error
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // === Obtener lista de resultados ===
            $result = $stmt->get_result();
            $tokens = [];
            while ($row = $result->fetch_assoc()) {
                $tokens[] = $row;
            }
           
            if (count($tokens) > 0) {
                http_response_code(200);
                echo json_encode([
                    'estado' => 'ok',
                    'codigo' => 200,
                    'tokens' => $tokens
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 404,
                    'mensaje' => 'Token no encontrado o inválido'
                ], JSON_UNESCAPED_UNICODE);
            }

            $stmt->close();

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'estado' => 'error',
                'codigo' => 500,
                'mensaje' => 'Error interno del servidor',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function obtenerTokenEmizor_($id_empresa) 
    {
        try {
            // === Validar parámetro ===
            if ($id_empresa === null) {
                http_response_code(400); // Bad Request encontrada
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 400,
                    'mensaje' => 'ID de empresa no válido'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
                $sql = "SELECT * 
                    FROM facturatoken ftk";
            // === Query (sin LIMIT, siempre lista) ===
            // $sql = "SELECT * 
            //         FROM factura ft
            //         INNER JOIN facturatoken ftk ON ftk.idfactura = ft.idfactura
            //         WHERE ft.idempresa = ?
            //         ORDER BY ftk.idfacturatoken DESC";

                // $sql = "SELECT * 
                //      FROM factura ft";
            if (!$stmt = $this->ad->prepare($sql)) {
                http_response_code(500);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 500,
                    'mensaje' => 'Error al preparar la consulta: ' . $this->ad->error
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

           // $stmt->bind_param("i", $id_empresa);

            if (!$stmt->execute()) {
                http_response_code(500);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 500,
                    'mensaje' => 'Error al ejecutar la consulta: ' . $stmt->error
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // === Obtener lista de resultados ===
            $result = $stmt->get_result();
            $tokens = [];
            while ($row = $result->fetch_assoc()) {
                $tokens[] = $row;
            }

            if (count($tokens) > 0) {
                http_response_code(200);
                echo json_encode([
                    'estado' => 'ok',
                    'codigo' => 200,
                    'tokens' => $tokens
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode([
                    'estado' => 'error',
                    'codigo' => 404,
                    'mensaje' => 'No se encontraron tokens para la empresa ' . $id_empresa
                ], JSON_UNESCAPED_UNICODE);
            }

            $stmt->close();

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'estado' => 'error',
                'codigo' => 500,
                'mensaje' => 'Error interno del servidor',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function obtenerTokenEmizor($md5)
    {
        try {
            // === Validar parámetro ===
            $url = $this->endpoint[3] . "/administrador/api/tokenvalido/" . $md5;

            // Inicializar cURL 
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10); // máximo 10 segundos
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

            // Ejecutar petición
            $response = curl_exec($ch);

            // Verificar errores de cURL
            if ($response === false) {
                $error = curl_error($ch);
                curl_close($ch);
                echo json_encode(["error" => "Error en cURL", "detalle" => $error]);
                return null;
            }

            // Obtener código de respuesta HTTP
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            // Si no es 200, mostrar error
            if ($httpCode !== 200) {
                echo json_encode(["error" => "HTTP Code $httpCode", "response" => $response]);
                return null;
            }

            // Decodificar JSON
            $data = json_decode($response, true);

            // Verificar si JSON fue válido
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    "error" => "JSON inválido",
                    "detalle" => json_last_error_msg(),
                    "response" => $response
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                return null;
            }
            // Retornar token valido  
            $ultimo = end($data);
            return $ultimo['access_token'];
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'estado' => 'error',
                'codigo' => 500,
                'mensaje' => 'Error interno del servidor',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            return null;
        }
        // return "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAyMzIiLCJqdGkiOiJhNjM0NjIyMDdhOThkMDVjZDkzNWJkNDdiYjgwMzQ5MTgyZTIwODRmNWEyOTUxMGJiZGI5MTVhOTEyYTk3ZDM4ODg4MTRhY2ZlODE0MzgyMSIsImlhdCI6MTc1OTE1MzkzMywibmJmIjoxNzU5MTUzOTMzLCJleHAiOjE3OTA2ODk5MzMsInN1YiI6IiIsInNjb3BlcyI6W119.SBaYAQX50-0wa1UmHSCXabfoav9tBLLB_In9yt4IeJ7_hvopXc40E5Zh8UrHxzHPdgiQxODGSAg7WxVbFKqUc4IQzg1zhGsDDhmimJqJYPuwF-Y9mNMQHY3UM3QXSl5T0822Rf41YKBiDi3wku0BMoErIyupICG7ZiCnRqwlEs_hN-KZA23v0WT1eDstcivut6ahpKu3__XpDyf4taKIQEzYQTqOMbqN7FoupQTCTUn293U6a6UPG1ZG75-qnTsVr9poJuUii9395YWA9fhoqF09LLDZP2Qj_bsF2Oxv0PE_rlIJjUyo3NnrY_stgpbnvpASgFL_qQnQVWCHS80uEH4CsDnoB0p7yR0XrlQrGKVlCZtn-VUWH92E3PGDMCgaXMcJMZvjNdnlKOcKAGnrykpsFMQEl1057D_h29L2qep7X-A8xaHXurZAtXbkqKArFv75k4ID_YM4AN_QEeTi4FovijDYOEM4g4NJHyPi9QESD1y6Vp1yh7crFT9hPxVtBoPP3o4l0UkAGvrZRb5It2cu5dXpupvXQ0Y7HkWSZX-dcT_b9hLn7H0mTQZ5A2Cl8kIWTxX5v0-yENXfPvOfWeIdVG1YyQN_fwqMvfHOBGC5s4eMqSRWROcDhNkMVz0ET0TkoiO7X6gdW_DH2mWzQWDmHCRu6dC-_ew6cwNv7MQ";
    }

    public function verificarFactura($id_empresa) {
        $url = "http://mistersofts.com/administrador/api/verificarfacturatoken/{$id_empresa}";

        // Inicializar cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // máximo 10 segundos
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        // Ejecutar petición
        $response = curl_exec($ch);

        // Verificar errores de cURL
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            echo json_encode(["error" => "Error en cURL", "detalle" => $error]);
            return null;
        }

        // Obtener código de respuesta HTTP
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Si no es 200, mostrar error
        if ($httpCode !== 200) {
            echo json_encode(["error" => "HTTP Code $httpCode", "response" => $response]);
            return null;
        }

        // Decodificar JSON
        $data = json_decode($response, true);

        // Verificar si JSON fue válido
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                "error" => "JSON inválido",
                "detalle" => json_last_error_msg(),
                "response" => $response
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return null;
        }

        // Retornar los datos
        return $data;
    }

    public function autenticarPeticion()
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
            $stmt->bind_param("si", $token_hash, $decoded->data->id_empresa);
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
public function autenticarPeticionPrueba()
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
            $stmt->bind_param("si", $token_hash, $decoded->data->id_empresa);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(401);
                echo json_encode(['estado' => 'error', 'mensaje' => 'Token inválido o expirado']);
                exit;
            }

            // 5. Retornar los datos decodificados (payload del token)
            echo json_encode(["array" => $decoded]);

        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['estado' => 'error', 'mensaje' => 'Token inválido', 'detalle' => $e->getMessage()]);
            exit;
        }
    }
    function sendResponse($statusCode, $message, $data = null) {
        http_response_code($statusCode);
        $response = [
            'status' => $statusCode,
            'message' => $message
        ];
        if ($data !== null) {
            $response['data'] = $data;
        }
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function generartokenSinFactura($idmd5){

    }


    public function generarTokenJWT($idmd5,$fecha_final)
    {
         $datosEmpresa = $this->verificarFactura($idmd5);
        

         $factura = 0;
         $tiempoExpiracionSegundos = 0; 
         $id_empresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
         
        if ($datosEmpresa === null) {
            $this->sendResponse(404, "Not Found", ["error" => "No se encontró el parámetro con los valores proporcionados"]);
            return;
        }

        if (empty($datosEmpresa)) {
            $fechaObjetivo = strtotime($fecha_final); // convierte a timestamp
            $ahora = time(); // timestamp actual

            if ($fechaObjetivo > $ahora) {
                $tiempoExpiracionSegundos = $fechaObjetivo - $ahora;   
            } 

        }else{
            // Acceder al primer elemento del array
            if (isset($datosEmpresa[0]['tipo'])) {
                $factura = $datosEmpresa[0]['tipo'];
                $tiempoExpiracionSegundos = $datosEmpresa[0]['expires_in'];  
                $id_empresa = $datosEmpresa[0]['idempresa'];
            } else {
                $this->sendResponse(404, "Not Found", ["error" => "No se encontró el parámetro  con los valores proporcionados"]);
                return;
            }
        }
        

        if ($id_empresa === null) {
            echo json_encode(['estado' => 'error', 'mensaje' => 'ID de empresa no válido']);
            return;
        }
        // Clave secreta para firmar el token.
        // **IMPORTANTE**: Guarda esta clave en un lugar seguro y no la expongas públicamente.
        // Puedes usar una variable de entorno, por ejemplo.
       
        
        $secret_key = 'mistersofts2025cm';

        // 1. Definir el payload del token
        $payload = [
            'iss' => 'mistersofts.com', // Emisor (issuer)
            'aud' => 'modulocm', // Audiencia
            'iat' => time(), // Hora en que el token fue emitido
            'exp' => time() + $tiempoExpiracionSegundos, // Hora de expiración
            'data' => [
                'md5' =>$idmd5,
                'id_empresa' => $id_empresa,
                'tipo' => $factura,
                'fecha_final' => $fecha_final
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
            
             $this->sendResponse(500, "Internal Server Error", ["error" => "Error al insertar token en la base de datos: ". $e->getMessage()]);
        }

   
       
    }
       
}

//encontrada