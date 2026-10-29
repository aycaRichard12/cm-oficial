<template>
  <q-page>
    <q-card-section class="q-pa-md">
      <ReporteProductosHeader />

      <!-- Formulario de parámetros -->
      <ReporteProductosFechasForm
        v-model:fechaInicial="fechaInicial"
        v-model:fechaFinal="fechaFinal"
        :validarFechas="validarFechas"
        :disableExport="!datosFiltrados || datosFiltrados.length === 0"
        @generar="generarReporte"
        @exportar="onExportar"
      />

      <!-- Filtros -->
      <ReporteProductosFiltros
        v-model:almacenSeleccionado="almacenSeleccionado"
        :almacenesOptions="almacenesOptions"
        v-model:clienteSeleccionado="clienteSeleccionado"
        :clientesOptions="clientesOptions"
        v-model:sucursalSeleccionada="sucursalSeleccionada"
        :sucursalesOptions="sucursalesOptions"
        :onFilterClientes="filtrarClientes"
        :onFilterSucursales="filtrarSucursales"
      />

      <!-- Tabla de resultados -->
      <ReporteProductosTabla
        id="reporteProductosTabla"
        ref="tableRef"
        :rows="datosFiltrados"
        :columns="columnas"
        :arrayHeaders="arrayHeaders"
        :sumColumns="sumColumns"
        :loading="cargando"
        :sumatorias="sumatorias"
        :tipoVenta="tipoVenta"
        :formatearFecha="formatearFecha"
        :formatearNumero="formatearNumero"
        :decimas="decimas"
        :redondear="redondear"
      />
    </q-card-section>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'
import { useReporteProductosVendidosGlobal } from 'src/composables/useReporteProductosVendidosGlobal'

// Importar Componentes
import ReporteProductosHeader from 'src/components/reporte/reporteProductosVendidosGlobal/ReporteProductosHeader.vue'
import ReporteProductosFechasForm from 'src/components/reporte/reporteProductosVendidosGlobal/ReporteProductosFechasForm.vue'
import ReporteProductosFiltros from 'src/components/reporte/reporteProductosVendidosGlobal/ReporteProductosFiltros.vue'
import ReporteProductosTabla from 'src/components/reporte/reporteProductosVendidosGlobal/ReporteProductosTabla.vue'

// Importar Composable
const {
  // Estado
  fechaInicial,
  fechaFinal,
  cargando,
  datosFiltrados,
  // Filtros
  almacenesOptions,
  almacenSeleccionado,
  clientesOptions,
  clienteSeleccionado,
  sucursalesOptions,
  sucursalSeleccionada,
  // Computados
  sumatorias,
  tipoVenta,
  // Métodos
  validarFechas,
  generarReporte,
  exportarTablaAExcel,
  filtrarClientes,
  filtrarSucursales,
  cargarAlmacenes,
  formatearFecha,
  formatearNumero,
  decimas,
  redondear,
} = useReporteProductosVendidosGlobal()

// Referencia a la tabla para la exportación filtrada
const tableRef = ref(null)

// Manejar la exportación pasando los datos filtrados de la tabla visual
const onExportar = () => {
  const data = tableRef.value ? tableRef.value.obtenerDatosFiltrados() : []
  exportarTablaAExcel(data)
}

// Configuración de columnas (constantes estáticas, no necesitan reactividad profunda aquí)
const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), align: 'left', field: 'numero', dataType: 'number' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), align: 'left', field: 'fecha', dataType: 'date' },
  {
    name: 'nrofactura',
    label: i18nT('ui.nro-doc-54aa60'),
    align: 'left',
    field: 'nrofactura',
    dataType: 'number',
  },
  {
    name: 'tipoventa',
    label: i18nT('ui.tipo-de-venta-28cac9'),
    align: 'left',
    field: 'tipoventa',
    dataType: 'text',
  },
  { name: 'codigo', label: i18nT('ui.codigo-producto-24251e'), align: 'left', field: 'codigo', dataType: 'text' },
  {
    name: 'codigobarra',
    label: i18nT('ui.codigo-barras-5b224c'),
    align: 'left',
    field: 'codigobarra',
    dataType: 'text',
  },
  {
    name: 'descripcion',
    label: i18nT('ui.descripcion-de-producto-a09968'),
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
  },
  {
    name: 'preciobase',
    label: i18nT('ui.costo-unitario-4ec928'),
    align: 'right',
    field: 'preciobase',
    dataType: 'number',
  },
  {
    name: 'preciounitario',
    label: i18nT('ui.precio-unitario-fd8ab0'),
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
  },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), align: 'right', field: 'cantidad', dataType: 'number' },
  { name: 'importe', label: i18nT('ui.importe-4476a5'), align: 'right', field: 'importe', dataType: 'number' },
  { name: 'descuento', label: i18nT('ui.dscto-dfa854'), align: 'right', field: 'descuento', dataType: 'number' },
  {
    name: 'totalcosto',
    label: i18nT('ui.costo-total-ba6044'),
    align: 'right',
    field: 'totalcosto',
    dataType: 'number',
  },
  {
    name: 'totalventa',
    label: i18nT('ui.venta-total-7d061a'),
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
  },
  { name: 'utilidad', label: i18nT('ui.utilidad-64a80d'), align: 'right', field: 'utilidad', dataType: 'number' },
  { name: 'tipopago', label: i18nT('ui.tipo-pago-37dfbb'), align: 'left', field: 'tipopago', dataType: 'text' },
  {
    name: 'idusuario',
    label: i18nT('ui.nombre-de-usuario-cca84a'),
    align: 'left',
    field: 'idusuario',
    dataType: 'text',
  },
  {
    name: 'sucursalc',
    label: i18nT('ui.sucursal-del-cliente-079701'),
    align: 'left',
    field: 'sucursalc',
    dataType: 'text',
  },
  { name: 'almacen', label: i18nT('ui.almacen-empresa-d94ea9'), align: 'left', field: 'almacen', dataType: 'text' },
  {
    name: 'cliente',
    label: i18nT('ui.razon-social-empresa-b2928e'),
    align: 'left',
    field: 'cliente',
    dataType: 'text',
  },
  {
    name: 'tipodocumento',
    label: i18nT('ui.tipo-documento-0431b6'),
    align: 'left',
    field: 'tipodocumento',
    dataType: 'text',
  },
  {
    name: 'nrodoc',
    label: i18nT('ui.nro-doc-tributario-120235'),
    align: 'left',
    field: 'nrodoc',
    dataType: 'text',
  },
  {
    name: 'nombrecomercial',
    label: i18nT('ui.nombre-comercial-55a6ae'),
    align: 'left',
    field: 'nombrecomercial',
    dataType: 'text',
  },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), align: 'left', field: 'unidad', dataType: 'text' },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), align: 'left', field: 'categoria', dataType: 'text' },
  {
    name: 'subcategoria',
    label: i18nT('configProducto.categoriaProducto.types.subcategoria'),
    align: 'left',
    field: 'subcategoria',
    dataType: 'text',
  },
  { name: 'canal', label: i18nT('configuracion.canalesDeVenta.table.canal'), align: 'left', field: 'canal', dataType: 'text' },
  {
    name: 'tipoprecio',
    label: i18nT('ui.tipo-de-precio-75fa00'),
    align: 'left',
    field: 'tipoprecio',
    dataType: 'text',
  },
]

const arrayHeaders = [
  'numero',
  'fecha',
  'nrofactura',
  'tipoventa',
  'codigo',
  'codigobarra',
  'descripcion',
  'preciobase',
  'preciounitario',
  'cantidad',
  'importe',
  'descuento',
  'totalcosto',
  'totalventa',
  'utilidad',
  'tipopago',
  'idusuario',
  'sucursalc',
  'almacen',
  'cliente',
  'tipodocumento',
  'nrodoc',
  'nombrecomercial',
  'unidad',
  'categoria',
  'subcategoria',
  'canal',
  'tipoprecio',
]

const sumColumns = ['cantidad', 'importe', 'descuento', 'totalcosto', 'totalventa', 'utilidad']

onMounted(() => {
  // Cargar lista inicial de almacenes si se desea, aunque el composable ya lo maneja
  cargarAlmacenes()
})
</script>

<style scoped>
.q-table__top {
  padding: 0;
}
</style>
