<?php
require_once 'vendor/autoload.php';
require_once "configuraciones.php";
require_once "configuracionInicial.php";
require_once "mantenimiento.php";
require_once "compras.php";
require_once "ventas.php";
require_once "sendIvoiceEmail.php";
require_once "useVenta.php";
require_once "useCotizacion.php";
require_once "arqueoPuntoVenta.php";
require_once "pagosCompra.php";
require_once "permisos_venta_sin_stock.php";
require_once "anularCompra.php";
require_once "firmas.php";
require_once "productoUnico.php";
require_once "producto_Variante.php";
require_once "vincularConta.php";

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Si es JSON, lo uso; si no, uso $_POST
$ver = $_POST['ver'] ?? $data['ver'] ?? null;
$user_id = $_POST['user_id'] ?? $data['user_id'] ?? null;

if ($ver == "registrarResponsable") {
    $controlador = new configuracion();
    $controlador->registroResponsable($_POST['usuario'], $_POST['idempresa']);
} elseif ($ver == "registrarResponsablealmacen") {
    $controlador = new configuracion();
    $controlador->registroResponsablealmacen($_POST['idresponsable'], $_POST['almacen']);
} elseif ($ver == "registrarResponsablePuntoVenta") {
    $controlador = new configuracion();
    $controlador->registroPuntoVentaResponsable($_POST['idresponsable'], $_POST['idpuntoventa']);
} elseif ($ver == "registrarTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->registrotipoalmacen($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->editartipoalmacen($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->registroCatproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa'], $_POST['idp']);
} elseif ($ver == "editarCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->editarCatproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion'], $_POST['idp']);
} elseif ($ver == "registrarEstadoProducto") {
    $controlador = new configuracion();
    $controlador->registroEstproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarEstadoProducto") {
    $controlador = new configuracion();
    $controlador->editarEstproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarUnidadProducto") {
    $controlador = new configuracion();
    $controlador->registroUniproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarUnidadProducto") {
    $controlador = new configuracion();
    $controlador->editarUniproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->registroCaracproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->editarCaracproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarDivisa") {
    $nombre = $_POST['nombre'] ?? '';
    $tipo = $_POST['tipo'] ?? '';
    $idempresa = $_POST['idempresa'] ?? '';
    $monedasin = $_POST['monedasin'] ?? null;
    $controlador = new configuracion();
    $controlador->registroDivisa($nombre, $tipo, $idempresa, $monedasin);
} 
elseif ($ver == "editarDivisa") {
    $controlador = new configuracion();
    
    // Asignar el valor solo si existe, de lo contrario asignar null o un valor por defecto
    $monedasin = isset($_POST['monedasin']) ? $_POST['monedasin'] : null;
    
    $controlador->editarDivisa(
        $_POST['id'], 
        $_POST['nombre'], 
        $_POST['tipo'], 
        $monedasin
    );
}
 elseif ($ver == "registrarTipoCLiente") {
    $controlador = new configuracion();
    $controlador->registroTipocliente($_POST['tipo'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarTipoCLiente") {
    $controlador = new configuracion();
    $controlador->editarTipocliente($_POST['id'], $_POST['tipo'], $_POST['descripcion']);
} elseif ($ver == "registrarCanalVenta") {
    $controlador = new configuracion();
    $controlador->registroCanalVenta($_POST['canal'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarCanalVenta") {
    $controlador = new configuracion();
    $controlador->editarCanalVenta($_POST['id'], $_POST['canal'], $_POST['descripcion']);
} elseif ($ver == "registrarLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->registroLeyendaProforma($_POST['texto'], $_POST['idempresa']);
} elseif ($ver == "editarLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->editarLeyendaProforma($_POST['id'], $_POST['texto']);
} elseif ($ver == "registrarPrecioBase") {
    $controlador = new configuracion();
    $controlador->registroPrecioBase($_POST['precio'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->registroCategoriaPrecio($_POST['tipo'], $_POST['porcentaje'], $_POST['idalmacen'], $_POST['id_categoria_precios']);
} elseif ($ver == "editarCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->editarCategoriaPrecio($_POST['id'], $_POST['tipo'], $_POST['porcentaje'], $_POST['idalmacen'], $_POST['id_categoria_precios']); 
    // echo json_encode(["status" => "success" , "id" => $_POST['id'], "tipo" => $_POST['tipo'], "porcentaje" => $_POST['porcentaje'], "idalmacen" => $_POST['idalmacen'], "id_categoria_precios" => $_POST['id_categoria_precios']]);
} elseif ($ver == "editarPrecioSugerido") {
    $afectarTodosAlmacenesString = $_POST['afectarTodosAlmacenes'];

    // Convertir el string "true" o "false" a un valor booleano (true o false)
    $afectarTodosAlmacenesBooleano = ($afectarTodosAlmacenesString === "true");

    $controlador = new configuracion();

    // CORRECCIÓN: Usar $afectarTodosAlmacenesBooleano
    $controlador->editarPrecioSugerido(
        $_POST['id'], 
        $_POST['precio'],
        $afectarTodosAlmacenesBooleano, // <-- ¡Corregido el nombre!
        $_POST['idproducto']
    );
} elseif ($ver == "registrarLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->registroLeyendaFactura($_POST['nombre'], $_POST['codigosin'], $_POST['idempresa']);
} elseif ($ver == "editarLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->editarLeyendaFactura($_POST['id'], $_POST['nombre'], $_POST['codigosin']);
} elseif ($ver == "registrarMetodoPagoFactura") {
    $controlador = new configuracion();
    $controlador->registroMetodoPagoFactura($_POST['nombre'], $_POST['codigosin'] ?? '', $_POST['idempresa']);
} elseif ($ver == "editarMetodoPagoFactura") {
    $controlador = new configuracion();
    $controlador->editarMetodoPagoFactura($_POST['id'], $_POST['nombre'], $_POST['codigosin']);
} elseif ($ver == "registrarParametro") {
    $controlador = new configuracion();
    $controlador->registroParametro($_POST['nombre'], $_POST['valor'], $_POST['color'],$_POST['tipo'], $_POST['idempresa'], $_POST['descripcion']);
} elseif ($ver == "editarParametro") {
    $controlador = new configuracion();
    $controlador->editarParametro($_POST['id'], $_POST['nombre'], $_POST['valor'], $_POST['color'],$_POST['tipo'], $_POST['descripcion']);
} elseif ($ver == "registrarAlmacen") {
    $controlador = new mantenimiento();
    $controlador->registraralmacen($_POST['nombre'], $_POST['direccion'], $_POST['telefono'], $_POST['email'], $_POST['tipoalmacen'], $_POST['stockmin'], $_POST['stockmax'], $_POST['sucursal'], $_POST['idempresa'], $_POST['codigo']);
} elseif ($ver == "editarAlmacen") {
    $controlador = new mantenimiento();
    $controlador->editaralmacen($_POST['id'], $_POST['nombre'], $_POST['direccion'], $_POST['telefono'], $_POST['email'], $_POST['tipoalmacen'], $_POST['stockmin'], $_POST['stockmax'], $_POST['sucursal'], $_POST['codigo']);
} elseif ($ver == "registrarPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->registroPuntoVenta($_POST['nombre'], $_POST['descripcion'], $_POST['idalmacen'], $_POST['idempresa']);
} elseif ($ver == "editarPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->editarPuntoVenta($_POST['id'], $_POST['nombre'], $_POST['descripcion'], $_POST['tipo']);
} elseif ($ver == "crearPuntoVentaFacturacion") {
    $controlador = new mantenimiento();
    $controlador->crarPuntoVentaFactura(json_decode($_POST['puntoventaJSON'], true), $_POST['codigosucursal'], $_POST['token'], $_POST['tipof'], $_POST['id'], $_POST['tipo']);
}elseif ($ver == "registrarProducto"){
    try {
        $controlador = new mantenimiento();
        $carpetaDestino = __DIR__ . "/imagen/";

        if (!is_dir($carpetaDestino)) {
            mkdir($carpetaDestino, 0775, true);
        }

        if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            $mime = mime_content_type($_FILES['imagen']['tmp_name']);

            if (!in_array($extension, ['jpg', 'jpeg', 'png']) || !in_array($mime, ['image/jpeg', 'image/png'])) {
                throw new Exception("Formato de imagen no permitido. Solo JPG y PNG.");
            }

            $nombreLimpio = preg_replace('/[^a-zA-Z0-9_-]/', '_', $_POST['nombre']);
            $nombreArchivo = $nombreLimpio . rand(10000, 999999) . ".jpg";
            $url = "imagen/" . $nombreArchivo;

            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpetaDestino . $nombreArchivo)) {
                throw new Exception("Error al guardar la imagen en el servidor.");
            }
        } else {
            if (empty($_POST['imagen'])) {
                //throw new Exception("Debe proporcionar una imagen.");
            }
            $url = null;
        }
         
        $codigoSin = $_POST['codigosin'] ?? '';
        $codigoactividad = $_POST['codigoactividad'] ?? '';
        $unidadsin = $_POST['unidadsin'] ?? '';
        $codigoNandina = $_POST['codigoNandina'] ?? '';
            
            
        $controlador->registroProducto(
            $_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['codigobarras'],
            $_POST['categoria'], $_POST['medida'], $_POST['estadoproductos'], $_POST['unidad'],
            $_POST['caracteristica'], $url, $codigoSin, $codigoactividad,
            $unidadsin, $codigoNandina, $_POST['idempresa']
        );

    } catch (Exception $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
} elseif ($ver == "editarProducto") {
    try {
        $controlador = new mantenimiento();
        $carpetaDestino = __DIR__ . "/imagen/";

        if (!is_dir($carpetaDestino)) {
            mkdir($carpetaDestino, 0775, true);
        }

        if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            $mime = mime_content_type($_FILES['imagen']['tmp_name']);

            if (!in_array($extension, ['jpg', 'jpeg', 'png']) || !in_array($mime, ['image/jpeg', 'image/png'])) {
                throw new Exception("Formato de imagen no permitido. Solo JPG y PNG.");
            }

            $nombreLimpio = preg_replace('/[^a-zA-Z0-9_-]/', '_', $_POST['nombre']);
            $nombreArchivo = $nombreLimpio . rand(10000, 999999) . ".jpg";
            $url = "imagen/" . $nombreArchivo;

            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpetaDestino . $nombreArchivo)) {
                throw new Exception("Error al guardar la imagen en el servidor.");
            }
        } else {
            
            $url = $_POST['imagen'];
        }   
        // echo json_encode([$_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['codigobarras'], $_POST['categoria'], $_POST['medida'], $_POST['estadoproductos'], $_POST['unidad'], $_POST['caracteristica'], $url, $_POST['codigosin'], $_POST['codigoactividad'], $_POST['unidadsin'],$_POST['codigoNandina']]);
         $controlador->editarProducto($_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['codigobarras'], $_POST['subcategoria'] == 0 ? $_POST['categoria']:$_POST['subcategoria'], $_POST['medida'], $_POST['estadoproductos'], $_POST['unidad'], $_POST['caracteristica'], $url, $_POST['codigosin']??'', $_POST['codigoactividad']??'', $_POST['unidadsin']??'',$_POST['codigoNandina']??'');
    } catch (Exception $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
} elseif ($ver == "registrarProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->registroProductoAlmacen($_POST['stockmin'], $_POST['stockmax'], $_POST['detalle'], json_decode($_POST['jsonProductos'], true));
} elseif ($ver == "editarProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->editarProductoAlmacen($_POST['id'], $_POST['detalle'], $_POST['stockmin'], $_POST['stockmax']);
} elseif ($ver == "registrarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->registroMovimiento($_POST['fecha'], $_POST['almacendestino'], $_POST['descripcion'], $_POST['almacenorigen'], $_POST['idusuario']);
} elseif ($ver == "editarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->editarMovimiento($_POST['id'],$_POST['fecha'], $_POST['almacendestino'], $_POST['descripcion'], $_POST['almacenorigen'], $_POST['idusuario']);
} 
elseif ($ver == "registrarDetalleMovimiento") {
    $controlador = new mantenimiento();
    $data = [
        'cantidad'           => $_POST['cantidad'] ?? null,
        'idmovimiento'       => $_POST['idmovimiento'] ?? null,
        'idproductoalmacen'  => $_POST['idproductoalmacen'] ?? null,
        'idProductoVariante' => $_POST['idProductoVariante'] ?? null
    ];
    $controlador->registroDetalleMovimiento($data);
}
elseif ($ver == "editarDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->actualizarDetalleMovimiento($_POST['id'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarcampana") {
    $controlador = new mantenimiento();
    $controlador->registroCampaña($_POST['campana'], $_POST['fechai'], $_POST['fechaf'], $_POST['porcentaje'], $_POST['idalmacen'], $_POST['idusuario']);
} elseif ($ver == "editarcampaña") {
    $controlador = new mantenimiento();
    $controlador->editarCampaña($_POST['id'],$_POST['campana'], $_POST['fechai'], $_POST['fechaf'], $_POST['porcentaje'], $_POST['idalmacen']);
} elseif ($ver == "registrocategoriacampaña") {
    $controlador = new mantenimiento();
    $controlador->registrocategoriaprecio($_POST['idcategoriaprecio'], $_POST['idcampaña'], $_POST['idempresa']);
} 
elseif ($ver == "registrarpreciocampaña") {
    $controlador = new mantenimiento();
    $controlador->registrarPrecioCampaña(
        $_POST['idproducto'],
        $_POST['precio'],
        $_POST['idcampana'],
        $_POST['idusuario']
    );
}
elseif ($ver == "editarPreciocampana") {
    $controlador = new mantenimiento();
    $controlador->editarPreciocampaña(
        $data['id_detalle_campanas'],
        $data['idproducto'],
        $data['precio'],
        $data['idcategoriacampaña'],
        
    );
}
elseif ($ver == "registrarProductoPrecioCampana") {
    $controlador = new mantenimiento();
    $controlador->registrar_producto_precio_campana(
        $data['idproducto'],
        $data['precio'],
        $data['idcategoriacampaña'],
        
    );
}

elseif ($ver == "registrarProveedor") {
    $controlador = new compras();

    $controlador->registroproveedor(
        $_POST['nombre'] ?? '',
        $_POST['codigo'] ?? '',
        $_POST['nit'] ?? '',
        $_POST['detalle'] ?? '',
        $_POST['direccion'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['movil'] ?? '',
        $_POST['email'] ?? '',
        $_POST['web'] ?? '',
        $_POST['pais'] ?? '',
        $_POST['ciudad'] ?? '',
        $_POST['zona'] ?? '',
        $_POST['contacto'] ?? '',
        $_POST['idempresa'] ?? 0
    );
} 
elseif ($ver == "editarProveedor") {
    $controlador = new compras();

    $controlador->editarregistroproveedor(
        $_POST['id'] ?? 0,
        $_POST['nombre'] ?? '',
        $_POST['codigo'] ?? '',
        $_POST['nit'] ?? '',
        $_POST['detalle'] ?? '',
        $_POST['direccion'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['mobil'] ?? '', // o mobil, según el nombre real
        $_POST['email'] ?? '',
        $_POST['web'] ?? '',
        $_POST['pais'] ?? '',
        $_POST['ciudad'] ?? '',
        $_POST['zona'] ?? '',
        $_POST['contacto'] ?? ''
    );
}
elseif ($ver == "registrarPedido") {
    $controlador = new compras();
    $controlador->registroPedido($_POST['fecha'], $_POST['observacion'], $_POST['almacenorigen'], $_POST['tipo'], $_POST['almacendestino'], $_POST['idusuario'], $_POST['idempresa']);
} elseif ($ver == "editarPedido") {
    $controlador = new compras();
    $controlador->editarPedido($_POST['id'],$_POST['fecha'], $_POST['observacion'], $_POST['almacenorigen'], $_POST['tipo'], $_POST['almacendestino']);
}elseif ($ver == "uploadRecibo") {
    $controlador = new compras(); // Or new FilesController() if you create one
    $controlador->uploadRecibo(); // This method directly handles $_POST and $_FILES
} elseif ($ver == "getRecibo") {
    $controlador = new compras(); // Or new FilesController()
    // Assuming getRecibo expects idpedido from GET or POST
    $idpedido = isset($_REQUEST['idpedido']) ? $_REQUEST['idpedido'] : null;
    $controlador->getRecibo($idpedido);
} elseif ($ver == "deleteRecibo") {
    $controlador = new compras(); // Or new FilesController()
    // Assuming deleteRecibo expects idpedido from GET or POST
    $idpedido = isset($_REQUEST['idpedido']) ? $_REQUEST['idpedido'] : null;
    $controlador->deleteRecibo($idpedido);
}
// --- NEW ENDPOINT FOR MOVEMENT PHOTOS ---
elseif ($ver == "uploadFotoMovimiento") {
    $controlador = new compras(); // Or new FilesController()
    $controlador->uploadFotoMovimiento(); // This method directly handles $_POST and $_FILES
}
elseif ($ver == "registrarDetallePedido") {
    $controlador = new compras();
    $idProductoVariante = !empty($_POST['idProductoVariante']) ? $_POST['idProductoVariante'] : null;
    $controlador->registroDetallePedido($_POST['idpedido'], $_POST['cantidad'], $_POST['idproductoalmacen'], $idProductoVariante);
} 
elseif ($ver == "editardetallepedido") {
    $controlador = new compras();
    $controlador->editarDetallePedido($_POST['id'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarCompra") {
    $controlador = new compras();
    $res = $controlador->registroCompra($_POST);
    echo json_encode($res);
} elseif ($ver == "editarCompra") {
    $controlador = new compras();
    $controlador->editarCompra($_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['proveedor'], $_POST['factura']);
} 
elseif ($ver == "registrarDetalleCompra") {
    $controlador = new compras();
    $data = [
        'precio'            => $_POST['precio'] ?? null,
        'cantidad'          => $_POST['cantidad'] ?? null,
        'idingreso'         => $_POST['idingreso'] ?? null,
        'productoalmacen'   => $_POST['idproductoalmacen'] ?? null,
        'registrarProUnico' => $_POST['productoUnico'] ?? false,
        'idProductoVariante' => $_POST['idProductoVariante'] ?? null
    ];
    $controlador->registroDetalleCompra($data);
}
elseif ($ver == "editarDetalleCompra") {
    $controlador = new compras();
    $controlador->editardetalleCompra($_POST['id'], $_POST['precio'], $_POST['cantidad'], $_POST['idproductoalmacen']);
}
 elseif ($ver == "vincular_orden_produccion_pedido") {
    $controlador = new compras();
    $controlador->concluir_pedido($_POST['id'], $_POST['estado']);
}
 
elseif ($ver == "registrarCliente") {
      $controlador = new ventas();
    $controlador->registrocliente(
        $_POST['nombre'] ?? '',
        $_POST['nombrecomercial'] ?? '',
        $_POST['canalventa'] ?? '',
        $_POST['tipocliente'] ?? '',
        $_POST['tipodocumento'] ?? '',
        $_POST['nrodocumento'] ?? '',
        $_POST['detalle'] ?? '', // Aquí está el campo que lanza el warning
        $_POST['direccion'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['movil'] ?? '',
        $_POST['email'] ?? '',
        $_POST['web'] ?? '',
        $_POST['pais'] ?? '',
        $_POST['ciudad'] ?? '',
        $_POST['zona'] ?? '',
        $_POST['contacto'] ?? '',
        $_POST['idempresa'] ?? '',
        null,
        $_POST['almacen'] ?? '',
    );
}elseif ($ver == "registroClienteMinimal") {
      $controlador = new ventas();
    $controlador->registroClienteMinimal(
        $_POST['nombre'] ?? '',
        $_POST['nombrecomercial'] ?? '',
        $_POST['canalventa'] ?? '',
        $_POST['tipocliente'] ?? '',
        $_POST['tipodocumento'] ?? '',
        $_POST['nrodocumento'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['idempresa'] ?? ''
    );
} 
elseif ($ver == "editarCliente") {
    $controlador = new ventas();
   
    $controlador->editarcliente(
    $_POST['id']              ?? '',
    $_POST['nombre']          ?? '',
    $_POST['nombrecomercial'] ?? '',
    $_POST['canalventa']      ?? '',
    $_POST['tipocliente']     ?? '',
    $_POST['tipodocumento']   ?? '',
    $_POST['nrodocumento']    ?? '',
    $_POST['detalle']         ?? '',
    $_POST['direccion']       ?? '',
    $_POST['telefono']        ?? '',
    $_POST['movil']           ?? '',
    $_POST['email']           ?? '',
    $_POST['web']             ?? '',
    $_POST['pais']            ?? '',
    $_POST['ciudad']          ?? '',
    $_POST['zona']            ?? '',
    $_POST['contacto']        ?? '',
    $_POST['almacen']         ?? ''
);
} 
elseif ($ver == "registrarSucursal") {
    $controlador = new ventas();
    $controlador->registrosucursal($_POST['nombre'], $_POST['telefono'], $_POST['direccion'], $_POST['idcliente']);
} elseif ($ver == "editarSucursal") {
    $controlador = new ventas();
    $controlador->editarsucursal($_POST['id'], $_POST['nombre'], $_POST['telefono'], $_POST['direccion']);
} elseif ($ver == "registroVenta") {
    $controlador = new UseVEnta();
    $controlador->registroVenta($_POST['fecha'], $_POST['tipoventa'], $_POST['tipopago'], $_POST['idcliente'], $_POST['sucursal'], $_POST['canal'], $_POST['idempresa'], $_POST['idusuario'], json_decode($_POST['jsonDetalles'], true));
} 
 elseif ($ver === "registrarCotizacion") {
    header('Content-Type: application/json');

    try {
        // Validar parámetros obligatorios
        $requeridos = ['tipo_operacion', 'idcliente', 'idsucursal', 'listaProductos'];

        foreach ($requeridos as $param) {
            // 1. Primero verificamos si el parámetro ni siquiera fue enviado
            if (!isset($_POST[$param])) {
                throw new Exception("Falta el parámetro obligatorio: $param");
            }

            // 2. Validación especial solo para 'tipo_operacion'
            if ($param === 'tipo_operacion') {
                // Solo falla si está realmente vacío (cadena vacía)
                if ($_POST[$param] === '') {
                    throw new Exception("El parámetro obligatorio $param no puede estar vacío");
                }
            } else {
                // 3. El resto de los campos se siguen validando con empty() como antes
                if (empty($_POST[$param])) {
                    throw new Exception("Falta el parámetro obligatorio o está vacío: $param");
                }
            }
        }

        // Extraer y validar tipo de operación
        $tipoOperacion = intval($_POST['tipo_operacion']);
        if (!in_array($tipoOperacion, [1, 0])) {
            throw new Exception("El tipo de operación debe ser 1 (venta) o 0 (cotización).");
        }

        // Decodificar lista de productos
        $listaProductos = json_decode($_POST['listaProductos'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($listaProductos)) {
            throw new Exception("El formato de 'listaProductos' no es un JSON válido.");
        }

        if (!isset($listaProductos['listaProductos']) || !is_array($listaProductos['listaProductos'])) {
            throw new Exception("El campo 'listaProductos' no contiene una lista válida de productos.");
        }

        // Extraer otros datos
        $idCliente  = $_POST['idcliente'];
        $idSucursal = $_POST['idsucursal'];

        // Llamar al controlador
        $controlador = new UseCotizacion();
        $respuesta = $controlador->registroCotizacion($tipoOperacion, $idCliente, $idSucursal, $listaProductos);
        echo $respuesta;

    } catch (Exception $e) {
        echo json_encode([
            "estado"  => "error",
            "mensaje" => $e->getMessage()
        ]);
    }
}

 elseif ($ver == "registrarInventarioExterno") {
    $controlador = new ventas();
    
    $controlador->registroinventarioexterno($_POST['fecha'], $_POST['idcliente'], $_POST['sucursal'], $_POST['observacion'], $_POST['almacen'], $_POST['idusuario'],$_POST['latitud'],$_POST['longitud']);
} elseif ($ver == "editarInventarioExterno") {
    $controlador = new ventas();
    $controlador->editarinventarioexterno($_POST['id'], $_POST['fecha'], $_POST['idcliente'], $_POST['sucursal'], $_POST['observacion'], $_POST['almacen']);
} elseif ($ver == "registrarDetalleInvexterno") {
    $controlador = new ventas();
    $controlador->registrodetalleinventarioexterno($_POST['idproductoalmacen'], $_POST['fecha'], $_POST['cantidad'], $_POST['idinventarioexterno']);
} elseif ($ver == "editarDetalleInvexterno") {
    $controlador = new ventas();
    $controlador->editardetalleinventarioexterno($_POST['id'], $_POST['idproductoalmacen'], $_POST['fecha'], $_POST['cantidad']);
}
elseif ($ver == "registroPagoCuentaxCobrar") {
    $controlador = new ventas();
    $url = "";

    // 1. Manejo de archivos (Imagen o PDF)
    if (!empty($_FILES['imagen']['name'])) {
        $destination_dir = "imagen/";
        if (!file_exists($destination_dir)) mkdir($destination_dir, 0777, true);
        
        $url = $destination_dir . "PagoCXC" . rand(10000, 999999) . ".jpg";
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $url)) {
            echo json_encode(["estado" => "error", "mensaje" => "la imagen no se pudo mover"]);
            exit;
        }
    } else {
        $url = $_POST["urlpdf"] ?? "";
    }

    // 2. Preparar el ARRAY escalable
    // Aquí mapeamos lo que llega por POST a las llaves que usará tu controlador
    $datosRegistro = [
        'fecha'         => $_POST['fecha'] ?? null,
        'ncuotas'       => $_POST['ncuotas'] ?? 0,
        'interes'       => 0, // El valor que tenías fijo
        'total'         => $_POST['total'] ?? 0,
        'saldo'         => $_POST['saldo'] ?? 0,
        'idestadocobro' => $_POST['idestadocobro'] ?? null,
        'idcaja_banco'  => $_POST['idcaja_banco'] ?? null, // ¡IMPORTANTE!
        'idempresa'     => $_POST['idempresa'] ?? null, // ¡IMPORTANTE!
        'url_comprobante' => $url
    ];

    // 3. Pasar el array a la función
    $res = $controlador->registropagoscredito($datosRegistro);
    echo json_encode($res);
} 
elseif ($ver == "editarPagoCuentaxCobrar") {
    $controlador = new ventas();
    $url = "";

    // 1. Manejo de archivos (Imagen o PDF)
    // Si se sube una nueva imagen, la guardamos y reemplazamos la anterior
    if (!empty($_FILES['imagen']['name'])) {
        $destination_dir = "imagen/";
        if (!file_exists($destination_dir)) mkdir($destination_dir, 0777, true);
        
        $url = $destination_dir . "PagoCXC" . rand(10000, 999999) . ".jpg";
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $url)) {
            echo json_encode(["estado" => "error", "mensaje" => "la imagen no se pudo mover"]);
            exit;
        }
    } else {
        // Si no se sube nueva imagen, usamos la URL existente enviada por POST
        $url = $_POST["urlpdf"] ?? "";
    }

    // 2. Preparar el ARRAY con los datos de edición
    $datosEdicion = [
        'iddetalle_cobro'   => $_POST['iddetalle_cobro'] ?? null,   // Identificador del pago a editar (obligatorio)
        'fecha'             => $_POST['fecha'] ?? null,
        'ncuotas'           => $_POST['ncuotas'] ?? 0,
        'valorcuota'        => $_POST['valorcuota'] ?? 0,           // Valor unitario de la cuota (puede ser opcional)
        'total'             => $_POST['total'] ?? 0,                // Nuevo monto total pagado
        'saldo'             => $_POST['saldo'] ?? 0,                // Puede ser ignorado por la función (se recalcula)
        'idestadocobro'     => $_POST['idestadocobro'] ?? null,     // Para actualizar el estado de cobro si es necesario
        'idcaja_banco'      => $_POST['idcaja_banco'] ?? null,      // Nueva caja o banco (null para quitar)
        'idempresa'         => $_POST['idempresa'] ?? null,
        'url_comprobante'   => $url
    ];

    // 3. Llamar a la función de edición del controlador
    $res = $controlador->editarpagoscredito($datosEdicion);
    echo json_encode($res);
}
elseif ($ver == "registrarmerma") {
    $controlador = new ventas();
     $datosRegistro = [
        'almacen'         => $_POST['almacen'] ?? null,
        'fecha'           => $_POST['fecha'] ?? 0,
        'descripcion'     => $_POST['descripcion'] ?? 0,
        'idusuario'       => $_POST['idusuario'] ?? "",
        'idempresa'       => $_POST['idempresa'] ?? "",
        'idcaja_banco'    => $_POST['idcaja_banco'] ?? null,
        'nombrealmacen'   => $_POST['nombrealmacen'] ?? null,
        
    ];
    $res = $controlador->registromerma($datosRegistro);
    echo json_encode($res);
} elseif ($ver == "actualizarmerma") {
    $controlador = new ventas();
    $controlador->editarmerma($_POST['id'],$_POST['almacen'], $_POST['fecha'], $_POST['descripcion']);
} 
elseif ($ver == "registrarDetallemerma") {
    $controlador = new ventas();
    $res = $controlador->registrodetallemerma($data);
    echo $res;
} 
elseif ($ver == "editarDetallemerma") {
    $controlador = new ventas();
    $controlador->editardetallemerma($_POST['id'], $_POST['idproductoalmacen'], $_POST['cantidad']);
} elseif ($ver == "registrarrobo") {
    $controlador = new ventas();
    
    $datosRegistro = [
        'almacen'         => $_POST['almacen'] ?? null,
        'fecha'       => $_POST['fecha'] ?? 0,
        'descripcion'         => $_POST['descripcion'] ?? 0,
        'idusuario'         => $_POST['idusuario'] ?? "",
        'idempresa'         => $_POST['idempresa'] ?? "",
        'idcaja_banco'         => $_POST['idcaja_banco'] ?? null,
        'nombrealmacen'         => $_POST['nombrealmacen'] ?? null,
        
    ];
    $res = $controlador->registrorobo($datosRegistro);
    echo json_encode($res);
} elseif ($ver == "editarrobo") {
    $controlador = new ventas();
    $controlador->editarrobo($_POST['id'],$_POST['almacen'], $_POST['fecha'], $_POST['descripcion']);
} elseif ($ver == "registrarDetallerobos") {
    $controlador = new ventas();
    $respuesta = $controlador->registrodetallerobo($data);
    

    echo $respuesta;
} elseif ($ver == "editarDetallerobos") {
    $controlador = new ventas();
    $controlador->editardetallerobo($_POST['id'], $_POST['idproductoalmacen'], $_POST['cantidad']);
} elseif ($ver == "registroDevolucion") {
    $controlador = new ventas();
    $datosRegistro = [
        'motivo'          => $_POST['motivo'] ?? null,
        'idventa'         => $_POST['idventa'] ?? 0,
        'idmd5U'       => $_POST['idusuario'] ?? 0,
        'tipo_dev'        => $_POST['tipo_dev'] ?? "",
        'idmd5E'       => $_POST['idempresa'] ?? "",
        'idcaja_banco'    => $_POST['idcaja_banco'] ?? null,
        'nombrealmacen'   => $_POST['nombrealmacen'] ?? null,
    ];

    $res = $controlador->registrodevolucion($datosRegistro);
    echo json_encode($res);
} elseif ($ver == "actualizarDetalleDev") {
    $controlador = new ventas();
    $controlador->editardevolucion($_POST['id'], $_POST['cantidad'], $_POST['perdida'], $_POST['cantidadperdida']);
}elseif ($ver == "importar_excel_cliente") { 
    $controlador = new ventas();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_cliente($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}
elseif ($ver == "importar_excel_proveedor") { 
    $controlador = new compras();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_proveedor2($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}
elseif ($ver == "importar_excel_productos") { 
    $controlador = new mantenimiento();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_productos($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}elseif ($ver == "control") {
    $controlador = new ConfiguracionInicial();
    $controlador->control($_POST['empresa'],$_POST['sucursal'],$_POST['usuario'], $_POST['idrubro']);
}
elseif($ver == "subir_pdf"){
    $controlador = new ConfiguracionInicial();
   if( isset($_FILES['file'])){
        $targetDir = __DIR__ . '/pdfs/';
        $targetFile = $targetDir . basename($_FILES['file']['name']);
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo']);
        }
   }
}
elseif($ver == "enviar_factura_email"){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Method Not Allowed
        echo json_encode(['estado' => 'error', 'message' => 'Método no permitido. Utiliza POST.']);
        exit();
    }

    // Validar que todos los datos necesarios estén presentes
    if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK ||
        !isset($_POST['recipientEmail']) || !isset($_POST['invoiceNumber']) ||
        !isset($_POST['clientName']) || !isset($_POST['nombreEmpresa']) ||
        !isset($_POST['direccionEmpresa']) || !isset($_POST['telefonoEmpresa']) ||
        !isset($_POST['idempresa'])) { // Asegúrate de que todos los parámetros necesarios estén enviados
        
        http_response_code(400); // Bad Request
        echo json_encode(['estado' => 'error', 'message' => 'Faltan datos requeridos para enviar el correo o el PDF está ausente/dañado.']);
        exit();
    }

    // Instanciar la clase y llamar al método precio
    $controlador = new SendInvoiceEmail();
    $controlador->sendEmail(
        $_POST['recipientEmail'],
        $_POST['invoiceNumber'],
        $_POST['clientName'],
        $_POST['nombreEmpresa'],
        $_POST['direccionEmpresa'],
        $_POST['telefonoEmpresa'],
        $_POST['idempresa']  
    );
}
elseif ($ver == "facturar") {
    $controlador = new UseCotizacion();
    $controlador->facturar($_POST['idcotizacion'],$_POST['fecha'], $_POST['tipoventa'], $_POST['tipopago'],$_POST['idcliente'], $_POST['idsucursal'],$_POST['canalventa'],$_POST['idempresa'],$_POST['idusuario'],json_decode($_POST['jsonDetalle'],true));
}
elseif ($ver == "registrarCierre") {
    $controlador = new ArqueoPuntoVenta(); 
    $controlador->registrarCierre(
        $data['idempresa'],
        $data['idusuario'], 
        $data['fechaInicio'], 
        $data['fechaFin'], 
        $data['puntoVenta'],
        $data['caja'], 
        $data['totalesPorMetodo'], 
        $data['totalesPorMetodoCotizacion'], 
        $data['denominaciones'], 
        $data['observacion']
    );
}
elseif ($ver == "AutorizacionCierre") {
    $controlador = new ArqueoPuntoVenta(); 
    $controlador->AutorizacionCierre($data);
  
    
}
elseif ($ver == "registrarCompraCredito") {
    $controlador = new PagosCompra(); 
    $controlador->registrarCompraCredito($data);
}
elseif ($ver == "RegistrarPagos"){
    $controlador = new PagosCompra();
    $controlador->handleRegistrarPago($_POST['id_cuota']);
}
elseif ($ver == "pruebaVenta"){
    $controlador = new UseVEnta();
    $controlador->registroPrueba($data);
}
elseif ($ver == "registrarNotaCreditoDebito"){
    $controlador = new Nota_Debito_Credito();
    $controlador->registrarNotaCreditoDebito($data);
}
elseif ($ver == "registrarSaldo"){
    $controlador = new Kardex();
    $controlador->registrarSaldo($data);
}
elseif ($ver == "editarSaldo") {
    $controlador = new Kardex();
    $ok = $controlador->editarSaldo($data);
    echo json_encode(["success" => $ok]);
}
elseif ($ver == "cambiarTipoKardex") {
    $controlador = new Kardex();
    $controlador->cambiarTipoKardex($data['idempresa'], $data['tipo']);
}
elseif ($ver == "facturarjson") {
    $controlador = new UseCotizacion();
    $controlador->facturarjson($data);
}
elseif ($ver == "crearCategoriaPrecio") {
    $controlador = new UseCategoriaPrecio();
    $controlador->crearCategoriaPrecio($data);
}
elseif ($ver == "editarCategoriaPrecioNuevo") {
    $controlador = new UseCategoriaPrecio();
    $controlador->editarCategoriaPrecio($data['id'],$data);
}
elseif ($ver == "editarCategoriaPrecioNuevo") {
    $controlador = new UseCategoriaPrecio();
    $controlador->editarCategoriaPrecio($data['id'],$data);
}
elseif ($ver == "crearOperaciones") {
    $controlador = new configuracion();
    $controlador->crearOperaciones($data);
}
elseif ($ver == "actualizarOperacion") {
    $controlador = new configuracion();
    $controlador->actualizarOperacion($data);
}
elseif ($ver == "unirTodoslosDetallesPedidos") {
    $controlador = new mantenimiento();
    $controlador->unirTodoslosDetallesPedidos($data['idsPedido']);
}
elseif ($ver == "unirTodoslosPedidos") {
    $controlador = new mantenimiento();
    $controlador->unirTodoslosPedidos($data['idsPedido']);
}
elseif ($ver == "cambiarestadopedidoOptimizado") {
    $controlador = new mantenimiento();
    $controlador->cambiarestadopedidoOptimizado($data['idsPedido'], $data['estado'], $data['idUsuarioMd5']);
}
if ($ver == "crearSolicitudPermiso") {
    $controlador = new PermisosVentaSinStock();
    echo $controlador->crearSolicitudPermiso($data);

} elseif ($ver == "aprobarRechazarSolicitud") {
    $controlador = new PermisosVentaSinStock();
    echo $controlador->aprobarRechazarSolicitud($data);

} 
elseif ($ver == "consumirPermiso") {
    $controlador = new PermisosVentaSinStock();
    echo $controlador->consumirPermiso($data);

}
elseif ($ver == "registrarConfiguracionInicial") {
    $controlador = new ConfiguracionInicial();
    $controlador->registrarConfiguracionInicial(0,$data['descripcion'],$data['id_empresa_md5']);

}
// ARCHIVO: endpoint.php
elseif ($ver == "authPusher") {
    ob_clean(); // Elimina cualquier espacio en blanco accidental
    header('Content-Type: application/json');

    $controlador = new SocketPusher();
    $channel_name = $_POST['channel_name'] ?? null;
    $socket_id = $_POST['socket_id'] ?? null;
    $user_id = $_POST['user_id'] ?? null;

    // IMPORTANTE: Solo un echo, y debe ser el que genera la librería de Pusher
    echo $controlador->authPusher($channel_name, $socket_id, $user_id);
    exit; 
}

elseif ($ver == "crearSolicitudAnulacion") {
    $controlador = new AnularCompra();
    echo $controlador->crearSolicitud($data); 
}
 elseif ($ver == "procesarSolicitudAnulacion") {
    $controlador = new AnularCompra();
    echo $controlador->procesarSolicitud($data);
}
 elseif ($ver == "anularCompraDirecta") {
    $controlador = new AnularCompra();
    echo $controlador->anularCompraDirecta($data);
}
 elseif ($ver == "enlazarFirma") {
    $controlador = new ConfiguracionFirma();
    $controlador->enlazarFirma($data);
}
 elseif ($ver == "ImportarInventarioProductoVarianteExcel") {
    $controlador = new ProductoVariante();
    $controlador->cargarDesdeExcel();
}
 elseif ($ver == "ImportarInventarioProductoVarianteDesdeCompra") {
    $controlador = new ProductoVariante();
    $controlador->importarCompraDesdeCSV();
}
 elseif ($ver == "VincularOperacionesContabilidad") {
    $controlador = new VincularConta();
    $controlador->VincularOperacionesContabilidad($data);
}
elseif ($ver == "subirFirmaUsuario") {
    try {
        $controlador = new ConfiguracionFirma();
        $carpetaDestino = __DIR__ . "/imagen/firmas/";

        if (!is_dir($carpetaDestino)) {
            mkdir($carpetaDestino, 0775, true);
        }

        if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $tmpPath = $_FILES['imagen']['tmp_name'];
            $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            
            // 1. Crear el recurso de imagen según el tipo
            if ($extension === 'png') {
                $srcImage = imagecreatefrompng($tmpPath);
                // Mantener transparencia si es necesario, o convertir a fondo blanco
                imagepalettetotruecolor($srcImage);
            } else {
                $srcImage = imagecreatefromjpeg($tmpPath);
            }

            // 2. REDIMENSIONAR (Opcional pero recomendado para firmas)
            $anchoDeseado = 400; // Suficiente para un PDF
            $anchoOriginal = imagesx($srcImage);
            $altoOriginal = imagesy($srcImage);
            $altoDeseado = ($altoOriginal / $anchoOriginal) * $anchoDeseado;

            $imagenDestino = imagecreatetruecolor($anchoDeseado, $altoDeseado);
            
            // Copiar y redimensionar
            imagecopyresampled($imagenDestino, $srcImage, 0, 0, 0, 0, $anchoDeseado, $altoDeseado, $anchoOriginal, $altoOriginal);

            // 3. GUARDAR CON COMPRESIÓN
            $nombreArchivo = "FIRMA_" . rand(100, 99999) . ".jpg";
            $rutaCompleta = $carpetaDestino . $nombreArchivo;
            
            // Guardar como JPG con calidad 60 (es muy ligero y se ve bien)
            imagejpeg($imagenDestino, $rutaCompleta, 60); 

            // Liberar memoria
            imagedestroy($srcImage);
            imagedestroy($imagenDestino);

            $url = "imagen/firmas/" . $nombreArchivo;

        } else {
            $url = $_POST['imagen'];
        }

        $controlador->registrarFirmaResponsable($_POST['idcliente'], $url);

    } catch (Exception $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
}
elseif ($ver == "actualizarCodigoUnico") {
    $controlador = new ProductoUnico();
   
    $res = $controlador->actualizarCodigoIndividual($_POST['id'],$_POST['codigo']);

    echo $res;
}
elseif ($ver == "registrarDevolucioneProductoUnico") {
    $controlador = new ProductoUnico();
   
    $res = $controlador->registrarDevolucioneProductoUnico($data);

    echo $res;
}
elseif ($ver == "actualizarDevolucioneProductoUnico") {
    $controlador = new ProductoUnico();
   
    $res = $controlador->actualizarDevolucioneProductoUnico($data);

    echo $res;
}
elseif ($ver == "importar_excel_precios_base") { 
    $controlador = new configuracion();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name'];
        
        // Ejecutamos la función y guardamos el retorno
        $res = $controlador->importar_excel_precios_base($archivo);
        
        header('Content-Type: application/json');
        echo json_encode($res);
        
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}

elseif ($ver == "editarCotizacion") {
    $controlador = new UseCotizacion();
    $controlador->editarCotizacion($data);
}

elseif ($ver == "eliminarCotizacion") {
    $controlador = new UseCotizacion();
    $controlador->eliminarCotizacion($id);
}
elseif ($ver == "eliminarProductosMasivo") {
    $controlador = new mantenimiento();
    $ids = $data['ids'] ?? []; 
    $controlador->eliminarProductosMasivo($ids);
}
elseif ($ver == "registrarProductoVariante") {
    // Leer datos JSON o de formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $data = !empty($input) ? $input : $_POST;
    $controlador = new ProductoVariante();

    try {
        $resultado = $controlador->registrarProductoVariante($data);

        header('Content-Type: application/json');
        echo json_encode([
            'success'   => "exito",
            'message'   => 'Productos variantes registrados correctamente',
            'resultado' => $resultado
        ]);
    } catch (Exception $e) {
        http_response_code(422); // o 500 según el caso
        header('Content-Type: application/json');
        echo json_encode([
            'success' => "error",
            'message' => 'Error al registrar producto variante',
            'error'   => $e->getMessage()
        ]);
    }
}
elseif ($ver == "registroDetalleCompraDesdeExcel") {    
    $controlador = new ProductoVariante();
    $resultado = $controlador->registroDetalleCompraDesdeExcel();

}

if ($controlador === null) {
    // Acción por defecto si no se encuentra una ruta válida producto sendEmail ConfiguracionInicial registroPrueba registrarConfiguracion
    echo json_encode("El formulario ".$ver." no existe");
}