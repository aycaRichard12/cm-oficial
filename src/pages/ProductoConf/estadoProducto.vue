<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Registrar Estado Producto</div>
          <q-btn icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <ProductStateForm
            :isEditing="isEditing"
            :model-value="formData"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <ProductStateTable
      :rows="productStates"
      @add="toggleForm"
      @edit-item="editState"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import ProductStateForm from 'src/components/productoConf/estadoProducto/estadoForm.vue'
import ProductStateTable from 'src/components/productoConf/estadoProducto/estadoTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'

const idempresa = idempresa_md5()
const $q = useQuasar()

const showForm = ref(false)
const isEditing = ref(false)

const productStates = ref([])
const formData = ref({
  ver: 'registrarEstadoProducto',
  idempresa: idempresa,
})
async function loadRows() {
  try {
    const response = await api.get(`listaEstadoProducto/${idempresa}`) // Cambia a tu ruta real
    productStates.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
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
    ver: 'registrarEstadoProducto',
    idempresa: idempresa,
    nombre: '',
    descripcion: '',
  }
}
const editState = (item) => {
  formData.value = {
    ver: 'editarEstadoProducto',
    idempresa: idempresa,
    nombre: item.nombre,
    descripcion: item.descripcion,
    id: item.id,
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Estado "${item.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarEstadoProducto/${item.id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
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
    const response = await api.get(`actualizarEstadoEstadoProducto/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    loadRows()
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
    loadRows()
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
  loadRows()
})
</script>

<style></style>
