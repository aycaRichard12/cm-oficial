<template>
  <q-card flat bordered class="shadow-2 rounded-borders">
    <!-- Header Controls: Filters and Actions -->
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md items-center justify-between">
        <!-- Filtro Almacén -->
        <div class="col-12 col-sm-6 col-md-4" id="filtroAlmacenCostoUnitario">
          <q-select
            v-model="filtroAlmacen"
            :options="almacenes"
            label="Seleccionar Almacén"
            dense
            outlined
            map-options
            options-dense
            emit-value
            class="full-width"
            id="almacen"
            bg-color="white"
          >
            <template v-slot:prepend>
              <q-icon name="store" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Action Buttons -->
        <div class="col-12 col-sm-6 col-md-8 row justify-end q-gutter-x-sm">
          <q-btn
            color="secondary"
            id="reportedepreciosbase"
            to="/reportedepreciosbase"
            icon="assessment"
            label="Reporte de Costos"
            no-caps
            unelevated
          />

          <q-btn
            color="negative"
            icon="picture_as_pdf"
            label="Vista Previa PDF"
            no-caps
            @click="onPrintReport"
            id="btnVistaPDF"
            unelevated
          />
        </div>
      </div>
    </q-card-section>
    
    <q-separator />

    <!-- Tabla de productos -->
    <q-table
      :rows="filtrados"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      :filter="filter"
      :loading="loading"
      v-model:pagination="pagination"
      id="tableCostoUnitario"
      dense
      separator="cell"
      no-data-label="No se encontraron resultados"
      rows-per-page-label="Filas por página"
    >
      <template v-slot:top>
         <div class="full-width row justify-between items-center q-py-xs">
           <div class="text-h6 text-primary q-ml-sm">Costo Unitario</div>
           
           <!-- Search Input -->
           <q-input
             v-model="filter"
             placeholder="Buscar costo unitario..."
             dense
             outlined
             debounce="300"
             id="buscar"
             bg-color="grey-1"
             class="q-ml-md"
             style="min-width: 250px"
           >
             <template v-slot:append>
               <q-icon name="search" color="primary" />
             </template>
           </q-input>
         </div>
      </template>

      <!-- Botones de opciones -->
      <template #body-cell-opciones="props">
        <q-td :props="props" class="text-center" auto-width>
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="editarProducto(props.row)"
            title="Editar producto"
            id="btnEditarCostoUnitario"
          >
            <q-tooltip>Editar Costo</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Loading State -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- No Data State: Customizing the default 'no-data' slot overrides no-data-label, but we can keep it consistent -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-8 q-pa-md">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span class="q-ml-sm">No se encontraron resultados</span>
        </div>
      </template>
    </q-table>

    <!-- Modal PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column no-wrap">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Vista Previa de Reporte</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col q-pa-none">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            class="fit"
            style="border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
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
  { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad' },
  {
    name: 'precio',
    label: 'Costo' + ' (' + currencyStore.simbolo + ')',
    align: 'right',
    field: 'precio',
    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2)),
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
