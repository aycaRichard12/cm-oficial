import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

export function useClienteAlmacenConfig(md5) {
  const soloAlmacen = ref(false)
  const loading = ref(false)
  const showDialog = ref(false)
  const dialogType = ref('success')
  const dialogTitle = ref('')
  const dialogMessage = ref('')

  const fetchEstadoActual = async () => {
    loading.value = true
    try {
      console.log(md5)
      const { data } = await api.get(`configuracionclientesAlmacenEstadoActual/${md5}`)
      console.log(data)
      // Ajusta el parseo según la estructura real de la respuesta (ej. data.estado, data.valor, etc.)
      soloAlmacen.value = data.clientesAlmacen ?? data ?? false
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

  const toggleClienteAlmacen = async () => {
    loading.value = true
    // Invertimos temporalmente para hacer la petición (el servidor normalmente devuelve el nuevo estado)
    const previous = soloAlmacen.value
    soloAlmacen.value = !soloAlmacen.value

    try {
      const { data } = await api.get(`toggleclienteAlmacen/${md5}`)
      console.log(data)
      // El backend puede devolver el nuevo estado confirmado
      if (data !== undefined && data !== null) {
        soloAlmacen.value = data.clientesAlmacen ?? data
      }
      showDialog.value = true
      dialogType.value = 'success'
      dialogTitle.value = 'Configuración actualizada'
      dialogMessage.value = soloAlmacen.value
        ? 'Ahora solo se listan clientes del almacén actual.'
        : 'Ahora se listan todos los clientes de la empresa.'
    } catch (error) {
      console.error(error)
      // Revertir cambio si hubo error
      soloAlmacen.value = previous
      showDialog.value = true
      dialogType.value = 'error'
      dialogTitle.value = 'Error al cambiar configuración'
      dialogMessage.value =
        'No se pudo aplicar el cambio.<br>Verifique la conexión e intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchEstadoActual()
  })

  return {
    soloAlmacen,
    loading,
    showDialog,
    dialogType,
    dialogTitle,
    dialogMessage,
    toggleClienteAlmacen,
  }
}
