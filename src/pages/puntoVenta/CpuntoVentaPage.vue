<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Punto de Venta</div>
          <q-btn color="" icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <FormularioRegistroPDV
            :isEditing="isEditing"
            :model-value="formData"
            :almacenes="tiposAlmacen"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <RegistrarAlmacenDialog
      v-model="showWarningDialog"
      title="¡Advertencia!"
      message="No tienes un almacén asignado. Debes asignarte uno o asignar un almacén a otros usuarios para desbloquear las funcionalidades del sistema."
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />

    <TablaPDV
      :rows="puntosVenta"
      :tipos-almacen="tiposAlmacen"
      @onSeleccionarTipo="cargarPuntosPorTipo"
      @add="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FormularioRegistroPDV from 'components/puntoVenta/creacion/puntoVentaForm.vue'
import TablaPDV from 'components/puntoVenta/creacion/puntoVentaTable.vue'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useRouter } from 'vue-router'

const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
const router = useRouter()
const showForm = ref(false)
const isEditing = ref(false)
const tipoSeleccionado = ref(null)
const showWarningDialog = ref(false)

const formData = ref({
  ver: 'registrarPuntoventa',
  idempresa: idempresa,
})
const puntosVenta = ref([])
const tiposAlmacen = ref([])
// const listaSucursales = ref([])

const cargarTiposAlmacen = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`) // ejemplo
    const filtrados = response.data.filter((u) => u.idusuario == idusuario)
    console.log('datos de la respuestas', response)
    console.log('datos filtrados', filtrados.length)
    if (filtrados.length === 0) {
      showWarningDialog.value = true
    }
    const formateado = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))

    tiposAlmacen.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

const cargarPuntosPorTipo = async (tipo) => {
  tipoSeleccionado.value = tipo

  if (!tipoSeleccionado.value) {
    puntosVenta.value = []
    return
  }
  try {
    const response = await api.get(`listaPuntoVenta/${tipoSeleccionado.value}`) // Cambia a tu ruta real
    console.log(response)

    puntosVenta.value = response.data.map((obj, index) => {
      return {
        ...obj,
        numero: index + 1,
      }
    }) // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Puntos de Venta',
    })
  }
}
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarPuntoventa',
    idempresa: idempresa,
  }
}
const editUnit = (item) => {
  formData.value = {
    ver: 'editarPuntoventa',
    idempresa: idempresa,
    nombre: item.nombre,
    descripcion: item.descripcion,
    idalmacen: tipoSeleccionado.value,
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Almacen "${item.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarPuntoventa/${item.id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        await cargarPuntosPorTipo(tipoSeleccionado.value)
        $q.notify({
          type: 'positive',
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
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoAlmacen/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    await cargarPuntosPorTipo(tipoSeleccionado.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const handleSubmit = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
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
    await cargarPuntosPorTipo(tipoSeleccionado.value)
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar' + error,
    })
  }
  toggleForm()
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
onMounted(() => {
  cargarTiposAlmacen()
})
</script>
