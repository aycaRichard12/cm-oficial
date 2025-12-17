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
class UseCategoriaPrecio
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


    /**
     * Crea una nueva categoría de precio.
     *
     * @param array $data Contiene: nombre_categoria, porcentaje, estado, idempresa.
     * @return true|string Retorna true si la inserción fue exitosa, o un mensaje de error.
     */
    public function crearCategoriaPrecio($data) {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($data['idempresa']);
        $sql = "INSERT INTO categoria_precios (
            nombre_categoria,
            estado,
            porcentaje,
            idempresa
        ) VALUES (?, ?, ?, ?)";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return [
                'status' => 'error', 
                'message' => "Error al preparar la consulta de creación: " . $this->cm->error
            ];
        }

        $stmt->bind_param(
            "sidi",
            $data['nombre_categoria'],
            $data['estado'],
            $data['porcentaje'],
            $idempresa
        );

        if (!$stmt->execute()) {
            return [
                'status' => 'error', 
                'message' => "Error al ejecutar la consulta de creación: " . $stmt->error
            ];
        }

        if ($stmt->affected_rows === 0) {
            return [
                'status' => 'error', 
                'message' => "La categoría de precio no pudo ser insertada."
            ];
        }
        
        // CAPTURAR EL ID INSERTADO
        $id_insertado = $this->cm->insert_id;

        $stmt->close();
        return [
            'status' => 'success', 
            'message' => "Categoría de precio creada exitosamente.",
            'data' => ['id_categoria_precios' => $id_insertado] // Retorna el ID
        ];
    }
    /**
     * Edita el nombre y el porcentaje de una categoría de precio existente.
     *
     * @param int $id El ID de la categoría a editar (id_categoria_precios).
     * @param array $data Contiene: nombre_categoria, porcentaje.
     * @return true|string Retorna true si la edición fue exitosa, o un mensaje de error.
     */
    public function editarCategoriaPrecio($id, $data) {
        $sql = "UPDATE categoria_precios SET
            nombre_categoria = ?,
            porcentaje = ?
        WHERE id_categoria_precios = ?";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return [
                'status' => 'error', 
                'message' => "Error al preparar la consulta de edición: " . $this->cm->error
            ];
        }

        $stmt->bind_param("sdi", $data['nombre_categoria'], $data['porcentaje'], $id);

        if (!$stmt->execute()) {
            return [
                'status' => 'error', 
                'message' => "Error al ejecutar la consulta de edición: " . $stmt->error
            ];
        }
        
        // Nota: affected_rows puede ser 0 si los datos son idénticos, lo cual no es un error.
        // Solo se chequea si hubo un error en la ejecución.

        $stmt->close();
        return [
            'status' => 'success', 
            'message' => "Categoría de precio actualizada exitosamente."
        ];
    }
    /**
     * Realiza una eliminación lógica de una categoría de precio (cambiando el estado a 0).
     *
     * @param int $id El ID de la categoría a eliminar (id_categoria_precios).
     * @return true|string Retorna true si la eliminación fue exitosa, o un mensaje de error.
     */
    public function eliminarCategoriaPrecio($id) {
    
        $sql = "DELETE FROM categoria_precios WHERE id_categoria_precios = ?";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return [
                'status' => 'error', 
                'message' => "Error al preparar la consulta de eliminación: " . $this->cm->error
            ];
        }

        $stmt->bind_param("i", $id);

        if (!$stmt->execute()) {
            return [
                'status' => 'error', 
                'message' => "Error al ejecutar la consulta de eliminación: " . $stmt->error
            ];
        }

        if ($stmt->affected_rows === 0) {
            // En eliminación lógica, 0 filas afectadas indica que el ID no existe o ya tenía ese estado.
            return [
                'status' => 'error', 
                'message' => "No se encontró la categoría de precio con ID: " . $id . " o ya estaba eliminada."
            ];
        }

        $stmt->close();
        return [
            'status' => 'success', 
            'message' => "Categoría de precio eliminada lógicamente."
        ];
    }

    /**
     * API pública para listar categorías de precio.
     *
     * @param string $idmd5 El hash MD5 del ID de la empresa.
     * @return array|string Retorna un array de categorías o un mensaje de error.
     */
    public function listarCategoriasPrecio($idmd5) {
        // 1. Obtiene el ID numérico de la empresa a partir del hash MD5
        // Asumiendo que $this->verificar->verificarIDEMPRESAMD5() maneja la verificación y retorna el ID INT.
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if (!is_numeric($idempresa) || $idempresa <= 0) {
            // Manejar el caso donde el ID MD5 no es válido o no se encuentra la empresa
            return "Error de autenticación o ID de empresa inválido.";
        }

        // 2. Llama al método interno (que cumple con el estándar solicitado)
        $resultado = $this->_listar_categorias_empresa($idempresa);
        
        // El método interno ya retorna el array de categorías o un error string.
        return $resultado;
    }
    /**
     * Lista todas las categorías de precio de una empresa específica.
     *
     * @param int $idempresa El ID numérico de la empresa.
     * @return array|string Retorna un array de filas (MYSQLI_ASSOC) o un mensaje de error.
     */
    private function _listar_categorias_empresa($idempresa) {
        // La consulta incluye el filtro por idempresa
        $sql = "SELECT 
            id_categoria_precios, 
            nombre_categoria, 
            estado, 
            porcentaje, 
            idempresa
        FROM categoria_precios 
        WHERE idempresa = ?"; 

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return "Error al preparar la consulta de listado por empresa: " . $this->cm->error;
        }

        // Tipos: i (integer)
        $stmt->bind_param("i", $idempresa);

        if (!$stmt->execute()) {
            return "Error al ejecutar la consulta de listado por empresa: " . $stmt->error;
        }

        $result = $stmt->get_result();
        
        // Devuelve un array asociativo de todas las filas. Si no hay resultados, devuelve un array vacío.
        $categorias = $result->fetch_all(MYSQLI_ASSOC); 

        $stmt->close();
        return $categorias;
    }

    /**
     * Obtiene una categoría de precio específica por su ID.
     *
     * @param int $id El ID de la categoría a obtener (id_categoria_precios).
     * @return array|string Retorna un array asociativo con la categoría, o un mensaje de error.
     */
    public function obtenerCategoriaPrecio($id) {
        $sql = "SELECT 
            id_categoria_precios, 
            nombre_categoria, 
            estado, 
            porcentaje, 
            idempresa
        FROM categoria_precios
        WHERE id_categoria_precios = ?";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return "Error al preparar la consulta de obtención: " . $this->cm->error;
        }

        // Tipos: i (integer)
        $stmt->bind_param("i", $id);

        if (!$stmt->execute()) {
            return "Error al ejecutar la consulta de obtención: " . $stmt->error;
        }

        $result = $stmt->get_result();
        $categoria = $result->fetch_assoc(); // Obtiene solo la primera fila como array asociativo

        $stmt->close();

        if ($categoria) {
            return $categoria;
        } else {
            return "Categoría de precio con ID $id no encontrada.";
        }
    }

    /**
     * Cambia el estado de una categoría de precio.
     *
     * @param int $id El ID de la categoría a modificar (id_categoria_precios).
     * @param int $nuevo_estado El nuevo estado (1: Activo, 2: Inactivo, o cualquier otro valor definido).
     * @return true|string Retorna true si el cambio fue exitoso, o un mensaje de error.
     */
    public function cambiarEstadoCategoria($id, $nuevo_estado) {
        // Validar que el estado sea 1 o 2 (o cualquier lógica de tu negocio)
        if (!in_array($nuevo_estado, [1, 2])) {
            return [
                'status' => 'error', 
                'message' => "Estado no válido. Debe ser 1 (Activo) o 2 (Inactivo)."
            ];
        }

        $sql = "UPDATE categoria_precios SET estado = ? WHERE id_categoria_precios = ?";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            return [
                'status' => 'error', 
                'message' => "Error al preparar la consulta de cambio de estado: " . $this->cm->error
            ];
        }

        $stmt->bind_param("ii", $nuevo_estado, $id);

        if (!$stmt->execute()) {
            return [
                'status' => 'error', 
                'message' => "Error al ejecutar la consulta de cambio de estado: " . $stmt->error
            ];
        }

        if ($stmt->affected_rows === 0) {
            // Asumiendo que puede ser 0 si el estado ya era el mismo, no lo consideramos un error fatal,
            // pero sí si el ID no existe. Necesitarías una verificación adicional si quieres distinguir.
            return [
                'status' => 'success', 
                'message' => "El estado de la categoría ya estaba establecido o el ID no causó cambios."
            ];
        }

        $stmt->close();
        return [
            'status' => 'success', 
            'message' => "Estado de la categoría modificado exitosamente."
        ];
    }
}