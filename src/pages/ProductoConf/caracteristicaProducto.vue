<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Caracteristica Producto</div>
          <q-btn icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <CaracteristicaProductoForm
            :isEditing="isEditing"
            :model-value="formData"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <CaracteristicaProductoTable
      :rows="CaracteristicaProd"
      @add="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import CaracteristicaProductoForm from 'components/productoConf/caracteristicas/caracteristicaForm.vue'
import CaracteristicaProductoTable from 'components/productoConf/caracteristicas/caracteristicaTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useNotify } from 'src/composables/useNotify'
const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const CaracteristicaProd = ref([])
const notify = useNotify()
const formData = ref({
  ver: 'registrarCaracteristicaProducto',
  idempresa: idempresa,
})
async function loadRows() {
  try {
    const response = await api.get(`listaCaracteristicaProducto/${idempresa}`) // Cambia a tu ruta real
    CaracteristicaProd.value = response.data // Asume que la API devuelve un array
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
    ver: 'registrarCaracteristicaProducto',
    idempresa: idempresa,
  }
}
const editUnit = (item) => {
  formData.value = {
    ver: 'editarCaracteristicaProducto',
    idempresa: idempresa,
    nombre: item.nombre,
    descripcion: item.descripcion,
    id: item.id,
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = async (item) => {
  console.log('Iniciando confirmación para:', item.nombre)

  const confirmed = await notify.question(`¿Eliminar Característica "${item.nombre}"?`)

  console.log('Resultado de la confirmación:', confirmed) // Si esto no sale, el problema es useNotify

  if (!confirmed) return

  try {
    const response = await api.get(`eliminarCaracteristicaProducto/${item.id}/`)
    const res = response.data

    const esExito = res.estado === 'exito' || (Array.isArray(res) && res[0] === 'exito')
    const mensaje = res.mensaje || (Array.isArray(res) ? res[1] : null) || 'Procesado'

    if (esExito) {
      // 2. Notificación de éxito profesional
      await notify.success(mensaje)
      loadRows()
    } else {
      // 3. Advertencia si el registro está en uso
      await notify.warn(`${mensaje}. La característica podría estar en uso por algún producto.`)
      $q.notify({
        type: 'warning',
        message: mensaje,
        caption: 'La característica podría estar en uso por algún producto.',
        icon: 'warning',
        timeout: 5000,
      })
    }
  } catch (error) {
    console.error('Error al eliminar:', error)
    // 4. Error de sistema o conexión
    notify.error('No se pudo conectar con el servidor para eliminar el registro.')

    $q.notify({
      type: 'negative',
      message: 'No se pudo eliminar el registro',
    })
  }
}

const toggleStatus = async (item) => {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(
      `actualizarEstadoCaracteristicaProducto/${item.id}/${nuevoEstado}`,
    ) // Cambia a tu ruta real
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
