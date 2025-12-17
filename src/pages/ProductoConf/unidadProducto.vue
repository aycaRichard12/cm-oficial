<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Unidades para Productos</div>
          <q-btn icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <product-unit-form
            :isEditing="isEditing"
            :model-value="formData"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <product-unit-table
      :rows="productUnits"
      @add="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ProductUnitForm from 'src/components/productoConf/unidadProducto/unidadForm.vue'
import ProductUnitTable from 'src/components/productoConf/unidadProducto/unidadTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'

const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const productUnits = ref([])

const formData = ref({
  ver: 'registrarUnidadProducto',
  idempresa: idempresa,
})
async function loadRows() {
  try {
    const response = await api.get(`listaUnidadProducto/${idempresa}`) // Cambia a tu ruta real
    productUnits.value = response.data // Asume que la API devuelve un array
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
    ver: 'registrarUnidadProducto',
    idempresa: idempresa,
  }
}
const editUnit = (item) => {
  formData.value = {
    ver: 'editarUnidadProducto',
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
      const response = await api.get(`eliminarUnidadProducto/${item.id}/`) // Cambia a tu ruta real
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
    const response = await api.get(`actualizarEstadoUnidadProducto/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
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
