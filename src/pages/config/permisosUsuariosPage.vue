<template>
  <q-page padding class="q-pt-sm">
    <!-- Header Section -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="bg-white shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm q-px-md">
            <div class="row items-center">
              <q-icon name="security" color="primary" size="2.5rem" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold text-primary">Permisos de Usuarios</div>
                <div class="text-subtitle2 text-grey-7">
                  Gestiona las operaciones y niveles de autorización
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Form Section -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm">
            <form-autorizar-permisos
              :loading="loading"
              @on-submit="handleSave"
              @tipo-cambiado="handleTipoCambiado"
              @usuario-cambiado="handleUsuarioCambiado"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Table Section -->
    <div class="row">
      <div class="col-12">
        <q-card flat class="shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm">
            <base-filterable-table
              :title="
                tipoFiltro === 'operacion' ? 'Operaciones Registradas' : 'Gráficos Autorizados'
              "
              :rows="operacionesFiltradas"
              :columns="dynamicColumns"
              :array-headers="dynamicHeaders"
              row-key="id"
              no-data-label="No hay permisos registrados"
            >
              <template v-slot:body-cell-num="props">
                <q-td :props="props">
                  {{ props.pageIndex + 1 }}
                </q-td>
              </template>
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
                  <div class="row q-gutter-xs no-wrap justify-center">
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
                        {{ Number(props.row.estado) === 1 ? 'Desautorizar' : 'Autorizar' }}
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
                      <q-tooltip class="bg-grey-8 text-body2">Eliminar</q-tooltip>
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import FormAutorizarPermisos from 'src/components/general/operacionesPermisos/FormAutorizarPermisos.vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const operaciones = ref([])
const loading = ref(false)
const IDMD5 = idempresa_md5()
const tipoFiltro = ref('operacion')
const usuarioSeleccionado = ref(null)

// Filtrar operaciones según la pestaña seleccionada y el usuario seleccionado
// En permisosUsuariosPage.vue
const operacionesFiltradas = computed(() => {
  let filtradas = operaciones.value
  console.log(operaciones.value)

  if (usuarioSeleccionado.value) {
    // Normalizamos el valor seleccionado a String
    const idBusqueda = String(usuarioSeleccionado.value)

    filtradas = filtradas.filter((op) => {
      // Intentamos obtener el ID del usuario de varias formas posibles según tu API
      const idEnRegistro = op.idusuario || op.usuario?.[0]?.idusuario || op.usuario?.[0]?.id

      // Comparamos convirtiendo ambos a String para evitar errores de tipo (int vs string)
      const matchesID = String(idEnRegistro) === idBusqueda

      // Opcional: Comparar por nombre de usuario si el ID falla
      const matchesUsername =
        op.usuario && String(op.usuario).toLowerCase() === idBusqueda.toLowerCase()

      return matchesID || matchesUsername
    })
  }

  // Mantener el filtrado por tipo (Operaciones vs Gráficos)
  if (tipoFiltro.value === 'graficos') {
    return filtradas.filter((op) => op.codigo && String(op.codigo).startsWith('db_'))
  }
  return filtradas.filter((op) => op.codigo && !String(op.codigo).startsWith('db_'))
})

const handleTipoCambiado = (tipo) => {
  tipoFiltro.value = tipo
}

const handleUsuarioCambiado = (idUsuario) => {
  console.log('Usuario seleccionado en el padre:', idUsuario)
  usuarioSeleccionado.value = idUsuario || null // Asegura que si es undefined pase a null
}

// Columnas dinámicas: Oculta la columna usuario si ya hay un usuario seleccionado
const dynamicColumns = computed(() => {
  const cols = [
    {
      name: 'num',
      align: 'left',
      label: 'N°',
      field: 'num',
      sortable: true,
      dataType: 'number',
    },
    {
      name: 'codigo',
      align: 'left',
      label: 'Código',
      field: 'codigo',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'operacion',
      align: 'left',
      label: 'Operación/Gráfico',
      field: 'operacion',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'estado',
      align: 'center',
      label: 'Estado',
      field: 'estado',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'acciones',
      align: 'center',
      label: 'Acciones',
      field: 'acciones',
      sortable: false,
    },
  ]

  if (!usuarioSeleccionado.value) {
    cols.splice(1, 0, {
      name: 'usuario',
      align: 'left',
      label: 'Usuario',
      field: 'usuario',
      sortable: true,
      dataType: 'text',
    })
  }

  return cols
})

const dynamicHeaders = computed(() => {
  return usuarioSeleccionado.value
    ? ['codigo', 'operacion', 'estado']
    : ['usuario', 'codigo', 'operacion', 'estado']
})

// Obtener Operaciones
const fetchOperaciones = async () => {
  loading.value = true
  try {
    const data = await api.get(`listarOperaciones/${IDMD5}`)
    const response = data.data
    // En permisosUsuariosPage.vue -> fetchOperaciones
    operaciones.value = (response.data || []).map((obj) => {
      // Extraemos los datos del usuario que vienen en un array por parte de la API
      const datosUser = Array.isArray(obj.usuario) ? obj.usuario[0] : obj.usuario || {}

      return {
        ...obj,
        // Forzamos que idusuario esté disponible en el primer nivel
        idusuario: obj.idusuario || datosUser.idusuario || datosUser.id,
        usuario: datosUser.usuario || 'Sin Usuario',
        nombreCompleto: datosUser.nombre
          ? `${datosUser.nombre} ${datosUser.apellido || ''}`
          : 'N/A',
      }
    })
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al cargar operaciones: ' + error })
  } finally {
    loading.value = false
  }
}

// Crear o Actualizar (Soporta múltiples registros para Dashboard Checks)
const handleSave = async (payload) => {
  loading.value = true
  try {
    // Es una selección masiva (array) proveniente de los Checkboxes
    if (Array.isArray(payload)) {
      for (const req of payload) {
        const body = {
          ...req,
          ver: 'crearOperaciones',
          idmd5: IDMD5,
        }
        await api.post('crearOperaciones', body)
      }
      $q.notify({
        color: 'positive',
        message: 'Permisos asignados con éxito',
      })
    }
    // Es una petición singular (Operaciones menú principal)
    else {
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
    }
    fetchOperaciones() // Refrescar tabla en ambas circunstancias
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
