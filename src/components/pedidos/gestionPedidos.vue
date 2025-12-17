<template>
  <q-page class="q-ma-md">
    <div>
      <div class="titulo">Autorizando Pedidos</div>
      <!-- Formulario principal -->
      <q-form @submit.prevent="onSubmit">
        <div class="row justify-center q-col-gutter-x-md">
          <div class="col-12 col-md-4">
            <label for="fechaini">Fecha Inicial*</label>
            <q-input type="date" v-model="fechai" id="fechaini" dense outlined />
          </div>
          <div class="col-12 col-md-4">
            <label for="fechafin">Fecha Final*</label>
            <q-input type="date" v-model="fechaf" id="fechafin" dense outlined />
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <div class="col-auto">
            <q-btn label="Generar reporte" color="primary" type="submit" class="q-mr-sm" />
            <q-btn label="Vista previa del Reporte" color="primary" outline @click="vistaPrevia" />
          </div>
        </div>
      </q-form>
      <div class="row q-col-gutter-x-md flex justify-start">
        <div class="col-12 col-md-3">
          <label for="almacen">Filtrar por Almacén</label>
          <q-select id="almacen" v-model="almacen" :options="almacenes" clearable dense outlined />
        </div>
      </div>
      <q-table
        title="Pedidos"
        :rows="filterPedido"
        :columns="columnas"
        row-key="id"
        flat
        class="q-mt-md"
        :style="{ maxHeight: 'calc(100vh - 325px)', overflowY: 'auto' }"
      >
        <template v-slot:body-cell-tipopedido="props">
          <q-td :props="props">
            {{ tipo[Number(props.row.tipopedido)] }}
          </q-td>
        </template>
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            {{ tipoestados[Number(props.row.estado)] }}
          </q-td>
        </template>
        <template v-slot:body-cell-autorizacion="props">
          <q-td :props="props">
            <q-badge
              color="green"
              v-if="Number(props.row.autorizacion) === 1"
              label="Autorizado"
              outline
            />
            <q-badge color="red" v-else label="No Autorizado" outline />
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td align="center">
            <!-- Ver Detalle -->

            <!-- Enviar por WhatsApp -->

            <template v-if="Number(props.row.autorizacion) === 2">
              <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>Ver Pedido</q-tooltip>
              </q-btn>
              <q-btn icon="delete" color="negative" dense flat @click="confirmDelete(props.row)" />

              <q-btn icon="toggle_off" dense flat color="grey" @click="toggleStatus(props.row)">
                <q-tooltip>Autorizar Pedido</q-tooltip>
              </q-btn>
            </template>
            <template v-else>
              <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>Ver Pedido</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="mdi-whatsapp"
                color="green"
                flat
                @click="enviarPDFPorWhatsApp(props.row)"
                dense
              >
                <q-tooltip>Enviar PDF por WhatsApp</q-tooltip>
              </q-btn>
            </template>
          </q-td>
        </template>
        <!-- Autorizar -->
      </q-table>
    </div>
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
import { useWhatsapp } from 'src/composables/useWhatsapp'
import { PDF_REPORTE_GESTIPO_PEDIDOS_DETALLE } from '../../utils/pdfReportGenerator'
import { PDF_REPORTE_GESTION_PEDIDOS } from '../../utils/pdfReportGenerator'
const { mostrarDialogoWhatsapp } = useWhatsapp()
const pdfData = ref(null)
const mostrarModal = ref(false)

const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }
const tipoestados = { 1: 'Procesado', 2: 'Pendiente', 3: 'Descartado' }

const $q = useQuasar()
// Obtener la fecha actual en formato YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Fechas
const fechai = ref(today)
const fechaf = ref(today)

// Filtros
const almacen = ref(null)
const canal = ref(null)
const tipopago = ref('')

// Opciones select
const almacenes = ref([])

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}

// Datos de la tabla
const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'nropedido', label: 'Nro.Pedido', field: 'nropedido', align: 'center' },
  { name: 'tipopedido', label: 'Tipo', field: 'tipopedido', align: 'center' },
  { name: 'almacenorigen', label: 'Almacén Origen', field: 'almacenorigen', align: 'center' },
  { name: 'almacen', label: 'Almacén Destino', field: 'almacen', align: 'center' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'center' },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const rows = ref([])
const detallePedido = ref([])
// Acciones
const verDetalle = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)
  if (detallePedido.value) {
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedido  sin items',
    })
  }
}

const onSubmit = async () => {
  try {
    const response = await api.get(`reportepedidos/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
    rows.value = response.data // Asume que la API devuelve un array
    console.log(rows.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const processedRows = computed(() => {
  return rows.value.map((row, index) => ({
    fecha: cambiarFormatoFecha(row.fecha),
    id: row.id,
    autorizacion: row.autorizacion,
    observacion: row.observacion,
    codigo: row.codigo,
    idalmacen: row.idalmacen,
    almacen: row.almacen,
    estado: row.estado,
    tipopedido: row.tipopedido,
    idalmacenorigen: row.idalmacenorigen,
    almacenorigen: row.almacenorigen,
    idusuario: row.idusuario,
    nropedido: row.nropedido,
    nro: index + 1,
  }))
})
const filterPedido = computed(() => {
  return processedRows.value.filter((compra) => {
    console.log(canal.value, tipopago.value)
    const porAlmacen = !almacen.value || compra.idalmacen == almacen.value.value

    return porAlmacen
  })
})
const getDatallePedido = async (id) => {
  try {
    const response = await api.get(`getPedido_/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
watch(
  () => almacenes.value,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !almacen.value) {
      almacen.value = nuevosAlmacenes[0]
    }
  },
  { immediate: true },
)

function imprimirReporte() {
  if (detallePedido.value) {
    const doc = PDF_REPORTE_GESTIPO_PEDIDOS_DETALLE(detallePedido)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedido  sin items',
    })
  }
}
const vistaPrevia = () => {
  if (filterPedido.value) {
    const doc = PDF_REPORTE_GESTION_PEDIDOS(filterPedido, tipoestados, fechai, fechaf, almacen)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedidos  sin items',
    })
  }
}
const toggleStatus = async (item) => {
  try {
    const responsev = await api.get(`verificarDetallePedido/${item.id}`)
    console.log(responsev.data)
    if (!responsev.data.tieneDetalle) {
      $q.notify({
        type: 'negative',
        message: 'El pedido está vacío y no puede ser confirmado.',
      })
      return
    }

    $q.dialog({
      title: 'Confirmar',
      message: '¿Deseas confirmar este pedido?',
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const response = await api.get(`actualizarEstadoPedido/${item.id}/1`)
        if (response.data.estado === 'error') {
          $q.notify({
            type: 'negative',
            message: response.data.mensaje,
          })
        } else {
          onSubmit()
          enviarPDFPorWhatsApp(item) // llamada a función si es exitosa
        }
      } catch (error) {
        console.error('Error al autorizar el pedido:', error)
        $q.notify({
          type: 'negative',
          message: 'No se pudo autorizar el pedido. Intenta de nuevo.',
        })
      }
    })
  } catch (error) {
    console.error('Error al verificar detalle del pedido:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al verificar si el pedido tiene productos.',
    })
  }
}
const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Pedido?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarPedido/${item.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        getDatallePedido()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
const enviarPDFPorWhatsApp = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)

  if (!detallePedido.value) {
    $q.notify({
      type: 'negative',
      message: 'Pedido sin items',
    })
    return
  }

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))
  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  autoTable(doc, {
    columns,
    body: datos,
    startY: 50,
    margin: { horizontal: 5 },
    styles: { fontSize: 5, cellPadding: 2 },
    headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 100, halign: 'left' },
      cantidad: { cellWidth: 80, halign: 'right' },
    },
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }
        doc.setFontSize(7).setFont(undefined, 'bold').text(nombreEmpresa, 5, 10)
        doc.setFontSize(6).setFont(undefined, 'normal').text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)
        doc
          .setFontSize(10)
          .setFont(undefined, 'bold')
          .text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
        doc.setDrawColor(0).setLineWidth(0.2).line(5, 30, 200, 30)
        doc.setFontSize(7).setFont(undefined, 'bold').text('DATOS ORDEN:', 5, 35)
        doc.setFontSize(6).setFont(undefined, 'normal')
        doc.text(`${detallePlano[0].almacen}`, 5, 38)
        doc.text(detallePlano[0].empresa.direccion, 5, 41)
        doc.text(detallePlano[0].empresa.email, 5, 44)
        doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc
          .setFontSize(7)
          .setFont(undefined, 'bold')
          .text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })
        doc.setFontSize(6).setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text('Tipo ' + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
      }
    },
  })

  // ✅ Convertir PDF a Blob
  const pdfBlob = doc.output('blob')

  // ✅ Crear objeto FormData para enviarlo al servidor
  const formData = new FormData()

  const nombreArchivo = `OrdenPedido_${row.id}.pdf`
  formData.append('ver', 'subir_pdf')

  formData.append('file', pdfBlob, nombreArchivo)

  const response = await fetch('https://mistersofts.com/app/cmv1/api/', {
    method: 'POST',
    body: formData,
    mode: 'cors', // Esto fuerza a mostrar errores CORS claramente
  })

  console.log('Tamaño del PDF:', pdfBlob.size)
  if (pdfBlob.size === 0) throw new Error('El PDF está vacío')
  const result = await response.text() // Si el servidor no envía JSON
  console.log('Respuesta del servidor:', result)
  console.log('Response completo:', {
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers],
    body: result,
  })
  if (result.includes('error') || result.includes('fail')) {
    // Ajusta según lo que devuelva tu servidor
    throw new Error(result)
  }
  if (!response.ok) {
    throw new Error(result || 'Error al subir el PDF')
  }

  // WhatsApp después de la subida exitosa
  const linkPDF = `https://mistersofts.com/app/cmv1/api/pdfs/${nombreArchivo}`
  mostrarDialogoWhatsapp(
    `Aquí tienes la orden de pedido: ${linkPDF}\n\n*Nota: Este enlace estará activo por 48 horas y luego será eliminado.*`,
  )
}

onMounted(() => {
  cargarAlmacenes()
  onSubmit()
})
</script>
