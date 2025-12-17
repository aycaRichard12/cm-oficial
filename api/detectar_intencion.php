<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$projectId = 'cmdvoz-56343'; // 🔹 Tu ID de proyecto
$languageCode = 'es-ES';
$sessionId = uniqid();

// Cargar credenciales
$credentialsPath = __DIR__ . '/cmdvoz-56343-eac36fffabe3.json';
if (!file_exists($credentialsPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Archivo de credenciales no encontrado.']);
    exit;
}
$credentials = json_decode(file_get_contents($credentialsPath), true);
if (!$credentials || !isset($credentials['client_email'], $credentials['private_key'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Credenciales inválidas o corruptas.']);
    exit;
}

// Leer comando del frontend
$input_data = json_decode(file_get_contents('php://input'), true);
if (!isset($input_data['comando'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Comando de voz faltante.']);
    exit;
}
$comando = $input_data['comando'];
$sessionId = $input_data['sessionId'] ?? $sessionId;

// Crear JWT para autenticar con Google OAuth2
$now = time();
$jwtHeader = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
$jwtClaimSet = base64_encode(json_encode([
    'iss' => $credentials['client_email'],
    'scope' => 'https://www.googleapis.com/auth/dialogflow',
    'aud' => 'https://oauth2.googleapis.com/token',
    'exp' => $now + 3600,
    'iat' => $now
]));
$unsignedJwt = $jwtHeader . '.' . $jwtClaimSet;
$signature = '';
openssl_sign($unsignedJwt, $signature, $credentials['private_key'], 'sha256');
$jwt = $unsignedJwt . '.' . base64_encode($signature);

// Obtener token de acceso
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion' => $jwt
]));
$response = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!isset($response['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo autenticar con Google.', 'detalles' => $response]);
    exit;
}

$accessToken = $response['access_token'];

// Enviar el comando a Dialogflow REST API
$url = "https://dialogflow.googleapis.com/v2/projects/$projectId/agent/sessions/$sessionId:detectIntent";

$payload = json_encode([
    'queryInput' => [
        'text' => [
            'text' => $comando,
            'languageCode' => $languageCode
        ]
    ]
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $accessToken,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
$apiResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

// Procesar la respuesta de Dialogflow
if (isset($apiResponse['queryResult'])) {
    echo json_encode([
        'intencion' => $apiResponse['queryResult']['intent']['displayName'] ?? 'none',
        'parametros' => $apiResponse['queryResult']['parameters'] ?? [],
        'respuestaPorVoz' => $apiResponse['queryResult']['fulfillmentText'] ?? '',
        'comandoOriginal' => $apiResponse['queryResult']['queryText'] ?? ''
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo obtener respuesta de Dialogflow',
        'detalles' => $apiResponse
    ]);
}
?>
