import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5 } from '../FuncionesGenerales'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
const idempresa = idempresa_md5()
const almacenStore = useAlmacenStore()

/**
 * Composable para la gestión de solicitudes y permisos.
 * Centraliza las llamadas a la API, manejo de estados de carga y notificaciones de UI.
 */
export function useSolicitudes() {
  const $q = useQuasar()
  const loading = ref(false)
  const responsables = ref([])
  const almacenesResponsable = ref([])

  // --- Helpers de Notificación ---
  const notifySuccess = (message) => {
    $q.notify({
      type: 'positive',
      message: message || 'Operación realizada con éxito',
      position: 'top-right',
    })
  }

  const notifyError = (error) => {
    const message = error.response?.data?.message || 'Error al procesar la solicitud'
    $q.notify({
      type: 'negative',
      message,
      position: 'top-right',
    })
  }
  async function loadAAlmacenes() {
    loading.value = true
    try {
      await almacenStore.listaAlmacenes()
      // 1. Usar un nombre distinto para la data cruda
      const dataCruda = almacenStore.almacenesResponsable

      if (dataCruda.length === 0) {
        $q.notify({ type: 'warning', message: 'No hay almacenes...' })
      }

      // 2. Asignar directamente al .value de la variable reactiva del composable
      almacenesResponsable.value = dataCruda.map((a) => ({
        value: a.idalmacen,
        label: a.almacen,
      }))

      return almacenesResponsable.value
    } finally {
      loading.value = false
    }
  }

  async function loadUsuarios() {
    loading.value = true
    try {
      const response = await api.get(`listaResponsable/${idempresa}`)

      console.log('Respuesta cruda de usuarios:', response.data)
      responsables.value = response.data.map((item) => {
        // Extraer datos del usuario (puede ser objeto o array)
        const usuarioData = Array.isArray(item.usuario) ? item.usuario[0] : item.usuario

        // Construir el label con nombre completo y cargo
        const nombre = usuarioData?.nombre || ''
        const apellido = usuarioData?.apellido || ''
        const cargo = usuarioData?.cargo || ''
        const nombreUsuario = usuarioData?.usuario || ''

        // Formato: "Nombre Apellido - Cargo (usuario)"
        let label = ''
        if (nombre && apellido) {
          label = `${nombre} ${apellido}`
          if (cargo) {
            label += ` - ${cargo}`
          }
          if (nombreUsuario) {
            label += ` (${nombreUsuario})`
          }
        } else if (nombreUsuario) {
          label = nombreUsuario
        } else {
          label = 'Sin nombre'
        }

        return {
          ...item,
          usuarioData: usuarioData, // Guardar datos completos del usuario
          label: label,
          value: item.idusuarioMD5 || '',
        }
      })

      console.log('Usuarios procesados:', responsables.value)
      return responsables.value
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los usuarios',
        position: 'top',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva solicitud de permiso en el sistema.
   * @param {Object} payload - Datos de la solicitud
   */
  const crearSolicitudPermiso = async (payload) => {
    loading.value = true
    payload.ver = 'crearSolicitudPermiso' // Indicamos al backend que esta acción es para crear una solicitud
    console.log('Creando solicitud con payload:', payload)
    try {
      const response = await api.post('', payload)
      const data = response.data
      console.log('Solicitud creada:', response)
      notifySuccess('Solicitud creada correctamente')
      return data
    } catch (error) {
      notifyError(error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Aprueba o rechaza una solicitud existente.
   * Utiliza el campo "ver" dentro del payload según requerimiento de backend.
   * @param {Object} payload - { id, ver: 'aprobar'|'rechazar', ... }
   */
  const aprobarRechazarSolicitud = async (payload) => {
    loading.value = true
    try {
      const response = await api.post('', payload)
      const data = response.data
      console.log('Solicitud gestionada:', response)
      notifySuccess(`Acción "${payload.ver}" procesada exitosamente`)
      return data
    } catch (error) {
      notifyError(error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Ejecuta el consumo de un permiso ya aprobado.
   * @param {Object} payload - Datos para el consumo del permiso
   */
  const consumirPermiso = async (payload) => {
    loading.value = true
    try {
      const response = await api.post('', payload)
      const data = response.data
      console.log('Permiso consumido:', response)
      notifySuccess('Permiso consumido correctamente')
      return data
    } catch (error) {
      notifyError(error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el listado de permisos activos de una empresa.
   * @param {Number|String} idempresa
   */
  const listarPermisosActivos = async () => {
    if (!idempresa) return []
    loading.value = true
    try {
      const response = await api.get(`/listarPermisosActivos/${idempresa}`)
      console.log('Permisos activos:', response)
      return response.data
    } catch (error) {
      notifyError(error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el historial de permisos ya utilizados.
   * @param {Number|String} idempresa
   */
  const listarPermisosUsados = async () => {
    if (!idempresa) return []
    loading.value = true
    try {
      const { data } = await api.get(`/listarPermisosUsados/${idempresa}`)
      return data
    } catch (error) {
      notifyError(error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene los permisos que han expirado sin ser utilizados.
   * @param {Number|String} idempresa
   */
  const listarPermisosVencidos = async () => {
    if (!idempresa) return []
    loading.value = true
    try {
      const { data } = await api.get(`/listarPermisosVencidos/${idempresa}`)
      return data
    } catch (error) {
      notifyError(error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Lista todas las solicitudes pendientes o históricas de un usuario.
   * @param {Number|String} idempresa
   */
  const listarSolicitudes = async () => {
    if (!idempresa) return []
    loading.value = true
    try {
      const { data } = await api.get(`/listarSolicitudes/${idempresa}`)
      return data
    } catch (error) {
      notifyError(error)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    almacenesResponsable,
    responsables,
    loading,
    loadUsuarios,
    crearSolicitudPermiso,
    aprobarRechazarSolicitud,
    consumirPermiso,
    listarPermisosActivos,
    listarPermisosUsados,
    listarPermisosVencidos,
    listarSolicitudes,
    loadAAlmacenes,
  }
}
