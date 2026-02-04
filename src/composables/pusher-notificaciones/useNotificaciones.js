import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from '../FuncionesGenerales'

export function useNotificaciones() {
  const $q = useQuasar()
  const idempresa = idempresa_md5()

  const responsables = ref([])
  const loading = ref(false)

  /**
   * Carga la lista de usuarios responsables desde la API
   * @returns {Promise<void>}
   */
  async function loadUsuarios() {
    loading.value = true
    try {
      const response = await api.get(`listaResponsable/${idempresa}`)

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
   * Envía una notificación a un usuario específico
   * @param {Object} params - Parámetros de la notificación
   * @param {string} params.id_usuario - ID del usuario destinatario
   * @param {string} params.asunto - Asunto de la notificación
   * @param {string} params.mensaje - Mensaje de la notificación
   * @param {string} params.prioridad - Prioridad (alta, media, baja)
   * @param {Object} params.datos_adicionales - Datos adicionales opcionales
   * @returns {Promise<Object>}
   */
  async function enviarNotificacion({ id_usuario, asunto, mensaje, datos_adicionales = {} }) {
    loading.value = true

    try {
      // Validaciones
      if (!id_usuario) {
        throw new Error('Debe seleccionar un usuario destinatario')
      }

      if (!asunto || !mensaje) {
        throw new Error('El asunto y mensaje son obligatorios')
      }

      // Formatear fecha actual
      const now = new Date()
      const fechaFormateada = now
        .toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(',', '')

      // Estructura del payload según especificación actualizada
      const payload = {
        ver: 'enviarNotificacion',
        idmd5: idempresa,
        id_usuario: id_usuario,
        mensaje: {
          asunto: asunto,
          descripcion: mensaje,
          fecha: fechaFormateada,
          url_de_envio: datos_adicionales.url_de_envio || '',
        },
      }

      console.log('Enviando notificación:', payload)

      const response = await api.post('services/', payload)

      console.log('Respuesta del servidor:', response)

      $q.notify({
        type: 'positive',
        message: 'Notificación enviada exitosamente',
        position: 'top',
        icon: 'check_circle',
      })

      return response.data
    } catch (error) {
      console.error('Error al enviar notificación:', error)

      const errorMessage = error.message || 'No se pudo enviar la notificación'

      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        icon: 'error',
      })

      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Envía notificaciones a múltiples usuarios
   * @param {Array<string>} usuarios_ids - Array de IDs de usuarios
   * @param {Object} datosNotificacion - Datos de la notificación
   * @returns {Promise<Array>}
   */
  async function enviarNotificacionMasiva(usuarios_ids, datosNotificacion) {
    const promesas = usuarios_ids.map((id_usuario) =>
      enviarNotificacion({
        id_usuario,
        ...datosNotificacion,
      }),
    )

    try {
      const resultados = await Promise.allSettled(promesas)

      const exitosas = resultados.filter((r) => r.status === 'fulfilled').length
      const fallidas = resultados.filter((r) => r.status === 'rejected').length

      $q.notify({
        type: exitosas > 0 ? 'positive' : 'warning',
        message: `Notificaciones enviadas: ${exitosas} exitosas, ${fallidas} fallidas`,
        position: 'top',
      })

      return resultados
    } catch (error) {
      console.error('Error en envío masivo:', error)
      throw error
    }
  }

  return {
    responsables,
    loading,
    loadUsuarios,
    enviarNotificacion,
    enviarNotificacionMasiva,
  }
}
