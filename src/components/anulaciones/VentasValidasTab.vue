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
      title="Ventas Validas"
      :rows="filteredRows"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      :sumColumns="summationHeaders"
      nombre-columna-totales="nfactura"
      no-data-label="No hay ventas validas"
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
            :opciones="
              getNumber(props.row.tipoventa) == 0 ? opcionesAccionSimple : opcionesAccionCompleta
            "
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
import { ref, computed } from 'vue'
import VentasFiltroBar from './VentasFiltroBar.vue'
import VentasTableActions from './VentasTableActions.vue'
import VentasTableVerButtons from './VentasTableVerButtons.vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

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
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Almacén' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Tipo pago' },
  { value: 7, label: 'Canal' },
  { value: 8, label: 'Nro. factura' },
  { value: 9, label: 'Total' },
  { value: 10, label: 'Dscto' },
  { value: 11, label: 'Monto' },
  { value: 12, label: 'Estado' },
]

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center', dataType: 'number' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left', dataType: 'text' },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center', dataType: 'date' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left', dataType: 'text' },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left', dataType: 'text' },
  { name: 'tipopago', label: 'Tipo pago', field: 'tipopago', align: 'left', dataType: 'text' },
  { name: 'canal', label: 'Canal', field: 'canal', align: 'left', dataType: 'text' },
  {
    name: 'nfactura',
    label: 'Nro. factura',
    field: 'nfactura',
    align: 'center',
    dataType: 'number',
  },
  { name: 'total', label: 'Total', field: 'total', align: 'right', dataType: 'number' },
  { name: 'descuento', label: 'Dscto', field: 'descuento', align: 'right', dataType: 'number' },
  { name: 'montototal', label: 'Monto', field: 'montototal', align: 'right', dataType: 'number' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', dataType: 'text' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
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
]

const summationHeaders = ['total', 'descuento', 'montototal']

const opcionesAccionSimple = [
  { label: 'Seleccione', value: '' },
  { label: 'Anulación', value: 1 },
  { label: 'Devolución', value: 2 },
]

const opcionesAccionCompleta = [
  { label: 'Seleccione', value: '' },
  { label: 'Anulación', value: 1 },
  { label: 'Devolución', value: 2 },
  { label: 'Ver estado', value: 3 },
]

// Logic
const getNumber = (val) => Number(val)

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
