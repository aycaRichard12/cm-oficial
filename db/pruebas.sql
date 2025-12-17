

select 
  ec.id_estado_cobro, 
  ct.fecha_cotizacion, 
  concat(c.nombre , ' | ' ,  c.nombrecomercial, ' | ', c.ciudad) as cliente, 
  ec.Ncuotas, 
  ec.valorcuotas, 
  ec.saldo, 
  (ct.monto_total+descuento), 
  ec.fecha_limite, 
  pa.almacen_id_almacen,

  (select sum(dc.ncuotas) as ncuotas from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as cuotaspagadas, 

  ec.estado, 
  ct.num, 
  ct.estado, 
  su.nombre, 
  (select sum(dc.monto) as cobro from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as totalcobro 
from estado_cobro ec
LEFT join cotizacion ct on ec.venta_id_venta=ct.id_cotizacion
LEFT join cliente c on ct.cliente_id_cliente=c.id_cliente
LEFT JOIN sucursal su ON ct.idsucursal=su.id_sucursal
LEFT join detalle_cotizacion dctz on ct.id_cotizacion=dctz.cotizacion_id_cotizacion
LEFT join productos_almacen pa on dctz.productos_almacen_id_productos_almacen=pa.id_productos_almacen
where c.idempresa='$idempresa'
group by ec.id_estado_cobro
order by ec.id_estado_cobro DESC
