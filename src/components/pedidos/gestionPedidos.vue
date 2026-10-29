<template>
  <q-page class="q-ma-md">
    <div>
      
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="assignment" size="md" class="q-mr-sm" />
          {{ $t('ui.autorizando-pedidos-ebaa8c') }}
        </div>
        <div class="text-subtitle2 cm-text-muted q-mt-xs">
          {{ $t('ui.administracion-de-autorizando-pedidos-a2521c') }}
        </div>
      </div>
    </div>
      <!-- Formulario principal -->
      <q-form @submit.prevent="onSubmit">
        <div class="row justify-center q-col-gutter-x-md" id='filtrosFechas'>
          <div class="col-12 col-md-4">
            <label for="fechaini">{{ $t('ui.fecha-inicial-2b461a') }}</label>
            <q-input type="date" v-model="fechai" id="fechaini" dense outlined />
          </div>
          <div class="col-12 col-md-4">
            <label for="fechafin">{{ $t('ui.fecha-final-33d0e8') }}</label>
            <q-input type="date" v-model="fechaf" id="fechafin" dense outlined />
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <div class="col-auto">
            <q-btn :label="$t('ui.generar-reporte-eeafce')" color="primary" type="submit" class="q-mr-sm" id="datosPedido" />
            <q-btn :label="$t('ui.vista-previa-del-reporte-60d956')" color="primary" outline @click="vistaPrevia" id="pdfPedido"/>
          </div>
        </div>
      </q-form>
      <div class="row q-col-gutter-x-md flex justify-start" id="filtrosAlmacen">
        <div class="col-12 col-md-3">
          <label for="almacen">{{ $t('ui.filtrar-por-almacen-f5828a') }}</label>
          <q-select id="almacen" v-model="almacen" :options="almacenes" clearable dense outlined>
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                size="sm"
                color="primary"
                icon="refresh"
                :loading="recargandoAlmacenes"
                @click.stop.prevent="recargarAlmacenes"
              >
                <q-tooltip>{{ $t('ui.recargar-almacenes-fa871e') }}</q-tooltip>
              </q-btn>
            </template>
          </q-select>
        </div>
      </div>
      <div class="row justify-end q-mb-sm">
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('ui.recargar-tabla-4f363d')"
          outline
          no-caps
          id="btnRecargarTablaGestion"
          :loading="recargandoTabla"
          @click.stop.prevent="recargarTabla"
        >
          <q-tooltip>{{ $t('ui.volver-a-cargar-los-pedidos-efcd77') }}</q-tooltip>
        </q-btn>
      </div>
      <q-table
      id="tablaPedidos"
        :title="$t('ui.pedidos-6170d2')"
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
              :label="$t('ui.autorizado-b4fb49')"
              outline
            />
            <q-badge color="red" v-else :label="$t('ui.no-autorizado-988c4e')" outline />
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td align="center">
            <!-- Ver Detalle -->

            <!-- Enviar por WhatsApp -->

            <template v-if="Number(props.row.autorizacion) === 2">
              <q-btn id="verDetalle" size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>{{ $t('ui.ver-pedido-87d476') }}</q-tooltip>
              </q-btn>
              <q-btn id="eliminarPedido" icon="delete" color="negative" dense flat @click="confirmDelete(props.row)" />

              <q-btn id="autorizarPedido" icon="toggle_off" dense flat color="grey" @click="toggleStatus(props.row)">
                <q-tooltip>{{ $t('ui.autorizar-pedido-56cac3') }}</q-tooltip>
              </q-btn>
            </template>
            <template v-else>
              <q-btn id="verDetallePedido"  size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>{{ $t('ui.ver-pedido-87d476') }}</q-tooltip>
              </q-btn>
              <q-btn
                id="enviarPedido"
                size="sm"
                icon="mdi-whatsapp"
                color="green"
                flat
                @click="enviarPDFPorWhatsApp(props.row)"
                dense
              >
                <q-tooltip>{{ $t('ui.enviar-pdf-por-whatsapp-6edec0') }}</q-tooltip>
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
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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

    <RegistrarAlmacenDialog
      v-model="ShowWarningDialog"
      :title="$t('ui.advertencia-0ef76a')"
      :message="$t('ui.no-tienes-un-almacen-asignado-debes-asignarte-uno-o-2b40f1')"
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
import { useRouter } from 'vue-router'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones'

const { mostrarDialogoWhatsapp } = useWhatsapp()
const { enviarNotificacion } = useNotificaciones()
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
const recargandoAlmacenes = ref(false)
const recargandoTabla = ref(false)

const router = useRouter()
const ShowWarningDialog = ref(false)

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    filtrados.length > 0 ? (almacen.value = almacenes.value[0]) : (ShowWarningDialog.value = true)
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-proveedores-3f776a') })
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

// Datos de la tabla
const columnas = [
  { name: 'nro', label: i18nT('cotizacion.table.number'), field: 'nro', align: 'center' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha', align: 'center' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'center' },
  { name: 'nropedido', label: 'Nro.Pedido', field: 'nropedido', align: 'center' },
  { name: 'tipopedido', label: i18nT('configGeneral.divisas.table.type'), field: 'tipopedido', align: 'center' },
  { name: 'almacenorigen', label: i18nT('ui.almacen-origen-d3b270'), field: 'almacenorigen', align: 'center' },
  { name: 'almacen', label: i18nT('ui.almacen-destino-ae5ede'), field: 'almacen', align: 'center' },
  { name: 'observacion', label: i18nT('ui.observacion-1d0d99'), field: 'observacion', align: 'center' },
  { name: 'autorizacion', label: i18nT('ui.autorizacion-077400'), field: 'autorizacion', align: 'center' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
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
      message: i18nT('ui.pedido-sin-items-16845d'),
    })
  }
}

const onSubmit = async () => {
  try {
    const response = await api.get(`reportepedidos/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
    rows.value = response.data // Asume que la API devuelve un array
    console.log('datos de la fila', rows.value)
    // Debug: Ver el primer elemento completo para identificar campos disponibles
    if (rows.value.length > 0) {
      console.log('Primer pedido completo:', rows.value[0])
      console.log('Campos disponibles:', Object.keys(rows.value[0]))
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
    idusuariomd5: row.idusuariomd5, // Agregar el campo MD5 del usuario
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
    console.log('detalle pedido', response.data)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
      message: i18nT('ui.pedido-sin-items-16845d'),
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
      message: i18nT('ui.pedidos-sin-items-1d275b'),
    })
  }
}
const toggleStatus = async (item) => {
  try {
    const responsev = await api.get(`verificarDetallePedido/${item.id}`)
    console.log('informacion necesaria', responsev.data)
    if (!responsev.data.tieneDetalle) {
      $q.notify({
        type: 'negative',
        message: i18nT('ui.el-pedido-esta-vacio-y-no-puede-ser-confirmado-90bd97'),
      })
      return
    }

    $q.dialog({
      title: i18nT('configGeneral.divisas.messages.deleteTitle'),
      message: i18nT('ui.deseas-confirmar-este-pedido-3cf2ec'),
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
          console.log('item', item)
          // Enviar notificación al usuario que creó el pedido
          try {
            await enviarNotificacion({
              id_usuario: item.idusuariomd5,

              asunto: 'Pedido Autorizado',
              mensaje: `Tu pedido solicitado en fecha ${item.fecha} \n ha sido autorizado exitosamente.`,
              datos_adicionales: {
                url_de_envio: 'generarpedido',
                tipo_pedido: tipo[Number(item.tipopedido)],
                almacen: item.almacen,
              },
            })
            console.log('Notificación enviada exitosamente', item.idusuariomd5)
          } catch (notifError) {
            console.error('Error al enviar notificación:', notifError)
            // No bloqueamos el flujo si falla la notificación
          }
        }
      } catch (error) {
        console.error('Error al autorizar el pedido:', error)
        $q.notify({
          type: 'negative',
          message: i18nT('ui.no-se-pudo-autorizar-el-pedido-intenta-de-nuevo-234885'),
        })
      }
    })
  } catch (error) {
    console.error('Error al verificar detalle del pedido:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-verificar-si-el-pedido-tiene-productos-1025d8'),
    })
  }
}
const confirmDelete = (item) => {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `${i18nT('ui.eliminar-pedido-94c79f')}`,
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

        // Enviar notificación al usuario que creó el pedido
        try {
          await enviarNotificacion({
            id_usuario: item.idusuariomd5,
            asunto: 'Pedido Eliminado',
            mensaje: `Tu pedido solicitado en fecha ${item.fecha} \n ha sido eliminado.`,
            datos_adicionales: {
              url_de_envio: 'generarpedido',
              tipo_pedido: tipo[Number(item.tipopedido)],
              almacen: item.almacen,
            },
          })
          console.log('Notificación enviada exitosamente', item.idusuariomd5)
        } catch (notifError) {
          console.error('Error al enviar notificación:', notifError)
          // No bloqueamos el flujo si falla la notificación
        }
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
        message: i18nT('configGeneral.divisas.messages.loadError'),
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
      message: i18nT('ui.pedido-sin-items-16845d'),
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
    { header: i18nT('configuracion.servicios.table.descripcion'), dataKey: 'descripcion' },
    { header: i18nT('ui.cantidad-b5b6f8'), dataKey: 'cantidad' },
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
        doc.text(i18nT('ui.fecha-de-orden-57b4f3') + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc
          .setFontSize(7)
          .setFont(undefined, 'bold')
          .text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })
        doc.setFontSize(6).setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text(i18nT('configGeneral.divisas.table.type') + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
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
    throw new Error(result || i18nT('ui.error-al-subir-el-pdf-5a202e'))
  }

  // WhatsApp después de la subida exitosa
  const linkPDF = `https://mistersofts.com/app/cmv1/api/pdfs/${nombreArchivo}`
  mostrarDialogoWhatsapp(
    `Aquí tienes la orden de pedido: ${linkPDF}\n\n*Nota: Este enlace estará activo por 48 horas y luego será eliminado.*`,
  )
}

const recargarAlmacenes = async () => {
  if (recargandoAlmacenes.value) return
  recargandoAlmacenes.value = true
  try {
    await cargarAlmacenes()
    $q.notify({ type: 'positive', message: i18nT('ui.almacenes-recargados-5f8af7'), position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar almacenes:', err)
  } finally {
    recargandoAlmacenes.value = false
  }
}

const recargarTabla = async () => {
  if (recargandoTabla.value) return
  recargandoTabla.value = true
  try {
    await onSubmit()
    $q.notify({ type: 'positive', message: i18nT('ui.tabla-recargada-a604bf'), position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar tabla:', err)
  } finally {
    recargandoTabla.value = false
  }
}

onMounted(() => {
  cargarAlmacenes()
  onSubmit()
})
</script>
