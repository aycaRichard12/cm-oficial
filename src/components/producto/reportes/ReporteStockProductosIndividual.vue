<template>
  <q-card-section>
    <q-form @submit.prevent class="q-mb-md">
      <div class="q-gutter-md">
        <div class="row q-col-gutter-md justify-center" id="filtroFechas">
          <div class="col-md-4">
            <label for="fechafin">Fecha Final*</label>
            <q-input
              v-model="fechaFin"
              id="fechafin"
              type="date"
              outlined
              dense
              @update:model-value="generarReporte"
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="almacen">Almacén*</label>
            <q-select
              v-model="form.almacen"
              id="almacen"
              :options="almacenes"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              outlined
              clearable
              class="col-md-4"
              :input-style="{ paddingLeft: '10px', paddingRight: '10px' }"
              @update:model-value="generarReporte"
            />
          </div>
        </div>
      </div>

      <div class="row q-gutter-sm justify-center q-mt-lg">
        <q-btn color="primary" label="Vista Previa" @click="vistaPrevia" id="vistaPrevia" />
        <q-btn color="primary" label="Reporte con imágen" @click="reporteImage" id="reporteImage" />
        <q-btn color="primary" label="Catálogo" @click="vistaCatalogo" id="vistaCatalogo" />
      </div>
    </q-form>

    <!-- <div class="row q-col-gutter-x-md flex justify-end">
      <div class="col-12 col-md-4" id="buscador">
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="search"
          placeholder="Buscar..."
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: white"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div> -->
    <BaseFilterableTable
      id="tablaStock"
      ref="miTabla"
      title="Productos"
      :rows="processedRows"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      :sumColumns="sumColumns"
      flat
      row-key="id"
      separator="horizontal"
      :filter="search"
      nombreColumnaTotales="costounitario"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          {{ Number(props.row.estado) === 1 ? 'Activo' : 'No Activo' }}
        </q-td>
      </template>
    </BaseFilterableTable>
  </q-card-section>

  <q-card-section>
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
  </q-card-section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { decimas, redondear } from 'src/composables/FuncionesG'
import { imagen } from 'src/boot/url'
import {
  PDFreporteStockProductosIndividual,
  PDFreporteStockProductosIndividual_img,
} from 'src/utils/pdfReportGenerator'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_vistaCatalogo } from 'src/utils/pdfs/catalogo/reporte'
const fechaFin = ref(obtenerFechaActualDato())
const pdfData = ref(null)
const mostrarModal = ref(false)
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const idusuario = contenidousuario[0]?.idusuario
const form = ref({})
const almacenes = ref([])
const search = ref('')
const divisaActiva = useCurrencyStore().simbolo

const datos = ref([])

const definicionColumnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center', dataType: 'number' },
  // { name: 'fecha', label: 'Fecha registro', field: 'fecha', align: 'left', dataType: 'date' },
  // { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left', dataType: 'text' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', dataType: 'text' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left', dataType: 'text' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', dataType: 'text' },
  {
    name: 'subcategoria',
    label: 'Sub categoría',
    field: 'subcategoria',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'descripcion',
    label: 'Descripcion',
    field: 'descripcion',
    align: 'left',
    dataType: 'text',
  },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text' },
  { name: 'pais', label: 'País', field: 'pais', align: 'left', dataType: 'text' },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left',
    datatype: 'text',
    sortable: true,
  },
  {
    name: 'stock',
    label: 'Stock',
    field: 'stock',
    align: 'right',
    dataType: 'number',
    sortable: true,
    format: (val) => decimas(val),
  },
  {
    name: 'costounitario',
    label: `Costo Unit. (${divisaActiva})`,
    field: 'costounitario',
    align: 'right',
    dataType: 'number',
    format: (val) => decimas(val),
  },
  {
    name: 'costo',
    label: `Costo total (${divisaActiva})`,
    field: 'costo',
    align: 'right',
    dataType: 'number',
    format: (val) => decimas(val),
  },
]

const columnas = computed(() => {
  const rows = processedRows.value
  if (!rows || rows.length === 0) return definicionColumnas

  return definicionColumnas.filter((col) => {
    // Si la columna es 'numero' siempre mostrar
    if (col.name === 'numero') return true

    return rows.some((row) => {
      const val = row[col.field]
      return val !== null && val !== undefined && val !== ''
    })
  })
})

const arrayHeaders = [
  'numero',
  'fecha',
  'almacen',
  'codigo',
  'producto',
  'categoria',
  'subcategoria',
  'descripcion',
  'unidad',
  'pais',
  'stock',
  'costo',
  'costounitario',
  'estado',
]

const sumColumns = ['costo']

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
    console.log(response)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    form.value.almacen = almacenes.value[0]?.value
    generarReporte()
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}

// Métodos simulados
const generarReporte = async () => {
  console.log('Generando reporte', form.value?.almacen)
  try {
    const point = `reporteproductoalmacen/${form.value?.almacen}/${idempresa}/${fechaFin.value}`
    console.log(point)
    const response = await api.get(`${point}`)
    console.log(response)
    datos.value = response.data
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}
const processedRows = computed(() => {
  let rows = [...datos.value]

  return rows.map((item, index) => ({
    ...item,
    numero: index + 1,
    costo: redondear(parseFloat(item.costounitario) * parseFloat(item.stock)),
    estado: estadoTexto(item.estado),
  }))
})

onMounted(() => {
  cargarAlmacenes()
})
const miTabla = ref(null)

const vistaPrevia = () => {
  // Obtener las columnas visibles de la tabla
  const visibleColumnsFromTable = miTabla.value?.obtenerColumnasVisibles() || []

  // Mapejar nombres de columnas: 'costo' en la UI -> 'costototal' en el PDF
  const mappedColumns = visibleColumnsFromTable.map((col) => ({
    ...col,
    name: col.name === 'costo' ? 'costototal' : col.name,
  }))
  const resultado = miTabla.value?.obtenerDatosFiltrados()

  const doc = PDFreporteStockProductosIndividual(resultado, mappedColumns)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const reporteImage = async () => {
  const productos = await prepararImagenes()
  const doc = PDFreporteStockProductosIndividual_img(productos)

  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

function convertirImagenARutaBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/jpeg')
      resolve(dataURL)
    }
    img.onerror = () => reject('Error al cargar imagen')
    img.src = url
  })
}
const prepararImagenes = async () => {
  const resultadoFiltrado = ref(null)
  resultadoFiltrado.value = miTabla.value?.obtenerDatosFiltrados()
  const productosConImagenes = await Promise.all(
    resultadoFiltrado.value.map(async (item) => {
      try {
        console.log(`${imagen}${item.imagen}`)
        const base64 = await convertirImagenARutaBase64(`${imagen}${item.imagen}`)
        console.log(base64)
        return { ...item, imagenBase64: base64 }
      } catch (e) {
        console.warn('No se pudo cargar imagen para', item.codigo + e)
        return { ...item, imagenBase64: null }
      }
    }),
  )
  console.log(productosConImagenes)
  return productosConImagenes
}

const vistaCatalogo = async () => {
  const resultadoFiltrado = ref(null)
  resultadoFiltrado.value = miTabla.value?.obtenerDatosFiltrados()
  const doc = await PDF_vistaCatalogo(resultadoFiltrado, almacenes, divisaActiva, form)

  pdfData.value = doc
  mostrarModal.value = true
}

function estadoTexto(estado) {
  return Number(estado) === 1 ? 'Activo' : 'Inactivo'
}
</script>
<style></style>
