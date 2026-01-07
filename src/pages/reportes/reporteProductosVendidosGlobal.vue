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
  { name: 'numero', label: 'N°', align: 'left', field: 'numero', dataType: 'number' },
  { name: 'fecha', label: 'Fecha', align: 'left', field: 'fecha', dataType: 'date' },
  {
    name: 'nrofactura',
    label: 'Nro. Doc.',
    align: 'left',
    field: 'nrofactura',
    dataType: 'number',
  },
  {
    name: 'tipoventa',
    label: 'Tipo de Venta',
    align: 'left',
    field: 'tipoventa',
    dataType: 'text',
  },
  { name: 'codigo', label: 'Código Producto', align: 'left', field: 'codigo', dataType: 'text' },
  {
    name: 'codigobarra',
    label: 'Código Barras',
    align: 'left',
    field: 'codigobarra',
    dataType: 'text',
  },
  {
    name: 'descripcion',
    label: 'Descripción de Producto',
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
  },
  {
    name: 'preciobase',
    label: 'Costo Unitario',
    align: 'right',
    field: 'preciobase',
    dataType: 'number',
  },
  {
    name: 'preciounitario',
    label: 'Precio Unitario',
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
  },
  { name: 'cantidad', label: 'Cantidad', align: 'right', field: 'cantidad', dataType: 'number' },
  { name: 'importe', label: 'Importe', align: 'right', field: 'importe', dataType: 'number' },
  { name: 'descuento', label: 'Dscto.', align: 'right', field: 'descuento', dataType: 'number' },
  {
    name: 'totalcosto',
    label: 'Costo Total',
    align: 'right',
    field: 'totalcosto',
    dataType: 'number',
  },
  {
    name: 'totalventa',
    label: 'Venta Total',
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
  },
  { name: 'utilidad', label: 'Utilidad', align: 'right', field: 'utilidad', dataType: 'number' },
  { name: 'tipopago', label: 'Tipo Pago', align: 'left', field: 'tipopago', dataType: 'text' },
  {
    name: 'idusuario',
    label: 'Nombre de Usuario',
    align: 'left',
    field: 'idusuario',
    dataType: 'text',
  },
  {
    name: 'sucursalc',
    label: 'Sucursal del Cliente',
    align: 'left',
    field: 'sucursalc',
    dataType: 'text',
  },
  { name: 'almacen', label: 'Almacén Empresa', align: 'left', field: 'almacen', dataType: 'text' },
  {
    name: 'cliente',
    label: 'Razón Social Empresa',
    align: 'left',
    field: 'cliente',
    dataType: 'text',
  },
  {
    name: 'tipodocumento',
    label: 'Tipo Documento',
    align: 'left',
    field: 'tipodocumento',
    dataType: 'text',
  },
  {
    name: 'nrodoc',
    label: 'Nro. Doc. Tributario',
    align: 'left',
    field: 'nrodoc',
    dataType: 'text',
  },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    align: 'left',
    field: 'nombrecomercial',
    dataType: 'text',
  },
  { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad', dataType: 'text' },
  { name: 'categoria', label: 'Categoría', align: 'left', field: 'categoria', dataType: 'text' },
  {
    name: 'subcategoria',
    label: 'Sub Categoría',
    align: 'left',
    field: 'subcategoria',
    dataType: 'text',
  },
  { name: 'canal', label: 'Canal', align: 'left', field: 'canal', dataType: 'text' },
  {
    name: 'tipoprecio',
    label: 'Tipo de Precio',
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

const sumColumns = ['cantidad', 'importe', 'descuento', 'totalcosto', 'totalventa']

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
