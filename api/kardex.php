<?php
require_once "../db/conexion.php";
require_once "funciones.php";
class Kardex
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    private $tabla = 'saldos_iniciales_metodo';
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        //$this->ad = $this->conexion->ad; reportecreditos detalleVenta
        $this->em = $this->conexion->em;
    }
    public function cambiarTipoKardex($idmd5, $tipo) {
        header('Content-Type: application/json; charset=utf-8'); // <-- asegura formato JSON
        
        try {
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

            if (!$idempresa) {
                echo json_encode([
                    "estado" => "error",
                    "mensaje" => "Empresa no encontrada o ID inválido"
                ]);
                return;
            }

            $sql = "UPDATE configuracion_inicial
                    SET kardex = ?
                    WHERE idempresa = ?;";

            $stmt = $this->cm->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error al preparar la consulta: " . $this->cm->error);
            }

            $stmt->bind_param('si', $tipo, $idempresa);

            if (!$stmt->execute()) {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
            }

            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "estado" => "exito",
                    "mensaje" => "Se actualizó correctamente el tipo de Kardex a '$tipo'."
                ]);
            } else {
                echo json_encode([
                    "estado" => "advertencia",
                    "mensaje" => "No se realizaron cambios. Es posible que ya esté configurado como '$tipo'."
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "estado" => "error",
                "mensaje" => $e->getMessage()
            ]);
        }
    }

    public function getTipoKardex($idmd5) {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $sql = "SELECT kardex
                FROM configuracion_inicial
                WHERE idempresa = ?;";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $this->cm->error);
        }

        // Vinculamos el parámetro
        $stmt->bind_param('i', $idempresa);

        // Ejecutamos la consulta
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        // Vinculamos la variable donde se almacenará el resultado
        $stmt->bind_result($kardex);

        // Obtenemos el resultado (fetch devuelve true si hay una fila)
        if ($stmt->fetch()) {
            return $kardex; // ✅ devolvemos el valor encontrado
        } else {
            return null; // ⚠️ no hay resultado
        }
    }

    public function getTipoKardexjson($idmd5) {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $sql = "SELECT kardex
                FROM configuracion_inicial
                WHERE idempresa = ?;";

        $stmt = $this->cm->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $this->cm->error);
        }

        $stmt->bind_param('i', $idempresa);

        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        $stmt->bind_result($kardex);

        // ✅ Este paso es obligatorio para llenar $kardex
        if ($stmt->fetch()) {
            echo json_encode(["metodo" => $kardex]);
        } else {
            echo json_encode(["metodo" => null]);
        }
    }

    public function arrayIDalmacen($idmd5)
    {

        $lista = array();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_usuario='$idusuario'");

        while ($qwe = $this->cm->fetch($consulta)) {
            $idalmacen = $qwe[2]; 
            $lista[] = $idalmacen;
        }
        $resultado = implode(',', $lista);
        return $resultado;
    }
    public function getConceptoKardex($cod){
        $codigo = [
            'NUE'=>'SALDO INICIAL',
            'VE'=> 'VENTAS',
            'MOV1'=> 'MOVIMIENTO+',
            'MOV2'=> 'MOVIMIENTO-',
            'MIC'=> 'COMPRAS',
            'RO'=> 'ROBOS',
            'MER'=> 'MERMAS',
            'AN'=> 'ANULADO',
            'EXT'=> 'EXTRAVIO',
            'DEV'=> 'DEVOLUCION',
            'AN'=>'ANULACION',
            'ANC'=>'ANULACION',
            'COT'=>'COTIZACION',
        ];
        return $codigo[$cod] ?? 'MOVIMIENTO DESCONOCIDO';
    }
    public function prepararKardex($fechainicio, $fechafinal,$idproducto, $idmd5){
        $resultado = [];
        
        $sql = "";
        // NOTA: Se asume que el objeto $this->cm implementa prepare/bind_param/execute/get_result
        // (por ejemplo, con mysqli)
        
        $sql = "SELECT 
                    s.id_stock, s.cantidad as stock , s.fecha, s.codigo, s.estado, s.productos_almacen_id_productos_almacen,
                    case 
                        WHEN s.codigo is not null THEN COALESCE(
                            s.cantidad - LAG(s.cantidad) OVER (
                                PARTITION BY s.productos_almacen_id_productos_almacen
                                ORDER BY s.fecha, s.id_stock
                            ), s.cantidad
                        )
                        ELSE 0
                    end as cantidad_movimiento, 
                    case 
                        when s.idorigen is null and s.codigo = 'MIC' then COALESCE((
                            select di.precio_unitario from ingreso as i
                            left join detalle_ingreso as di on i.id_ingreso = di.ingreso_id_ingreso
                            where i.fecha_ingreso = s.fecha and di.productos_almacen_id_productos_almacen = s.productos_almacen_id_productos_almacen limit 1
                        ),0)
                        when s.idorigen is not null and s.codigo = 'MIC' then COALESCE((
                            select precio_unitario from detalle_ingreso where id_detalle_ingreso = s.idorigen limit 1
                        ),0)
                        when s.idorigen is not null and s.codigo = 'MER' then COALESCE((
                            select precio_unitario from detalle_ingreso where id_detalle_ingreso = s.idorigen limit 1
                        ),0)
                        when s.idorigen is not null and s.codigo = 'EXT' then COALESCE((
                            select precio_unitario from detalle_ingreso where id_detalle_ingreso = s.idorigen limit 1
                        ),0)
                    end as precio_unitario,
                    case 
                    
                        when s.idorigen is not null and s.codigo = 'DEV' then COALESCE((
                            select s2.id_stock from stock as s2 where s2.idorigen = s.idorigen and s2.codigo = 'VE' limit 1
                        ),0)
                        when s.idorigen is not null and s.codigo = 'AN' then COALESCE((
                            select s2.id_stock from stock as s2 where s2.idorigen = s.idorigen and s2.codigo = 'VE' limit 1
                        ),0)
                        when s.idorigen is not null and s.codigo = 'ANC' then COALESCE((
                            select s2.id_stock from stock as s2 where s2.idorigen = s.idorigen and s2.codigo = 'COT' limit 1
                        ),0)
                    end as precio_de
                from stock s where s.productos_almacen_id_productos_almacen = ? and s.fecha <= ?";
        
        
        
        $stm = $this->cm->prepare($sql);
        
        if(!$stm){
            $resultado = ["estado" => "error", "mesaje"=> "No se puedo preparar la consulta del kardex" ];
            return $resultado; // Asegurar retorno en caso de error de preparación
        }
        
        
        $stm->bind_param('is', $idproducto, $fechafinal);
        
        $stm->execute();
        $result = $stm->get_result();

        $kardex = [];
        while($row = $result->fetch_assoc()){
            $kardex[] = $row;
        }
        
        $stm->close(); // Cierre de la sentencia preparada

        $tipo = $this->getTipoKardex($idmd5);
        $k = [];
        
        switch ($tipo) {
            case 'PEPS':
                // Código si $variable == 'valor1'
                $k = $this->PEPS($kardex);
                break;

            case 'UEPS':
                // Código si $variable == 'valor2'
                $k = $this->UEPS($kardex,$idproducto,0);
                break;
            case 'PROMEDIO':
                // Código si $variable == 'valor2'
                $k = $this->Promedio_($kardex,$idproducto,0);
                break;

            default:
                // Código si no coincide ningún caso
                break;
        }
        echo json_encode([
            $tipo => $k
        ], JSON_UNESCAPED_UNICODE);
        // Si la función está en una clase, probablemente debería retornar el valor, no imprimirlo
        // return $peps; 
    }
    public function PEPS($KARDEX){
        $a = [];
        $resultado = [];
        $entradas = []; // Entradas pendientes [cantidad, precio_unitario]
        $saldo_inicial = [];
        
        $saldo_final_of = 0;
        foreach ($KARDEX as $movimiento) {
            $precios_divididos = [];
            $entradas_divididos = []; 
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);
            $cod = $movimiento['codigo'];
            $debe = 0;
            $haber = 0;
            $codigos_perdidas = [ 'EXT', 'MER'];
            $codigos_entradas = ['MIC'];
            $codigos_salidas = ['VE', 'COT'];
            $codigos_especiales = ['DEV', 'AN', 'ANC'];
            if( in_array($cod, $codigos_entradas) ){
                // Entrada
                $entradas[] = [
                    'idstock' => $movimiento['id_stock'],
                    'cantidad' => abs($cantidadMovimiento),
                    'precio_unitario' => $precioUnitario
                ];
                $debe = abs($cantidadMovimiento) * $precioUnitario;
                $precioUnitario = $precioUnitario; // Precio unitario de la entrada

            } elseif(in_array($cod, $codigos_perdidas)){
                
                $haber = abs($cantidadMovimiento) * $precioUnitario;
                $precioUnitario = $precioUnitario; // Precio unitario de la entrada
                
                
                foreach ($entradas as &$e) {
                    if ($e['precio_unitario'] == $precioUnitario) {
                        $e['cantidad'] -= abs($cantidadMovimiento);
                        
                        break; // salir de ambos loops
                    }
                    
                }
                unset($e);
                
            }
             elseif(in_array($cod, $codigos_salidas)) {
                // Salida (Venta/Consumo)
                $cantidad_salida = abs($cantidadMovimiento); 
                $haber = 0;
                // Usaremos esta variable para registrar el detalle de los precios de salida
 
                while($cantidad_salida > 0 && count($entradas) > 0){
                    $primera = &$entradas[0];
                    
                    if($primera['cantidad'] <= $cantidad_salida){
                        // Consume el lote completo
                        $valor_consumido = $primera['cantidad'] * $primera['precio_unitario'];
                        $haber += $valor_consumido;
                        $cantidad_salida -= $primera['cantidad'];

                        $precios_divididos [] = [
                            "compra_de" => $primera['idstock'],
                            "cantidad" => $primera['cantidad'],
                            "precio" => $primera['precio_unitario']
                        ];

                        unset($primera); // 🔹 rompe la referencia
                        array_shift($entradas);
                        $a [] = $precios_divididos;
                    } else {
                        // Consume una parte del lote
                        $valor_consumido = $cantidad_salida * $primera['precio_unitario'];
                        $haber += $valor_consumido;
                        $primera['cantidad'] -= $cantidad_salida;

                        $precios_divididos [] = [
                            "compra_de" => $primera['idstock'],
                            "cantidad" => $cantidad_salida,
                            "precio" => $primera['precio_unitario']
                        ];

                        $cantidad_salida = 0;
                        unset($primera); // también aquí, buena práctica
                        $a [] = $precios_divididos;
                    }
                    
                }
                // El precio unitario de una salida es el detalle de los precios usados
                
                
            } elseif (in_array($cod, $codigos_especiales)) {
                
                $compra_de = null;

                // Buscar el movimiento original desde el cual se hace la devolución/anulación
                foreach ($resultado as $mov) {
                    if (isset($movimiento['precio_de']) && $mov['idstock'] == $movimiento['precio_de']) {
                        $precioUnitario = floatval($mov['C.Unit']);
                        $compra_de = $mov['compra_de']; // asumimos que se devuelve al mismo lote
                        $entradas_divididos[] = [
                            "compra_de" => $compra_de,
                            "cantidad" => $mov['Salida'],
                            "precio" => $precioUnitario
                        ];
                    }
                }
                // echo $compra_de;
                //Si se encontró el lote original, se agrega la cantidad devuelta a ese lote
                $no_existe_entrada = true;
                if ($compra_de !== null) {
                    foreach ($entradas as &$e) {
                        if ($e['idstock'] == $compra_de) {
                            $e['cantidad'] += abs($cantidadMovimiento);
                            $no_existe_entrada = false;
                            break; // salir de ambos loops
                        }
                        
                    }
                    unset($e);
                    if($no_existe_entrada){
                        $entradas[] = [                          
                            'idstock' => $compra_de,
                            'cantidad' => abs($cantidadMovimiento),
                            'precio_unitario' => $precioUnitario
                        ];
                    }
                } else {
                    // Si no se encontró el lote, se crea una nueva entrada (devolución sin referencia exacta)
                    $entradas[] = [
                        'idstock' => $movimiento['id_stock'], // opcional, para rastrear
                        'cantidad' => abs($cantidadMovimiento),
                        'precio_unitario' => $precioUnitario > 0 ? $precioUnitario : 0
                    ];
                }

                // Actualizamos el movimiento financiero
                $debe = abs($cantidadMovimiento) * $precioUnitario;
            }
            $registro = [];
            // Existencia = stock del movimiento
            $existencia = $movimiento['stock'];

            // Saldo = sumatoria de las entradas pendientes valoradas (Inventario Final Valor PEPS)
            $saldo = array_sum(array_map(fn($e) => $e['cantidad']*$e['precio_unitario'], $entradas));
            
            // **********************************************
            // CÁLCULO DEL PRECIO UNITARIO PROMEDIO (PUP)
            // Solo para el saldo. Es el Saldo Valor dividido por la Existencia.
            // **********************************************
            $pup_final = ($existencia > 0) ? ($saldo / $existencia) : 0;
            if (is_array($precios_divididos) && count($precios_divididos) > 0) {
                foreach($precios_divididos as $dividido){
                    $saldo_final_of -= floatval($dividido['cantidad'])* floatval($dividido['precio']);

                    $registro = [
                        "compra_de"=> $dividido['compra_de'],
                        "idstock" => $movimiento['id_stock'],
                        "Fecha" => $movimiento['fecha'],
                        "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                        "Entrada" => 0,
                        "Salida" => $dividido['cantidad'],
                        "Existencia" => $existencia, 
                        "C.Unit" => $dividido['precio'], // En salidas, es el detalle de precios usados
                        "Debe" => $debe,
                        "Haber" => floatval($dividido['cantidad'])* floatval($dividido['precio']),
                        "Saldo" => $saldo_final_of,
                        "saldo_final" => $saldo_final_of,
                        // Detalle de los lotes pendientes (para el último registro, es el inventario final)
                        "Lotes_Pendientes" => $entradas
                    ];
                    if (count($KARDEX) == (array_key_last($KARDEX) + 1)) {
                        $registro['PUP_Final'] = $pup_final;
                    
                    }
                    $resultado[] = $registro;
                }
                
            }else{
                 if (is_array($entradas_divididos) && count($entradas_divididos) > 0) {
                    foreach($entradas_divididos as $dividido){
                        $saldo_final_of += floatval($dividido['cantidad'])* floatval($dividido['precio']);

                        $registro = [
                            "compra_de"=> 0,
                            "idstock" => $movimiento['id_stock'],
                            "Fecha" => $movimiento['fecha'],
                            "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                            "Entrada" => $dividido['cantidad'],
                            "Salida" => 0,
                            "Existencia" => $existencia, 
                            "C.Unit" => $dividido['precio'], // En salidas, es el detalle de precios usados
                            "Debe" => floatval($dividido['cantidad'])* floatval($dividido['precio']),
                            "Haber" => $haber,
                            "Saldo" => $saldo_final_of,
                            "saldo_final" => $saldo_final_of,
                            // Detalle de los lotes pendientes (para el último registro, es el inventario final)
                            "Lotes_Pendientes" => $entradas
                        ];
                        if (count($KARDEX) == (array_key_last($KARDEX) + 1)) {
                            $registro['PUP_Final'] = $pup_final;
                        
                        }
                        $resultado[] = $registro;
                    }
                 }
                 else{
                    $registro = [
                        "compra_de" => 0,
                        "idstock" => $movimiento['id_stock'],
                        "Fecha" => $movimiento['fecha'],
                        "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                        "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                        "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                        "Existencia" => $existencia, 
                        "C.Unit" => $precioUnitario, // En salidas, es el detalle de precios usados
                        "Debe" => $debe,
                        "Haber" => $haber,
                        "Saldo" => $saldo,
                        "saldo_final" => $saldo_final_of,
                        // Detalle de los lotes pendientes (para el último registro, es el inventario final)
                        "Lotes_Pendientes" => $entradas
                    ];
                    if (count($KARDEX) == (array_key_last($KARDEX) + 1)) {
                        $registro['PUP_Final'] = $pup_final;
                    
                    }
                    $resultado[] = $registro;
                 }
                
            }
            
            $saldo_final_of = $saldo;
            // Añadir el PUP al registro si es el último
            

           
        }

       
        // OBTENER EL SALDO FINAL CON EL PRECIO UNITARIO
       
        $ultimo_movimiento = end($resultado);
        
        $saldo_final_data = [
            "Saldo_Valorado" => $ultimo_movimiento['Saldo'],
            "Existencia_Final" => $ultimo_movimiento['Existencia'],
            "Lotes_Detalle_PEPS" => $ultimo_movimiento['Lotes_Pendientes'], // El verdadero detalle PEPS
            "Precio_Unitario_Promedio_Ponderado_Final" => $pup_final // El PUP, si necesitas un solo precio
        ];
        
        // OBTENER EL SALDO INICIAL CON EL PRECIO UNITARIO
        
        
        return [
            'kardex' => $resultado,
            'saldo_final' => $saldo_final_data,
            'saldo_inicial' => $saldo_inicial,
            'salidas' => $a,
        ];
    }
    // Función PEPS con acceso a arrays corregido
    
    public function UEPS($KARDEX){
        $a = [];
        $resultado = [];
        $entradas = []; // Entradas pendientes [cantidad, precio_unitario]
        $saldo_inicial = [];
        
        $saldo_final_of = 0;

        foreach ($KARDEX as $movimiento) {
            $precios_divididos = [];
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);
            $cod = $movimiento['codigo'];
            $debe = 0;
            $haber = 0;
            $codigos_perdidas = [ 'EXT', 'MER'];
            $codigos_entradas = ['MIC'];
            $codigos_salidas = ['VE', 'COT'];
            $codigos_especiales = ['DEV', 'AN', 'ANC'];
            $es_ultimo_movimiento = (array_key_last($KARDEX) == key($KARDEX)); // Verifica si estamos en el último item

            if(in_array($cod, $codigos_entradas)){
                // Entrada
                $entradas[] = [
                    'idstock' => $movimiento['id_stock'],
                    'cantidad' => abs($cantidadMovimiento),
                    'precio_unitario' => $precioUnitario
                ];
                $debe = abs($cantidadMovimiento) * $precioUnitario;
                $precioUnitario = $precioUnitario; 

            } 
            elseif(in_array($cod, $codigos_perdidas)){
                
                $haber = abs($cantidadMovimiento) * $precioUnitario;
                $precioUnitario = $precioUnitario; // Precio unitario de la entrada
                
                
                foreach ($entradas as &$e) {
                    if ($e['precio_unitario'] == $precioUnitario) {
                        $e['cantidad'] -= abs($cantidadMovimiento);
                        
                        break; // salir de ambos loops
                    }
                    
                }
                unset($e);
                
            }
            elseif(in_array($cod, $codigos_salidas)) {
                // Salida (se consume la ÚLTIMA entrada)
                $cantidad_salida = abs($cantidadMovimiento); 
                $haber = 0;

                while($cantidad_salida > 0 && count($entradas) > 0){
                    // Referencia a la ÚLTIMA entrada
                    $ultima_posicion = count($entradas) - 1;
                    $ultima = &$entradas[$ultima_posicion];
                    
                    if($ultima['cantidad'] <= $cantidad_salida){
                        // Consumo total del último lote
                        $valor_consumido = $ultima['cantidad'] * $ultima['precio_unitario'];
                        $haber += $valor_consumido;
                        $cantidad_salida -= $ultima['cantidad'];

                        $precios_divididos [] = [
                            "compra_de" => $ultima['idstock'],
                            "cantidad" => $ultima['cantidad'],
                            "precio" => $ultima['precio_unitario']
                        ];

                        unset($ultima); // rompe la referencia
                        array_pop($entradas); // Eliminamos la última entrada consumida
                        $a [] = $precios_divididos;

                    } else {
                        // Consumo parcial del último lote
                        $valor_consumido = $cantidad_salida * $ultima['precio_unitario'];
                        $haber += $valor_consumido;
                        $ultima['cantidad'] -= $cantidad_salida;
                        
                        $precios_divididos [] = [
                            "compra_de" => $ultima['idstock'],
                            "cantidad" => $cantidad_salida,
                            "precio" => $ultima['precio_unitario']
                        ];
                        $cantidad_salida = 0; 
                        unset($ultima);
                        $a [] = $precios_divididos;

                    }
                }
            }elseif (in_array($cod, $codigos_especiales)) {
                
                $compra_de = null;

                // Buscar el movimiento original desde el cual se hace la devolución/anulación
                foreach ($resultado as $mov) {
                    if (isset($movimiento['precio_de']) && $mov['idstock'] == $movimiento['precio_de']) {
                        $precioUnitario = floatval($mov['C.Unit']);
                        $compra_de = $mov['compra_de']; // asumimos que se devuelve al mismo lote
                        break;
                    }
                }
                // echo $compra_de;
                //Si se encontró el lote original, se agrega la cantidad devuelta a ese lote
                if ($compra_de !== null) {
                    foreach ($entradas as &$e) {
                        if ($e['idstock'] == $compra_de) {
                            $e['cantidad'] += abs($cantidadMovimiento);
                           
                            break; // salir de ambos loops
                        }
                        
                    }
                    unset($e);
                } else {
                    // Si no se encontró el lote, se crea una nueva entrada (devolución sin referencia exacta)
                    $entradas[] = [
                        'idstock' => $movimiento['id_stock'], // opcional, para rastrear
                        'cantidad' => abs($cantidadMovimiento),
                        'precio_unitario' => $precioUnitario > 0 ? $precioUnitario : 0
                    ];
                }

                // Actualizamos el movimiento financiero
                $debe = abs($cantidadMovimiento) * $precioUnitario;
            }

            // Existencia = stock del movimiento
            $existencia = $movimiento['stock'];

            // Saldo = sumatoria de los valores de las entradas pendientes (Inventario Final Valor UEPS)
            $saldo = array_sum(array_map(fn($e) => $e['cantidad']*$e['precio_unitario'], $entradas));
            
            // CÁLCULO DEL PRECIO UNITARIO PROMEDIO (PUP)
            $pup_final = ($existencia > 0) ? ($saldo / $existencia) : 0;
            if (is_array($precios_divididos) && count($precios_divididos) > 0) {
                foreach($precios_divididos as $dividido){
                    $saldo_final_of -= floatval($dividido['cantidad'])* floatval($dividido['precio']);

                    $registro = [
                        "compra_de"=> $dividido['compra_de'],
                        "idstock" => $movimiento['id_stock'],
                        "Fecha" => $movimiento['fecha'],
                        "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                        "Entrada" => 0,
                        "Salida" => $dividido['cantidad'],
                        "Existencia" => $existencia, 
                        "C.Unit" => $dividido['precio'], // En salidas, es el detalle de precios usados
                        "Debe" => $debe,
                        "Haber" => floatval($dividido['cantidad'])* floatval($dividido['precio']),
                        "Saldo" => $saldo_final_of,
                        "saldo_final" => $saldo_final_of,
                        // Detalle de los lotes pendientes (para el último registro, es el inventario final)
                        "Lotes_Pendientes" => $entradas
                    ];
                    if ($es_ultimo_movimiento) {
                        $registro['PUP_Final'] = $pup_final;
                    }

                    $resultado[] = $registro;
                }
                
            }else{
                $registro = [
                    "compra_de" => 0,
                    "idstock" => $movimiento['id_stock'],
                    "Fecha" => $movimiento['fecha'],
                    "Concepto" => $this->getConceptoKardex($movimiento['codigo']), 
                    "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                    "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                    "Existencia" => $existencia, 
                    "C.Unit" => $precioUnitario,
                    "Debe" => $debe,
                    "Haber" => $haber,
                    "Saldo" => $saldo,
                    "saldo_final" => $saldo_final_of,

                    // Detalle de los lotes pendientes (el inventario final)
                    "Lotes_Pendientes" => $entradas
                ];
                if ($es_ultimo_movimiento) {
                    $registro['PUP_Final'] = $pup_final;
                }

                $resultado[] = $registro;
            }
            $saldo_final_of = $saldo;

            next($KARDEX); // Avanza el puntero para la siguiente iteración

            // Para asegurar que el PUP y el detalle final estén en el último registro
           
        }

     
        // OBTENER EL SALDO FINAL CON EL PRECIO UNITARIO
       
        $ultimo_movimiento = end($resultado);
        
        $saldo_final_data = [
            "Saldo_Valorado" => $ultimo_movimiento['Saldo'],
            "Existencia_Final" => $ultimo_movimiento['Existencia'],
            "Lotes_Detalle_UEPS" => $ultimo_movimiento['Lotes_Pendientes'], // Detalle de los lotes a precio de las primeras compras
            "Precio_Unitario_Promedio_Ponderado_Final" => $pup_final // El PUP, si se necesita un precio único
        ];
        

        
        return [
            'kardex' => $resultado,
            'saldo_final' => $saldo_final_data,
            'saldo_inicial' => $saldo_inicial,
        ];
    }

    public function Promedio($KARDEX){
        $resultado = [];
        // En Promedio Ponderado, solo necesitamos el Saldo Valor y la Existencia Total
        $existenciaTotal = 0;
        $saldoValorado = 0;
        $costoUnitarioPromedio = 0;
        $saldo_inicial = [];
        $entradas = []; // Entradas pendientes [cantidad, precio_unitario]


        foreach ($KARDEX as $movimiento) {
            $cod = $movimiento['codigo'];

            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);
            $debe = 0;
            $haber = 0;
            $cUnit = 0;
            
            $codigos_entradas = ['MIC'];
            $codigos_salidas = ['VE', 'COT', 'EXT', 'MER'];
            $codigos_especiales = ['DEV', 'AN', 'ANC'];

            if(in_array($cod, $codigos_entradas)){
                // 1. Entrada: Se recalcula el promedio ponderado
                
                $valorEntrada = $cantidadMovimiento * $precioUnitario;
                $debe = $valorEntrada;
                $cUnit = $precioUnitario; // Costo unitario de la compra

                // Nuevo Saldo Valor = Saldo Anterior + Valor de la Nueva Entrada
                $saldoValorado += $valorEntrada;
                
                // Nueva Existencia Total = Existencia Anterior + Cantidad de la Entrada
                $existenciaTotal += $cantidadMovimiento;
                
                // Recalculamos el Costo Unitario Promedio (solo después de una entrada)
                $costoUnitarioPromedio = $existenciaTotal > 0 ? ($saldoValorado / $existenciaTotal) : 0;
                 $entradas[] = [
                    'idstock' => $movimiento['id_stock'],
                    'cantidad' => abs($cantidadMovimiento),
                    'precio_unitario' => $precioUnitario
                ];
                
            }
            elseif(in_array($cod, $codigos_salidas)){
                // 2. Salida: Se usa el promedio ponderado CALCULADO antes de esta salida
                
                $cantidad_salida = abs($cantidadMovimiento);
                
                if ($costoUnitarioPromedio == 0) {
                    // Debería ser muy raro, solo si se vende sin inventario inicial/compras
                    $costoUnitarioSalida = 0; 
                } else {
                    $costoUnitarioSalida = $costoUnitarioPromedio;
                }
                
                $haber = $cantidad_salida * $costoUnitarioSalida;
                $cUnit = $costoUnitarioSalida;

                // Actualizamos la Existencia y el Saldo Valor
                $existenciaTotal -= $cantidad_salida;
                $saldoValorado -= $haber;
                
                // Ajuste por errores de redondeo: si la existencia es cero, el saldo también debe ser cero.
                if ($existenciaTotal < 0.0001) { // Usamos un margen para flotantes
                    $existenciaTotal = 0;
                    $saldoValorado = 0;
                    $costoUnitarioPromedio = 0;
                }
            }elseif (in_array($cod, $codigos_especiales)) {
                // Buscar el movimiento original desde el cual se hace la devolución/anulación
                foreach ($resultado as $mov) {
                    if (isset($movimiento['precio_de']) && $mov['idstock'] == $movimiento['precio_de']) {
                        $precioUnitario = floatval($mov['C.Unit']);
                        break;
                    }
                }
                // echo $compra_de;
                //Si se encontró el lote original, se agrega la cantidad devuelta a ese lote
               

                $valorEntrada = $cantidadMovimiento * $precioUnitario;
                $debe = $valorEntrada;
                $cUnit = $precioUnitario; // Costo unitario de la compra

                // Nuevo Saldo Valor = Saldo Anterior + Valor de la Nueva Entrada
                $saldoValorado += $valorEntrada;
                
                // Nueva Existencia Total = Existencia Anterior + Cantidad de la Entrada
                $existenciaTotal += $cantidadMovimiento;
                
                // Recalculamos el Costo Unitario Promedio (solo después de una entrada)
                $costoUnitarioPromedio = $existenciaTotal > 0 ? ($saldoValorado / $existenciaTotal) : 0;
                
            }
            
            // **********************************************
            // NOTA: El stock del movimiento ('stock') debería coincidir 
            // con la $existenciaTotal que calculamos internamente.
            // Usamos la interna para mantener la consistencia del cálculo.
            // **********************************************
            $existencia = $existenciaTotal; 
            $saldo = $saldoValorado;

            $registro = [
                "Fecha" => $movimiento['fecha'],
                "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                "Existencia" => $existencia, 
                "C.Unit" => round($cUnit, 2), // El precio de la entrada o el promedio de la salida
                "Debe" => $debe,
                "Haber" => $haber,
                "Saldo" => $saldo,
                "Costo_Promedio_Actual" => $costoUnitarioPromedio // Precio que se usará en la siguiente salida
            ];

            $resultado[] = $registro;
        }

        // SALDO FINAL Y PRECIO UNITARIO PARA CONTABILIZAR

        $saldo_final_data = [
            "Saldo_Valorado" => $saldoValorado,
            "Existencia_Final" => $existenciaTotal,
            // El precio unitario final es el último costo promedio calculado

            "Precio_Unitario_Promedio_Ponderado_Final" => $costoUnitarioPromedio 
        ];

        
        return [
            'kardex' => $resultado,
            'saldo_final' => $saldo_final_data,
            'saldo_inicial' => $saldo_inicial,
        ];
    }
    public function Promedio_($KARDEX) {
        $resultado = [];
        $existenciaTotal = 0;
        $saldoValorado = 0;
        $costoUnitarioPromedio = 0;
        $saldo_inicial = [];
        $entradas = [];

        foreach ($KARDEX as $movimiento) {
            $cod = $movimiento['codigo'];
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);

            if ($this->esEntrada($cod)) {
                [$existenciaTotal, $saldoValorado, $costoUnitarioPromedio, $debe, $cUnit] =
                    $this->procesarEntrada($cantidadMovimiento, $precioUnitario, $existenciaTotal, $saldoValorado);
            } 
            elseif ($this->esSalida($cod)) {
                [$existenciaTotal, $saldoValorado, $costoUnitarioPromedio, $haber, $cUnit] =
                    $this->procesarSalida($cantidadMovimiento, $costoUnitarioPromedio, $existenciaTotal, $saldoValorado);
            } 
            elseif ($this->esEspecial($cod)) {
                [$existenciaTotal, $saldoValorado, $costoUnitarioPromedio, $debe, $cUnit] =
                    $this->procesarEspecial($movimiento, $resultado, $existenciaTotal, $saldoValorado);
            }

            // Registro
            $resultado[] = $this->crearRegistro(
                $movimiento,
                $existenciaTotal,
                $saldoValorado,
                $cUnit ?? 0,
                $debe ?? 0,
                $haber ?? 0,
                $costoUnitarioPromedio
            );

            // Reiniciar valores para evitar arrastres
            $debe = $haber = $cUnit = 0;
        }

        $saldo_final = [
            "Saldo_Valorado" => $saldoValorado,
            "Existencia_Final" => $existenciaTotal,
            "Precio_Unitario_Promedio_Ponderado_Final" => $costoUnitarioPromedio,
        ];

        return [
            'kardex' => $resultado,
            'saldo_final' => $saldo_final,
            'saldo_inicial' => $saldo_inicial,
        ];
    }
    private function esEntrada($codigo) {
        return in_array($codigo, ['MIC']);
    }

    private function esSalida($codigo) {
        return in_array($codigo, ['VE', 'COT', 'EXT', 'MER']);
    }

    private function esEspecial($codigo) {
        return in_array($codigo, ['DEV', 'AN']);
    }

    private function procesarEntrada($cantidad, $precio, $existencia, $saldo) {
        $valorEntrada = $cantidad * $precio;
        $existencia += $cantidad;
        $saldo += $valorEntrada;
        $costoPromedio = $existencia > 0 ? $saldo / $existencia : 0;

        return [$existencia, $saldo, $costoPromedio, $valorEntrada, $precio];
    }
    private function procesarSalida($cantidad, $costoPromedio, $existencia, $saldo) {
        $cantidadSalida = abs($cantidad);
        $costoUnitario = $costoPromedio ?: 0;
        $valorSalida = $cantidadSalida * $costoUnitario;

        $existencia -= $cantidadSalida;
        $saldo -= $valorSalida;

        // Corrección flotante
        if ($existencia < 0.0001) {
            $existencia = 0;
            $saldo = 0;
            $costoPromedio = 0;
        }

        return [$existencia, $saldo, $costoPromedio, $valorSalida, $costoUnitario];
    }
    private function procesarEspecial($movimiento, $resultado, $existencia, $saldo) {
        $precioUnitario = 0;

        if (isset($movimiento['precio_de'])) {
            foreach ($resultado as $mov) {
                if ($mov['idstock'] == $movimiento['precio_de']) {
                    $precioUnitario = floatval($mov['C.Unit']);
                    break;
                }
            }
        }

        $valorEntrada = abs($movimiento['cantidad_movimiento']) * $precioUnitario;
        $existencia += abs($movimiento['cantidad_movimiento']);
        $saldo += $valorEntrada;
        $costoPromedio = $existencia > 0 ? $saldo / $existencia : 0;

        return [$existencia, $saldo, $costoPromedio, $valorEntrada, $precioUnitario];
    }
    private function crearRegistro($movimiento, $existencia, $saldo, $cUnit, $debe, $haber, $costoPromedio) {
        $cantidad = floatval($movimiento['cantidad_movimiento']);

        return [
            "idstock" => $movimiento['id_stock'],
            "Fecha" => $movimiento['fecha'],
            "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
            "Entrada" => $cantidad > 0 ? $cantidad : 0,
            "Salida" => $cantidad < 0 ? abs($cantidad) : 0,
            "Existencia" => $existencia,
            "C.Unit" => round($cUnit, 2),
            "Debe" => $debe,
            "Haber" => $haber,
            "Saldo" => $saldo,
            "Costo_Promedio_Actual" => $costoPromedio,
        ];
    }

    public function kardex($fechainicio, $fechafinal, $idalmacen, $idproducto, $idmd5)
    {
        $this->prepararKardex($fechainicio, $fechafinal,$idproducto, $idmd5);
    
    }


    public function registrarSaldo($data) {
        $productoAlmacenId = $data['id'];
         $fecha= $data['fecha']; 
         $metodo= $data['metodo']; 
         $cantidad= $data['cantidad']; 
         $costoUnitario = $data['precio'];
        $sql = "INSERT INTO {$this->tabla} (
                    productos_almacen_id_productos_almacen, 
                    fecha, 
                    metodo, 
                    cantidad, 
                    costo_unitario
                ) VALUES (?, ?, ?, ?, ?)";
        
        // Preparar la sentencia
        $stmt = $this->cm->prepare($sql);
        
        if ($stmt === false) {
            error_log("Error al preparar la sentencia INSERT: " . $this->cm->error);
            return false;
        }

        // Vincular parámetros (i: integer, s: string, d: double/decimal)
        $stmt->bind_param("issdd", 
            $productoAlmacenId, 
            $fecha, 
            $metodo, 
            $cantidad, 
            $costoUnitario
        );

        // Ejecutar y verificar
        if ($stmt->execute()) {
            echo json_encode(["estado"=>"exito"]); // Devolver el ID insertado
        } else {
            error_log("Error al ejecutar INSERT: " . $stmt->error);
            echo json_encode(["error"=>"error"]); // Devolver el ID insertado
        }
    }


    /**
     * Obtiene un saldo inicial por su ID.
     * @param int $idSaldo ID del registro de saldo.
     * @return array|bool El registro como array asociativo o false si no se encuentra.
     */
    public function obtenerPorId(int $idSaldo) {
        $sql = "SELECT * FROM {$this->tabla} WHERE id_saldo = ?";
        
        $stmt = $this->cm->prepare($sql);
        if ($stmt === false) {
            error_log("Error al preparar la sentencia SELECT: " . $this->cm->error);
            return false;
        }

        $stmt->bind_param("i", $idSaldo);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            return $resultado->fetch_assoc(); // Devolver un array asociativo
        }
        return false;
    }

    /**
     * Lista todos los saldos o filtra por producto_almacen.
     * @param int|null $productoAlmacenId Opcional: ID para filtrar.
     * @return array Lista de registros.
     */
    public function listarSaldos( $productoAlmacenId): array {
        $sql = "SELECT * FROM {$this->tabla}";
        $stmt = null;
        
        if ($productoAlmacenId !== null) {
            $sql .= " WHERE productos_almacen_id_productos_almacen = ?";
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                 error_log("Error al preparar la sentencia SELECT con filtro: " . $this->cm->error);
                 return [];
            }
            $stmt->bind_param("i", $productoAlmacenId);
        } else {
             // Usar query() para consultas sin parámetros
             $resultado = $this->cm->query($sql); 
             if ($resultado === false) {
                 error_log("Error al ejecutar la consulta SELECT sin filtro: " . $this->cm->error);
                 return [];
             }
             return $resultado->fetch_all(MYSQLI_ASSOC);
        }
        
        $stmt->execute();
        $resultado = $stmt->get_result();
        return $resultado->fetch_all(MYSQLI_ASSOC);
    }
    

    /**
     * Edita la cantidad y/o el costo unitario de un saldo inicial existente.
     * @param int $idSaldo ID del registro a editar.
     * @param float $cantidad Nueva cantidad.
     * @param float $costoUnitario Nuevo costo unitario.
     * @return bool True si la edición fue exitosa, false en caso contrario.
     */
    public function editarSaldo($data): bool {

        $idSaldo = $data['idSaldo'];
         $cantidad= $data['cantidad']; 
         $costoUnitario = $data['precio'];
        $sql = "UPDATE {$this->tabla} SET 
                    cantidad = ?, 
                    costo_unitario = ?
                WHERE id_saldo = ?";
        
        $stmt = $this->cm->prepare($sql);
        if ($stmt === false) {
            error_log("Error al preparar la sentencia UPDATE: " . $this->cm->error);
            return false;
        }
        
        // Vincular parámetros (d: double/decimal, i: integer)
        $stmt->bind_param("ddi", $cantidad, $costoUnitario, $idSaldo);
        
        return $stmt->execute();
    }


    /**
     * Elimina un registro de saldo inicial por su ID.
     * @param int $idSaldo ID del registro a eliminar.
     * @return bool True si la eliminación fue exitosa, false en caso contrario.
     */
    public function eliminarSaldo($idSaldo): bool {
        $sql = "DELETE FROM {$this->tabla} WHERE id_saldo = ?";
        
        $stmt = $this->cm->prepare($sql);
        if ($stmt === false) {
            error_log("Error al preparar la sentencia DELETE: " . $this->cm->error);
            return false;
        }

        $stmt->bind_param("i", $idSaldo);
        
        return $stmt->execute();
    }

    public function _______peps($KARDEX){
        $resultado = [];
        $entradas = []; // Entradas pendientes [cantidad, precio_unitario]
        $cantidades = 0;
        $precio = 0;
        foreach ($KARDEX as $movimiento) {
            
            // CORRECCIÓN: Usar $movimiento['clave'] en lugar de $movimiento->clave
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);

            if($cantidadMovimiento > 0){
                // Entrada: agregamos al inventario
                $entradas[] = [
                    'cantidad' => $cantidadMovimiento,
                    'precio_unitario' => $precioUnitario
                ];
                $debe = $cantidadMovimiento * $precioUnitario;
                $haber = 0;

            } else {
                // Salida: consumimos las primeras entradas (PEPS)
                $cantidad_salida = abs($cantidadMovimiento); 
                $haber = 0;
                $precioUnitario = "";

                while($cantidad_salida > 0 && count($entradas) > 0){
                    $primera = &$entradas[0];
                    if($primera['cantidad'] <= $cantidad_salida){
                        $haber += $primera['cantidad'] * $primera['precio_unitario'];
                        $cantidad_salida -= $primera['cantidad'];
                        $precioUnitario .= $primera['cantidad'] . ":" . $primera['precio_unitario'] . ", ";
                        array_shift($entradas); // Eliminamos entrada consumida
                    } else {
                        $haber += $cantidad_salida * $primera['precio_unitario'];
                        $primera['cantidad'] -= $cantidad_salida;
                        if (!empty($precioUnitario)) {
                            $precioUnitario .= $cantidad_salida . ":" .$primera['precio_unitario'];

                        }else{
                            $precioUnitario = $primera['precio_unitario'];

                        }
                        $cantidad_salida = 0;
                    }
                }
                $debe = 0;
            }

            // Existencia = stock del movimiento
            // CORRECCIÓN: Usar $movimiento['stock']
            $existencia = $movimiento['stock'];

            // Saldo = sumatoria de las entradas pendientes
            $saldo = array_sum(array_map(fn($e) => $e['cantidad']*$e['precio_unitario'], $entradas));

            $resultado[] = [
                // CORRECCIÓN en todas las llamadas:
                "Fecha" => $movimiento['fecha'],
                "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                "Existencia" => $existencia, 
                "C.Unit" => $precioUnitario,
                "Debe" => $debe,
                "Haber" => $haber,
                "Saldo" => $saldo,
            ];
        }

        return $resultado;
    }
    /**
     * Aplica la lógica UEPS (Últimas Entradas, Primeras Salidas) para calcular los costos de salida
     * y el saldo de inventario a partir de los movimientos del KARDEX.
     * En UEPS, las salidas consumen primero las entradas más recientes (último elemento del array $entradas).
     *
     * @param array $KARDEX Array de movimientos de kardex.
     * @return array Array de movimientos de kardex con los campos de valor (Debe, Haber, Saldo) calculados.
     */
    public function ____________ueps($KARDEX){
        $resultado = [];
        $entradas = []; // Entradas pendientes [cantidad, precio_unitario]
        
        foreach ($KARDEX as $movimiento) {
            
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);
            $debe = 0;
            $haber = 0;

            if($cantidadMovimiento > 0){
                // Entrada: agregamos al inventario.
                // En UEPS, las entradas se agregan al final (LIFO - Last In, First Out).
                $entradas[] = [
                    'cantidad' => $cantidadMovimiento,
                    'precio_unitario' => $precioUnitario
                ];
                $debe = $cantidadMovimiento * $precioUnitario;
                $precioUnitario = $precioUnitario; // Para mostrar el costo unitario de la entrada

            } else {
                // Salida: consumimos las últimas entradas (UEPS - LIFO).
                $cantidad_salida = abs($cantidadMovimiento); 
                $precioUnitario = ""; // Para mostrar los costos unitarios de la salida

                while($cantidad_salida > 0 && count($entradas) > 0){
                    // Referencia a la ÚLTIMA entrada (índice count($entradas)-1)
                    $ultima_posicion = count($entradas) - 1;
                    $ultima = &$entradas[$ultima_posicion];
                    
                    if($ultima['cantidad'] <= $cantidad_salida){
                        // Consumo total de la última entrada
                        $haber += $ultima['cantidad'] * $ultima['precio_unitario'];
                        $cantidad_salida -= $ultima['cantidad'];
                        $precioUnitario .= $ultima['cantidad'] . ":" . $ultima['precio_unitario'] . ", ";
                        array_pop($entradas); // Eliminamos la última entrada consumida
                    } else {
                        // Consumo parcial de la última entrada
                        $haber += $cantidad_salida * $ultima['precio_unitario'];
                        $ultima['cantidad'] -= $cantidad_salida;
                        
                        if (!empty($precioUnitario)) {
                            $precioUnitario .= $cantidad_salida . ":" .$ultima['precio_unitario'];
                        }else{
                            $precioUnitario = $ultima['precio_unitario'];
                        }
                        $cantidad_salida = 0; // Salida cubierta
                    }
                }
            }

            // Existencia = stock del movimiento
            $existencia = $movimiento['stock'];

            // Saldo = sumatoria de los valores de las entradas pendientes
            $saldo = array_sum(array_map(fn($e) => $e['cantidad']*$e['precio_unitario'], $entradas));

            $resultado[] = [
                "Fecha" => $movimiento['fecha'],
                // Se asume la existencia de esta función en la clase contenedora, como en el ejemplo PEPS
                "Concepto" => $this->getConceptoKardex($movimiento['codigo']), 
                "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                "Existencia" => $existencia, 
                "C.Unit" => $precioUnitario,
                "Debe" => $debe,
                "Haber" => $haber,
                "Saldo" => $saldo,
            ];
        }

        return $resultado;
    }
        public function ____________promedio($KARDEX){
        $resultado = [];
        $entradas = []; // Entradas acumuladas [cantidad, precio_unitario]
        
        foreach ($KARDEX as $movimiento) {
            $cantidadMovimiento = floatval($movimiento['cantidad_movimiento']);
            $precioUnitario = floatval($movimiento['precio_unitario']);

            if($cantidadMovimiento > 0){
                // Entrada: agregamos al inventario
                $entradas[] = [
                    'cantidad' => $cantidadMovimiento,
                    'precio_unitario' => $precioUnitario
                ];
                $debe = $cantidadMovimiento * $precioUnitario;
                $haber = 0;
                $cUnit = $precioUnitario;
            } else {
                // Salida: usamos promedio ponderado
                $cantidad_salida = abs($cantidadMovimiento);
                $haber = 0;
                $debe = 0;

                // Calculamos el promedio ponderado actual
                $totalCantidad = array_sum(array_map(fn($e) => $e['cantidad'], $entradas));
                $totalValor = array_sum(array_map(fn($e) => $e['cantidad'] * $e['precio_unitario'], $entradas));
                $promedioUnitario = $totalCantidad > 0 ? ($totalValor / $totalCantidad) : 0;

                $haber = $cantidad_salida * $promedioUnitario;
                $cUnit = $promedioUnitario;

                // Reducimos las cantidades de las entradas proporcionalmente
                foreach ($entradas as &$entrada) {
                    if($cantidad_salida <= 0) break;

                    if($entrada['cantidad'] <= $cantidad_salida){
                        $cantidad_salida -= $entrada['cantidad'];
                        $entrada['cantidad'] = 0;
                    } else {
                        $entrada['cantidad'] -= $cantidad_salida;
                        $cantidad_salida = 0;
                    }
                }
                // Eliminamos entradas agotadas
                $entradas = array_filter($entradas, fn($e) => $e['cantidad'] > 0);
            }

            // Existencia = stock del movimiento
            $existencia = $movimiento['stock'];

            // Saldo = sumatoria de todas las entradas pendientes
            $saldo = array_sum(array_map(fn($e) => $e['cantidad']*$e['precio_unitario'], $entradas));

            $resultado[] = [
                "Fecha" => $movimiento['fecha'],
                "Concepto" => $this->getConceptoKardex($movimiento['codigo']),
                "Entrada" => $cantidadMovimiento > 0 ? $cantidadMovimiento : 0,
                "Salida" => $cantidadMovimiento < 0 ? abs($cantidadMovimiento) : 0,
                "Existencia" => $existencia, 
                "C.Unit" => $cUnit,
                "Debe" => $debe,
                "Haber" => $haber,
                "Saldo" => $saldo,
            ];
        }

        return $resultado;
    }
}



//kardex