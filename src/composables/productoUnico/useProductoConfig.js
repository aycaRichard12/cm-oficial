import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export function useProductoConfig(md5) {
  const $q = useQuasar()

  // Estado reactivo
  const config = ref({
    productounico: false,
    idempresa: null,
  })
  const loading = ref(false)
  const showDialog = ref(false)
  const dialogType = ref('success')
  const dialogTitle = ref('')
  const dialogMessage = ref('')

  // Función interna para notificaciones de error
  const mostrarError = (mensaje) => {
    dialogType.value = 'error'
    dialogTitle.value = 'Error'
    dialogMessage.value = mensaje
    showDialog.value = true

    $q.notify({
      type: 'negative',
      message: mensaje,
      icon: 'error',
      position: 'top-right',
      color: 'negative',
      textColor: 'white',
      timeout: 5000,
    })
  }

  const obtenerEstadoActual = async () => {
    try {
      loading.value = true
      const endpoint = `configuracionProductoUnicoEstadoActual/${md5}`
      const response = await api.get(endpoint)
      if (response.data.estado === 'ok') {
        config.value.productounico = response.data.productounico
        config.value.idempresa = response.data.idempresa
      }
      console.log(config.value)
    } catch (error) {
      mostrarError('No se pudo obtener la configuración actual: ' + error)
    } finally {
      loading.value = false
    }
  }

  const toggleProductoUnico = async (nuevoValor) => {
    try {
      loading.value = true
      const response = await api.get(`toggleProductoUnico/${md5}`)
      const data = response.data

      if (data.estado === 'ok') {
        config.value.productounico = data.productounico
        $q.notify({
          type: 'positive',
          message: data.mensaje,
          icon: 'check_circle',
          position: 'top-right',
        })
      } else {
        config.value.productounico = !nuevoValor
        mostrarError(data.mensaje || 'Error al actualizar')
      }
    } catch (error) {
      config.value.productounico = !nuevoValor
      const mensaje = error.response?.data?.mensaje || 'Error de conexión'
      mostrarError(mensaje)
    } finally {
      loading.value = false
    }
  }

  // Hook de ciclo de vida dentro del composable
  onMounted(obtenerEstadoActual)

  // Retornamos todo lo que el componente necesitará
  return {
    config,
    loading,
    showDialog,
    dialogType,
    dialogTitle,
    dialogMessage,
    toggleProductoUnico,
    obtenerEstadoActual,
  }
}
