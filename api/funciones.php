<?php
class Funciones
{
    private $conexion;
    private $em;
    private $rh;
    private $cm;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->em = $this->conexion->em;
        $this->rh = $this->conexion->rh;
        $this->cm = $this->conexion->cm;
    }

    public function verificarIDUSERMD5($idMd5)
    {
        $consulta = $this->rh->query("select idusuario from usuario WHERE MD5(idusuario) = '$idMd5'");
        if ($consulta->num_rows > 0) {
            $fila = $this->rh->fetch($consulta);
            $id = $fila[0];
            return json_decode($id);
        } else {
            return "false";
        }
    }

    public function verificarIDEMPRESAMD5($idMd5)
    {
        $consulta = $this->em->query("select idorganizacion from organizacion WHERE MD5(idorganizacion) = '$idMd5'");
        if ($consulta->num_rows > 0) {
            $fila = $this->em->fetch($consulta);
            $id = $fila[0];
            return $id;
        } else {
            return "false";
        }
    }
    

    public function convertirObjeto($objeto) {
        $nuevoFormato = [];

        foreach ($objeto->data as $moneda) {
            // Verificar si el objeto tiene la propiedad 'codigo'
            if (isset($moneda->codigo)) {
                $codigoActividad = isset($moneda->codigoActividad) ? $moneda->codigoActividad : null;
                $nuevoFormato[$moneda->codigo] = [
                    "descripcion" => $moneda->descripcion,
                    "isActive" => $moneda->isActive,
                    'codigoActividad' => $codigoActividad
                ];
            }
        }
    
        return $nuevoFormato;
    }

  public function obtenerDatosUsuario($id, $tipo)
  {
    $datos = "";
    $consulta = $this->rh->query("SELECT u.idusuario, u.nombre, t.nombre, t.apellido FROM usuario u 
    LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
    WHERE u.idusuario = '$id'");
        if ($consulta->num_rows > 0) {
            $fila = $this->rh->fetch($consulta);
            $datos = [
              "id" => $fila[0],
              "usuario" => $fila[1],
              "nombre" => $fila[2],
              "apellido" => $fila[3]
            ];
            if ($tipo == 1) {
              return $datos;
            } else {
              json_encode($datos);
            }
            
        } else {
            return "false";
        }
  }

  public function redondear($num)
  {
    if (!is_numeric($num)) {
      return null;
    }
    $signo = $num >= 0 ? 1 : -1;

    return round(($num * pow(10, 2) + ($signo * 0.0001)) / pow(10, 2), 2);
  }
  public function validarFecha($fecha)
  {
      return preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha);
  }
  public function VerificarTipoFactura() {
    
  }

  public function datosExtras() {
      $datos = '{
          "tiposDocumentos": [
            {
              "id": "1",
              "descripcion": "CI"
            },
            {
              "id": "2",
              "descripcion": "CEX"
            },
            {
              "id": "3",
              "descripcion": "PAS"
            },
            {
              "id": "4",
              "descripcion": "Otro documento de identidad"
            },
            {
              "id": "5",
              "descripcion": "NIT"
            }
          ],
          "motivos": [
            {
              "id": "1",
              "descripcion": "Factura mal emitida"
            },
            {
              "id": "2",
              "descripcion": "Nota de credito-debito mal emitida"
            },
            {
              "id": "3",
              "descripcion": "Datos de emision incorrectos"
            },
            {
              "id": "4",
              "descripcion": "Factura o nota de credito-debito devuelta"
            }
          ],
          "motivos": [
            {
              "id": "1",
              "descripcion": "Factura mal emitida"
            },
            {
              "id": "2",
              "descripcion": "Nota de credito-debito mal emitida"
            },
            {
              "id": "3",
              "descripcion": "Datos de emision incorrectos"
            },
            {
              "id": "4",
              "descripcion": "Factura o nota de credito-debito devuelta"
            }
          ]
        }';
        
      return $datos;
  }

  public function cotizacionventaFechayPV_ids($fechai,$fechaf,$puntoventa){
      $res = [];
      $sql = "SELECT DISTINCT
              c.id_cotizacion
              FROM punto_venta pv 
              inner JOIN almacen a on pv.idalmacen = a.id_almacen
              inner JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
              inner JOIN productos p on p.id_productos = pa.productos_id_productos
              inner JOIN detalle_cotizacion dc on dc.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
              inner JOIN cotizacion c on c.id_cotizacion = dc.cotizacion_id_cotizacion
              where c.fecha_cotizacion BETWEEN ? AND ? and pv.idpunto_venta = ? and c.estado = 1";

      $stm = $this->cm->prepare($sql);

      if(!$stm){
        return [];
      }

      $stm->bind_param('ssi',$fechai,$fechaf,$puntoventa);

      $stm->execute();
      
      $result = $stm->get_result();

      if(!$result){
        return [];
      }

      while ($qwe = $result->fetch_assoc()) {
        $res[] = $qwe['id_cotizacion'];
      }
      $stm->close();

      $resultado = implode(',', $res);

      return $resultado;
  }

  public function ventasPorFechaYPV_ids($fechai,$fechaf,$puntoventa){
    $res = [];
    $sql = "SELECT DISTINCT
            v.id_venta
            FROM punto_venta pv 
            inner JOIN almacen a on pv.idalmacen = a.id_almacen
            inner JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
            inner JOIN productos p on p.id_productos = pa.productos_id_productos
            inner JOIN detalle_venta dv on dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
            inner JOIN venta v on v.id_venta = dv.venta_id_venta
            WHERE v.fecha_venta BETWEEN ? AND ? and pv.idpunto_venta = ?";

    $stm = $this->cm->prepare($sql);
    if(!$stm){
      return [];
    }

    $stm->bind_param('ssi',$fechai,$fechaf,$puntoventa);

    $stm->execute();
    
    $result = $stm->get_result();

    if(!$result){
      return [];
    }

    while ($qwe = $result->fetch_assoc()) {
      $res[] = $qwe['id_venta'];
    }
    $stm->close();

    $resultado = implode(',', $res);

    return $resultado;
  }
  public function ventasPorFechaYANUL_ids($fechai,$fechaf,$puntoventa){
    $res = [];
    $sql = "SELECT DISTINCT
            v.id_venta
            FROM punto_venta pv 
            LEFT JOIN almacen a on pv.idalmacen = a.id_almacen
            LEFT JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
            LEFT JOIN productos p on p.id_productos = pa.productos_id_productos
            LEFT JOIN detalle_venta dv on dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
            LEFT JOIN venta v on v.id_venta = dv.venta_id_venta
            inner JOIN anulaciones anl on anl.venta_id_venta = dv.venta_id_venta
            WHERE v.fecha_venta BETWEEN ? AND ? and pv.idpunto_venta = ?";

    $stm = $this->cm->prepare($sql);
    if(!$stm){
      return [];
    }

    $stm->bind_param('ssi',$fechai,$fechaf,$puntoventa);

    $stm->execute();
    
    $result = $stm->get_result();

    if(!$result){
      return [];
    }

    while ($qwe = $result->fetch_assoc()) {
      $res[] = $qwe['id_venta'];
    }
    $stm->close();

    $resultado = implode(',', $res);

    return $resultado;
  }
  
  public function comprasPorFechaYPV_ids($fechai,$fechaf,$puntoventa){
    $res = [];
    $sql = "SELECT DISTINCT
            ig.id_ingreso
            FROM punto_venta pv
            LEFT JOIN almacen a ON pv.idalmacen = a.id_almacen 
            LEFT JOIN ingreso ig ON ig.almacen_id_almacen = a.id_almacen
            LEFT JOIN detalle_ingreso di ON di.ingreso_id_ingreso = ig.id_ingreso
            WHERE ig.fecha_ingreso BETWEEN ? AND ?
              AND pv.idpunto_venta = ?;";

    $stm = $this->cm->prepare($sql);
    if(!$stm){
      return [];
    }

    $stm->bind_param('ssi',$fechai,$fechaf,$puntoventa);

    $stm->execute();
    
    $result = $stm->get_result();

    if(!$result){
      return [];
    }

    while ($qwe = $result->fetch_assoc()) {
      $res[] = $qwe['id_ingreso'];
    }
    $stm->close();

    $resultado = implode(',', $res);

    return $resultado;
  }
  
  public function MetodosPagos($empresa){
    $lista = [];
    $sql = "SELECT * FROM metodopago mp WHERE mp.idempresa = ? AND mp.estado = ?;";

    $stm = $this->cm->prepare($sql);
    if(!$stm){
      return [];
    }

    $estado = 1;
    $stm->bind_param('ii',$empresa,$estado);

    $stm->execute();
    
    $result = $stm->get_result();

    if(!$result){
      return [];
    }


    while ($qwe = $result->fetch_assoc()) {
      $res = array(
        "id" => $qwe['idmetodopago'],
        "nombre" =>$qwe['nombre'],
        "codigosin" =>$qwe['codigosin']
      );
      array_push($lista,$res);
    }
    $stm->close();

    

    return $lista;
  }
  
}
