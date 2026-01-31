<template>
  <q-page padding class="bg-grey-1">
    <!-- Header Section -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card flat class="bg-white q-pa-sm border-rounded shadow-1">
          <q-item>
            <q-item-section avatar>
              <q-icon name="security" color="primary" size="2.5rem" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h5 text-weight-bold text-primary">Permisos de Usuarios</q-item-label>
              <q-item-label caption class="text-grey-7">Gestiona las operaciones y niveles de autorización para los usuarios del sistema.</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <!-- Content Section -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <div class="sticky-top">
          <form-autorizar-permisos :loading="loading" @on-submit="handleSave" />
        </div>
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
    console.log('operaciones que pueden hacer creo ',response)
    operaciones.value = response.data.map((obj, index) => {
      return {
        ...obj,
        id: index + 1,
        usuario: obj.usuario[0]?.usuario || 'N/A',
      }
    })
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

    const response = await api[method](url, body)
    console.log(response.data)
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
      message: 'No se pudieron cargar los datos',
    })
  }
}

onMounted(fetchOperaciones)
</script>
