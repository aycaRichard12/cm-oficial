import { defineAsyncComponent } from 'vue'
import IconVentas from 'src/assets/Ventas.png'
import IconPedidos from 'src/assets/Compras.png'
import IconAdmin from 'src/assets/Productos.png'
import IconReportes from 'src/assets/Reportes.png'
import IconDefault from 'src/assets/icon-128.png'

// Carga dinámica de componentes principales
const VentaComponent = defineAsyncComponent(() => import('src/components/venta/ventaComponent.vue'))
const PedidoComponent = defineAsyncComponent(() => import('pages/compra/RcompraPage.vue'))
const ProductoComponent = defineAsyncComponent(() => import('pages/producto/CproductoPage.vue'))
const ReporteComponent = defineAsyncComponent(
  () => import('src/components/reporte/reporteComponent.vue'),
)

// Registro de todos los módulos disponibles como atajos
export const shortcutsRegistry = [
  {
    id: 'venta',
    codigo: 'shortcut_venta',
    title: 'VENTAS',
    component: VentaComponent,
    icon: IconVentas,
    permissionKey: 'venta',
    routePath: '/registrarventa',
  },
  {
    id: 'compra',
    codigo: 'shortcut_compra',
    title: 'COMPRAS',
    component: PedidoComponent,
    icon: IconPedidos,
    permissionKey: 'compra',
    routePath: '/registrarcompra',
  },
  {
    id: 'producto',
    codigo: 'shortcut_producto',
    title: 'PRODUCTOS',
    component: ProductoComponent,
    icon: IconAdmin,
    permissionKey: 'producto',
    routePath: '/registrarproductos',
  },
  {
    id: 'dashboard',
    codigo: 'shortcut_dashboard',
    title: 'ESTADÍSTICAS',
    component: ReporteComponent,
    icon: IconReportes,
    permissionKey: 'dashboard',
    routePath: '/reportedeventas',
  },
  {
    id: 'cuentasxcobrar',
    codigo: 'shortcut_cuentasxcobrar',
    title: 'CUENTAS POR COBRAR',
    component: defineAsyncComponent(() => import('pages/cuentasxcobrar/CuentasxCobrarPage.vue')),
    icon: IconDefault,
    permissionKey: 'cuentasxcobrar',
    routePath: '/cuentasporcobrar',
  },
  {
    id: 'gestionpedidos',
    codigo: 'shortcut_gestionpedidos',
    title: 'GESTIÓN DE PEDIDOS',
    component: defineAsyncComponent(() => import('src/pages/autorizaciones/GestionPedidoPage.vue')),
    icon: IconDefault,
    permissionKey: 'gestionPedido',
    routePath: '/gestionPedido',
  },
  {
    id: 'reporteventas',
    codigo: 'shortcut_reporteventas',
    title: 'REPORTE DE VENTAS',
    component: defineAsyncComponent(() => import('pages/Venta/ReporteVentas.vue')),
    icon: IconDefault,
    permissionKey: 'reporteventas',
    routePath: '/reportedeventas',
  },
  {
    id: 'cierrecaja',
    codigo: 'shortcut_cierrecaja',
    title: 'CIERRE DE CAJA',
    component: defineAsyncComponent(() => import('src/pages/cierrecaja/cierresDeCaja.vue')),
    icon: IconDefault,
    permissionKey: 'cierrecaja',
    routePath: '/cierrecaja',
  },
  {
    id: 'proveedores',
    codigo: 'shortcut_proveedores',
    title: 'PROVEEDORES',
    component: defineAsyncComponent(() => import('pages/proveedor/proveedorAPage.vue')),
    icon: IconDefault,
    permissionKey: 'proveedor',
    routePath: '/registrarproveedor',
  },
  {
    id: 'clientes',
    codigo: 'shortcut_clientes',
    title: 'CLIENTES',
    component: defineAsyncComponent(() => import('pages/Client/admin/clienteAPage.vue')),
    icon: IconDefault,
    permissionKey: 'cliente',
    routePath: '/registrodecliente',
  },
  {
    id: 'kardex',
    codigo: 'shortcut_kardex',
    title: 'KARDEX',
    component: defineAsyncComponent(() => import('src/pages/cotizacion/kardexPage.vue')),
    icon: IconDefault,
    permissionKey: 'kardex',
    routePath: '/kardex',
  },
]

// Obtiene un atajo por su código
export function getShortcutByCodigo(codigo) {
  console.log(codigo)
  return shortcutsRegistry.find((s) => s.codigo === codigo)
}

// Obtiene un atajo por su ID
export function getShortcutById(id) {
  return shortcutsRegistry.find((s) => s.id === id)
}

// Lista de opciones disponibles para el selector (sin filtrar por permisos aún)
export function getAvailableShortcuts() {
  return shortcutsRegistry.map(({ codigo, title, id }) => ({ codigo, title, id }))
}
