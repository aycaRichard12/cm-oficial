<template>
  <q-tab-panel name="anuladas">
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
      title="Ventas Anuladas"
      :rows="filteredRows"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      no-data-label="No hay ventas anuladas"
      row-key="id"
      :search="busqueda"
      :filter-method="filtrarRows"
      :loading="loading"
      dense
      flat
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <VentasTableActions
            :row="props.row"
            :opciones="props.row.tipoventa === 0 ? [] : opcionesEstadoFactura"
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

// State
const filtroAlmacen = ref(0)
const filtroTipo = ref(0)
const busqueda = ref('')
const columnaBusqueda = ref(0)

const columnasBusqueda = [
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Fecha anulación' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Motivo' },
  { value: 7, label: 'Nro. factura' },
]

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center', dataType: 'number' },
  {
    name: 'fecharegistro',
    label: 'Fecha anulación',
    field: 'fecharegistro',
    align: 'center',
    dataType: 'date',
  },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center', dataType: 'date' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left', dataType: 'text' },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left', dataType: 'text' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left', dataType: 'text' },
  {
    name: 'nfactura',
    label: 'Nro. factura',
    field: 'nfactura',
    align: 'center',
    dataType: 'number',
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
]

const arrayHeaders = [
  'numero',
  'fecharegistro',
  'fechaventa',
  'cliente',
  'sucursal',
  'tipov',
  'motivo',
  'nfactura',
]

const opcionesEstadoFactura = [
  { label: 'Seleccione', value: '' },
  { label: 'Ver estado', value: 3 },
]

const filteredRows = computed(() => {
  if (filtroAlmacen.value) {
    return props.rows
      .filter((v) => Number(v.idalmacen) == filtroAlmacen.value)
      .filter((v) => Number(v.tipoventa) == filtroTipo.value)
  } else {
    return []
  }
})

const filtrarRows = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''

  if (!lowerTerms) {
    return rows
  }

  // Si se selecciona "Todas" (value 0)
  if (columnaBusqueda.value === 0) {
    return rows.filter((row) => {
      return cols.some((col) => {
        const val = cellValue(col, row)?.toString().toLowerCase() || ''
        return val.includes(lowerTerms)
      })
    })
  }

  const col = cols[columnaBusqueda.value]

  return rows.filter((row) => {
    if (!col) return false
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const handleAccion = ({ row, accion }) => {
  row.accionSeleccionada = accion
  emit('accion', row)
}
</script>
