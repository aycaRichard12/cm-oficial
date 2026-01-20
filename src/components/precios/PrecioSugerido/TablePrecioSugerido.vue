<template>
  <q-card flat bordered class="shadow-2 rounded-borders">
    <!-- Header / Filters Section -->
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md items-end">
        <!-- Almacén Filter -->
        <div class="col-12 col-sm-4">
          <label class="text-weight-bold text-grey-8 q-mb-sm block">Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="almacenes"
            id="almacen"
            dense
            outlined
            options-dense
            emit-value
            map-options
            bg-color="white"
            @update:model-value="cargarCategoriaPrecio"
          >
            <template v-slot:prepend>
              <q-icon name="store" />
            </template>
          </q-select>
        </div>

        <!-- Categoria Filter -->
        <div class="col-12 col-sm-4">
          <label class="text-weight-bold text-grey-8 q-mb-sm block">Categoría</label>
          <q-select
            id="filtroCategoria"
            v-model="filtroscategoria"
            :options="categorias"
            dense
            outlined
            options-dense
            bg-color="white"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>
        </div>

        <!-- PDF Button (Align with inputs) -->
        <div class="col-12 col-sm-4 flex justify-end">
          <q-btn
            color="negative"
            icon="picture_as_pdf"
            label="Vista Previa PDF"
            unelevated
            @click="onPrintReport"
            class="full-width"
            id="btnPDFps"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Table Section -->
    <q-card-section class="q-pa-none">
      <q-table
        :rows="filtrados"
        :columns="columnas"
        row-key="id"
        flat
        bordered

        :loading="loading"
        id="tablaPrecioSugerido"
        dense
        separator="cell"
        no-data-label="No se encontraron registros"
        rows-per-page-label="Filas por página"
      >
        <!--  Input in para buscar Table Top Slot -->
        <template v-slot:top>
          <div class="full-width row justify-between items-center q-py-xs">
            <div class="text-h6 text-primary q-ml-sm">Lista de Precios</div>
            <q-input
              v-model="filter"
              dense
              outlined
              debounce="300"
              placeholder="Buscar..."
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

        <template #body-cell-opciones="props">
          <q-td :props="props" auto-width>
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="editarProducto(props.row)"
              title="Editar producto"
              id="btnEditarPS"
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>

  <!-- PDF Modal -->
  <q-dialog
    v-model="mostrarModal"
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column full-height">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Vista Previa del Reporte</q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="col q-pa-none">
        <iframe
          v-if="pdfData"
          :src="pdfData"
          class="full-width full-height"
          style="border: none"
        ></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_PRECIOS_SUGERIDOS } from 'src/utils/pdfReportGenerator'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const pdfData = ref(null)
const mostrarModal = ref(false)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
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
const filtroAlmacen = ref(null)
const filtroscategoria = ref(null)
const filter = ref('')
const emit = defineEmits(['add', 'edit'])
const categorias = ref([])
// Datos simulados
// const datos = ref([
//   { id: 4002, codigo: 'P-01', descripcion: 'Base de maquillaje completo 50 tonos', precio: 0 },
//   { id: 4001, codigo: 'qq', descripcion: 'qq', precio: 0 },
// ])

const columnas = [
  { name: 'numero', label: 'N°', field: (row) => row.numero, align: 'center', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
    style: 'min-width: 300px; white-space: normal;',
  },
  { name: 'numero', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Medida', field: 'unidad', align: 'left' },
  {
    name: 'precio',
    label: 'Precio' + ' (' + currencyStore.simbolo + ')',
    field: 'precio',
    align: 'right',
    sortable: true,

    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2)),
  },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const filtrados = computed(() => {
  const res = props.rows.filter((p) => {
    const matchesCateforia =
      (!filtroscategoria.value ||
        Number(p.idporcentaje) === Number(filtroscategoria.value?.value)) &&
      filtroscategoria.value !== null
    const matchesCodigo =
      !filter.value ||
      p.codigo?.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(filter.value.toLowerCase()) ||
      String(p.precio).toLowerCase().includes(filter.value.toLowerCase())
    return matchesCodigo && matchesCateforia
  })

  // return datos.value.filter((row) => {
  //   const coincideBusqueda =
  //     buscar.value === '' ||
  //     row.descripcion.toLowerCase().includes(buscar.value.toLowerCase()) ||
  //     row.codigo.toLowerCase().includes(buscar.value.toLowerCase())

  //   const coincideAlmacen = !filtros.value.almacen || true // Agrega lógica si almacenes filtran productos
  //   const coincideCategoria = !filtros.value.categoria || true // Agrega lógica si categorías filtran productos

  //   return coincideBusqueda && coincideAlmacen && coincideCategoria
  // })
  return res.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
const cargarCategoriaPrecio = async () => {
  /* console.log(filtroAlmacen.value) */
  const almacenId = filtroAlmacen.value
  try {
    const response = await api.get(`listaCategoriaPrecio/${idempresa}`)
    console.log(response.data)
    console.log(idusuario)
    const filtrado = response.data.filter(
      (u) => Number(u.estado) == 1 && Number(u.idalmacen) == Number(almacenId),
    )
    categorias.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    filtroscategoria.value = categorias.value[0]
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function editarProducto(row) {
  console.log('Editar producto:', row)
  emit('edit', row)
}
watch(
  () => props.almacenes,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      console.log(nuevosAlmacenes)
      filtroAlmacen.value = nuevosAlmacenes[0].value
      cargarCategoriaPrecio()
    }
  },
  { immediate: true },
)
function onPrintReport() {
  const almacenId = filtroAlmacen.value
  const almacenObj = props.almacenes.find(a => a.value === almacenId)
  const label = almacenObj ? almacenObj.label : ''
  const doc = PDF_PRECIOS_SUGERIDOS(filtrados.value, label)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
