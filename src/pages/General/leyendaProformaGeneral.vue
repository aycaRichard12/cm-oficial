<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Condiciones para Cotización</div>
          <q-btn icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <FormLeyenda
            :model-value="formData"
            :is-editing="isEditing"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Tabla -->
    <TableLeyendas
      :leyendas="rows"
      @add="toggleForm"
      @edit="editItem"
      @delete="deleteItem"
      @toggle-status="changeStatus"
    />
  </q-page>

  <!-- Formulario -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import FormLeyenda from 'components/general/Leyenda/FormLeyenda.vue'
import TableLeyendas from 'components/general/Leyenda/TableLeyenda.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const rows = ref([])

const formData = ref({
  ver: 'registrarLeyendaCotizacion',
  idempresa: idempresa,
  texto: '',
})
async function loadRows() {
  try {
    const response = await api.get(`listaLeyendaCotizacion/${idempresa}`) // Cambia a tu ruta real
    rows.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) resetForm()
}

function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarLeyendaCotizacion',
    idempresa: idempresa,
    texto: '',
  }
}

async function handleSubmit(data) {
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

function editItem(item) {
  formData.value = {
    ver: 'editarLeyendaCotizacion',
    idempresa: idempresa,
    texto: item.texto,
    id: item.id,
  }
  isEditing.value = true
  showForm.value = true
}

async function deleteItem(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Leyenda "${item.texto}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarLeyendaCotizacion/${item.id}/`) // Cambia a tu ruta real
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

async function changeStatus(item) {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoLeyendaCotizacion/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
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
