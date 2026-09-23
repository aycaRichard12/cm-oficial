import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

export function useProductoVarianteConfig(md5) {
  const usarVariante = ref(false) // true = usar variante, false = no usar
  const loading = ref(false)
  const showDialog = ref(false)
  const dialogType = ref('success')
  const dialogTitle = ref('')
  const dialogMessage = ref('')

  const fetchEstadoActual = async () => {
    loading.value = true

    try {
      const { data } = await api.get(`configuracionProductoVarianteEstadoActual/${md5}`)

      console.log(data)

      // Ajusta según la estructura real de la respuesta
      usarVariante.value = Boolean(
        data?.usarVariante ?? data?.ProductoVariante ?? data?.estado ?? data,
      )
    } catch (error) {
      console.error(error)

      showDialog.value = true
      dialogType.value = 'error'
      dialogTitle.value = 'Error al cargar configuración'
      dialogMessage.value = 'No se pudo obtener el estado actual.<br>Intente nuevamente.'
    } finally {
      loading.value = false
    }
  }

  const toggleProductoVariante = async (nuevoValor) => {
    const valorAnterior = usarVariante.value
    const valorAplicar = typeof nuevoValor === 'boolean' ? nuevoValor : !usarVariante.value

    usarVariante.value = valorAplicar
    loading.value = true

    try {
      const { data } = await api.get(`toggleProductoVariante/${md5}`)

      // Confirmación del servidor
      if (data !== undefined && data !== null) {
        usarVariante.value = Boolean(
          data?.usarVariante ?? data?.ProductoVariante ?? data?.estado ?? data,
        )
      }

      showDialog.value = true
      dialogType.value = 'success'
      dialogTitle.value = 'Configuración actualizada'
      dialogMessage.value = usarVariante.value
        ? 'Se habilitó el uso de variantes en productos.'
        : 'Se deshabilitó el uso de variantes en productos.'
    } catch (error) {
      console.error(error)

      // Revertir cambio si hay error
      usarVariante.value = valorAnterior

      showDialog.value = true
      dialogType.value = 'error'
      dialogTitle.value = 'Error al cambiar configuración'
      dialogMessage.value =
        'No se pudo aplicar el cambio.<br>Verifique la conexión e intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchEstadoActual)

  return {
    usarVariante,
    loading,
    showDialog,
    dialogType,
    dialogTitle,
    dialogMessage,
    toggleProductoVariante,
  }
}
