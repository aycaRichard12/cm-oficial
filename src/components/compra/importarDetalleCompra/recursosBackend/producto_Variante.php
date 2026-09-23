<?php
require_once __DIR__ . '/vendor/autoload.php';

require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";

use BcMath\Number;




/**
 * Clase para gestionar las operaciones de ventas, facturación y stock. idproductoalmacen id datosAdicionales
 */
class ProductoVariante
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $prod;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;

    
    /**
     * Constructor de la clase Ventas.
     */
    public function __construct()
    {
        $this->conexion = Conexion::getInstance();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();

        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        $this->prod = $this->conexion->prod;

    }

    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);


    /**
     * Lee un archivo CSV y devuelve un array similar a toArray() de PhpSpreadsheet.
     * Cada fila será un array asociativo con claves 'A', 'B', 'C', ... (letras de columna).
     */
    private function leerCSV($rutaArchivo) {
        $filas = [];
        $manejador = fopen($rutaArchivo, 'r');

        if (!$manejador) {
            throw new Exception('No se pudo abrir el archivo CSV');
        }

        // Leer la primera línea para detectar el delimitador
        $primeraLinea = fgets($manejador);
        if ($primeraLinea === false) {
            fclose($manejador);
            return $filas;
        }

        // Contar ocurrencias de coma y punto y coma
        $numComas = substr_count($primeraLinea, ',');
        $numPuntoComa = substr_count($primeraLinea, ';');

        // Elegir el que tenga más ocurrencias
        $delimitador = ($numPuntoComa > $numComas) ? ';' : ',';

        // Rebobinar para leer desde el principio
        rewind($manejador);

        $primeraFila = true;

        while (($fila = fgetcsv($manejador, 0, $delimitador, '"', '\\')) !== false) {
            if ($primeraFila && isset($fila[0])) {
                // Eliminar BOM (Byte Order Mark) si existe
                $fila[0] = preg_replace('/^\xEF\xBB\xBF/', '', $fila[0]);
                $primeraFila = false;
            }

            // Limpiar cada celda: quitar espacios y filtrar vacías (opcional)
            $filaLimpia = [];
            foreach ($fila as $valor) {
                $valorLimpio = trim($valor);
                // Puedes omitir celdas vacías, pero es mejor conservarlas para no alterar índices
                $filaLimpia[] = $valorLimpio;
            }

            $filas[] = $filaLimpia;
        }

        fclose($manejador);
        return $filas;
    }

    /**
     * Convierte un índice numérico (0,1,2,...) en letra de columna Excel (A,B,C,...).
     */
    private function obtenerLetraColumna($indice) {
        $letra = '';
        $indice++; // Excel empieza en 1 para A
        while ($indice > 0) {
            $modulo = ($indice - 1) % 26;
            $letra = chr(65 + $modulo) . $letra;
            $indice = intval(($indice - $modulo) / 26);
        }
        return $letra;
    }
    
    private function procesarFilasExcel($encabezados, $filas) {
        // Mapear índices de columnas
        $mapa = [];
        foreach ($encabezados as $indice => $nombre) {
            $mapa[strtolower(trim((string)$nombre))] = $indice;
        }

        // Validar columnas obligatorias
        $requeridos = [
            'idproducto',
            'productos_almacen_id_productos_almacen',
            'costo_unitario',
            'cantidad',
            'sku'
        ];

        foreach ($requeridos as $req) {
            if (!isset($mapa[$req])) {
                throw new Exception("Falta la columna requerida: $req");
            }
        }

        $items = [];

        foreach ($filas as $fila) {
            $item = [
                'idproducto' => $fila[$mapa['idproducto']] ?? null,
                'productos_almacen_id_productos_almacen' => $fila[$mapa['productos_almacen_id_productos_almacen']] ?? null,
                'id_Producto_Variante' => 0,
                'costo_unitario' => $fila[$mapa['costo_unitario']] ?? null,
                'cantidad' => $fila[$mapa['cantidad']] ?? null,
                'sku' => $fila[$mapa['sku']] ?? null,
                'atributos' => []
            ];

            // Procesar atributos dinámicos
            $atributos = [];
            foreach ($mapa as $nombre => $indice) {
                if (preg_match('/^atributo_(\d+)$/', $nombre, $m)) {
                    $num = $m[1];
                    $nombreAtributo = $fila[$indice] ?? null;
                    $valorAtributo = $fila[$mapa["valor_$num"] ?? null] ?? null;

                    if (!empty($nombreAtributo) && !empty($valorAtributo)) {
                        $atributos[] = [
                            'atributo' => $nombreAtributo,
                            'valor' => $valorAtributo
                        ];
                    }
                }
            }

            $item['atributos'] = $atributos;
            $items[] = $item;
        }

        return $items;
    }

    public function exportar_detalle_compra_flat($idalmacen) {
        $idalmacen = (int)$idalmacen;
        if ($idalmacen <= 0) {
            return [
                'estado' => 'error',
                'mensaje' => 'ID de almacén inválido.',
                'data' => []
            ];
        }

        // 1. Productos activos en el almacén
        $sqlProductos = "SELECT 
                            pa.id_productos_almacen,
                            pa.productos_id_productos,
                            p.codigo,
                            p.nombre,
                            p.descripcion
                        FROM productos_almacen pa
                        INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
                        WHERE pa.almacen_id_almacen = ? AND pa.estado = '1'
                        ORDER BY p.nombre ASC";
        $stmtProd = $this->cm->prepare($sqlProductos);
        if (!$stmtProd) {
            return ['estado' => 'error', 'mensaje' => 'Error al preparar productos: ' . $this->cm->error, 'data' => []];
        }
        $stmtProd->bind_param("i", $idalmacen);
        $stmtProd->execute();
        $productos = $stmtProd->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmtProd->close();

        if (empty($productos)) {
            return ['estado' => 'exito', 'mensaje' => 'No hay productos en este almacén.', 'data' => []];
        }

        $filasExportar = [];

        foreach ($productos as $producto) {
            $idProductoComercial = (int)$producto['productos_id_productos'];
            $idProductoAlmacen = (int)$producto['id_productos_almacen'];

            // 2. Variantes activas del producto (en BD "prod")
            $sqlVariantes = "SELECT 
                                id_Producto_Variante,
                                sku
                            FROM Producto_Variante
                            WHERE idproducto = ? AND activo = 1";
            $stmtVar = $this->prod->prepare($sqlVariantes);
            if (!$stmtVar) continue;
            $stmtVar->bind_param("i", $idProductoComercial);
            $stmtVar->execute();
            $variantes = $stmtVar->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmtVar->close();

            if (empty($variantes)) continue;

            // 3. Para cada variante, obtener sus atributos y armar la fila
            foreach ($variantes as $variante) {
                $idVariante = (int)$variante['id_Producto_Variante'];

                // Consulta de atributos de esta variante
                $sqlAtributos = "SELECT 
                                    ap.nombre AS atributo,
                                    va.valor
                                FROM Variante_Valor vv
                                INNER JOIN Valor_Atributo va ON va.id_Valor_Atributo = vv.id_Valor_Atributo
                                INNER JOIN Atributo_producto ap ON ap.id_Atributo_producto = va.id_Atributo_producto
                                WHERE vv.id_Producto_Variante = ?";
                $stmtAttr = $this->prod->prepare($sqlAtributos);
                if ($stmtAttr) {
                    $stmtAttr->bind_param("i", $idVariante);
                    $stmtAttr->execute();
                    $atributos = $stmtAttr->get_result()->fetch_all(MYSQLI_ASSOC);
                    $stmtAttr->close();
                } else {
                    $atributos = [];
                }

                // Concatenar atributos en formato "Nombre: Valor, Nombre: Valor"
                $atributosString = '';
                foreach ($atributos as $attr) {
                    $atributosString .= $attr['atributo'] . ': ' . $attr['valor'] . ', ';
                }
                $atributosString = rtrim($atributosString, ', ');

                // Armar fila plana
                $filasExportar[] = [
                    'id_productos_almacen' => $idProductoAlmacen,
                    'codigo_producto'     => $producto['codigo'],
                    'nombre_producto'     => $producto['nombre'],
                    'descripcion_producto'=> $producto['descripcion'],
                    'sku_variante'        => $variante['sku'],
                    'id_variante'         => $idVariante,
                    'atributos'           => $atributosString
                ];
            }
        }

        return [
            'estado' => 'exito',
            'mensaje' => 'Datos listos para exportar.',
            'data' => $filasExportar
        ];
    }

    private function insertarDetalleCompraSinUnicos($precio, $cantidad, $idingreso, $productoalmacen, $idProductoVariante = null) {
        // 1. Obtener código del producto (para los códigos únicos posteriores)
        $stmtProd = $this->cm->prepare("SELECT p.codigo FROM productos p 
                                        JOIN productos_almacen pa ON p.id_productos = pa.productos_id_productos 
                                        WHERE pa.id_productos_almacen = ?");
        $stmtProd->bind_param("i", $productoalmacen);
        $stmtProd->execute();
        $rowProd = $stmtProd->get_result()->fetch_assoc();
        $codProducto = $rowProd['codigo'] ?? 'S-COD';

        // 2. Obtener código del ingreso y usuario
        $stmtIng = $this->cm->prepare("SELECT codigo, usuario FROM ingreso WHERE id_ingreso = ?");
        $stmtIng->bind_param("i", $idingreso);
        $stmtIng->execute();
        $rowIng = $stmtIng->get_result()->fetch_assoc();
        $codCompra = $rowIng['codigo'] ?? 'S-COMP';
        $idUsuario = $rowIng['usuario'] ?? 0;

        // 3. Insertar detalle_ingreso
        $sqlBase = "INSERT INTO detalle_ingreso (id_detalle_ingreso, precio_unitario, cantidad, ingreso_id_ingreso, productos_almacen_id_productos_almacen";
        $tipos = "ddii";
        $params = [$precio, $cantidad, $idingreso, $productoalmacen];
        if ($idProductoVariante !== null) {
            $sqlBase .= ", idProductoVariante) VALUES (NULL, ?, ?, ?, ?, ?)";
            $tipos .= "i";
            $params[] = $idProductoVariante;
        } else {
            $sqlBase .= ") VALUES (NULL, ?, ?, ?, ?)";
        }
        $stmtIns = $this->cm->prepare($sqlBase);
        $stmtIns->bind_param($tipos, ...$params);
        
        if (!$stmtIns->execute()) {
            throw new Exception("Error al insertar detalle: " . $this->cm->error);
        }
        $idDetalleInsertado = $this->cm->insert_id;
        $stmtIns->close();

        // Devolver datos necesarios para códigos únicos
        return [
            'id_detalle' => $idDetalleInsertado,
            'compra_id' => $idDetalleInsertado, // según tu ejemplo
            'productos_almacen_id' => (int)$productoalmacen,
            'cantidad' => (int)$cantidad,
            'codProducto' => $codProducto,
            'codCompra' => $codCompra,
            'idUsuario' => (int)$idUsuario
        ];
    }

    public function registroDetalleCompraDesdeExcel($TIPORESPUESTA = null) {
        // Esto se llamará desde el controlador; aquí asumimos que $_POST y $_FILES están disponibles
        // o podemos pasar los datos como parámetros.
        // Para mantener la estructura de tu API, usaremos $_POST y $_FILES directamente.
        
        header('Content-Type: application/json');
        
        try {
            // 1. Validar idingreso y registrarProUnico
            $idingreso = isset($_POST['idingreso']) ? (int)$_POST['idingreso'] : 0;
            $registrarProUnico = isset($_POST['registrarProUnico']) ? filter_var($_POST['registrarProUnico'], FILTER_VALIDATE_BOOLEAN) : false;
            
            if ($idingreso <= 0) {
                throw new Exception('ID de ingreso inválido');
            }
            
            // 2. Validar archivo
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No se recibió archivo o hubo error al subir');
            }
            
            $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            if ($extension !== 'csv') {
                throw new Exception('Solo se permite archivo CSV');
            }
            
            // 3. Leer CSV (reutilizando tu función leerCSV)
            $filas = $this->leerCSV($_FILES['file']['tmp_name']);
            if (count($filas) < 2) { // Debe tener encabezado + al menos una fila
                throw new Exception('El archivo está vacío');
            }
            
            $encabezados = array_shift($filas);
            // Mapear columnas (similar a procesarFilasExcel pero para este caso)
            $mapa = [];
            foreach ($encabezados as $indice => $nombre) {
                $mapa[strtolower(trim((string)$nombre))] = $indice;
            }
            
            // Columnas requeridas
            $requeridos = ['cantidad', 'productoalmacen']; // idProductoVariante es opcional
            foreach ($requeridos as $req) {
                if (!isset($mapa[$req])) {
                    throw new Exception("Falta la columna requerida: $req");
                }
            }
            
            // Si hay columna precio_unitario o precio, la usamos; si no, podrías definir un precio por defecto o null
            $columnaPrecio = null;
            if (isset($mapa['precio_unitario'])) {
                $columnaPrecio = $mapa['precio_unitario'];
            } elseif (isset($mapa['precio'])) {
                $columnaPrecio = $mapa['precio'];
            } else {
                // Podrías lanzar error o establecer un precio por defecto; aquí asumimos que es obligatorio
                throw new Exception('Falta columna de precio (precio_unitario o precio)');
            }
            
            // Columna opcional idProductoVariante
            $columnaIdVariante = $mapa['idproductovariante'] ?? null;
            
            // 4. Procesar filas y preparar datos
            $detalles = [];
            foreach ($filas as $numFila => $fila) {
                $cantidad = (int)($fila[$mapa['cantidad']] ?? 0);
                $productoalmacen = (int)($fila[$mapa['productoalmacen']] ?? 0);
                $precio = (float)($fila[$columnaPrecio] ?? 0);
                $idProductoVariante = null;
                if ($columnaIdVariante !== null && isset($fila[$columnaIdVariante]) && $fila[$columnaIdVariante] !== '') {
                    $idProductoVariante = (int)$fila[$columnaIdVariante];
                }
                
                // Validaciones básicas
                if ($cantidad <= 0 || $productoalmacen <= 0 || $precio < 0) {
                    throw new Exception("Fila " . ($numFila + 2) . ": datos inválidos (cantidad, productoalmacen o precio)");
                }
                
                $detalles[] = [
                    'precio' => $precio,
                    'cantidad' => $cantidad,
                    'productoalmacen' => $productoalmacen,
                    'idProductoVariante' => $idProductoVariante
                ];
            }
            
            if (empty($detalles)) {
                throw new Exception('No hay detalles para registrar');
            }
            
            // 5. Iniciar transacción en la base de datos principal
            $this->cm->begin_transaction();
            
            $datosParaCodigosUnicos = [
                'id_usuario' => 0, // se llenará después
                'productos' => []
            ];
            
            foreach ($detalles as $detalle) {
                $resultadoInsercion = $this->insertarDetalleCompraSinUnicos(
                    $detalle['precio'],
                    $detalle['cantidad'],
                    $idingreso,
                    $detalle['productoalmacen'],
                    $detalle['idProductoVariante']
                );
                
                
                
            }
            
           
            
            // 7. Commit de la transacción
            $this->cm->commit();
            
            $respuesta = [
                'estado' => 'exito',
                'mensaje' => 'Se registraron ' . count($detalles) . ' detalles correctamente',
                'idingreso' => $idingreso,
                'total_detalles' => count($detalles),
                'registroProUnico' => $registrarProUnico ? ($resultadoUnicos ?? 'No procesado') : 'No solicitado'
            ];
            
            return $this->responder($TIPORESPUESTA, $respuesta);
            
        } catch (Exception $e) {
            // Si hay transacción activa, rollback
            if ($this->cm->errno === 0 && $this->cm->server_info !== null) {
                // Verificar si hay transacción activa
                if ($this->cm->begin_transaction()) { } // No, mejor no.
            }
            if ($this->cm->errno == 0 && $this->cm->server_status & 1) { // SERVER_STATUS_IN_TRANS
                $this->cm->rollback();
            }
            // En tu código original no usas transacciones, así que simplemente lanza error.
            $respuesta = [
                'estado' => 'error',
                'mensaje' => $e->getMessage()
            ];
            return $this->responder($TIPORESPUESTA, $respuesta);
        }
    }
    private function responder($TIPORESPUESTA, $res) {
        if ($TIPORESPUESTA === null) {
            header('Content-Type: application/json');
            echo json_encode($res);
            exit;
        }
        return $res;
    }

}
