<template>
  <q-card-section>
    <q-form @submit.prevent>
      <div class="q-gutter-md">
        <div class="row q-col-gutter-md justify-center" id="filtroFechas">
          <div class="col-md-4">
            <label for="fechafin">Fecha Final*</label>
            <q-input
              v-model="fechaFin"
              id="fechafin"
              type="date"
              outlined
              2
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

    <div class="row q-col-gutter-x-md flex justify-end">
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
    </div>
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
import jsPDF from 'jspdf'
import { imagen } from 'src/boot/url'
import { PDFreporteStockProductosIndividual, PDFreporteStockProductosIndividual_img, getLogoBase64 } from 'src/utils/pdfReportGenerator'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { useCurrencyStore } from 'src/stores/currencyStore'
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
const vistaPrevia = () => {
  const doc = PDFreporteStockProductosIndividual(processedRows)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const reporteImage = async () => {
  const doc = PDFreporteStockProductosIndividual_img(processedRows)

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
  const productosConImagenes = await Promise.all(
    processedRows.value.map(async (item) => {
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
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })
  const productos = await prepararImagenes() // ahora tienen `imagenBase64`
  
  const idempresa = contenidousuario[0]
  const empresa = idempresa.empresa

  const pageWidth = doc.internal.pageSize.getWidth()
  
  // LOGO de la Empresa (Centrado)
  const logo = getLogoBase64()
  if (logo) {
    const imgWidth = 20
    const imgHeight = 20
    const xPos = (pageWidth - imgWidth) / 2
    doc.addImage(logo, 'PNG', xPos, 5, imgWidth, imgHeight, undefined, 'FAST')
  }

  // Textos de Empresa (Lado Izquierdo)
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(empresa.nombre || '', 10, 10)
  
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text(empresa.direccion || '', 10, 13)
  doc.text(empresa.oestado || '', 10, 16)
  doc.text(empresa.ociudad || '', 10, 19)
  doc.text(empresa.opais || '', 10, 22)

  // Datos Derecho
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('NIT:' + (empresa.nit || ''), pageWidth - 10, 10, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Telf.: ' + (empresa.telefono || ''), pageWidth - 10, 13, { align: 'right' })
  doc.text('Cel.: ' + (empresa.ocelular || ''), pageWidth - 10, 16, { align: 'right' })
  doc.text(empresa.email || '', pageWidth - 10, 19, { align: 'right' })
  doc.text(empresa.ositioweb || '', pageWidth - 10, 22, { align: 'right' })

  // Línea Recta de la Cabecera
  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 25, pageWidth - 10, 25)

  // -------------------------
  // TÍTULO CENTRADO
  // -------------------------
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('CATÁLOGO DE PRODUCTOS', pageWidth / 2, 30, { align: 'center' })

  // -------------------------
  // DATOS DEL REPORTE (Izquierda)
  // -------------------------
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  doc.text('DATOS DEL REPORTE:', 10, 39)
  
  doc.setFont(undefined, 'normal')
  let almacenName = almacenes.value.find(a => a.value === form.value.almacen)?.label || 'Todos los Almacenes'
  doc.text(`Almacén: ${almacenName}`, 10, 42)

  // -------------------------
  // DATOS DEL ENCARGADO
  // -------------------------
  doc.setFont(undefined, 'bold')
const xRight = pageWidth / 2 + 57

doc.text('DATOS DEL ENCARGADO:', xRight, 39)
doc.setFont(undefined, 'normal')
doc.text(idempresa.nombre || '', xRight, 42)
doc.text(idempresa.cargo || '', xRight, 45)
  // Parametros Grilla
  let startY = 55
  let anchoTarjeta = 85
  let altoTarjeta = 55
  let colIndex = 0

  productos.forEach((item) => {
    // Control de paginado
    if (startY + altoTarjeta > doc.internal.pageSize.getHeight() - 10) {
      doc.addPage()
      startY = 20
      colIndex = 0
    }

    let x = colIndex === 0 ? 15 : 110
    let y = startY

    // 1. Contenedor de Tarjeta (Borde Suave y Fondo)
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(252, 252, 252)
    doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 3, 3, 'FD')

    // 2. Título de Tarjeta
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(30, 30, 30)
    let tituloExt =
      item.producto.length > 40 ? item.producto.substring(0, 37) + '...' : item.producto
    doc.text(tituloExt, x + 3, y + 6)
    doc.setDrawColor(220, 220, 220)
    doc.line(x, y + 8, x + anchoTarjeta, y + 8)

    // 3. Contenido Detalles
    doc.setFontSize(7)
    doc.setTextColor(60, 60, 60)

    // 4. Imagen o Placeholder
    if (item.imagenBase64) {
      try {
        doc.addImage(item.imagenBase64, 'JPEG', x + 3, y + 12, 35, 30, undefined, 'FAST')
      } catch (e) {
        doc.setFillColor(240, 240, 240)
        doc.rect(x + 3, y + 12, 35, 30, 'F')
        doc.text('Error Img', x + 10, y + 27, e)
      }
    } else {
      doc.setFillColor(240, 240, 240)
      doc.rect(x + 3, y + 12, 35, 30, 'F')
      doc.text('Sin Imagen', x + 10, y + 27)
    }

    // 5. Textos al lado de la imagen
    let txtX = x + 40
    let txtY = y + 15
    doc.setFont(undefined, 'normal')
    doc.text('Cod: ' + item.codigo, txtX, txtY)
    doc.text('Cat: ' + item.categoria, txtX, txtY + 4)
    doc.text('Sub: ' + item.subcategoria, txtX, txtY + 8)
    doc.text('Und: ' + item.unidad, txtX, txtY + 12)
    doc.text('Estado: ' + (item.estado == 1 ? 'Activo' : 'Inactivo'), txtX, txtY + 16)

    // Destacar Stock y Precio
    doc.setFont(undefined, 'bold')
    doc.text('Stock: ' + item.stock, txtX, txtY + 22)
    doc.setTextColor(0, 100, 0) // verde para coste
    doc.text('Costo U.: ' + divisaActiva + ' ' + item.costounitario, txtX, txtY + 26)

    // 6. Descripción abajo
    doc.setTextColor(110, 110, 110)
    doc.setFont(undefined, 'italic')
    doc.setFontSize(6)
    let desc =
      item.descripcion && item.descripcion !== 'null'
        ? item.descripcion
        : 'Sin descripción particular'
    let textLines = doc.splitTextToSize(desc, anchoTarjeta - 6)
    // Mostramos máximo 2 líneas para no desbordar la tarjeta
    if (textLines.length > 2) textLines = [textLines[0], textLines[1] + '...']
    doc.text(textLines, x + 3, y + 46)

    // 7. Actualizar indices
    colIndex++
    if (colIndex > 1) {
      // 2 columnas
      colIndex = 0
      startY += altoTarjeta + 8
    }
  })

  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
function estadoTexto(estado) {
  return Number(estado) === 1 ? 'Activo' : 'Inactivo'
}
</script>
<style></style>
