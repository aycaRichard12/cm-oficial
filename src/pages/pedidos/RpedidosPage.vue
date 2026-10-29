<template>
  <q-page padding="">
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="assignment" size="md" class="q-mr-sm" />
          {{ $t('ui.pedidos-6170d2') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-pedidos-f06c96') }}
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-sm q-mt-md-none">
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('ui.recargar-9d2c9d')"
          outline
          no-caps
          id="btnRecargarPedidos"
          :loading="recargandoTodo"
          @click.stop.prevent="recargarTodo"
        >
          <q-tooltip>{{ $t('ui.recargar-pedidos-y-almacenes-6c52b7') }}</q-tooltip>
        </q-btn>
      </div>
    </div>
    <!-- Diálogo con Formulario -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>{{ $t('ui.registrar-pedido-5839d5') }}</div>
          <q-btn icon="close" @click="showForm = false" dense flat round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <form-pedidos
            :isEditing="isEditing"
            :modal-value="formData"
            :almacenes="listaAlmacenes"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Tabla de Pedidos formularioDetallePedido -->
    <table-pedidos
      :pedidos="listaPedidos"
      :loading="cargando"
      :almacenes="listaAlmacenes"
      @add="toggleForm"
      @edit="editUnit"
      @verDetalle="onVerDetalle"
      @delete="confirmDelete"
      @verimagen="onVerimagen"
      @toggle-status="toggleStatus"
      @reload="recargarTodo"
    />
    <q-dialog v-model="showDetallePedido" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>{{ $t('ui.detalle-pedido-d83446') }}</div>
          <q-btn
            icon="close"
            @click="((showDetallePedido = false), (selectedPedido.value = null))"
            dense
            flat
            round
          />
        </q-card-section>
        <q-card-section>
          <DetallePedido :model-value="selectedPedido" @close="cancelarDetalle" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="mostrarImagen">
      <q-card class="responsive-dialog">
        <q-card-section>
          <q-img :src="imagenSeleccionada" style="width: 100%; height: auto" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('ui.cerrar-4b0816')" color="primary" v-close-popup />
        </q-card-actions>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FormPedidos from 'src/components/pedidos/FormPedidos.vue'
import TablePedidos from 'src/components/pedidos/TablePedidos.vue'
import DetallePedido from 'src/components/pedidos/DetallePedido.vue'
import { idempresa_md5, idusuario_md5, objectToFormData } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'

const $q = useQuasar()
const showDetallePedido = ref(false)
// ID de empresa simulado
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()
const today = new Date().toISOString().slice(0, 10)
// Estados reactivos
const listaPedidos = ref([]) // Lista de pedidos
const cargando = ref(false) // Cargando tabla
const listaAlmacenes = ref([])
const mostrarImagen = ref(false)
const imagenSeleccionada = ref('')
const recargandoTodo = ref(false)

const router = useRouter()
const ShowWarningDialog = ref(false)
async function getAlmacen() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    listaAlmacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    if (listaAlmacenes.value.length === 0) {
      ShowWarningDialog.value = true
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-proveedores-3f776a') })
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

async function getPedidos() {
  try {
    const response = await api.get(`listaPedido/${idempresa}`)
    console.log(response.data)
    listaPedidos.value = response.data
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-proveedores-3f776a') })
  }
}
// Modal y formulario
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  ver: 'registrarPedido',
  idempresa: idempresa,
  fecha: today,
  idusuario: idusuario,
})

// Función para abrir el formulario vacío o cerrado
function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
  }
}

// Inicializa valores del formulario
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarPedido',
    idempresa: idempresa,
    fecha: today,
    idusuario: idusuario,
  }
}

// Cargar en modo edición editarPedido
function editUnit(item) {
  console.log(item)
  formData.value = {
    ver: 'editarPedido',
    fecha: item.fecha,
    tipo: item.tipopedido,
    observacion: item.observacion,
    id: item.id,
    almacenorigen: item.idalmacenorigen,
    almacendestino: item.idalmacen,
  }
  isEditing.value = true
  showForm.value = true
}

// Guardar nuevo o actualizar
const handleSubmit = async (data) => {
  console.log(data)

  let idorigen
  let iddestino
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    if (k === 'almacenorigen') {
      idorigen = v
    }
    if (k == 'almacendestino') {
      iddestino = v
    }
  }
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  formData.delete('almacenorigen')
  formData.delete('almacendestino')
  formData.append('almacenorigen', iddestino)
  formData.append('almacendestino', idorigen)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  if (isEditing.value) {
    const response = await api.post(``, formData)
    console.log(response)
  } else {
    const response = await api.post(``, formData)
    console.log(response)
  }
  $q.notify({
    type: 'positive',
    message: isEditing.value ? i18nT('configGeneral.leyenda.messages.updated') : i18nT('configGeneral.leyenda.messages.saved'),
  })
  toggleForm() // Cerrar y limpiar
  getPedidos()
}

// Eliminar pedido
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
        getPedidos()
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
const toggleStatus = async (item) => {
  try {
    const responsev = await api.get(`verificarDetallePedido/${item.id}`)
    console.log(responsev.data)
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
          getPedidos()
          enviarPDFPorWhatsApp(item) // llamada a función si es exitosa
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

const enviarPDFPorWhatsApp = async (row) => {
  console.log(row)
}

// Cambiar estado de autorización

const onVerDetalle = (item) => {
  console.log(item)
  showDetallePedido.value = true
  selectedPedido.value = {
    ...item,
    autorizacion: item.autorizacion,
    ver: 'registrarDetallePedido',
    idpedido: item.id,
  }
}
const onVerimagen = (item) => {
  imagenSeleccionada.value = item
  mostrarImagen.value = true
}

//=================================================================================================================Detalle Pedido ========================================================================================================idpedido
const selectedPedido = ref(null) // Usaremos esta ref para pasar el objeto completo del pedido
function cancelarDetalle() {
  showDetallePedido.value = false
  selectedPedido.value = null // Limpiar el pedido seleccionado si es necesario
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
    showDetallePedido.value = false
    selectedPedido.value = null
  }
}

const recargarTodo = async () => {
  if (recargandoTodo.value) return
  recargandoTodo.value = true
  try {
    await Promise.all([getAlmacen(), getPedidos()])
    $q.notify({ type: 'positive', message: i18nT('ui.datos-recargados-db86ec'), position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar:', err)
  } finally {
    recargandoTodo.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
onMounted(() => {
  getAlmacen()
  getPedidos()
})
</script>
