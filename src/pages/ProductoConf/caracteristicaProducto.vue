<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para atributos o propiedades -->
          <q-icon name="tune" size="md" class="q-mr-sm" />
          {{ t('configProducto.caracteristicaProducto.title') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ t('configProducto.caracteristicaProducto.subtitle') }}
        </div>
      </div>
    </div>
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>{{ t('configProducto.caracteristicaProducto.dialogTitle') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()
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
      message: t('configProducto.caracteristicaProducto.messages.loadError'),
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

  const confirmed = await notify.question(
    t('configProducto.caracteristicaProducto.messages.deleteMessage', { name: item.nombre }),
  )

  console.log('Resultado de la confirmación:', confirmed) // Si esto no sale, el problema es useNotify

  if (!confirmed) return

  try {
    const response = await api.get(`eliminarCaracteristicaProducto/${item.id}/`)
    const res = response.data

    const esExito = res.estado === 'exito' || (Array.isArray(res) && res[0] === 'exito')
    const mensaje = res.mensaje || (Array.isArray(res) ? res[1] : null) || i18nT('ui.procesado-6c27bb')

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
        caption: i18nT('ui.la-caracteristica-podria-estar-en-uso-por-algun-prod-5ef2c7'),
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
      message: i18nT('ui.no-se-pudo-eliminar-el-registro-8371ff'),
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
      message: t('configProducto.caracteristicaProducto.messages.loadError'),
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
        message: t('configProducto.caracteristicaProducto.messages.saved'),
    })
    loadRows()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
        message: t('configProducto.caracteristicaProducto.messages.saveError') + error,
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
