<template>
  <!-- Botón Cancelar Registro -->
  <div class="row q-col-gutter-x-md q-mb-md">
    <div class="col-12 col-md-4">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenes"
        id="almacen"
        dense
        outlined
        @update:model-value="cargarCategoriaPrecio"
      />
    </div>
    <div class="col-12 col-md-4">
      <label for="categoria">Categoria</label>
      <q-select
        id="filtroCategoria"
        v-model="filtroscategoria"
        :options="categorias"
        dense
        outlined
      />
    </div>
    <div class="col-12 col-md-4 flex justify-end">
      <q-btn color="info" outline @click="onPrintReport" class="btn-res q-mt-lg" id="btnPDFps">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista Previa PDF</span>
      </q-btn>
    </div>
    <!-- Filtros -->
  </div>
  <div class="row justify-end" id="inputBuscarPS">
    <div class="q-mb-md">
      <label for="buscar">Buscar...</label>
      <q-input v-model="filter" dense outlined debounce="300" style="background-color: white">
        <template v-slot:append>
          <q-icon name="search" />
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
  >
    <template v-slot:top-right> </template>
    <template #body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          flat
          dense
          icon="edit"
          color="primary"
          @click="editarProducto(props.row)"
          title="Editar producto"
          id="btnEditarPS"
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
      p.precio.toLowerCase().includes(filter.value.toLowerCase())
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
  console.log(filtroAlmacen.value)
  const almacen = filtroAlmacen.value
  try {
    const response = await api.get(`listaCategoriaPrecio/${idempresa}`)
    console.log(response.data)
    console.log(idusuario)
    const filtrado = response.data.filter(
      (u) => Number(u.estado) == 1 && Number(u.idalmacen) == Number(almacen.value),
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
      filtroAlmacen.value = nuevosAlmacenes[0]
      cargarCategoriaPrecio()
    }
  },
  { immediate: true },
)
function onPrintReport() {
  const almacen = filtroAlmacen.value
  const doc = PDF_PRECIOS_SUGERIDOS(filtrados.value, almacen.label)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
