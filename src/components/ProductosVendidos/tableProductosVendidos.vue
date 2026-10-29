<template>
  <div>
    <div class="row justify-left q-mb-sm"></div>

    <!-- Selector de vista -->
    <div class="row justify-end q-mb-sm">
      <q-btn
        id="btnexportarexcel"
        :label="$t('ui.exportar-a-excel-1569c7')"
        icon="mdi-file-excel"
        color="green"
        @click="$emit('exportarexcel')"
      />
      <q-btn
        v-if="tipoVista == 'compacta'"
        label="PDF"
        icon="mdi-file-pdf-box"
        color="red"
        @click="$emit('reportepdf')"
      />
      <q-btn-toggle
        v-model="tipoVista"
        no-caps
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: $t('ui.lista-compacta-9bfa8c'), value: 'compacta' },
          { label: $t('ui.lista-extensa-47883c'), value: 'extensa' },
        ]"
      />
    </div>

    <BaseFilterableTable
      ref="refHijo"
      :title="$t('ui.reporte-productos-vendidos-ec4622')"
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
          {{ props.row.tipoDocumento || $t('ui.desconocido-452c8a') }}
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
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'nro', label: i18nT('cotizacion.table.number'), align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    align: 'right',
    field: 'fecha',
    dataType: 'date',
    soportable: true,
  },
  {
    name: 'nrofactura',
    label: i18nT('ui.n-doc-c73aae'),
    align: 'right',
    field: 'nrofactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipoventa',
    label: i18nT('ui.tipo-de-venta-28cac9'),
    align: 'left',
    field: 'tipoventa',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigo',
    label: i18nT('ui.codigo-producto-24251e'),
    align: 'left',
    field: 'codigo',
    dataType: 'text',
    sortable: true,
  },
  /**{
    name: 'codigobarra',
    label: i18nT('ui.codigo-barras-5b224c'),
    align: 'right',
    field: 'codigobarra',
    dataType: 'text',
    sortable: true,
  },*/
  {
    name: 'descripcion',
    label: i18nT('ui.descripcion-de-producto-a09968'),
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'preciounitario',
    label: i18nT('ui.precio-unitario-fd8ab0'),
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    align: 'right',
    field: 'cantidad',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'importe',
    label: i18nT('ui.importe-4476a5'),
    align: 'right',
    field: 'importe',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'descuento',
    label: i18nT('ui.dscto-dfa854'),
    align: 'right',
    field: 'descuento',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'totalventa',
    label: i18nT('ui.venta-total-7d061a'),
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipopago',
    label: i18nT('ui.tipo-pago-37dfbb'),
    align: 'left',
    field: 'tipopago',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'vendedor',
    label: i18nT('ui.nombre-de-usuario-cca84a'),
    align: 'left',
    field: 'vendedor',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'sucursalc',
    label: i18nT('ui.sucursal-del-cliente-079701'),
    align: 'left',
    field: 'sucursalc',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'almacen',
    label: i18nT('ui.almacen-empresa-d94ea9'),
    align: 'left',
    field: 'almacen',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cliente',
    label: i18nT('ui.razon-social-empresa-b2928e'),
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nombrecomercial',
    label: i18nT('ui.nombre-comercial-55a6ae'),
    align: 'left',
    field: 'nombrecomercial',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipodocumento',
    label: i18nT('ui.tipo-documento-0431b6'),
    align: 'left',
    field: 'tipodocumento',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nrodoc',
    label: i18nT('ui.nro-doc-tributario-120235'),
    align: 'right',
    field: 'nrodoc',
    dataType: 'text',
    sortable: true,
  },

  {
    name: 'unidad',
    label: i18nT('configProducto.unidadProducto.table.nombre'),
    align: 'left',
    field: 'unidad',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'categoria',
    label: i18nT('configProducto.categoriaProducto.types.categoria'),
    align: 'left',
    field: 'categoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'subcategoria',
    label: i18nT('configProducto.categoriaProducto.types.subcategoria'),
    align: 'left',
    field: 'subcategoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'canal',
    label: i18nT('configuracion.canalesDeVenta.table.canal'),
    align: 'left',
    field: 'canal',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipoprecio',
    label: i18nT('ui.tipo-de-precio-75fa00'),
    align: 'left',
    field: 'tipoprecio',
    dataType: 'text',
    sortable: true,
  },
]

// Columnas para vista compacta (sólo las 10 especificadas)
const columnasCompactas = [
  { name: 'nro', label: i18nT('cotizacion.table.number'), align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    align: 'right',
    field: 'fecha',
    dataType: 'date',
    soportable: true,
  },
  {
    name: 'nrofactura',
    label: i18nT('ui.n-doc-c73aae'),
    align: 'right',
    field: 'nrofactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'cliente',
    label: i18nT('ui.razon-social-empresa-b2928e'),
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigo',
    label: i18nT('ui.codigo-producto-24251e'),
    align: 'left',
    field: 'codigo',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: i18nT('ui.descripcion-de-producto-a09968'),
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    align: 'right',
    field: 'cantidad',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'preciounitario',
    label: i18nT('ui.precio-unitario-fd8ab0'),
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'descuento',
    label: i18nT('ui.dscto-dfa854'),
    align: 'right',
    field: 'descuento',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'totalventa',
    label: i18nT('ui.venta-total-7d061a'),
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
defineExpose({ obtenerDatos: () => ejecutarDesdePadre(), getActiveFiltersReport, tipoVista })

function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()
  console.log('Resultado recibido del hijo:', resultado)
  return resultado
}

// Eventos emitidos
defineEmits(['reportepdf', 'exportarexcel'])

// Formateo de moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}
</script>
