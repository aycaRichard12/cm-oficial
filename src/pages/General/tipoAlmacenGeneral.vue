<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="warehouse" size="md" class="q-mr-sm" />
          {{ t('configGeneral.tipoAlmacen.title') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ t('configGeneral.tipoAlmacen.subtitle') }}
        </div>
      </div>
    </div>
    <template v-if="lectura">
      <q-dialog v-model="showForm" persistent>
        <q-card class="responsive-dialog">
          <q-card-section class="bg-primary text-white text-h6 flex justify-between">
            <div>{{ t('configGeneral.tipoAlmacen.dialogTitle') }}</div>
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
        :puede-crear="escritura"
        :puede-editar="editar"
        :puede-eliminar="eliminar"
        @add="toggleForm"
        @edit="editItem"
        @delete="deleteItem"
        @toggle-status="changeStatus"
      />
    </template>

    <div v-else class="flex flex-center q-pa-xl">
      <q-card flat bordered class="q-pa-lg text-center" style="max-width: 520px">
        <q-icon name="lock" size="64px" color="grey-6" />
        <div class="text-h6 q-mt-md">Acceso Restringido</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          No tiene permisos para consultar el módulo de Tipos de Almacén. Contacte al administrador
          del sistema para solicitar acceso.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import TipoAlmacenForm from 'components/general/tipoAlmacen/FormTipoAlmacen.vue'
import TipoAlmacenTable from 'components/general/tipoAlmacen/TableTipoAlmacen.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
const idempresa = idempresa_md5()
const [escritura, lectura, editar, eliminar] = obtenerPermisosPagina()
console.log('Resultado Permisos')
console.log(escritura, lectura, editar, eliminar)
const $q = useQuasar()
const { t } = useI18n()
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
      message: t('configGeneral.tipoAlmacen.messages.loadError'),
    })
  }
}
function toggleForm() {
  if (!showForm.value && !escritura) {
    $q.notify({
      type: 'warning',
      message: 'No tiene permiso para crear registros en este módulo.',
      icon: 'warning',
      position: 'top-right',
    })
    return
  }
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
  if (isEditing.value && !editar) {
    $q.notify({
      type: 'warning',
      message: 'No tiene permiso para editar registros en este módulo.',
      icon: 'warning',
      position: 'top-right',
    })
    return
  }
  if (!isEditing.value && !escritura) {
    $q.notify({
      type: 'warning',
      message: 'No tiene permiso para crear registros en este módulo.',
      icon: 'warning',
      position: 'top-right',
    })
    return
  }
  const formDataToSend = objectToFormData(data)
  for (let [k, v] of formDataToSend.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    if (isEditing.value) {
      const response = await api.post(``, formDataToSend)
      console.log(response)
    } else {
      const response = await api.post(``, formDataToSend)
      console.log(response)
    }
    $q.notify({
      type: 'positive',
      message: isEditing.value
        ? t('configGeneral.tipoAlmacen.messages.updated')
        : t('configGeneral.tipoAlmacen.messages.saved'),
    })
    loadRows()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: t('configGeneral.tipoAlmacen.messages.saveError') + error,
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
  if (!eliminar) {
    $q.notify({
      type: 'warning',
      message: 'No tiene permiso para eliminar registros en este módulo.',
      icon: 'warning',
      position: 'top-right',
    })
    return
  }
  const esAlmacenAutomatico = item.tipoalmacen === 'ALMACEN_1'

  if (esAlmacenAutomatico) {
    // Para almacén automático: diálogo con confirmación de texto
    $q.dialog({
      title: t('configGeneral.tipoAlmacen.messages.deleteTitle'),
      message: t('configGeneral.tipoAlmacen.messages.autoWarehouse', { name: item.tipoalmacen }),
      prompt: {
        model: '',
        type: 'text',
        placeholder: t('configGeneral.tipoAlmacen.messages.promptPlaceholder'),
      },
      persistent: true,
      ok: {
        flat: true,
        label: t('configGeneral.tipoAlmacen.messages.deletePermanently'),
        color: 'negative',
      },
      cancel: {
        flat: true,
        color: 'primary',
        label: t('common.cancel'),
      },
    }).onOk(async (userInput) => {
      if (userInput !== item.tipoalmacen) {
        $q.notify({
          type: 'warning',
          message: t('configGeneral.tipoAlmacen.messages.mismatch'),
          icon: 'warning',
        })
        return
      }
      await procesarEliminacion(item)
    })
  } else {
    // Para almacén normal: diálogo de confirmación simple
    $q.dialog({
      title: t('configGeneral.tipoAlmacen.messages.deleteTitle'),
      message: t('configGeneral.tipoAlmacen.messages.deleteNormal', { name: item.tipoalmacen }),
      persistent: true,
      ok: {
        flat: true,
        label: t('common.delete'),
        color: 'negative',
      },
      cancel: {
        flat: true,
        color: 'primary',
        label: t('common.cancel'),
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
        message: t('configGeneral.tipoAlmacen.messages.deleted'),
        icon: 'check',
      })
    } else {
      $q.notify({
        type: 'warning',
        message: t('configGeneral.tipoAlmacen.messages.dependencyWarning'),
        icon: 'warning',
        timeout: 4000,
      })
    }
  } catch (error) {
    console.error('Error al eliminar:', error)
    $q.notify({
      type: 'warning',
      message: t('configGeneral.tipoAlmacen.messages.dependencyWarning'),
      icon: 'warning',
      timeout: 4000,
    })
  }
}

async function changeStatus(item) {
  if (!editar) {
    $q.notify({
      type: 'warning',
      message: 'No tiene permiso para cambiar el estado de los registros en este módulo.',
      icon: 'warning',
      position: 'top-right',
    })
    return
  }
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoTipoAlmacen/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    loadRows()
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: t('configGeneral.tipoAlmacen.messages.loadError'),
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
