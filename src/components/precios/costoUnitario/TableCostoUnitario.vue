<template>
  <div class="row flex justify-between">
    <!-- Filtro por almacén -->

    <div class="col-auto flex flex-col gap-3">
      <div class="col-12 col-md-4">
        <label for="almacen">Almacén</label>
        <q-select
          v-model="filtroAlmacen"
          :options="almacenes"
          id="almacen"
          map-options
          dense
          outlined
        />
      </div>

      <q-btn
        color="secondary"
        class="btn-res q-mt-lg"
        id="reportedepreciosbase"
        to="/reportedepreciosbase"
        icon="assessment"
        label="Reporte de Costos"
        no-caps
      />
    </div>

    <!-- Botón imprimir -->

    <q-btn outline="" color="info" @click="onPrintReport" class="btn-res q-mt-lg" dense>
      <q-icon name="picture_as_pdf" class="icono" />

      <span class="texto">Vista previa PDF</span>
    </q-btn>
  </div>
  <div class="row flex justify-end">
    <div class="">
      <label for="buscar">Buscar...</label>
      <q-input v-model="filter" dense outlined debounce="300" id="buscar">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <!-- Tabla de productos -->
  <q-table
    title="Costo Unitario"
    :columns="columnas"
    :rows="filtrados"
    row-key="id"
    flat
    bordered
    :filter="filter"
    :loading="loading"
    v-model:pagination="pagination"
  >
    <template v-slot:top-right> </template>
    <!-- Botones de opciones -->
    <template #body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          flat
          dense
          icon="edit"
          color="primary"
          @click="editarProducto(props.row)"
          title="Editar producto"
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
import { ref, computed, watch } from 'vue'

import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_REPORTE_COSTO_UNITARIO_X_ALMACEN } from 'src/utils/pdfReportGenerator'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const pdfData = ref(null)
const mostrarModal = ref(false)
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add', 'edit'])

const filtroAlmacen = ref(null)
const filter = ref('')
const pagination = ref({ page: 1, rowsPerPage: 10 })

// Procesamiento inicial para añadir índice si se desea
// const processedRows = computed(() => {
//   return props.rows.map((row, index) => ({
//     ...row,
//     numero: index + 1,
//   }))
// })

// Columnas de la tabla
const columnas = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  {
    name: 'precio',
    label: 'Costo',
    align: 'right',
    field: 'precio',
    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2) + currencyStore.simbolo),
  },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

// Filtro combinado por búsqueda y almacén
const filtrados = computed(() => {
  console.log(props.rows)
  console.log(filtroAlmacen.value)
  const almacen = filtroAlmacen.value
  const res = props.rows.filter((p) => {
    console.log(filtroAlmacen.value)
    const matchesAlmacen =
      (!filtroAlmacen.value || Number(p.idalmacen) === Number(almacen.value)) &&
      filtroAlmacen.value !== null
    const matchesCodigo =
      !filter.value ||
      p.codigo.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filter.value.toLowerCase())
    return matchesCodigo && matchesAlmacen
  })

  return res.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

watch(
  () => props.almacenes,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      console.log(nuevosAlmacenes)
      filtroAlmacen.value = nuevosAlmacenes[0]
    }
  },
  { immediate: true },
)
// Emitir evento de edición
function editarProducto(id) {
  emit('edit', id)
}
// Función imprimir (puedes reemplazar con lógica real)
function onPrintReport() {
  const almacen = filtroAlmacen.value
  const doc = PDF_REPORTE_COSTO_UNITARIO_X_ALMACEN(filtrados.value, almacen.label)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>
