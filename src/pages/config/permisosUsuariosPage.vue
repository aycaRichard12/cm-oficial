<template>
  <q-page padding class="bg-grey-1">
    <!-- Header Section -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-card flat class="bg-white shadow-2 rounded-borders">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-icon name="security" color="primary" size="3rem" class="q-mr-md" />
              <div>
                <div class="text-h4 text-weight-bold text-primary">Permisos de Usuarios</div>
                <div class="text-subtitle1 text-grey-7 q-mt-xs">
                  Gestiona las operaciones y niveles de autorización para los usuarios del sistema
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Form Section -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-card flat class="bg-white shadow-2 rounded-borders">
          <q-card-section class="q-pa-md">
            <form-autorizar-permisos :loading="loading" @on-submit="handleSave" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Table Section -->
    <div class="row">
      <div class="col-12">
        <q-card flat class="bg-white shadow-2 rounded-borders">
          <q-card-section class="q-pa-md">
            <base-filterable-table
              title="Operaciones Registradas"
              :rows="operaciones"
              :columns="columns"
              :array-headers="['usuario', 'codigo', 'operacion', 'estado']"
              row-key="id"
            >
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-badge
                    :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'"
                    :label="Number(props.row.estado) === 1 ? 'Autorizado' : 'No Autorizado'"
                    outline
                    class="q-px-sm q-py-xs"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <div class="row q-gutter-xs no-wrap">
                    <q-btn
                      :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
                      dense
                      flat
                      round
                      :color="Number(props.row.estado) === 1 ? 'positive' : 'grey-6'"
                      @click="toggleStatus(props.row)"
                      size="sm"
                    >
                      <q-tooltip class="bg-grey-8 text-body2">
                        {{ Number(props.row.estado) === 1 ? 'Desautorizar' : 'Autorizar' }} Operación
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      color="negative"
                      dense
                      flat
                      round
                      @click="handleDelete(props.row.id_operacion)"
                      size="sm"
                    >
                      <q-tooltip class="bg-grey-8 text-body2">Eliminar Permiso</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>
            </base-filterable-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import FormAutorizarPermisos from 'src/components/general/operacionesPermisos/FormAutorizarPermisos.vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const operaciones = ref([])
const loading = ref(false)
const IDMD5 = idempresa_md5()

// Definición de columnas para la tabla
const columns = [
  { 
    name: 'id', 
    align: 'left', 
    label: 'N°', 
    field: 'id', 
    sortable: true,
    dataType: 'number'
  },
  { 
    name: 'usuario', 
    align: 'left', 
    label: 'Usuario', 
    field: 'usuario', 
    sortable: true,
    dataType: 'text'
  },
  { 
    name: 'codigo', 
    align: 'left', 
    label: 'Código', 
    field: 'codigo', 
    sortable: true,
    dataType: 'text'
  },
  { 
    name: 'operacion', 
    align: 'left', 
    label: 'Operación', 
    field: 'operacion',
    sortable: true,
    dataType: 'text'
  },
  { 
    name: 'estado', 
    align: 'center', 
    label: 'Estado', 
    field: 'estado',
    sortable: true,
    dataType: 'text'
  },
  { 
    name: 'acciones', 
    align: 'center', 
    label: 'Acciones', 
    field: 'acciones',
    sortable: false
  },
]

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
