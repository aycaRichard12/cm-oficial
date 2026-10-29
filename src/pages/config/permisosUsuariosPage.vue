<template>
  <q-page padding class="q-pt-sm">
    <!-- Header Section -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="cm-surface shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm q-px-md">
            <div class="row items-center">
              <q-icon name="security" color="primary" size="2.5rem" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold text-primary">{{ $t('ui.permisos-de-usuarios-d1e354') }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('ui.gestiona-las-operaciones-y-niveles-de-autorizacion-58d631') }}
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
                tipoFiltro === 'operacion' ? $t('ui.operaciones-registradas-4f84ef') : $t('ui.graficos-autorizados-890229')
              "
              :rows="operacionesFiltradas"
              :columns="dynamicColumns"
              :array-headers="dynamicHeaders"
              row-key="id"
              :no-data-label="$t('ui.no-hay-permisos-registrados-fbc7db')"
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
                    :label="Number(props.row.estado) === 1 ? $t('ui.autorizado-b4fb49') : $t('ui.no-autorizado-988c4e')"
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
                        {{ Number(props.row.estado) === 1 ? $t('ui.desautorizar-7626e2') : $t('ui.autorizar-8a74ab') }}
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
                      <q-tooltip class="bg-grey-8 text-body2">{{ $t('common.delete') }}</q-tooltip>
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
import { t as i18nT } from 'src/i18n/runtime'
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
      label: i18nT('cotizacion.table.number'),
      field: 'num',
      sortable: true,
      dataType: 'number',
    },
    {
      name: 'codigo',
      align: 'left',
      label: i18nT('ui.codigo-c35510'),
      field: 'codigo',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'operacion',
      align: 'left',
      label: i18nT('ui.operacion-grafico-40a6fd'),
      field: 'operacion',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'estado',
      align: 'center',
      label: i18nT('cotizacion.table.status'),
      field: 'estado',
      sortable: true,
      dataType: 'text',
    },
    {
      name: 'acciones',
      align: 'center',
      label: i18nT('common.actions'),
      field: 'acciones',
      sortable: false,
    },
  ]

  if (!usuarioSeleccionado.value) {
    cols.splice(1, 0, {
      name: 'usuario',
      align: 'left',
      label: i18nT('auth.user'),
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
        usuario: datosUser.usuario || i18nT('ui.sin-usuario-69e79a'),
        nombreCompleto: datosUser.nombre
          ? `${datosUser.nombre} ${datosUser.apellido || ''}`
          : 'N/A',
      }
    })
  } catch (error) {
    $q.notify({ color: 'negative', message: i18nT('ui.error-al-cargar-operaciones-711902') + error })
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
        console.log('Enviando payload para operación masiva:', body)
        await api.post('crearOperaciones', body)
      }
      $q.notify({
        color: 'positive',
        message: i18nT('ui.permisos-asignados-con-exito-99c3ab'),
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
        message: `Operación ${isUpdate ? i18nT('ui.actualizada-0989d0') : 'creada'} con éxito`,
      })
    }
    fetchOperaciones() // Refrescar tabla en ambas circunstancias
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
