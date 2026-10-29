<template>
  <div class="row flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      unelevated
      class="btn-res q-mt-lg"
      id="btnNuevaAsignacion"
    >
      <q-icon name="inventory_2" class="icono" />
      <span class="texto">{{ $t('ui.nueva-asignacion-e3b420') }}</span>
    </q-btn>

    <!-- Filtro por almacén -->
    <div class="col-2" id="filtroAlmacenProductos">
      <label for="almacen">{{ $t('inventario.warehouse') }}</label>
      <q-select
        v-model="filtro"
        :options="opciones"
        id="almacen"
        emit-value
        map-options
        dense
        outlined
        clearable
      />
    </div>

    <!-- Botón imprimir -->

    <q-btn
      outline=""
      color="info"
      @click="onPrintReport"
      class="btn-res q-mt-lg"
      id="btnPDFpreview"
    >
      <q-icon name="picture_as_pdf" class="icono" />

      <span class="texto">{{ $t('ui.vista-previa-pdf-46ad39') }}</span>
    </q-btn>
  </div>
  <div class="flex justify-end q-mb-md">
    <div id="buscadorProductos">
      <label for="buscar">{{ $t('common.search') }}</label>
      <q-input outlined dense debounce="300" v-model="filter" :placeholder="$t('common.search')">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table
    id="tableProductos"
    :title="$t('ui.productos-asignados-238368')"
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="filter"
    flat
    bordered
  >
    <!-- Buscador -->
    <template v-slot:body-cell-estado="props">
      <q-td :props="props" class="text-center">
        <q-btn
          flat
          round
          dense
          :icon="Number(props.row.estado) === 1 ? 'thumb_up' : 'thumb_down'"
          :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'"
          @click="$emit('toggle-estado', props.row)"
          :disable="props.row.estado === undefined"
        >
          <q-tooltip>
            {{ Number(props.row.estado) === 1 ? $t('ui.desactivar-producto-e694c2') : $t('ui.activar-producto-32afa2') }}
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <!-- Acciones -->
    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <!-- <q-btn
          dense
          round
          flat
          icon="edit"
          color="primary"
          @click="$emit('edit-item', props.row)"
        /> -->
        <q-btn
          icon="delete"
          color="negative"
          dense
          @click="$emit('delete-item', props.row)"
          flat
          id="btnEliminar"
        />
      </q-td>
    </template>
  </q-table>
  <q-dialog v-model="mostrarModal" full-width full-height>
    <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
        <q-space />
        <q-btn flat round icon="close" @click="mostrarModal = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
        <iframe
          v-if="pdfData"
          :src="pdfData"
          style="width: 100%; height: 100%; border: none"
        ></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch, computed } from 'vue'
import { DPF_REPORTE_PRODUCTO_ASIGNADOS } from 'src/utils/pdfReportGenerator'
// Props
const mostrarModal = ref(false)
const pdfData = ref(null)
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  opciones: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Eventos emitidos
const emit = defineEmits([
  'delete-item',
  'edit-item',
  'add',
  'onPrintReport',
  'onSeleccion_almacen',
  'toggle-estado',
])
const productoLista = computed(() => props.rows)
// Estado local
const filtro = ref(null) // almacén seleccionado
const filter = ref('') // texto del buscador

// Paginación
const pagination = ref({
  rowsPerPage: 5,
})
watch(
  () => props.opciones,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtro.value) {
      filtro.value = nuevosAlmacenes[0].value
    }
  },
  { immediate: true },
)
// Emitir selección de almacén
watch(
  filtro,
  (val) => {
    console.log(val)
    emit('onSeleccion_almacen', val)
  },
  { immediate: true },
)
// Columnas de la tabla
const columns = [
  { name: 'index', label: i18nT('cotizacion.table.number'), field: 'index', align: 'center' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left', sortable: true },
  {
    name: 'codigobarra',
    label: i18nT('ui.codigo-barra-427dc4'),
    field: 'codigobarra',
    align: 'left',
    sortable: true,
  },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left', sortable: true },
  {
    name: 'subcategoria',
    label: i18nT('ui.sub-categoria-229e51'),
    field: 'subcategoria',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'detalle', label: i18nT('ui.pais-0c664f'), field: 'detalle', align: 'left', sortable: true },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'rigth', sortable: true },
  { name: 'medida', label: i18nT('configProducto.caracteristicaProducto.table.nombre'), field: 'medida', align: 'left', sortable: true },
  {
    name: 'caracteristica',
    label: i18nT('ui.otras-caracteristicas-c95475'),
    field: 'caracteristica',
    align: 'left',
    sortable: true,
  },
  {
    name: 'estadoproducto',
    label: i18nT('ui.estado-fisico-4251d3'),
    field: 'estadoproducto',
    align: 'left',
    sortable: true,
  },
  { name: 'stock', label: i18nT('inventario.stock'), field: 'stock', align: 'right', sortable: true },
  {
    name: 'stockminimo',
    label: i18nT('ui.stock-minimo-e10ddd'),
    field: 'stockminimo',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stockmaximo',
    label: i18nT('ui.stock-maximo-8a95f2'),
    field: 'stockmaximo',
    align: 'right',
    sortable: true,
  },
  { name: 'fecha', label: i18nT('ui.fecha-creacion-c51fd0'), field: 'fecha', align: 'center', sortable: true },
  { name: 'fecha', label: i18nT('ui.fecha-creacion-c51fd0'), field: 'fecha', align: 'center', sortable: true },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'opciones', label: i18nT('common.actions'), field: 'actions', align: 'center' },
]

async function onPrintReport() {
  const almacen = props.opciones.find((obj) => (obj.value = filtro.value))
  const doc = await DPF_REPORTE_PRODUCTO_ASIGNADOS(productoLista, almacen)
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>

<style scoped>
.my-sticky-header-table {
  max-height: 600px;
  overflow-y: auto;
}
</style>
