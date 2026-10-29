<template>
  <q-page padding>
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="shopping_cart" size="md" class="q-mr-sm" />
          {{ $t('ui.registrar-compras-de6fa9') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-registrar-compras-b96286') }}
        </div>
      </div>
    </div>

    <q-form>
      <div
        class="row q-col-gutter-md q-mb-md"
        style="display: flex; justify-content: center; align-items: flex-end"
        id="filtroFechas"
      >
        <div class="col-12 col-md-4">
          <label for="fechaIni">{{ $t('ui.fecha-inicial-2b461a') }}</label>
          <q-input v-model="fechaInicio" type="date" dense outlined id="fechaIni" />
        </div>
        <div class="col-12 col-md-4">
          <label for="fechaFin">{{ $t('ui.fecha-final-33d0e8') }}</label>
          <q-input v-model="fechaFinal" type="date" dense outlined id="fechaFin" />
        </div>
        <div class="col-12 col-md-2 flex items-end">
          <q-btn
            color="primary"
            :label="$t('ui.filtrar-d878f8')"
            icon="search"
            @click="loadRows"
            class="full-width"
            no-caps
          />
        </div>
      </div>
    </q-form>

    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary flex justify-between items-center text-h6 text-white">
          <div>{{ $t('ui.registrar-compra-8c3ac1') }}</div>
          <div class="row q-gutter-x-xs">
            <q-btn
              color="white"
              icon="refresh"
              flat
              round
              dense
              @click="recargarDatosModal"
            >
              <q-tooltip>{{ $t('ui.recargar-datos-3840f2') }}</q-tooltip>
            </q-btn>
            <q-btn color="white" icon="close" @click="cerrarFormulario" flat round dense />
          </div>
        </q-card-section>
        <q-card-section>
          <form-compra
            :modalValue="registroActual"
            :almacenes="almacenes"
            :proveedores="proveedores"
            :cajaBancos="listaCajaBancos"
            @submit="guardarRegistro"
            @cancel="cerrarFormulario"
            @recargarProveedores="cargarProveedores"
            @recargarAlmacenes="cargarAlmacenes"
            @recargarCajaBancos="listarcajasbanco"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-compra
      :rows="compras"
      :almacenes="almacenes"
      :almacenSeleccionado="almacenSeleccionado"
      :solicitudesAnulacion="solicitudes"
      @detalleCompra="verDetalle"
      @add="toggleForm"
      @edit="editarCompra"
      @delete="eliminarCompra"
      @actualizarTablaPrincipal="iniciar"
      @repDesglosado="generarReporteDesglosado"
      @repCompras="generarReporteGeneral"
      @toggle-status="autorizarCompra"
      @solicitar-anulacion="solicitarAnulacionCompra"
    />

    <q-dialog v-model="mostrarDetalleCompra" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between items-center">
          <div>{{ $t('ui.detalle-compra-a909b1') }}</div>
          <div class="row q-gutter-x-xs">
            <q-btn
              icon="refresh"
              flat
              round
              dense
              :loading="isReloadingDetalle"
              @click="recargarDetalleCompra"
            >
              <q-tooltip>{{ $t('ui.recargar-detalle-a59940') }}</q-tooltip>
            </q-btn>
            <q-btn icon="close" @click="mostrarDetalleCompra = false" flat dense round />
          </div>
        </q-card-section>
        <q-card-section>
          <DetalleCompra
            ref="detalleCompraRef"
            :compra="formularioDetalleCompra"
            @close="cancelarDetalle"
            @update="iniciar"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showFormEdit" persistent>
      <q-card class="q-pa-md" style="width: 1200px; max-width: 90vw">
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-h6">{{ $t('ui.editar-compra-7f9132') }}</div>
          <div class="row q-gutter-x-xs">
            <q-btn
              icon="refresh"
              flat
              round
              dense
              color="primary"
              @click="cargarProveedores"
            >
              <q-tooltip>{{ $t('ui.recargar-proveedores-5ec929') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
        <FormCompraEditar
          :modalValue="registroActual"
          :proveedores="proveedores"
          :editing="isEditing"
          @submit="guardarRegistro"
          @cancel="cerrarFormulario"
          @recargarProveedores="cargarProveedores"
        />
      </q-card>
    </q-dialog>

    <RegistrarAlmacenDialog
      v-model="ShowWarningDialog"
      :title="$t('ui.advertencia-0ef76a')"
      :message="$t('ui.no-tienes-almacenes-asignados-por-favor-asigna-un-al-177d93')"
      @confirm="redirectToAssignment"
    />

    <!-- Dialog unificado de solicitud de anulación -->
    <SolicitudAnulacionDialog
      v-model="dialogAnulacion"
      :compra="compraParaAnulacion"
      @solicitud-enviada="onSolicitudAnulacionEnviada"
    />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5, objectToFormData } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import FormCompra from 'src/components/compra/FormCompra.vue'
import FormCompraEditar from 'src/components/compra/EditarCompra.vue'
import TableCompra from 'src/components/compra/TableCompra.vue'
import DetalleCompra from 'src/components/compra/DetalleCompra.vue'
import { useCompraStore } from 'src/stores/compras'
import { useRouter } from 'vue-router'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import SolicitudAnulacionDialog from 'src/components/compra/SolicitudAnulacionDialog.vue'
import { useAnulacionCompra } from 'src/composables/compra/useAnulacionCompra'
import { apiCt } from 'boot/axios'
const compraStore = useCompraStore()

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const fechaInicio = ref(null)
const fechaFinal = ref(null)
const almacenSeleccionado = ref(null)
const showForm = ref(false)
const isEditing = ref(false)
const almacenes = ref([])
const proveedores = ref([])
const compras = ref([])
const mostrarDetalleCompra = ref(false)
const registroActual = ref({
  ver: 'registrarCompra',
  idusuario: idusuario,
  factura: compras.value.length,
  codigo: generarCodigo(),
  nombre: 'CMP-',
  tipoRegistro: 2,
  total: 0,
  nombrealmacen: '',
})
const showFormEdit = ref(false)
const formularioDetalleCompra = ref({ ver: 'registrarDetalleCompra' })
const detalleCompraRef = ref(null)
const isReloadingDetalle = ref(false)
const detalleCompra = ref([])
const productosDisponibles = ref([])
const listaCajaBancos = ref([])

const router = useRouter()
const ShowWarningDialog = ref(false)

// Anulación de compra (estado y lógica en el composable)
const {
  dialogAnulacion,
  compraParaAnulacion,
  solicitudes,
  cargarSolicitudes,
  abrirDialogAnulacion,
} = useAnulacionCompra()

async function editarCompra(compra) {
  console.log(compra)
  registroActual.value = {
    ver: 'editarCompra',
    id: compra.id,
    nombre: compra.lote,
    codigo: compra.codigo,
    proveedor: compra.idproveedor,
    factura: compra.nfactura,
  }
  showFormEdit.value = true
}
async function eliminarCompra(compra) {
  console.log(compra)
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `${i18nT('ui.eliminar-compra-6e72d2')}`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarCompra/${compra.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
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
        message: i18nT('configGeneral.divisas.messages.loadError'),
      })
    }
  })
}
async function enviarFormData(endpoint, data, mensajeExito, mensajeError) {
  try {
    const formData = objectToFormData(data)

    console.log(data)
    const response = await api.post('', formData)
    console.log(response.data)
    if (response.data.estado === 'exito') {
      let msg = response.data.mensaje || mensajeExito
      // Override typical warning message or completely replace it with specific text
      msg =
        'El registro de compra esta en espera de autorización o confirmación, para continuar con plan de pagos.'

      $q.notify({ type: 'positive', message: msg, timeout: 5000 })
      almacenSeleccionado.value = almacenes.value.find((almacen) => almacen.value === data.almacen)
      console.log(almacenSeleccionado.value)
      //iniciar()

      return response
    } else {
      let errorMsg = response.data.mensaje || mensajeError
      if (errorMsg) errorMsg = errorMsg.replace(/¡?Advertencia!?\s*:?\s*/gi, '')
      $q.notify({ type: 'negative', message: errorMsg })
    }
  } catch (error) {
    console.error('Error en API:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-en-la-solicitud-al-servidor-9eb809') + error })
  }
}

async function recargarDatosModal() {
  await Promise.all([
    cargarProveedores(),
    cargarAlmacenes(),
    listarcajasbanco(),
  ])
}

async function guardarRegistro(data) {
  console.log(data)
  const endpoint = isEditing.value ? 'editarCompra' : 'nuevaCompra'
  const response = await enviarFormData(
    endpoint,
    data,
    i18nT('ui.compra-registrada-correctamente-15a8d7'),
    i18nT('ui.hubo-un-problema-al-registrar-la-compra-485eb4'),
  )
  if (response?.data?.estado === 'exito') {
    console.log('Compra guardada con éxito')
    await loadRows()
    showForm.value = false
    showFormEdit.value = false
    resetForm()
  }
}

function cerrarFormulario() {
  showForm.value = false
  isEditing.value = false
  showFormEdit.value = false
  compraStore.eliminarCompra()
  resetForm()
}

function resetForm() {
  registroActual.value = {
    ver: 'registrarCompra',
    idusuario: idusuario,
    factura: compras.value.length,
    codigo: generarCodigo(),
    nombre: 'CMP-',
    tipoRegistro: 2,
  total: 0,
  }
  console.log('Formulario reseteado', registroActual.value)
}

async function cargarProveedores() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)
    proveedores.value = response.data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-proveedores-3f776a') })
  }
}

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((item) => item.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    if (almacenes.value.length === 0) {
      ShowWarningDialog.value = true
    }

    almacenSeleccionado.value = almacenes.value.length > 0 ? almacenes.value[0] : null
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-almacenes-4154c2') })
  }
}

async function listarcajasbanco() {
  try {
    const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)
    console.log(response.data)

    listaCajaBancos.value = response.data.map((item) => ({
      label: item.codigo + ' ' + item.tipo_cuenta,
      value: item.idcaja_bancos,
      codigo: item.codigo, // Guardamos el código por separado
      nombre: item.tipo_cuenta, // Guardamos el nombre por separado
    }))
    console.log(listaCajaBancos.value)
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-caja-bancos-8c4a52') })
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

async function loadRows() {
  try {
    let point = `listaCompra/${idempresa}`
    if (fechaInicio.value && fechaFinal.value) {
      point = `listaCompra/${idempresa}/${fechaInicio.value}/${fechaFinal.value}`
    }
    const response = await api.get(point)
    compras.value = response.data
    console.log(response.data)
  } catch (error) {
    console.error('Error al cargar compras:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-las-compras-127fb1') })
  }
}

function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}

async function verDetalle(compra) {
  try {
    await listaProductosDisponibles(compra)
    await getDetalleCompra(compra)
    mostrarDetalleCompra.value = true
    formularioDetalleCompra.value = {
      ...compra,
      autorizacion: compra.autorizacion,
      ver: 'registrarDetalleCompra',
      idingreso: compra.id,
      idalmacen: compra.idalmacen,
    }
    console.log(formularioDetalleCompra.value)
  } catch (error) {
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-mostrar-el-detalle-de-la-compra-7cbeeb') + error })
  }
}

async function listaProductosDisponibles(compra) {
  formularioDetalleCompra.value = {
    ver: 'registrarDetalleCompra',
    idingreso: compra.id,
  }
  try {
    const response = await api.get(`ListaProductosCompra/${compra.id}/${compra.idalmacen}`)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
    }))
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-productos-4c41c2') })
  }
}
//Hubo un problema al guardar el detalle

async function getDetalleCompra(compra) {
  try {
    const response = await api.get(`listaDetalleCompra/${compra.id}`)
    detalleCompra.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de compra:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-detalles-de-la-compra-5a4066') })
  }
}

async function recargarDetalleCompra() {
  if (isReloadingDetalle.value) return
  isReloadingDetalle.value = true
  try {
    await detalleCompraRef.value?.recargarComponente?.()
  } catch (error) {
    console.error('Error al recargar detalle:', error)
  } finally {
    isReloadingDetalle.value = false
  }
}

function cancelarDetalle() {
  mostrarDetalleCompra.value = false
}

async function autorizarCompra(compra) {
  console.log(compra)
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `${i18nT('ui.confirmar-compra-207d87')}`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const verificar = await api.get(`listaDetalleCompra/${compra.id}`)
      console.log(verificar.data)
      if (verificar.data.length > 0) {
        const point = `actualizarEstadoCompra/${compra.id}/1/${compra.idpedido}/${compra.idalmacen}`
        const response = await api.get(point)
        console.log(response.data)
        if (response.data.estado === 'error') {
          $q.notify({ type: 'negative', message: response.data.message })
        } else {
          $q.notify({ type: 'positive', message: response.data.message })

          iniciar()
        }
      } else {
        $q.notify({ type: 'negative', message: i18nT('ui.no-se-ingreso-ningun-producto-6ba004') })
      }
    } catch (error) {
      console.error('Error al autorizar compra:', error)
      $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-autorizar-la-compra-e25532') })
    }
  })
}

function solicitarAnulacionCompra(compra) {
  abrirDialogAnulacion(compra)
}

function onSolicitudAnulacionEnviada() {
  $q.notify({
    type: 'positive',
    message: i18nT('ui.solicitud-de-anulacion-y-notificacion-enviadas-corre-c4274f'),
    icon: 'check_circle',
    position: 'top',
  })
  iniciar()
}

function generarReporteDesglosado() {
  // Manejado internamente por TableCompra (imprimirReporte)
  console.log('generarReporteDesglosado delegado a TableCompra')
}

function generarReporteGeneral() {
  // Manejado internamente por TableCompra (imprimirReporte)
  console.log('generarReporteGeneral delegado a TableCompra')
}

function generarCodigo() {
  return `C-${compras.value.length}`
}
watch(
  () => compraStore.compraPendiente,
  (nueva) => {
    if (nueva) {
      console.log('Se registró nueva compra:', nueva)
      toggleForm()
      // aquí abres modal, reseteas formulario, etc.
    }
  },
  { immediate: true },
)
function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
    mostrarDetalleCompra.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

async function iniciar() {
  await cargarAlmacenes()
  await cargarProveedores()
  await loadRows()
  await cargarSolicitudes()
  await listarcajasbanco()
  registroActual.value = {
    ver: 'registrarCompra',
    idusuario: idusuario,
    factura: compras.value.length,
    codigo: generarCodigo(),
    nombre: 'CMP-',
    tipoRegistro: 2,
  total: 0,
  }
}
onMounted(async () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  fechaInicio.value = `${year}-${month}-01`
  fechaFinal.value = `${year}-${month}-${day}`
  await iniciar()
})
</script>
