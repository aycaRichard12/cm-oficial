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
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
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
    operaciones.value = response.data
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al cargar operaciones: ' + error })
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

    await api[method](url, body)
    $q.notify({
      color: 'positive',
      message: `Operación ${isUpdate ? 'actualizada' : 'creada'} con éxito`,
    })
    fetchOperaciones() // Refrescar tabla
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error en la solicitud: ' + error })
  } finally {
    loading.value = false
  }
}

// Eliminar
const handleDelete = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Deseas eliminar esta operación?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      const data = await api.get(`eliminarOperacion/${id}`)
      const response = data.data
      console.log(response, id)
      $q.notify({ color: 'positive', message: 'Operación eliminada' })
      fetchOperaciones()
    } catch (error) {
      $q.notify({ color: 'negative', message: 'Error al eliminar: ' + error })
    } finally {
      loading.value = false
    }
  })
}

onMounted(fetchOperaciones)
</script>
