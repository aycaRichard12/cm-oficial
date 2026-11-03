<template>
  <q-tab-panel name="validas">
    <VentasFiltroBar
      v-model:almacen="filtroAlmacen"
      v-model:tipo="filtroTipo"
      v-model:busqueda="busqueda"
      v-model:columna="columnaBusqueda"
      :almacenes-options="almacenesOptions"
      :tipos-venta-options="tiposVentaOptions"
      :columnas-busqueda="columnasBusqueda"
    />

    <BaseFilterableTable
      id="tablaventasvalidas"
      :title="$t('ui.ventas-validas-3e630c')"
      :rows="filteredRows"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      :sumColumns="summationHeaders"
      nombre-columna-totales="nfactura"
      :no-data-label="$t('ui.no-hay-ventas-validas-779f93')"
      row-key="id"
      :filter="busqueda"
      :filter-method="filtrarRows"
      :loading="loading"
      flat
      dense
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <VentasTableActions
            :row="props.row"
            :opciones="getOpcionesAccion(props.row)"
            @accion="handleAccion"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-ver="props">
        <q-td :props="props">
          <VentasTableVerButtons
            :row="props.row"
            @pdf="$emit('pdf', $event)"
            @ver-factura="$emit('ver-factura', $event)"
            @ver-siat="$emit('ver-siat', $event)"
          />
        </q-td>
      </template>
    </BaseFilterableTable>
  </q-tab-panel>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import VentasFiltroBar from './VentasFiltroBar.vue'
import VentasTableActions from './VentasTableActions.vue'
import VentasTableVerButtons from './VentasTableVerButtons.vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  almacenesOptions: { type: Array, default: () => [] },
  tiposVentaOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['accion', 'pdf', 'ver-factura', 'ver-siat'])

// State for filters
const filtroAlmacen = ref(0)
const filtroTipo = ref(0)
const busqueda = ref('')
const columnaBusqueda = ref(0)

const columnasBusqueda = [
  { value: 0, label: i18nT('ui.todas-8a3c34') },
  { value: 1, label: i18nT('inventario.warehouse') },
  { value: 2, label: i18nT('cotizacion.table.date') },
  { value: 3, label: i18nT('ventas.client') },
  { value: 4, label: i18nT('ui.sucursal-07d782') },
  { value: 5, label: i18nT('ui.tipo-venta-5ea030') },
  { value: 6, label: i18nT('ui.tipo-pago-db71ca') },
  { value: 7, label: i18nT('configuracion.canalesDeVenta.table.canal') },
  { value: 8, label: i18nT('ui.nro-factura-15a3bf') },
  { value: 9, label: i18nT('ventas.total') },
  { value: 10, label: i18nT('ui.dscto-9c1760') },
  { value: 11, label: i18nT('ui.monto-835dcd') },
  { value: 12, label: i18nT('cotizacion.table.status') },
  { value: 12, label: i18nT('configGeneral.divisas.table.type') },
]

const columnas = [
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => filteredRows.value.indexOf(row) + 1,
    align: 'center',
    dataType: 'number',
  },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left', dataType: 'text' },
  {
    name: 'fechaventa',
    label: i18nT('cotizacion.table.date'),
    field: 'fechaventa',
    align: 'center',
    dataType: 'date',
    format: (val) => {
      if (!val) return ''
      if (typeof val === 'string' && val.includes('/')) return val
      if (typeof val === 'string' && val.includes('-')) {
        try {
          return cambiarFormatoFecha(val)
        } catch {
          return val
        }
      }
      return String(val)
    },
  },
  { name: 'cliente', label: i18nT('ventas.client'), field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'sucursal', label: i18nT('ui.sucursal-07d782'), field: 'sucursal', align: 'left', dataType: 'text' },
  { name: 'tipov', label: i18nT('ui.tipo-venta-5ea030'), field: 'tipov', align: 'left', dataType: 'text' },
  { name: 'tipopago', label: i18nT('ui.tipo-pago-db71ca'), field: 'tipopago', align: 'left', dataType: 'text' },
  { name: 'canal', label: i18nT('configuracion.canalesDeVenta.table.canal'), field: 'canal', align: 'left', dataType: 'text' },
  {
    name: 'nfactura',
    label: i18nT('ui.nro-factura-15a3bf'),
    field: 'nfactura',
    align: 'center',
    dataType: 'number',
  },
  { name: 'total', label: i18nT('ventas.total'), field: 'total', align: 'right', dataType: 'number' },
  { name: 'descuento', label: i18nT('ui.dscto-9c1760'), field: 'descuento', align: 'right', dataType: 'number' },
  { name: 'montototal', label: i18nT('ui.monto-835dcd'), field: 'montototal', align: 'right', dataType: 'number' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'left', dataType: 'text' },
  { name: 'tipo', label: i18nT('configGeneral.divisas.table.type'), field: 'tipo', align: 'left', dataType: 'text' },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
  { name: 'ver', label: i18nT('ui.ver-49b372'), field: 'ver', align: 'center' },
]

const arrayHeaders = [
  'numero',
  'almacen',
  'fechaventa',
  'cliente',
  'sucursal',
  'tipov',
  'tipopago',
  'canal',
  'nfactura',
  'total',
  'descuento',
  'montototal',
  'estado',
  'tipo',
]

const summationHeaders = ['total', 'descuento', 'montototal']

const opcionesAccionSimple = [
  { label: i18nT('ui.seleccione-81cab4'), value: '' },
  { label: i18nT('ui.anulacion-1ede2d'), value: 1 },
  { label: i18nT('ui.devolucion-ce2809'), value: 2 },
]

const opcionesAccionCotizacionNormal = [
  { label: i18nT('ui.seleccione-81cab4'), value: '' },
  { label: i18nT('ui.anulacion-1ede2d'), value: 1 },
  { label: i18nT('ui.ver-estado-636348'), value: 3 },
]

const opcionesAccionCompleta = [
  { label: i18nT('ui.seleccione-81cab4'), value: '' },
  { label: i18nT('ui.anulacion-1ede2d'), value: 1 },
  { label: i18nT('ui.devolucion-ce2809'), value: 2 },
  { label: i18nT('ui.ver-estado-636348'), value: 3 },
]

// Logic
const getNumber = (val) => Number(val)

const getOpcionesAccion = (venta) => {
  if (getNumber(venta.tipoventa) == 0 && venta.tipo === 'FAC') {
    return opcionesAccionSimple
  } else if (getNumber(venta.tipoventa) == -1 && venta.tipo === 'PREF') {
    return opcionesAccionSimple
  } else if (getNumber(venta.tipoventa) == -1 && venta.tipo === 'NOR') {
    return opcionesAccionCotizacionNormal
  } else {
    return opcionesAccionCompleta
  }
}

const filteredRows = computed(() => {
  if (filtroAlmacen.value || filtroTipo.value) {
    if (filtroAlmacen.value) {
      return props.rows
        .filter((v) => filtroAlmacen.value === 0 || v.idalmacen == filtroAlmacen.value)
        .filter((v) => v.tipoventa == filtroTipo.value)
    }
    return []
  }
  return []
})

const filtrarRows = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''
  if (!lowerTerms || columnaBusqueda.value === 0) {
    return rows
  }

  const col = cols[columnaBusqueda.value]

  return rows.filter((row) => {
    // Safety check if col exists
    if (!col) return false
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const handleAccion = ({ row, accion }) => {
  // Update row state to have accionSeleccionada
  row.accionSeleccionada = accion
  emit('accion', row)
}
</script>
