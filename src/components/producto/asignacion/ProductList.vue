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
      <span class="texto">Nueva Asignación</span>
    </q-btn>

    <!-- Filtro por almacén -->
    <div class="col-2" id="filtroAlmacenProductos">
      <label for="almacen">Almacén</label>
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

      <span class="texto">Vista previa PDF</span>
    </q-btn>
  </div>
  <div class="flex justify-end q-mb-md">
    <div id="buscadorProductos">
      <label for="buscar">Buscar...</label>
      <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table
    id="tableProductos"
    title="Productos Asignados"
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="filter"
    flat
    bordered
  >
    <!-- Buscador -->

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
        <div class="text-h6">Vista previa de PDF</div>
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
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'codigobarra',
    label: 'Código barra',
    field: 'codigobarra',
    align: 'left',
    sortable: true,
  },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  {
    name: 'subcategoria',
    label: 'Sub categoría',
    field: 'subcategoria',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'detalle', label: 'País', field: 'detalle', align: 'left', sortable: true },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'rigth', sortable: true },
  { name: 'medida', label: 'Característica', field: 'medida', align: 'left', sortable: true },
  {
    name: 'caracteristica',
    label: 'Otras características',
    field: 'caracteristica',
    align: 'left',
    sortable: true,
  },
  {
    name: 'estadoproducto',
    label: 'Estado',
    field: 'estadoproducto',
    align: 'left',
    sortable: true,
  },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  {
    name: 'stockminimo',
    label: 'Stock mínimo',
    field: 'stockminimo',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stockmaximo',
    label: 'Stock máximo',
    field: 'stockmaximo',
    align: 'right',
    sortable: true,
  },
  { name: 'fecha', label: 'Fecha creación', field: 'fecha', align: 'center', sortable: true },
  { name: 'opciones', label: 'Acciones', field: 'actions', align: 'center' },
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
