<template>
  <!-- Encabezado de acciones -->
  <div class="row q-mt-lg q-gutter-md items-center">
    <!-- Columna: botones principales -->
    <div class="col-auto flex flex-col gap-3">
      <q-btn
        color="primary"
        class="btn-res"
        icon="add"
        label="Agregar"
        no-caps
        @click="$emit('add')"
      />

      <q-btn
        color="secondary"
        class="btn-res"
        id="reportedecategoriasdeprecio"
        to="/reportedecategoriasdeprecio"
        icon="assessment"
        label="Reporte Categorías"
        no-caps
      />
    </div>

    <!-- Columna: filtro de almacén -->

    <!-- Columna: acción PDF -->
    <div class="col-auto">
      <q-btn
        color="info"
        outline
        class="btn-res"
        icon="picture_as_pdf"
        label="Vista Previa PDF"
        no-caps
        @click="imprimir"
      />
    </div>
  </div>

  <div class="row justify-between q-gutter-md q-mt-md q-mb-md">
    <!-- Filtro de almacén -->
    <q-select
      v-model="filtroAlmacen"
      :options="almacenes"
      label="Seleccione un Almacén"
      dense
      outlined
      map-options
      class="min-w-[220px]"
    />

    <!-- Buscador -->
    <q-input
      v-model="search"
      label="Buscar..."
      dense
      outlined
      debounce="300"
      class="bg-white min-w-[220px]"
    >
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>
  </div>

  <!-- Tabla -->
  <q-table
    flat
    :rows="filtradas"
    :filter="search"
    :columns="columnas"
    row-key="id"
    :pagination="{ rowsPerPage: 5 }"
  >
    <template v-slot:top-right> </template>
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
        <q-badge color="red" v-else label="Inactivo" outline />
      </q-td>
    </template>

    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          icon="edit"
          color="primary"
          dense
          class="q-mr-sm"
          @click="$emit('edit-item', props.row)"
          flat
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat />
        <q-btn
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
          @click="$emit('toggle-status', props.row)"
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
import { PDF_REPORTE_CATEGORIA_PRECIO_X_ALMACEN } from 'src/utils/pdfReportGenerator'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const filtroAlmacen = ref(null)
const pdfData = ref(null)
const mostrarModal = ref(false)
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
})
console.log('Props almacenes en tabla:', props.rows)
defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: 'numero', sortable: true },
  { name: 'nombre', label: 'Categoría', align: 'left', field: 'nombre' },
  { name: 'porcentaje', label: 'Porcentaje', align: 'right', field: 'porcentaje' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]
const filtradas = computed(() => {
  let rows = props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))

  // Solo filtrar si hay selección
  console.log(filtroAlmacen.value)
  if (filtroAlmacen.value !== null) {
    rows = rows.filter((categoria) => categoria.idalmacen == filtroAlmacen.value?.value)
  }

  // Filtro por búsqueda
  if (search.value) {
    const term = search.value.toLowerCase()
    rows = rows.filter((r) => r.nombre.toLowerCase().includes(term))
  }

  return rows
})
console.log(props.almacenes)
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

const imprimir = () => {
  const doc = PDF_REPORTE_CATEGORIA_PRECIO_X_ALMACEN(filtradas.value, filtroAlmacen.value)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}

const search = ref('')
</script>
