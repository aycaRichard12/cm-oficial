<template>
  <div class="q-pa-sm">
    <!-- Filtros -->
    <q-card class="q-mb-md shadow-2 rounded-borders">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <span class="text-subtitle2 text-grey-8 q-mb-xs db">Almacén</span>
            <q-select
              v-model="filtroAlmacen"
              :options="almacenes"
              id="almacen"
              dense
              outlined
              options-dense
              bg-color="white"
              @update:model-value="cargarCategoriaPrecio"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <span class="text-subtitle2 text-grey-8 q-mb-xs db">Categoría</span>
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
          <div class="col-12 col-md-4 flex justify-end">
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Vista Previa PDF"
              @click="onPrintReport"
              class="q-mt-md full-width-lt-md"
              id="btnPDFps"
              no-caps
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Buscador -->
    <div class="row justify-end q-mb-md" id="inputBuscarPS">
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="filter"
          dense
          outlined
          debounce="300"
          placeholder="Buscar producto, código..."
          bg-color="white"
          class="shadow-1 rounded-borders"
        >
          <template v-slot:append>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Tabla -->
    <q-table
      :rows="filtrados"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      :filter="filter"
      :loading="loading"
      id="tablaPrecioSugerido"
      class="shadow-2 rounded-borders"
      header-class="bg-grey-2 text-grey-9 text-weight-bold"
    >
      <template #body-cell-opciones="props">
        <q-td :props="props" auto-width>
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="editarProducto(props.row)"
            id="btnEditarPS"
          >
            <q-tooltip content-class="bg-primary">Editar producto</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Loading State Customization -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </template>
    </q-table>

    <!-- Modal PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="column full-height">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="col q-pa-none overflow-hidden">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
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
  { name: 'numero', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Medida', field: 'unidad', align: 'left' },
  {
    name: 'precio',
    label: 'Precio' + ' (' + currencyStore.simbolo + ')',
    field: 'precio',
    align: 'right',
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
      p.codigo.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filter.value.toLowerCase()) ||
      String(p.precio).toLowerCase().includes(filter.value.toLowerCase())
    return matchesCodigo && matchesCateforia
  })

  // return datos.value.filter((row) => {
  //   const coincideBusqueda =
  //     buscar.value === '' ||
  //     row.descripcion.toLowerCase().includes(buscar.value.toLowerCase()) ||
  //     row.codigo.toLowerCase().includes(buscar.value.toLowerCase())
  //
  //   const coincideAlmacen = !filtros.value.almacen || true // Agrega lógica si almacenes filtran productos
  //   const coincideCategoria = !filtros.value.categoria || true // Agrega lógica si categorías filtran productos
  //
  //   return coincideBusqueda && coincideAlmacen && coincideCategoria
  // })
  return res.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
const cargarCategoriaPrecio = async (dataOrEvent) => {
  console.log(filtroAlmacen.value)
  const almacen = filtroAlmacen.value
  // check if dataOrEvent is an array (pre-fetched data) or event (null/mouseevent/value)
  let data = null
  if (Array.isArray(dataOrEvent)) {
    data = dataOrEvent
  }

  try {
    if (!data) {
      const response = await api.get(`listaCategoriaPrecio/${idempresa}`)
      console.log(response.data)
      console.log(idusuario)
      data = response.data
    }

    const filtrado = data.filter(
      (u) => Number(u.estado) == 1 && Number(u.idalmacen) == Number(almacen.value),
    )
    categorias.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    if (categorias.value.length > 0) {
      filtroscategoria.value = categorias.value[0]
    } else {
      filtroscategoria.value = null
    }
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
  async (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      try {
        const response = await api.get(`listaCategoriaPrecio/${idempresa}`)
        const allData = response.data
        // Find first warehouse that has categories
        const almacenConDatos = nuevosAlmacenes.find((alm) =>
          allData.some(
            (u) => Number(u.estado) == 1 && Number(u.idalmacen) == Number(alm.value),
          ),
        )

        if (almacenConDatos) {
          filtroAlmacen.value = almacenConDatos
          cargarCategoriaPrecio(allData)
        }
      } catch (e) {
        console.error(e)
      }
    }
  },
  { immediate: true },
)
function onPrintReport() {
  const almacen = filtroAlmacen.value
  const categoria = filtroscategoria.value
  const doc = PDF_PRECIOS_SUGERIDOS(filtrados.value, almacen.label, categoria?.label)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
