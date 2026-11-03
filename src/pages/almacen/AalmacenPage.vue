<template>
  <q-page padding>
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="label" size="md" class="q-mr-sm" />
          {{ $t('ui.asignar-almacen-5d1362') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-asignar-almacen-3c1cec') }}
        </div>
      </div>
    </div>
    <q-card-section v-if="!asignando">
      <q-dialog v-model="showForm" persistent>
        <q-card class="responsive-dialog">
          <q-card-section class="bg-primary text-h6 text-white flex justify-between">
            <div>{{ $t('ui.registrar-usuario-d24899') }}</div>
            <q-btn color="" icon="close" @click="showForm = false" flat dense round />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <ResponsableForm @registroExitoso="cargarTabla" @cancel="toggleForm" />
          </q-card-section>
        </q-card>
      </q-dialog>

      <ResponsableTable
        :rows="responsables"
        @add="toggleForm"
        @eliminar="eliminarResponsable"
        @asignar="iniciarAsignacion"
      />
    </q-card-section>

    <q-card-section v-else>
      <AsignarAlmacenes
        :responsableId="responsableSeleccionado"
        :responsable-nombre="responsableSeleccionado"
        :almacenes="almacenes"
        :model-value="formData"
        @submit="handleSubmit"
        @volver="cancelarAsignacion"
      />

      <q-separator class="q-my-md" />

      <AlmacenTable :rows="almacenesAsignados" @eliminar="eliminarAlmacen" />
    </q-card-section>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ResponsableForm from 'src/components/almacen/asignacion/responsableForm.vue'
import ResponsableTable from 'src/components/almacen/asignacion/responsableTable.vue'
import AsignarAlmacenes from 'components/almacen/asignacion/responsableAsignarResponsableForm.vue'
import AlmacenTable from 'components/almacen/asignacion/responsableAsignarResponsableTable.vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
import { showDialog } from 'src/utils/dialogs'
const [lectura, escritura, editar, eliminar] = obtenerPermisosPagina()
console.log(lectura, escritura, editar, eliminar)
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const responsables = ref([])
const almacenesAsignados = ref([])
const asignando = ref(false)
const responsableSeleccionado = ref({})
const isEditing = ref(false)
const showForm = ref(false)
const almacenes = ref([])
async function loadUsuarios() {
  try {
    const response = await api.get(`listaResponsable/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    responsables.value = response.data.map((item) => ({
      ...item,
      usuario: Array.isArray(item.usuario) ? item.usuario[0] : item.usuario,
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}

function cargarTabla() {
  toggleForm()
  loadUsuarios()
}
function eliminarResponsable(id) {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `${i18nT('ui.eliminar-usuario-f91510')}`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarResponsable/${id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadUsuarios()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: i18nT('configGeneral.divisas.messages.loadError'),
      })
    }
  })
}
const cargarAlmacen = async () => {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`) // ejemplo

    const filtrado = response.data.filter(
      (obj) => obj.estado == 1 && !almacenesAsignados.value.some((v) => v.idalmacen === obj.id),
    )

    const formateado = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))

    almacenes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}

async function iniciarAsignacion(responsable) {
  console.log(responsable)
  responsableSeleccionado.value = responsable
  console.log(responsableSeleccionado.value)
  // Cargar almacenes asignados reales desde API aquí
  try {
    const response = await api.get(`listaAlmacenAsignado/${responsableSeleccionado.value?.id}`) // ejemplo
    console.log(response)

    almacenesAsignados.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }

  cargarAlmacen()
  asignando.value = true
}

function cancelarAsignacion() {
  asignando.value = false
  responsableSeleccionado.value = {}
  almacenesAsignados.value = []
}

async function eliminarAlmacen(id) {
  const result = await showDialog(
    $q,
    'Q',
    i18nT('ui.estas-seguro-de-que-deseas-eliminar-este-registro-es-a35dda'),
  )
  console.log('Question dialog result:', result)
  if (result) {
    try {
      const response = await api.get(`eliminarResponsableAlmacen/${id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        iniciarAsignacion(responsableSeleccionado.value)
        almacenesAsignados.value = almacenesAsignados.value.filter((a) => a.id !== id)
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: i18nT('configGeneral.divisas.messages.loadError'),
      })
    }
    $q.notify({ message: i18nT('ui.registro-eliminado-af3547'), color: 'positive' })
  } else {
    $q.notify({ message: i18nT('ui.accion-cancelada-4177e8'), color: 'info' })
  }
}
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
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
const formData = ref({
  ver: 'registrarResponsablealmacen',
  idempresa: idempresa,
})
const handleSubmit = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  formData.append('idresponsable', responsableSeleccionado.value?.id)
  try {
    if (isEditing.value) {
      const response = await api.post(``, formData)
      console.log(response)
    } else {
      const response = await api.post(``, formData)
      console.log(response)
    }
    iniciarAsignacion(responsableSeleccionado.value)
    toggleForm()
    $q.notify({
      type: 'positive',
      message: isEditing.value ? i18nT('configGeneral.leyenda.messages.updated') : i18nT('configGeneral.leyenda.messages.saved'),
    })
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.leyenda.messages.saveError') + error,
    })
  }
  toggleForm()
}
onMounted(() => {
  loadUsuarios()
})
</script>
