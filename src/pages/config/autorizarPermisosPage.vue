<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <form-autorizar-permisos :loading="loading" @on-submit="handleSave" />
      </div>

      <div class="col-12 col-md-8">
        <table-autorizar-permisos
          :rows="operaciones"
          :loading="loading"
          @on-delete="handleDelete"
          @on-edit="handleEdit"
          @toggle-status="toggleStatus"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import FormAutorizarPermisos from 'src/components/general/operacionesPermisos/FormAutorizarPermisos.vue'
import TableAutorizarPermisos from 'src/components/general/operacionesPermisos/TableAutorizarPermisos.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const operaciones = ref([])
const loading = ref(false)
const IDMD5 = idempresa_md5()

// Obtener Operaciones
const fetchOperaciones = async () => {
  loading.value = true
  try {
    const data = await api.get(`listarOperaciones/${IDMD5}`)
    const response = data.data
    console.log(response)
    operaciones.value = response.data.map((obj, index) => {
      return {
        ...obj,
        id: index + 1,
        usuario: obj.usuario[0]?.usuario || 'N/A',
      }
    })
  } catch (error) {
    $q.notify({ color: 'negative', message: i18nT('ui.error-al-cargar-operaciones-711902') + error })
  } finally {
    loading.value = false
  }
}

// Crear o Actualizar
const handleSave = async (payload) => {
  loading.value = true
  try {
    const isUpdate = !!payload.id
    const url = isUpdate ? 'actualizarOperacion' : 'crearOperaciones'

    const method = isUpdate ? 'post' : 'post'
    const body = {
      ...payload,
      ver: isUpdate ? 'actualizarOperacion' : 'crearOperaciones',
      idmd5: IDMD5,
    }

    const response = await api[method](url, body)
    console.log(response.data)
    $q.notify({
      color: 'positive',
      message: `Operación ${isUpdate ? i18nT('ui.actualizada-0989d0') : 'creada'} con éxito`,
    })
    fetchOperaciones() // Refrescar tabla
  } catch (error) {
    $q.notify({ color: 'negative', message: i18nT('ui.error-en-la-solicitud-51865c') + error })
  } finally {
    loading.value = false
  }
}

// Eliminar
const handleDelete = async (id) => {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: i18nT('ui.deseas-eliminar-esta-operacion-483955'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      const data = await api.get(`eliminarOperacion/${id}`)
      const response = data.data
      console.log(response, id)
      $q.notify({ color: 'positive', message: i18nT('ui.operacion-eliminada-b3583b') })
      fetchOperaciones()
    } catch (error) {
      $q.notify({ color: 'negative', message: i18nT('ui.error-al-eliminar-e736aa') + error })
    } finally {
      loading.value = false
    }
  })
}

const toggleStatus = async (item) => {
  console.log('toggleStatus item', item)
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  console.log('nuevoEstado', nuevoEstado)
  try {
    const response = await api.get(
      `CambiarEstadoPermisosOperacionUsuario/${item.id_operacion}/${nuevoEstado}`,
    ) // Cambia a tu ruta real
    console.log(response)
    fetchOperaciones()
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}

onMounted(fetchOperaciones)
</script>
