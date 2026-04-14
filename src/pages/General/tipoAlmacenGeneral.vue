<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Tipo de Almacén</div>
          <q-btn icon="close" flat dense round @click="showForm = false"></q-btn>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <TipoAlmacenForm
            :model-value="formData"
            :is-editing="isEditing"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <TipoAlmacenTable
      :rows="rows"
      @add="toggleForm"
      @edit="editItem"
      @delete="deleteItem"
      @toggle-status="changeStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import TipoAlmacenForm from 'components/general/tipoAlmacen/FormTipoAlmacen.vue'
import TipoAlmacenTable from 'components/general/tipoAlmacen/TableTipoAlmacen.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const rows = ref([])

const formData = ref({
  ver: 'registrarTipoAlmacen',
  idempresa: idempresa,
  nombre: '',
  descripcion: '',
})
async function loadRows() {
  try {
    const response = await api.get(`listaTipoAlmacen/${idempresa}`) // Cambia a tu ruta real
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
    ver: 'registrarTipoAlmacen',
    idempresa: idempresa,
    nombre: '',
    descripcion: '',
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
    ver: 'editarTipoAlmacen',
    idempresa: idempresa,
    nombre: item.tipoalmacen,
    descripcion: item.descripcion,
    id: item.id,
  }
  isEditing.value = true
  showForm.value = true
}

async function deleteItem(item) {
  const esAlmacenAutomatico = item.tipoalmacen === 'ALMACEN_1'

  if (esAlmacenAutomatico) {
    // Para almacén automático: diálogo con confirmación de texto
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `Este almacén ("${item.tipoalmacen}") fue creado automáticamente por el sistema. Su eliminación es una acción delicada que puede afectar reportes previos. Para confirmar la eliminación definitiva, escriba el nombre "${item.tipoalmacen}" abajo:`,
      prompt: {
        model: '',
        type: 'text',
        placeholder: 'Escriba el nombre aquí...',
      },
      persistent: true,
      ok: {
        flat: true,
        label: 'Eliminar definitivamente',
        color: 'negative',
      },
      cancel: {
        flat: true,
        color: 'primary',
        label: 'Cancelar',
      },
    }).onOk(async (userInput) => {
      if (userInput !== item.tipoalmacen) {
        $q.notify({
          type: 'warning',
          message: 'El texto ingresado no coincide. Eliminación cancelada.',
          icon: 'warning',
        })
        return
      }
      await procesarEliminacion(item)
    })
  } else {
    // Para almacén normal: diálogo de confirmación simple
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar el tipo de almacén "${item.tipoalmacen}"? Esta acción no se puede deshacer.`,
      persistent: true,
      ok: {
        flat: true,
        label: 'Eliminar',
        color: 'negative',
      },
      cancel: {
        flat: true,
        color: 'primary',
        label: 'Cancelar',
      },
    }).onOk(async () => {
      await procesarEliminacion(item)
    })
  }
}

async function procesarEliminacion(item) {
  try {
    const response = await api.get(`eliminarTipoAlmacen/${item.id}/`)
    if (response.data.estado === 'exito') {
      loadRows()
      $q.notify({
        type: 'positive',
        message: 'El registro fue eliminado correctamente',
        icon: 'check',
      })
    } else {
      $q.notify({
        type: 'warning',
        message: `¡No permitido!, debido a registros dependientes`,
        icon: 'warning',
        timeout: 4000,
      })
    }
  } catch (error) {
    console.error('Error al eliminar:', error)
    $q.notify({
      type: 'warning',
      message: `¡No permitido!, debido a registros dependientes`,
      icon: 'warning',
      timeout: 4000,
    })
  }
}

async function changeStatus(item) {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoTipoAlmacen/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
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
