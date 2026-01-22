<template>
  <q-page padding="">
    <div class="titulo">Pedidos</div>
    <!-- Diálogo con Formulario -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Registrar Pedido</div>
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
    />
    <q-dialog v-model="showDetallePedido" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Detalle Pedido</div>
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
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <RegistrarAlmacenDialog
      v-model="ShowWarningDialog"
      title="¡Advertencia!"
      message="No tienes un almacén asignado. Debes asignarte uno o asignar un almacén a otros usuarios para desbloquear las funcionalidades del sistema."
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
  </q-page>
</template>

<script setup>
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
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
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
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
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
    message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
  })
  toggleForm() // Cerrar y limpiar
  getPedidos()
}

// Eliminar pedido
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
        message: 'No se pudieron cargar los datos',
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
          getPedidos()
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
