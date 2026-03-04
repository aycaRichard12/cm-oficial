import { ref } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { getUsuario, idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales';
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones';

/**
 * Composable que encapsula el flujo de solicitud de anulación de compra.
 */
export function useAnulacionCompra() {
  const $q = useQuasar()
  const idempresa = idempresa_md5()
  const idusuario = idusuario_md5()
  const nombreUsuario = getUsuario()
  const { enviarNotificacion } = useNotificaciones()

  const dialogAnulacion = ref(false)
  const compraParaAnulacion = ref(null)
  const loading = ref(false)

  /** Lista de solicitudes de anulación de la empresa */
  const solicitudes = ref([])

  /**
   * Carga todas las solicitudes de anulación desde la API.
   */
  async function cargarSolicitudes() {
    try {
      const response = await api.get(`obtenerSolicitudes/${idempresa}`)
      solicitudes.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error al cargar solicitudes de anulación:', error)
      solicitudes.value = []
    }
  }

  /**
   * Indica si una compra puede solicitar anulación.
   * Regla: sólo puede si NO tiene solicitud activa (pendiente/aprobada).
   *        Si fue rechazada puede volver a solicitar. Sin solicitud también puede.
   * @param {string|number} id_compra
   * @returns {boolean}
   */
  function puedeAnular(id_compra) {
    const solicitud = solicitudes.value.find((s) => String(s.id_ingreso) === String(id_compra))
    if (!solicitud) return true // Sin solicitud → puede
    if (solicitud.estado === 'rechazado') return true // Rechazada → puede volver a pedir
    return false // pendiente/aprobada → no puede
  }

  /**
   * Abre el diálogo de solicitud de anulación para la compra indicada.
   */
  function abrirDialogAnulacion(compra) {
    compraParaAnulacion.value = compra
    dialogAnulacion.value = true
  }

  /**
   * Ejecuta las dos llamadas API en secuencia:
   *  1. POST crearSolicitudAnulacion (JSON)
   *  2. enviarNotificacion al responsable seleccionado
   *
   * @param {{ motivo, usuarioSeleccionado, asunto, mensaje }} formData
   * @param {Object|null} compra - Compra a anular.
   * @returns {Promise<boolean>}
   */
  async function enviarSolicitudAnulacion(formData, compra = null) {
    const target = compra || compraParaAnulacion.value
    if (!target) {
      console.error('useAnulacionCompra: no hay compra seleccionada')
      return false
    }

    loading.value = true
    try {
      const payload = {
        ver: 'crearSolicitudAnulacion',
        id_compra: target.id,
        id_usuario_solicita: idusuario,
        motivo_usuario: formData.motivo,
      }
      console.log('payload anulacion:', payload)
      const response = await api.post('', payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      console.log('response anulacion:', response)
      const esExito = response.data.estado === 'exito' || response.data.estado === 'success'
      if (!esExito) {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje || 'No se pudo crear la solicitud de anulación',
        })
        return false
      }

      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Solicitud de anulación registrada',
      })

      await enviarNotificacion({
        id_usuario: formData.usuarioSeleccionado,
        asunto: formData.asunto,
        mensaje: formData.mensaje,
        datos_adicionales: {
          url_de_envio: 'anularcompra',
          nombre_usuario_notificacion: nombreUsuario,
        },
      })

      return true
    } catch (error) {
      console.error('Error en solicitud de anulación:', error)
      $q.notify({ type: 'negative', message: 'Error al procesar la solicitud' })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Anula una compra directamente sin pasar por flujo de solicitud.
   * @param {{ id: string|number, motivo?: string }} compra
   * @returns {Promise<boolean>}
   */
  async function anularCompraDirecta(compra) {
    loading.value = true
    const datosEnviar = {
      ver: 'anularCompraDirecta',
      id_compra: compra.id,
      id_usuario_solicita: idusuario,
      motivo_usuario: compra.motivo || 'Anulación directa por administrador',
    }
    try {
      const response = await api.post('', datosEnviar, {
        headers: { 'Content-Type': 'application/json' },
      })
      const esExito = response.data.estado === 'exito' || response.data.estado === 'success'
      if (!esExito) {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje || 'No se pudo anular la compra',
        })
        return false
      }
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Compra anulada exitosamente',
      })
      return true
    } catch (error) {
      console.error('Error al anular la compra:', error)
      $q.notify({ type: 'negative', message: 'Error al procesar la anulación' })
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    solicitudes,
    dialogAnulacion,
    compraParaAnulacion,
    loading,
    cargarSolicitudes,
    puedeAnular,
    abrirDialogAnulacion,
    enviarSolicitudAnulacion,
    anularCompraDirecta,
  }
}
