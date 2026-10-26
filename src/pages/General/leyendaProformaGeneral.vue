<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para documentos/leyendas -->
          <q-icon name="text_snippet" size="md" class="q-mr-sm" />
          {{ t('configGeneral.leyenda.title') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ t('configGeneral.leyenda.subtitle') }}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>{{ t('configGeneral.leyenda.dialogTitle') }}</div>
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
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from 'src/components/general/LanguageSwitcher.vue'
import { useQuasar } from 'quasar'
import FormLeyenda from 'components/general/Leyenda/FormLeyenda.vue'
import TableLeyendas from 'components/general/Leyenda/TableLeyenda.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const { t } = useI18n()
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
      message: t('configGeneral.leyenda.messages.loadError'),
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
      message: isEditing.value
        ? t('configGeneral.leyenda.messages.updated')
        : t('configGeneral.leyenda.messages.saved'),
    })
    loadRows()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: t('configGeneral.leyenda.messages.saveError') + error,
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
    title: t('configGeneral.leyenda.messages.deleteTitle'),
    message: t('configGeneral.leyenda.messages.deleteMessage', { name: item.texto }),
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
        message: t('configGeneral.leyenda.messages.loadError'),
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
      message: t('configGeneral.leyenda.messages.loadError'),
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
