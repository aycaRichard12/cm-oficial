<template>
  <div>
    <!-- Selector de vista -->
    <div class="row justify-end q-mb-sm">
      <q-btn-toggle
        v-model="tipoVista"
        no-caps
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Lista Compacta', value: 'compacta' },
          { label: 'Lista Extensa', value: 'extensa' },
        ]"
      />
    </div>

    <BaseFilterableTable
      ref="refHijo"
      title="Reporte Productos Vendidos"
      nombreColumnaTotales="estado"
      :rows="props.rows"
      :columns="columnasMostrar"
      :arrayHeaders="headersMostrar"
      :sumColumns="summationHeaders"
      row-key="id"
      flat
      bordered
      class="q-ma-sm shadow-2 rounded-borders"
    >
      <!-- Columna: Tipo (Estado) -->
      <template v-slot:body-cell-tipoDocumento="props">
        <q-td :props="props" class="text-center">
          {{ props.row.tipoDocumento || 'Desconocido' }}
        </q-td>
      </template>

      <!-- Descripción del producto -->
      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props" class="text-center">
          {{ props.row.descripcion }}
          <span v-if="props.row.descripcionAdicional">
            <br />
            <small class="text-weight-bold">{{ props.row.descripcionAdicional }}</small>
          </span>
        </q-td>
      </template>

      <!-- Columna de totales al final -->
      <template v-slot:body-cell-total_sumatorias="props">
        <q-td :props="props" class="text-right text-weight-bold">
          {{ formatCurrency(props.row.total_sumatorias) }}
        </q-td>
      </template>
    </BaseFilterableTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const refHijo = ref(null)

// Propiedades recibidas del componente padre
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Estado del selector de vista
const tipoVista = ref('extensa') // por defecto Lista Extensa

// ================== Definición de columnas ==================
// Columnas para vista extensa (todas las originales)
const columnasExtensas = [
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right',
    field: 'fecha',
    dataType: 'date',
    soportable: true,
  },
  {
    name: 'nrofactura',
    label: 'N° Doc.',
    align: 'right',
    field: 'nrofactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipoDocumento',
    label: 'Tipo de Venta',
    align: 'left',
    field: 'tipoDocumento',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigo',
    label: 'Código Producto',
    align: 'left',
    field: 'codigo',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigobarra',
    label: 'Código Barras',
    align: 'right',
    field: 'codigobarra',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción de Producto',
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'preciounitario',
    label: 'Precio Unitario',
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'right',
    field: 'cantidad',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'importe',
    label: 'Importe',
    align: 'right',
    field: 'importe',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: 'descuento',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'totalventa',
    label: 'Venta Total',
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipopago',
    label: 'Tipo Pago',
    align: 'left',
    field: 'tipopago',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'idusuario',
    label: 'Nombre de Usuario',
    align: 'left',
    field: 'idusuario',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'sucursalc',
    label: 'Sucursal del Cliente',
    align: 'left',
    field: 'sucursalc',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'almacen',
    label: 'Almacén Empresa',
    align: 'left',
    field: 'almacen',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cliente',
    label: 'Razón Social Empresa',
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipodocumento',
    label: 'Tipo Documento',
    align: 'left',
    field: 'tipodocumento',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nrodoc',
    label: 'Nro. Doc. Tributario',
    align: 'right',
    field: 'nrodoc',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    align: 'left',
    field: 'nombrecomercial',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'unidad',
    label: 'Unidad',
    align: 'left',
    field: 'unidad',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'categoria',
    label: 'Categoría',
    align: 'left',
    field: 'categoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'subcategoria',
    label: 'Sub Categoría',
    align: 'left',
    field: 'subcategoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'canal',
    label: 'Canal',
    align: 'left',
    field: 'canal',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipoprecio',
    label: 'Tipo de Precio',
    align: 'left',
    field: 'tipoprecio',
    dataType: 'text',
    sortable: true,
  },
]

// Columnas para vista compacta (sólo las 10 especificadas)
const columnasCompactas = [
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right',
    field: 'fecha',
    dataType: 'date',
    soportable: true,
  },
  {
    name: 'nrofactura',
    label: 'N° Doc.',
    align: 'right',
    field: 'nrofactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'cliente',
    label: 'Razón Social Empresa',
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigo',
    label: 'Código Producto',
    align: 'left',
    field: 'codigo',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción de Producto',
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'right',
    field: 'cantidad',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'preciounitario',
    label: 'Precio Unitario',
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: 'descuento',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'totalventa',
    label: 'Venta Total',
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
    sortable: true,
  },
]

// Columnas que se mostrarán en la tabla según el modo
const columnasMostrar = computed(() =>
  tipoVista.value === 'compacta' ? columnasCompactas : columnasExtensas,
)

// ================== Headers para filtros ==================
// Headers para vista extensa (todos los originales)
const headersExtensos = [
  'fecha',
  'nrofactura',
  'tipoDocumento',
  'codigo',
  'codigobarra',
  'descripcion',
  'preciounitario',
  'cantidad',
  'importe',
  'descuento',
  'totalventa',
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

// Headers para vista compacta (sólo campos visibles, se omite 'nro' como en la original)
const headersCompactos = [
  'fecha',
  'nrofactura',
  'cliente',
  'codigo',
  'descripcion',
  'cantidad',
  'preciounitario',
  'descuento',
  'totalventa',
]

// Headers dinámicos
const headersMostrar = computed(() =>
  tipoVista.value === 'compacta' ? headersCompactos : headersExtensos,
)

// ================== Sumatorias ==================
const summationHeaders = ['cantidad', 'importe', 'descuento', 'totalventa']

// ================== Métodos expuestos ==================
defineExpose({ obtenerDatos: () => ejecutarDesdePadre(), getActiveFiltersReport })

function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()
  console.log('Resultado recibido del hijo:', resultado)
  return resultado
}

// Eventos emitidos
defineEmits(['facturarVenta', 'generarComprobantePDF', 'column-filter-changed'])

// Formateo de moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}
</script>
