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

    <BaseFilterableTable
      id="tablaventasdevueltas"
      :title="$t('ui.devoluciones-c4cbac')"
      :rows="filteredRows"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      :no-data-label="$t('ui.no-hay-devoluciones-26d0e8')"
      row-key="id"
      :search="busqueda"
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

// State
const filtroAlmacen = ref(0)
const filtroTipo = ref(0)
const busqueda = ref('')
const columnaBusqueda = ref(0)
const pagination = ref({ rowsPerPage: 20 })

const columnasBusqueda = [
  { value: 0, label: i18nT('ui.todas-8a3c34') },
  { value: 1, label: i18nT('ui.fecha-devolucion-a59451') },
  { value: 2, label: i18nT('cotizacion.table.date') },
  { value: 3, label: i18nT('ventas.client') },
  { value: 4, label: i18nT('ui.sucursal-07d782') },
  { value: 5, label: i18nT('ui.tipo-venta-5ea030') },
  { value: 6, label: i18nT('ui.motivo-cbeec5') },
  { value: 7, label: i18nT('ui.nro-factura-15a3bf') },
]

const columnas = [
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => filteredRows.value.indexOf(row) + 1,
    align: 'center',
    dataType: 'number',
  },
  {
    name: 'fechadevolucion',
    label: i18nT('ui.fecha-devolucion-a59451'),
    field: 'fechadevolucion',
    align: 'center',

    format: (val) => (val ? cambiarFormatoFecha(val) : ''),
  },
  {
    name: 'fechaventa',
    label: i18nT('cotizacion.table.date'),
    field: 'fechaventa',
    align: 'center',
    format: (val) => (val ? cambiarFormatoFecha(val) : ''),
  },
  { name: 'cliente', label: i18nT('ventas.client'), field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'sucursal', label: i18nT('ui.sucursal-07d782'), field: 'sucursal', align: 'left', dataType: 'text' },
  { name: 'tipov', label: i18nT('ui.tipo-venta-5ea030'), field: 'tipov', align: 'left', dataType: 'text' },
  { name: 'motivo', label: i18nT('ui.motivo-cbeec5'), field: 'motivo', align: 'left', dataType: 'text' },
  {
    name: 'nfactura',
    label: i18nT('ui.nro-factura-15a3bf'),
    field: 'nfactura',
    align: 'center',
    dataType: 'number',
  },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
  { name: 'ver', label: i18nT('ui.ver-49b372'), field: 'ver', align: 'center' },
  { name: 'cliente', label: i18nT('ventas.client'), field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'sucursal', label: i18nT('ui.sucursal-07d782'), field: 'sucursal', align: 'left', dataType: 'text' },
  { name: 'tipov', label: i18nT('ui.tipo-venta-5ea030'), field: 'tipov', align: 'left', dataType: 'text' },
  { name: 'motivo', label: i18nT('ui.motivo-cbeec5'), field: 'motivo', align: 'left', dataType: 'text' },
  {
    name: 'nfactura',
    label: i18nT('ui.nro-factura-15a3bf'),
    field: 'nfactura',
    align: 'center',
    dataType: 'number',
  },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
  { name: 'ver', label: i18nT('ui.ver-49b372'), field: 'ver', align: 'center' },
]

const arrayHeaders = [
  'numero',
  'fechadevolucion',
  'fechaventa',
  'cliente',
  'sucursal',
  'tipov',
  'motivo',
  'nfactura',
]
const opcionesEstadoFactura = [
  { label: i18nT('ui.seleccione-81cab4'), value: '' },
  { label: i18nT('ui.ver-estado-636348'), value: 3 },
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
  if (!lowerTerms) return rows

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
