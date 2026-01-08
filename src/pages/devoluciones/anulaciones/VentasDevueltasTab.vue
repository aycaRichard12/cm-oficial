<template>
  <q-tab-panel name="devueltas">
    <VentasFiltroBar
      v-model:almacen="filtroAlmacen"
      v-model:tipo="filtroTipo"
      v-model:busqueda="busqueda"
      v-model:columna="columnaBusqueda"
      :almacenes-options="almacenesOptions"
      :tipos-venta-options="tiposVentaOptions"
      :columnas-busqueda="columnasBusqueda"
    />

    <q-table
      title="Devoluciones"
      :rows="filteredRows"
      :columns="columnas"
      row-key="id"
      :filter="busqueda"
      :filter-method="filtrarRows"
      :loading="loading"
      :pagination="pagination"
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
    </q-table>
  </q-tab-panel>
</template>

<script setup>
import { ref, computed } from 'vue'
import VentasFiltroBar from './VentasFiltroBar.vue'
import VentasTableActions from './VentasTableActions.vue'
import VentasTableVerButtons from './VentasTableVerButtons.vue'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  almacenesOptions: { type: Array, default: () => [] },
  tiposVentaOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['accion', 'pdf', 'ver-factura', 'ver-siat'])

// State
const filtroAlmacen = ref(0)
const filtroTipo = ref(0)
const busqueda = ref('')
const columnaBusqueda = ref(0)
const pagination = ref({ rowsPerPage: 20 })

const columnasBusqueda = [
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Fecha devolución' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Motivo' },
  { value: 7, label: 'Nro. factura' },
]

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fechadevolucion', label: 'Fecha devolución', field: 'fechadevolucion', align: 'center', },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left' },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  { name: 'nfactura', label: 'Nro. factura', field: 'nfactura', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
]

const opcionesEstadoFactura = [
  { label: 'Seleccione', value: '' },
  { label: 'Ver estado', value: 3 },
]

const filteredRows = computed(() => {
  if (filtroAlmacen.value) {
    return props.rows
      .filter((v) => v.idalmacen == filtroAlmacen.value)
      .filter((v) => v.tipoventa == filtroTipo.value)
  } else {
    return []
  }
})

const filtrarRows = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''
  if (!lowerTerms || columnaBusqueda.value === 0) return rows
  
  const col = cols[columnaBusqueda.value]
  return rows.filter((row) => {
    if(!col) return false
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const handleAccion = ({ row, accion }) => {
  row.accionSeleccionada = accion
  emit('accion', row)
}
</script>
