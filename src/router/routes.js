import { URL_APICM } from 'src/composables/services'
import { validarUsuario } from 'src/composables/FuncionesG'
import { peticionGET } from 'src/composables/peticionesFetch'

async function empresaRegistrada() {
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa
  const endpoint = `${URL_APICM}api/empresaRegistrada/${idempresa}`
  console.log(endpoint)

  try {
    const resultado = await peticionGET(endpoint)
    console.log(resultado)
    return resultado.estado !== 'error'
  } catch (error) {
    console.error('Error al consultar empresa:', error)
    return true // Tratar error como empresa no registrada
  }
}

async function checkConfiguracion() {
  const empresaRegistradaCorrectamente = await empresaRegistrada()
  return empresaRegistradaCorrectamente
}
const routes = [
  {
    path: '/',
    beforeEnter: async (to, from, next) => {
      const estaConfigurado = await checkConfiguracion()
      console.log(estaConfigurado)
      if (estaConfigurado) {
        next() // sigue normalmente a MainLayout
      } else {
        next('/configuracioninicial') // redirige a formulario de configuración
        //next() // redirige a formulario de configuración
      }
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/configuraciongeneral',
        component: () => import('pages/config/configuraciongeneralPage.vue'),
      },
      {
        path: '/tipodealmacen',
        component: () => import('pages/General/tipoAlmacenGeneral.vue'),
      },
      {
        path: '/divisas',
        component: () => import('pages/General/divisasGeneral.vue'),
      },
      {
        path: '/leyendaproforma',
        component: () => import('pages/General/leyendaProformaGeneral.vue'),
      },
      {
        path: '/configuracionproducto',
        component: () => import('pages/ProductoConf/categoriaProducto.vue'),
      },
      {
        path: '/categoriadeproducto',
        component: () => import('pages/ProductoConf/categoriaProducto.vue'),
      },
      {
        path: '/estadodeproducto',
        component: () => import('pages/ProductoConf/estadoProducto.vue'),
      },
      {
        path: '/unidaddeproducto',
        component: () => import('pages/ProductoConf/unidadProducto.vue'),
      },
      {
        path: '/caracteristicadeproducto',
        component: () => import('pages/ProductoConf/caracteristicaProducto.vue'),
      },
      {
        path: '/parametrosdeobsolescencia',
        component: () => import('pages/ProductoConf/parametroObsolescencia.vue'),
      },
      {
        path: '/configuracioncliente',
        component: () => import('pages/Client/config/clienteCPage.vue'),
      },
      {
        path: '/tiposdeclientes',
        component: () => import('pages/Client/config/clienteCPage.vue'),
      },
      {
        path: '/canalesdeventa',
        component: () => import('pages/canalVenta/config/canalVentaPage.vue'),
      },
      {
        path: '/administracioncreacion',
        component: () => import('pages/almacen/CalmacenPage.vue'),
      },
      {
        path: '/registraralmacen',
        component: () => import('pages/almacen/CalmacenPage.vue'),
      },
      {
        path: '/registrarpuntodeventa',
        component: () => import('pages/puntoVenta/CpuntoVentaPage.vue'),
      },
      {
        path: '/registrarproductos',
        component: () => import('pages/producto/CproductoPage.vue'),
      },
      {
        path: '/administracionasignacion',
        component: () => import('pages/almacen/AalmacenPage.vue'),
      },
      {
        path: '/asignaralmacen',
        component: () => import('pages/almacen/AalmacenPage.vue'),
      },
      {
        path: '/asignarpuntodeventa',
        component: () => import('pages/puntoVenta/ApuntoVentaPage.vue'),
      },
      {
        path: '/asignarproductos',
        component: () => import('pages/producto/AproductoPage.vue'),
      },
      {
        path: '/registrodecliente',
        component: () => import('pages/Client/admin/clienteAPage.vue'),
      },
      {
        path: '/registrarproveedor',
        component: () => import('pages/proveedor/proveedorAPage.vue'),
      },
      {
        path: '/registrarcompra',
        component: () => import('pages/compra/RcompraPage.vue'),
      },
      {
        path: '/generarpedido',
        component: () => import('pages/pedidos/RpedidosPage.vue'),
      },
      {
        path: '/gestionPedido',
        component: () => import('src/pages/autorizaciones/GestionPedidoPage.vue'),
      },
      {
        path: '/registrarventa',
        component: () => import('src/components/venta/ventaComponent.vue'),
      },
      {
        path: '/registrarventaoculto',
        component: () => import('src/components/venta/ventaPage.vue'),
      },
      {
        path: '/administracionprecios',
        component: () => import('pages/precio/precioPage.vue'),
      },
      {
        path: '/costounitario',
        component: () => import('pages/precio/precioPage.vue'),
      },
      {
        path: '/categoriasdeprecio',
        component: () => import('pages/precio/CategoriaPrecioPage.vue'),
      },
      {
        path: '/preciossugeridos',
        component: () => import('pages/precio/PrecioSugeridoPage.vue'),
      },
      {
        path: '/reportestockdeproductosindividual',
        component: () => import('pages/producto/ReporteStockProductoIndividualPage.vue'),
      },
      {
        path: '/reportedeventas',
        component: () => import('pages/Venta/ReporteVentas.vue'),
      },
      {
        path: '/movimientos',
        component: () => import('pages/movimiento/movimietoPage.vue'),
      },
      {
        path: '/cuentasporcobrar',
        component: () => import('pages/cuentasxcobrar/CuentasxCobrarPage.vue'),
      },
      {
        path: '/cuentasporcobrarocultas',
        component: () => import('pages/cuentasxcobrar/CuentasxCobrarPage.vue'),
      },
      {
        path: '/reportecuentasporcobrarocultas',
        component: () => import('pages/cuentasxcobrar/reporteCuentasxCobrarPage.vue'),
      },
      {
        path: '/reportecuentasxpagarxperiodo',
        component: () => import('pages/cuentasxcobrar/ReporteCuentasXCobrarPeriodo.vue'),
      },
      {
        path: '/reporteproductoscomprados',
        component: () => import('pages/reportes/detalleProductosComprados.vue'),
      },
      {
        path: '/reportestockdeproductosglobal',
        component: () => import('pages/reportes/reporteStockDeProductosGlobal.vue'),
      },
      {
        path: '/reportedecaducidaddeproductos',
        component: () => import('pages/reportes/caducidadProductos.vue'),
      },
      {
        path: '/reporteproductosvendidosglobal',
        component: () => import('pages/reportes/reporteProductosVendidosGlobal.vue'),
      },
      {
        path: '/crearcampanas',
        component: () => import('src/pages/campanas/campanasPage.vue'),
      },
      {
        path: '/contingencias',
        component: () => import('src/pages/devoluciones/anulacionPage.vue'),
      },
      {
        path: '/registraranulaciones',
        component: () => import('src/pages/devoluciones/anulacionPage.vue'),
      },
      {
        path: '/registrodeextravios',
        component: () => import('src/pages/devoluciones/extravioPage.vue'),
      },
      {
        path: '/registrodemermas',
        component: () => import('src/pages/devoluciones/registrodemermasPage.vue'),
      },
      {
        path: '/reportedeindicederotacion',
        component: () => import('src/pages/reportes/rotacionAlmacenPague.vue'),
      },
      {
        path: '/reportedeindicederotacionglobal',
        component: () => import('src/pages/reportes/rotacionGlobalPage.vue'),
      },
      {
        path: '/reportedeindicederotacionporcliente',
        component: () => import('src/pages/reportes/rotacionClientePage.vue'),
      },
      {
        path: '/reportedeventasporcampanas',
        component: () => import('src/pages/reportes/reporteVentasCampana.vue'),
      },
      {
        path: '/inventarioexterno',
        component: () => import('src/pages/inventarioExterior/inventarioExteriorPage.vue'),
      },
      {
        path: '/registrarcotizacionoculto',
        component: () => import('src/pages/cotizacion/cotizacionIndex.vue'),
      },
      {
        path: '/reportedecotizacionesocultas',
        component: () => import('src/pages/cotizacion/ReporteCotizacionPage.vue'),
      },
      {
        path: '/reporteproductosvendidosindividual',
        component: () => import('src/pages/cotizacion/DetalleProductosVendidosIndividual.vue'),
      },
      {
        path: '/kardex',
        component: () => import('src/pages/cotizacion/kardexPage.vue'),
      },
      {
        path: '/metodosdepagodefacturas',
        component: () => import('src/pages/metodoPago/metodoPago.vue'),
      },
      {
        path: '/leyendasdefacturas',
        component: () => import('src/pages/leyendaFactura/LeyendaFactura.vue'),
      },
      {
        path: '/procesarventaspendientes',
        component: () => import('src/pages/autorizaciones/VentasPendientesPage.vue'),
      },
      {
        path: '/cierrecaja',
        component: () => import('src/pages/cierrecaja/cierresDeCaja.vue'),
      },
      {
        path: '/generartokensapis',
        component: () => import('src/pages/token/ManualApisPage.vue'),
      },
      {
        path: '/ingresocredito',
        component: () => import('src/pages/compra/RcompraCreditoPage.vue'),
      },
      {
        path: '/autorizarcompra',
        component: () => import('src/pages/autorizaciones/autComprasPage.vue'),
      },
      {
        path: '/reportedecompras',
        component: () => import('src/pages/compra/RepComprasPage.vue'),
      },
      {
        path: '/reportedeindicederotacionporalmacen',
        component: () => import('src/pages/reportes/rotacionAlmacenPague.vue'),
      },
      {
        path: '/reportedeindicederotacionglobal',
        component: () => import('src/pages/reportes/rotacionGlobalPage.vue'),
      },
      {
        path: '/reportedeindicederotacionporcliente',
        component: () => import('src/pages/reportes/rotacionClientePage.vue'),
      },
      {
        path: '/reportedecampanas',
        component: () => import('src/pages/campanas/ReporteCampanasPage.vue'),
      },
      {
        path: '/reportedemovimientos',
        component: () => import('src/pages/movimiento/reporteMovimientoPage.vue'),
      },
      {
        path: '/reportedepedidos',
        component: () => import('src/pages/pedidos/reportePedidosPage.vue'),
      },
      {
        path: '/reportedepreciosbase',
        component: () => import('src/pages/precio/ReportePrecioBase.vue'),
      },
      {
        path: '/reportedecategoriasdeprecio',
        component: () => import('src/pages/precio/ReporteCategoriaPrecio.vue'),
      },
      {
        path: '/notascreditodebito',
        component: () => import('src/pages/NotasCreditoDebito/NotasCreditoDebitoPage.vue'),
      },
      {
        path: '/reportedeextravios',
        component: () => import('src/pages/devoluciones/reporteExtravioPage.vue'),
      },
      {
        path: '/reportedemermas',
        component: () => import('src/pages/devoluciones/reporteMermaPage.vue'),
      },
    ],
  },
  {
    path: '/configuracioninicial',
    component: () => import('pages/config/FormularioConfiguracionInicial.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it reportedecompras registrarventa
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
