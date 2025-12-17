<?php

require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";
require_once "logErrores.php";

class ConfiguracionInicial
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $em;
    private $logger;
    private $endpoint;

    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        $this->logger = new LogErrores();
        $this->endpoint = $this->conexion->endPoint;
    }

    // Función para crear un tipo de almacén
    public function crearTipoAlmacen($idempresa, $tipo_almacen, $descripcion, $estado): int
    {
        $query = "INSERT INTO tipo_almacen (tipo_almacen, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
        $stmt = $this->cm->prepare($query);
        $stmt->bind_param("ssii", $tipo_almacen, $descripcion, $estado, $idempresa);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarDivisa($nombre, $tipo_divisa, $estado, $idempresa, $monedasin): int
    {
        $query = "INSERT INTO divisas (nombre, tipo_divisa, estado, idempresa, monedasin) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("ssiii", $nombre, $tipo_divisa, $estado, $idempresa, $monedasin);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarLeyendaProforma($texto, $estado, $idempresa):int
    {
        $query = "INSERT INTO condiciones (texto, estado, idempresa) VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("sii", $texto, $estado, $idempresa);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarCategoriasProducto($id_empresa,$idrubro): int
    {
        // Validar ID de empresa
        if (!is_numeric($id_empresa) || $id_empresa <= 0) {
            error_log("ID de empresa inválido: " . $id_empresa);
            return 0;
        }

        
        $categorias = $this->sincronizarCategoria($idrubro);
        $success = true;
        $estado = 1; // Estado activo

        foreach ($categorias as $categoria) {
            // Validar categoría principal
            

            // Insertar categoría principal
            $query = "INSERT INTO categorias (nombre, descripcion, estado, id_empresa, idp) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            
            if (!$stmt) {
                error_log("Error preparando consulta de categoría: " . $this->conexion->cm->error);
                $success = false;
                break;
            }

            $idp = 0; // Categoría padre (0 para categorías principales)
            $stmt->bind_param("sssii", $categoria['nombre'], $categoria['descripcion'], $estado, $id_empresa, $idp);

            if (!$stmt->execute()) {
                error_log("Error insertando categoría: " . $stmt->error);
                $stmt->close();
                $success = false;
                break;
            }

            $stmt->close();

           
        }

        return $success ? 1 : 0;
    }
    public function registrarEstadosProducto($id_empresa,$idrubro):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $EstadosProductos = $this-> sincronizar_estado_productos($idrubro);
        $success = true;
        $estado = 1;
        foreach($EstadosProductos as $estProd){
           
            $query = "INSERT INTO estados_productos (tipos_estado, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$estProd['tipoestado'],$estProd['descricpion'],$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_unidades_de_medidas($id_empresa,$idrubro):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        
        $unidades = $this->sincronizarUnidadMedida($idrubro);
        $success = true;
        $estado = 1;
        foreach($unidades as $unidad){
            
            $query = "INSERT INTO unidad (nombre, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$unidad['nombre'],$unidad['descripcion'],$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_caracterisitcas($id_empresa,$idrubro):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }
        $caracteristicas_productos = $this->sincronizarCaracteristicas($idrubro);
        $success = true;
        $estado = 1;
        foreach($caracteristicas_productos as $caracteristica){
           
            $query = "INSERT INTO medida (nombre_medida, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$caracteristica['nombre'],$caracteristica['descripcion'],$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_parametros_obsolescencia($id_empresa, $idrubro):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $parametros_obsolescencia = $this-> sincronizar_parametros_obsolescencia($idrubro);
        $success = true;
        $estado = 1;

        foreach($parametros_obsolescencia as $parametros){
           

           
            $query = "INSERT INTO medidores (nombre, valor, color, tipo, idempresa) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("sdsii", $parametros['nombre'], $parametros['valor'], $parametros['color'], $estado, $id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    }
    public function registrar_tipos_clientes($id_empresa,$idrubro):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            echo("ID de empresa invalido: " . $id_empresa);
            return 0;
        }
        $tipos_clientes = $this->sincronizarTipoCliente($idrubro);
        $success = true;
        $estado = 1;

        foreach($tipos_clientes as $tipo_cliente){

            $query = "INSERT INTO tipocliente (tipo, descripcion, estado, idempresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);

 
            if(!$stmt){
                echo("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii", $tipo_cliente['tipo'], $tipo_cliente['descripcion'], $estado, $id_empresa);

            if(!$stmt->execute()){
                echo("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    
    }
    public function registrar_canales($id_empresa,$idrubro):int
    {
        

       
        $canales = $this->sincronizarCanalVenta($idrubro);
        $success = true;
        $estado = 1;

        foreach($canales as $canal){
            
            $query = "INSERT INTO canalventa (canal, descripcion, estado, idempresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
 
            if(!$stmt){
                echo("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$canal['canal'],$canal['descripcion'],$estado, $id_empresa);

            if(!$stmt->execute()){
                echo("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    
    }
   
    public function registrarAlmacen($nombre, $direccion, $telefono, $email, $tipo_almacen_id, $region_id, $fecha_creacion, $stockmin, $stockmax, $estado, $idempresa, $idsucursal): int
    {
        $query = "INSERT INTO almacen (nombre, direccion, telefono, email, tipo_almacen_id_tipo_almacen, region_id_region, fecha_creacion, stockmin, stockmax, estado, idempresa, idsucursal) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            // Registro de error en el prepare
            echo $this->conexion->cm->error;
            $this->logger->registrar(
                'Almacen',
                'PrepareError',
                'Error al preparar la consulta registrarAlmacen: ' . $this->conexion->cm->error,
                compact('nombre', 'direccion', 'telefono', 'email', 'tipo_almacen_id', 'region_id', 'fecha_creacion', 'stockmin', 'stockmax', 'estado', 'idempresa', 'idsucursal'),
                null,
                $idempresa
            );
            return 0;
        }
    
        // 4 strings, 2 ints, 1 string, 5 ints = 12 parámetros
        if(!$stmt->bind_param(
        "ssssiisiiiii",$nombre,$direccion,$telefono,$email,$tipo_almacen_id, $region_id,$fecha_creacion,$stockmin,$stockmax,$estado,$idempresa,$idsucursal)){
        $this->logger->registrar(
            'Almacen',
            'BindParamError',
            'Error en bind_param registrarAlmacen: ' . $stmt->error,
            compact('nombre'),
            null,
            $idempresa
        );
        return 0;
        }

    
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            // Registro de error en el execute
            echo $stmt->error;
            $this->logger->registrar(
                'Almacen',
                'ExecuteError',
                'Error al ejecutar la consulta registrarAlmacen: ' . $stmt->error,
                compact('nombre', 'direccion', 'telefono', 'email', 'tipo_almacen_id', 'region_id', 'fecha_creacion', 'stockmin', 'stockmax', 'estado', 'idempresa', 'idsucursal'),
                null,
                $idempresa
            );
            return 0;
        } 
        
    }
    
    public function registrarPuntoVenta($nombre, $descripcion, $tipo, $codigoSucursal, $idalmacen, $estadosin, $codigosin): int
    {
        $query = "INSERT INTO punto_venta (nombre, descripcion, tipo, codigoSucursal, idalmacen, estadosin, codigosin) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            // Registrar error si falla el prepare
            $this->logger->registrar(
                'PuntoVenta',
                'PrepareError',
                'Error al preparar la consulta registrarPuntoVenta: ' . $this->conexion->cm->error,
                compact('nombre', 'descripcion', 'tipo', 'codigoSucursal', 'idalmacen', 'estadosin', 'codigosin'),
                null,
                null // puedes pasar aquí el idempresa si lo tienes disponible
            );
            return 0;
        }
    
        $stmt->bind_param("ssissis", $nombre, $descripcion, $tipo, $codigoSucursal, $idalmacen, $estadosin, $codigosin);
    
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            // Registrar error si falla el execute
            $this->logger->registrar(
                'PuntoVenta',
                'ExecuteError',
                'Error al ejecutar la consulta registrarPuntoVenta: ' . $stmt->error,
                compact('nombre', 'descripcion', 'tipo', 'codigoSucursal', 'idalmacen', 'estadosin', 'codigosin'),
                null,
                null
            );
            return 0;
        }
    }
    
    public function obtenerIdResponsable($id_usuario, $id_empresa): int
    {
        $query = "SELECT id_responsable FROM responsable WHERE id_usuario = ? AND id_empresa = ? ORDER BY id_responsable ASC";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            // Error al preparar
            $this->logger->registrar(
                'Responsable',
                'PrepareError',
                'Error al preparar la consulta obtenerIdResponsable: ' . $this->conexion->cm->error,
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $stmt->bind_param("ii", $id_usuario, $id_empresa);

        if (!$stmt->execute()) {
            // Error al ejecutar
            $this->logger->registrar(
                'Responsable',
                'ExecuteError',
                'Error al ejecutar la consulta obtenerIdResponsable: ' . $stmt->error,
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $resultado = $stmt->get_result();

        if ($fila = $resultado->fetch_assoc()) {
            return $fila['id_responsable'];
        } else {
            // Opcional: registrar que no se encontró ningún responsable (no es un error técnico, pero puede ser útil)
            $this->logger->registrar(
                'Responsable',
                'NoDataFound',
                'No se encontró id_responsable con esos parámetros',
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }
    }

    public function registrarResponsable($id_usuario, $fecha, $id_empresa): int
    {
        $query = "INSERT INTO responsable (id_usuario, fecha, id_empresa) VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Responsable',
                'PrepareError',
                'Error al preparar la consulta registrarResponsable: ' . $this->conexion->cm->error,
                compact('id_usuario', 'fecha', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $stmt->bind_param("isi", $id_usuario, $fecha, $id_empresa);

        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            $this->logger->registrar(
                'Responsable',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsable: ' . $stmt->error,
                compact('id_usuario', 'fecha', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }
    }

    public function registrarResponsableAlmacen($responsable_id, $almacen_id, $fecha): int
    {
        $query = "INSERT INTO responsablealmacen (responsable_id_responsable, almacen_id_almacen, fecha) 
                VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'ResponsableAlmacen',
                'PrepareError',
                'Error al preparar la consulta registrarResponsableAlmacen: ' . $this->conexion->cm->error,
                compact('responsable_id', 'almacen_id', 'fecha'),
                null,
                null
            );
            return 0;
        }

        $stmt->bind_param("iis", $responsable_id, $almacen_id, $fecha);

        if ($stmt->execute()) {
            return 1;
        } else {
            $this->logger->registrar(
                'ResponsableAlmacen',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsableAlmacen: ' . $stmt->error,
                compact('responsable_id', 'almacen_id', 'fecha'),
                null,
                null
            );
            return 0;
        }
    }

    public function registrarCliente(array $data): int
    {
        $query = "INSERT INTO cliente (
            nombre, nombrecomercial, tipo, codigo, nit, detalle, direccion,
            telefono, mobil, email, web, pais, ciudad, zona, contacto,
            idempresa, tipodocumento, canal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Cliente',
                'PrepareError',
                'Error al preparar la consulta registrarCliente: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "ssissssssssssssisi",
            $data['nombre'],
            $data['nombrecomercial'],
            $data['tipo'],
            $data['codigo'],
            $data['nit'],
            $data['detalle'],
            $data['direccion'],
            $data['telefono'],
            $data['mobil'],
            $data['email'],
            $data['web'],
            $data['pais'],
            $data['ciudad'],
            $data['zona'],
            $data['contacto'],
            $data['idempresa'],
            $data['tipodocumento'],
            $data['canal']
        );

        if ($stmt->execute()) {
            $idCliente = $this->conexion->cm->insert_id;

            // Ahora registrar sucursal central
            $nombreSucursal = "Central ".$data['nombre'];
            $querySucursal = "INSERT INTO sucursal (nombre, telefono, direccion, cliente_id_cliente) VALUES (?, ?, ?, ?)";

            $stmtSucursal = $this->conexion->cm->prepare($querySucursal);

            if (!$stmtSucursal) {
                $this->logger->registrar(
                    'Sucursal',
                    'PrepareError',
                    'Error al preparar la consulta registrarSucursal: ' . $this->conexion->cm->error,
                    compact('nombreSucursal', 'data', 'idCliente')
                );
                return $idCliente; // cliente sí se registró
            }

            $stmtSucursal->bind_param("sssi", $nombreSucursal, $data['mobil'], $data['direccion'], $idCliente);

            if (!$stmtSucursal->execute()) {
                $this->logger->registrar(
                    'Sucursal',
                    'ExecuteError',
                    'Error al ejecutar la consulta registrarSucursal: ' . $stmtSucursal->error,
                    compact('nombreSucursal', 'data', 'idCliente')
                );
            }

            return $idCliente;
        } else {
            $this->logger->registrar(
                'Cliente',
                'ExecuteError',
                'Error al ejecutar la consulta registrarCliente: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }


    public function insertarPorcentaje(array $data): int
    {
        $query = "INSERT INTO porcentajes (tipo, porcentaje, autorizado, almacen_id_almacen)
                VALUES (?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Porcentajes',
                'PrepareError',
                'Error al preparar la consulta insertarPorcentaje: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "ssii", // tipos: string, string, int, int
            $data['tipo'],
            $data['porcentaje'],
            $data['autorizado'],
            $data['almacen_id_almacen']
        );

        if ($stmt->execute()) {
            return $this->conexion->cm->insert_id; // ID del nuevo registro
        } else {
            $this->logger->registrar(
                'Porcentajes',
                'ExecuteError',
                'Error al ejecutar insertarPorcentaje: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }

    public function registrarResponsablePuntoVenta($idresponsable, $idpuntoventa): int
    {
        $query = "INSERT INTO responsable_puntoventa (idresponsable, idpuntoventa) VALUES (?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            $this->logger->registrar(
                'ResponsablePuntoVenta',
                'PrepareError',
                'Error al preparar la consulta registrarResponsablePuntoVenta: ' . $this->conexion->cm->error,
                compact('idresponsable', 'idpuntoventa'),
                null,
                null
            );
            return 0;
        }
    
        $stmt->bind_param("ii", $idresponsable, $idpuntoventa);
    
        if ($stmt->execute()) {
            return 1;
        } else {
            $this->logger->registrar(
                'ResponsablePuntoVenta',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsablePuntoVenta: ' . $stmt->error,
                compact('idresponsable', 'idpuntoventa'),
                null,
                null
            );
            return 0;
        }
    }
    

    public function obtenerPrimeraSucursalID($idempresa): int
    {
        if ($idempresa === "false") {
            return 0; // Empresa inválida
        }

        $query = "SELECT idsucursalcontable FROM sucursalcontable WHERE idorganizacion = ? ORDER BY idsucursalcontable ASC LIMIT 1";
        $stmt = $this->em->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'SucursalContable',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimeraSucursalID: ' . $this->em->error,
                compact('idempresa'),
                null,
                $idempresa
            );
            return 0;
        }

        $stmt->bind_param("i", $idempresa);

        if (!$stmt->execute()) {
            $this->logger->registrar(
                'SucursalContable',
                'ExecuteError',
                'Error al ejecutar la consulta obtenerPrimeraSucursalID: ' . $stmt->error,
                compact('idempresa'),
                null,
                $idempresa
            );
            return 0;
        }

        $resultado = $stmt->get_result()->fetch_assoc();
        return $resultado ? (int) $resultado["idsucursalcontable"] : 0;
    }
    public function obtenerPrimerCanalVentaId(int $idempresa): ?int
    {
        $idCanal = 0;
        $query = "SELECT idcanalventa
                FROM canalventa
                WHERE idempresa = ?
                ORDER BY idcanalventa ASC
                LIMIT 1";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'CanalVenta',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimerCanalVentaId: ' . $this->conexion->cm->error,
                ['idempresa' => $idempresa]
            );
            return null;
        }

        $stmt->bind_param("i", $idempresa);
        $stmt->execute();

        $stmt->bind_result($idCanal);
        echo $idCanal;
        if ($stmt->fetch()) {
            return $idCanal;
        }

        return null; // No encontrado
    }
    public function obtenerPrimerTipoClienteId(int $idempresa): ?int
    {
        $idTipoCliente = 0;
        $query = "SELECT idtipocliente
                FROM tipocliente
                WHERE idempresa = ?
                ORDER BY idtipocliente ASC
                LIMIT 1";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'TipoCliente',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimerTipoClienteId: ' . $this->conexion->cm->error,
                ['idempresa' => $idempresa]
            );
            return null;
        }

        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $stmt->bind_result($idTipoCliente);
        echo $idTipoCliente;
        if ($stmt->fetch()) {
            return $idTipoCliente;
        }

        return null; // No se encontró ningún resultado
    }

    public function prepararCliente(int $idempresa): int
    {
        $idCanal = $this->obtenerPrimerCanalVentaId($idempresa);
        $tipo_documento = 1;
        $idTipoCliente = $this->obtenerPrimerTipoClienteId($idempresa);
        if ($idCanal === null || $idTipoCliente === null) {
            $this->logger->registrar(
                'Cliente',
                'DatosFaltantes',
                'No se pudo obtener idCanal o idTipoCliente',
                compact('idempresa', 'idCanal', 'idTipoCliente')
            );
            return 0;
        }

        $clienteFicticio = [
            'nombre' => 'Cliente varios',
            'nombrecomercial' => 'varios S.A.',
            'tipo' => $idTipoCliente,
            'codigo' => uniqid('CLI_'), // genera un código único
            'nit' => '00000000',
            'detalle' => 'Cliente generado automáticamente para pruebas',
            'direccion' => 'Dirección Genérica',
            'telefono' => '0000000',
            'mobil' => '70000000',
            'email' => 'ClienteVarios@one.com',
            'web' => 'https://Varios.test',
            'pais' => 'Bolivia',
            'ciudad' => 'Cochabamba',
            'zona' => 'Zud',
            'contacto' => 'Contacto Demo',
            'idempresa' => $idempresa,
            'tipodocumento' => $tipo_documento,
            'canal' => $idCanal
        ];
        return $this->registrarCliente($clienteFicticio);
    }
    public function registrarProveedorFicticio(array $data): int
    {
        $query = "INSERT INTO proveedor (
            nombre, codigo, nit, detalle, direccion, telefono, mobil, email,
            web, pais, ciudad, zona, contacto, id_empresa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Proveedor',
                'PrepareError',
                'Error al preparar la consulta registrarProveedorFicticio: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "sssssssssssssi",
            $data['nombre'],
            $data['codigo'],
            $data['nit'],
            $data['detalle'],
            $data['direccion'],
            $data['telefono'],
            $data['mobil'],
            $data['email'],
            $data['web'],
            $data['pais'],
            $data['ciudad'],
            $data['zona'],
            $data['contacto'],
            $data['id_empresa']
        );

        if ($stmt->execute()) {
            return $this->conexion->cm->insert_id;
        } else {
            $this->logger->registrar(
                'Proveedor',
                'ExecuteError',
                'Error al ejecutar la consulta registrarProveedorFicticio: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }
    public function prepararProveedor(int $idempresa): int
    {
        $data = [
            'nombre' => 'Proveedor Varios',
            'codigo' => uniqid('CLI_'),
            'nit' => '1234567890',
            'detalle' => 'Proveedor Varios',
            'direccion' => 'Calle Bol 123',
            'telefono' => '2222222',
            'mobil' => '77777777',
            'email' => 'proveedor@varios.com',
            'web' => 'http://proveedorVarios.com',
            'pais' => 'Bolivia',
            'ciudad' => 'Ciudad Central',
            'zona' => 'Zona 1',
            'contacto' => 'Juan',
            'id_empresa' => $idempresa
        ];

        return $this->registrarProveedorFicticio($data);
    }
    public function prepararPorcentage(int $idalmacen, int $idrubro): int
    {
        $point = "getlistapreciobase";
        $insertados = 0;

        try {
            // 1. Obtener datos de la API
            $porcentaje = $this->get_administrador($point, $idrubro);

        } catch (\Exception $e) {
            // Error de conexión o cURL
            return 0;
        }

        // 2. Validar respuesta de API
        if (!is_array($porcentaje) || empty($porcentaje)) {
            return 0;
        }

        // Manejo de error enviado por API
        if (isset($porcentaje['error']) && $porcentaje['error'] === true) {
            return 0;
        }

        // 3. Procesar array de ítems
        foreach ($porcentaje as $item) {

            // Validar que tenga la clave necesaria
            if (!isset($item['precio'])) {
                continue; // Saltar ítems inválidos
            }

            $data = [
                'tipo' => $item['precio'],
                'porcentaje' => 0,
                'autorizado' => 1,
                'almacen_id_almacen' => $idalmacen
            ];

            // Insertar y verificar si fue exitoso
            $id_porcentaje = $this->insertarPorcentaje($data);

            if ($id_porcentaje) {
                $insertados++;
            }
        }

        return $insertados;
    }

    /**
     * Fetches data from the 'administrador' API endpoint using cURL.
     *
     * @param string $point The specific API endpoint segment (e.g., 'users', 'config').
     * @param int $idrubro The ID parameter to be appended to the URL.
     * @return array|null The decoded JSON response as an associative array, or null on failure.
     * @throws \Exception If a cURL error occurs.
     */
    public function get_administrador(string $point, int $idrubro)
    {
        // Construir la URL directamente
        $url = "http://mistersofts.com/administrador/api/" . $point . "/" . $idrubro;

        // Intentar obtener el contenido
        $response = @file_get_contents($url);

        if ($response === false) {
            // No se pudo obtener la respuesta, retorna array vacío
            return [];
        }

        // Decodificar JSON
        $respuesta = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // JSON inválido, retorna array vacío
            return [];
        }

        return $respuesta;
}

    /**
     * Sincroniza los tipos de almacén de una API externa con el sistema local.
     *
     * @param int $idempresa El ID de la empresa local.
     * @param int $idrubro El ID de rubro para la consulta a la API.
     * @return array Un array con el estado de la sincronización (éxito o error).
     */
    public function sincronizarTipoAlmacen(int $idempresa, int $idrubro): int
    {
        $count = 0;
        $last_id_sincronizado = 0;
        $point = "gettipoalmacen";
        $result = $last_id_sincronizado;

       
            
        $tiposAlmacen = $this->get_administrador($point, $idrubro);
            
            

        foreach ($tiposAlmacen as $item) {
            // Asegurar que las claves existan para evitar errores de 'undefined index'
            $nombre = $item['tipoalmancen'] ?? '';
            $descripcion = $item['descripcion'] ?? '';
            $estado = $item['estado'] ?? 0;

            // Si faltan datos críticos, podrías saltar el ítem (continue) o lanzar un error
            if (empty($nombre)) {
                // error_log("Advertencia: Se saltó un ítem porque el nombre del tipo de almacén estaba vacío.");
                continue;
            }

            // Llamada a la función local para crear/actualizar el registro
            $id_tipo_almacen_local = $this->crearTipoAlmacen(
                $idempresa,
                $nombre,
                $descripcion,
                (int)$estado // Asegurar que el estado sea un entero si es necesario
            );

            if ($id_tipo_almacen_local > 0) {
                $last_id_sincronizado = $id_tipo_almacen_local;
                $count++;
            }
            // Nota: Asumimos que crearTipoAlmacen devuelve el ID del registro local creado/actualizado (> 0)
            // y 0 o false en caso de fallo.
        }

        // 4. Devolver el resultado final
        if ($count > 0) {
            $result = $last_id_sincronizado;
        } else {
            $result = 0;
            
        }

        return $result;
    }
    public function sincronizarDivisa(int $idempresa, int $idrubro): int
    {
        $count = 0;
        $last_id_sincronizado = 0;
        $point = "getlistadivisas";
        $result = $last_id_sincronizado;

        try {
            // 1. Obtener datos de la API
            $divisas = $this->get_administrador($point, $idrubro);

        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return $last_id_sincronizado;
        }

        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($divisas) && isset($divisas['error']) && $divisas['error'] === true) {
           
            return $last_id_sincronizado;
        }

        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($divisas) || empty($divisas)) {
           
            return $last_id_sincronizado;
        }
        foreach ($divisas as $item) {
            // Asegurar que las claves existan para evitar errores de 'undefined index'
            $nombre = $item['nombre'] ?? '';
            $tipodivisa = $item['tipodivisa'] ?? '';
            $estado = $item['estado'] ?? 0;
            $monedasin = $item['monedasin'] ?? 0;

            // Si faltan datos críticos, podrías saltar el ítem (continue) o lanzar un error
            if (empty($nombre)) {
                // error_log("Advertencia: Se saltó un ítem porque el nombre del tipo de almacén estaba vacío.");
                continue;
            }
            //$id_divisa = $this->registrarDivisa('Bolivianos', 'Bs.', 1, $idempresa, null);
            // Llamada a la función local para crear/actualizar el registro
            $id_divisa = $this->registrarDivisa(
                $nombre,
                $tipodivisa,
                $estado,
                $idempresa,
                $monedasin  // Asegurar que el estado sea un entero si es necesario
            );

            if ($id_divisa > 0) {
                $last_id_sincronizado = $id_divisa;
                $count++;
            }
            // Nota: Asumimos que crearTipoAlmacen devuelve el ID del registro local creado/actualizado (> 0)
            // y 0 o false en caso de fallo.
        }
        // 4. Devolver el resultado final
        if ($count > 0) {
            $result = $last_id_sincronizado;
        } else {
            $result = 0;
            
        }
        return $result;
    }
    public function sincronizarleyenda(int $idempresa, int $idrubro): int
    {
        $count = 0;
        $last_id_sincronizado = 0;
        $point = "getlitacondiciones";
        $result = $last_id_sincronizado;

        try {
            // 1. Obtener datos de la API
            $leyendas = $this->get_administrador($point, $idrubro);

        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return $last_id_sincronizado;
        }

        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($leyendas) && isset($leyendas['error']) && $leyendas['error'] === true) {
           
            return $last_id_sincronizado;
        }

        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($leyendas) || empty($leyendas)) {
           
            return $last_id_sincronizado;
        }
        foreach ($leyendas as $item) {
            // Asegurar que las claves existan para evitar errores de 'undefined index'
            $texto = $item['texto'] ?? '';
            $estado = $item['estado'] ?? '';
            

            // Si faltan datos críticos, podrías saltar el ítem (continue) o lanzar un error
            if (empty($texto)) {
                // error_log("Advertencia: Se saltó un ítem porque el nombre del tipo de almacén estaba vacío.");
                continue;
            }
            //$id_divisa = $this->registrarDivisa('Bolivianos', 'Bs.', 1, $idempresa, null);
            // Llamada a la función local para crear/actualizar el registro
            $id_condicion = $this->registrarLeyendaProforma(
                $texto,
                (int)$estado,
                $idempresa
            );

            if ($id_condicion > 0) {
                $last_id_sincronizado = $id_condicion;
                $count++;
            }
            // Nota: Asumimos que crearTipoAlmacen devuelve el ID del registro local creado/actualizado (> 0)
            // y 0 o false en caso de fallo.
        }
        // 4. Devolver el resultado final
        if ($count > 0) {
            $result = $last_id_sincronizado;
        } else {
            $result = 0;
        }
        return $result;
    }

    public function sincronizarCanalVenta(int $idrubro): array
    {
        $point = "getlistacanales";
        $canales = $this->get_administrador($point, $idrubro);
        return $canales;

    }
    public function sincronizarCategoria(int $idrubro): array
    {
        $point = "getlistacategorias";
        
        $categorias = $this->get_administrador($point, $idrubro);
        
        return $categorias;
    }
    public function sincronizar_parametros_obsolescencia(int $idrubro): array
    {
        $point = "getlistamedidores";
        try {
            // 1. Obtener datos de la API
            $medidores = $this->get_administrador($point, $idrubro);
        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return [];
        }
        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($medidores) && isset($medidores['error']) && $medidores['error'] === true) {  
            return [];
        }
        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($medidores) || empty($medidores)){
            return [];
        }
        return $medidores;
    }
    public function sincronizar_estado_productos(int $idrubro): array
    {
        $point = "getlistaestadoproductos";
        
        $res = $this->get_administrador($point, $idrubro);
       
        return $res;
    }
    public function sincronizarUnidadMedida(int $idrubro): array
    {
        $point = "getlistaunidades";
        try {
            // 1. Obtener datos de la API
            $unidades = $this->get_administrador($point, $idrubro);
        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return [];
        }
        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($unidades) && isset($unidades['error']) && $unidades['error'] === true) {  
            return [];
        }
        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($unidades) || empty($unidades)){
            return [];
        }
        return $unidades;
    }
    public function sincronizarCaracteristicas(int $idrubro): array
    {
        $point = "getlistamedidas";
        try {
            // 1. Obtener datos de la API
            $caracteristicas = $this->get_administrador($point, $idrubro);
        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return [];
        }
        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($caracteristicas) && isset($caracteristicas['error']) && $caracteristicas['error'] === true) {  
            return [];
        }
        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($caracteristicas) || empty($caracteristicas)){
            return [];
        }
        return $caracteristicas;
    }
    public function sincronizarTipoCliente(int $idrubro)
    {
        $point = "getlistatipocliente";
        
        $tiposCliente = $this->get_administrador($point, $idrubro);
        
        return $tiposCliente;
    }
    public function sincronizarPuntoVenta(int $idrubro, $idalmacen): int
    {
        $count = 0;
        $last_id_sincronizado = 0;
        $point = "getlistapuntoventa";
        $result = $last_id_sincronizado;

        try {
            // 1. Obtener datos de la API
            $puntosVenta = $this->get_administrador($point, $idrubro);

        } catch (\Exception $e) {
            // Manejar errores de conexión/cURL lanzados por get_administrador
            // Opcional: registrar el error en un log
            // error_log($result['message']);
            return $last_id_sincronizado;
        }

        // 2. Manejar errores lógicos o de respuesta (HTTP/JSON)
        // Asumiendo que errores de API devuelven ['error' => true, ...]
        if (is_array($puntosVenta) && isset($puntosVenta['error']) && $puntosVenta['error'] === true) {
           
            return $last_id_sincronizado;
        }

        // 3. Procesar datos (Debe ser un array de ítems)
        if (!is_array($puntosVenta) || empty($puntosVenta)) {
           
            return $last_id_sincronizado;
        }
        foreach ($puntosVenta as $item) {
            // Asegurar que las claves existan para evitar errores de 'undefined index'
            $nombre = $item['nombre'] ?? '';
            $descripcion = $item['descripcion'] ?? '';
            $tipo = $item['tipo'] ?? 0;
            $codigosucursal = $item['codigosucursal'] ?? 0;
            $estadosin = $item['estadosin'] ?? 0;
            $codigosin = $item['codigosin'] ?? 0;

            // Si faltan datos críticos, podrías saltar el ítem (continue) o lanzar un error
            if (empty($nombre)) {
                // error_log("Advertencia: Se saltó un ítem porque el nombre del tipo de almacén estaba vacío.");
                continue;
            }
            //$id_punto_venta = $this->registrarPuntoVenta('PuntoVT-1', 'Lugar de pago', null, null, $id_almacen, '', '');
            // Llamada a la función local para crear/actualizar el registro
            $idpunto_venta = $this->registrarPuntoVenta(
                $nombre,
                $descripcion,
                $tipo,
                $codigosucursal,
                $idalmacen,
                $estadosin,
                $codigosin
            );
            if ($idpunto_venta > 0) {
                $last_id_sincronizado = $idpunto_venta;
                $count++;
            }
            // Nota: Asumimos que crearTipoAlmacen devuelve el ID del registro local creado/actualizado (> 0)
            // y 0 o false en caso de fallo.
        }
        // 4. Devolver el resultado final
        if ($count > 0) {
            $result = $last_id_sincronizado;
        } else {
            $result = 0;
            
        }
        return $result;
    }
    public function registrarConfiguracion($idempresa, $idsucursal, $idusuario, $idrubro): int 
    {
        try {
            $fecha = date("Y-m-d");
            $id_tipo_almacen = $this->sincronizarTipoAlmacen((int)$idempresa, (int)$idrubro);
            if (!$id_tipo_almacen) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al crear tipo de almacén", compact('idempresa'), $idusuario, $idempresa);
                return -1;
            }

            $id_divisa = $this->sincronizarDivisa((int)$idempresa, (int)$idrubro);
            if (!$id_divisa) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar divisa", compact('idempresa'), $idusuario, $idempresa);
                return -2;
            }

            $id_leyenda_proforma = $this->sincronizarleyenda((int)$idempresa, (int)$idrubro);
            if (!$id_leyenda_proforma) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar leyenda proforma", compact('idempresa'), $idusuario, $idempresa);
                return -3;
            }

            if (!$this->registrar_canales($idempresa,(int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar canales de venta", compact('idempresa'), $idusuario, $idempresa);
                return -4;
            }

            if (!$this->registrarCategoriasProducto($idempresa,(int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar categorías de producto", compact('idempresa'), $idusuario, $idempresa);
                return -41;
            }

            if(!$this->registrar_parametros_obsolescencia($idempresa, (int)$idrubro)){
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar parametros obsolescencia", compact('idempresa'), $idusuario, $idempresa);
                return -45;
            }
            
            if (!$this->registrarEstadosProducto($idempresa,(int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar estados de producto", compact('idempresa'), $idusuario, $idempresa);
                return -42;
            }

            if (!$this->registrar_unidades_de_medidas($idempresa,(int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar unidades de medida", compact('idempresa'), $idusuario, $idempresa);
                return -43;
            }

            if (!$this->registrar_caracterisitcas($idempresa, (int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar características de producto", compact('idempresa'), $idusuario, $idempresa);
                return -44;
            }

            if (!$this->registrar_tipos_clientes($idempresa, (int)$idrubro)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar tipos de clientes", compact('idempresa'), $idusuario, $idempresa);
                return -46;
            }
            $id_Cliente = $this->prepararCliente($idempresa);

            $id_proveedor = $this->prepararProveedor($idempresa);
            $id_almacen = $this->registrarAlmacen('TIENDA 1', 'BOLIVIA', '00000000', 'almacen@alm.bo', $id_tipo_almacen, 0, $fecha, 10, 100, 1, $idempresa, $idsucursal);
            if (!$id_almacen) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar almacén", compact('idempresa', 'idsucursal'), $idusuario, $idempresa);
                return -5;
            }
            //Jcanales

            $id_punto_venta = $this->sincronizarPuntoVenta((int)$idrubro,(int) $id_almacen);
            $id_porcentaje = $this->prepararPorcentage($id_almacen, (int)$idrubro);
            if (!$id_punto_venta) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar punto de venta", compact('id_almacen'), $idusuario, $idempresa);
                return -6;
            }

            $id_responsable = $this->registrarResponsable($idusuario, $fecha,$idempresa);
            if (!$id_responsable) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al obtener ID responsable", compact('idusuario', 'idempresa'), $idusuario, $idempresa);
                return -7;
            }
            $uno = $this->registrarResponsableAlmacen($id_responsable, $id_almacen, $fecha);
            $dos = $this->registrarResponsablePuntoVenta($id_responsable, $id_punto_venta);
            if (!$uno || !$dos) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar responsable en almacén o punto de venta", compact('id_responsable', 'id_almacen', 'id_punto_venta'), $idusuario, $idempresa);
                return -8;
            }

            return 1; // Todo OK
        } catch (Exception $e) {
            $this->logger->registrar("Configuracion", "Excepcion", $e->getMessage(), compact('idempresa', 'idsucursal', 'idusuario'), $idusuario, $idempresa);
            return 0; // Error general parametros_obsolescencia
        }
    }
    public function control($idmd5, $idsucursal, $idusuario, $idrubro = null)
    {
        $respuesta = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if (!$this->empresaRegistrada($idempresa)) {
            $registro = $this->registrarConfiguracion($idempresa, $idsucursal, $idusuario, $idrubro);

            // Verifica si el registro ha fallado (código distinto a 1)
            if ($registro !== 1) {
                // Muestra el mensaje de error basado en el código
                $mensaje_error = $this->obtenerMensajeError($registro);
                $respuesta = [
                    "estado" => "error",
                    "mensaje" => $mensaje_error
                ];
            } else {
                $id = $this->registrarConfiguracionInicial($idempresa, 'registro completado');
                
                // Gestiona los errores relacionados con la configuración inicial
                switch ($id) {
                    case -1:
                        $respuesta = [
                            "estado" => "advertencia",
                            "mensaje" => "La empresa ya tenía una configuración inicial"
                        ];
                        break;
                    case 0:
                        $respuesta = [
                            "estado" => "error",
                            "mensaje" => "No se pudo registrar la configuración inicial"
                        ];
                        break;
                    default:
                        $respuesta = [
                            "estado" => "exito",
                            "mensaje" => "Empresa registrada correctamente"
                        ];
                        break;
                }
            }
        } else {
            $respuesta = [
                "estado" => "error",
                "mensaje" => "La empresa ya fue registrada previamente"
            ];
        }

        echo json_encode($respuesta);
    }

    public function obtenerMensajeError($codigo_error): string
    {
        // Mensajes personalizados para cada código de error
        switch ($codigo_error) {
            case 0:
                return "Error interno inesperado (ver logs)";
            case -1:
                return "Error al crear tipo de almacen";
            case -2:
                return "Error al registrar la divisa";
            case -3:
                return "Error al registrar la leyenda de proforma";
            case -4:
                return "Error en el registro de parámetros o categorías de producto";
            case -5:
                return "Error al registrar el almacén";
            case -6:
                return "Error al registrar el punto de venta";
            case -7:
                return "Error al obtener el responsable";
            case -8:
                return "Error al registrar responsables en almacén o punto de venta";
            case -41:
                return "Error al registrar categorías de productos";
            case -42:
                return "Error al registrar estados de producto";
            case -43:
                return "Error al registrar unidades de medida";
            case -44:
                return "Error al registrar características de productos";
            case -45:
                return "Error al registrar parámetros de obsolescencia";
            case -46:
                return "Error al registrar tipos de clientes";
            case -47:
                return "Error al registrar canales de venta";
            
            default:
                return "Código de error no reconocido: $codigo_error";
        }
    }


    public function empresaRegistrada($idempresa): bool
    {
        $existe = 0;
        $query = "SELECT COUNT(*) AS existe FROM configuracion_inicial WHERE idempresa = ?";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $stmt->bind_result($existe);
        $stmt->fetch();
        return $existe > 0;
    }
    public function empresaRegistradajs($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $query = "
            SELECT 
            EXISTS (SELECT 1 FROM configuracion_inicial WHERE idempresa = ?) OR
            (
                EXISTS (SELECT 1 FROM almacen WHERE idempresa = ?) AND
                EXISTS (SELECT 1 FROM categorias WHERE id_empresa = ?) AND
                EXISTS (SELECT 1 FROM cliente WHERE idempresa = ?) AND
                EXISTS (SELECT 1 FROM proveedor WHERE id_empresa = ?) AND
                EXISTS (
                    SELECT 1 FROM ingreso i
                    JOIN proveedor p ON i.proveedor_id_proveedor = p.id_proveedor
                    WHERE p.id_empresa = ?
                ) AND
                EXISTS (
                    SELECT 1 FROM venta v
                    JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
                    WHERE c.idempresa = ?
                )
            ) AS existe
        ";

        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("iiiiiii", $idempresa, $idempresa, $idempresa, $idempresa, $idempresa, $idempresa, $idempresa);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();

        $respuesta = [
            "estado" => $resultado['existe'] ? "exito" : "error",
            "mensaje" => $resultado['existe'] ? "Empresa registrada" : "Empresa no encontrada"
        ];

        echo json_encode($respuesta);
    }

    
    public function registrarConfiguracionInicial($idempresa, $descripcion): int
    {
        // Verificar si la empresa ya tiene un registro
        $query_check = "SELECT COUNT(*) AS existe FROM configuracion_inicial WHERE idempresa = ?";
        $stmt = $this->conexion->cm->prepare($query_check);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();

        if ($resultado['existe'] == 0) {
            //Insertar el registro si no existe
            $query_insert = "INSERT INTO configuracion_inicial (idempresa, fecha_ejecucion, estado, descripcion) VALUES (?, NOW(), 'Ejecutado', ?)";
            $stmt = $this->conexion->cm->prepare($query_insert);

            if (!$stmt) {
                $this->logger->registrar(
                    'ConfiguracionInicial',
                    'PrepareError',
                    'Error al preparar el INSERT en configuracion_inicial: ' . $this->conexion->cm->error,
                    compact('idempresa', 'descripcion'),
                    null,
                    $idempresa
                );
                return 0;
            }

            $stmt->bind_param("is", $idempresa, $descripcion);

            if ($stmt->execute()) {
                return 1;
            } else {
                $this->logger->registrar(
                    'ConfiguracionInicial',
                    'ExecuteError',
                    'Error al ejecutar el INSERT en configuracion_inicial: ' . $stmt->error,
                    compact('idempresa', 'descripcion'),
                    null,
                    $idempresa
                );
                return 0;
            }
        }

        return -1; // Ya existe No se pudo registrar la configuración inicial
    }

}

?>

