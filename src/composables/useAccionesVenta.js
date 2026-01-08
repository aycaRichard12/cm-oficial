import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesG'

export function useAccionesVenta() {
  const $q = useQuasar()
  
  // State for modals/dialogs
  const modalMotivoAnulacion = ref(false)
  const modalMotivoDevolucion = ref(false)
  const modalEstadoFactura = ref(false)
  
  // Selection state
  const motivoAnulacionSeleccionado = ref(null)
  const ventaAAnular = ref(null)
  const cotizacionAAnular = ref(null)
  
  const motivoDevolucion = ref('')
  const ventaADevolver = ref(null)
  const tipo_devolucion = ref(null)
  
  const estadoFactura = ref('')

  // Opciones
  const opcionesMotivoAnulacion = ref([
    { value: 1, label: 'Factura mal emitida' },
    { value: 2, label: 'Nota de crédito/débito mal emitida' },
    { value: 3, label: 'Datos de emisión incorrectos' },
    { value: 4, label: 'Factura o nota de crédito/débito devuelta' },
  ])

  // --- ANULACION ---
  const iniciarAnulacionVenta = (id) => {
    ventaAAnular.value = id
    cotizacionAAnular.value = null
    modalMotivoAnulacion.value = true
    motivoAnulacionSeleccionado.value = null
  }

  const iniciarAnulacionCotizacion = (id) => {
    cotizacionAAnular.value = id
    ventaAAnular.value = null
    modalMotivoAnulacion.value = true
    motivoAnulacionSeleccionado.value = null
  }

  const confirmarAnulacion = async () => {
    if (!motivoAnulacionSeleccionado.value) {
      $q.notify({ type: 'warning', message: 'Seleccione un motivo de anulación' })
      return false // Indicates failure
    }

    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const idusuario = usuario?.idusuario
      const token = usuario?.factura?.access_token
      const tipo = usuario?.factura?.tipo

      $q.loading.show({ message: 'Anulando venta...' })
      
      let response = null

      if (ventaAAnular.value == null) {
        const endpoint = `anularCotizacion/${cotizacionAAnular.value}/${motivoAnulacionSeleccionado.value}/${idusuario}`
        response = await api.get(`${endpoint}`)
      } else if (cotizacionAAnular.value == null) {
        const endpoint = `cambiarestadoventa/${ventaAAnular.value}/2/${motivoAnulacionSeleccionado.value}/${idusuario}/${token}/${tipo}`
        response = await api.get(`${endpoint}`)
      }

      if (response.data.estado === 'exito') {
        $q.notify({ type: 'positive', message: 'Venta anulada correctamente' })
        return true // Indicates success
      } else {
        throw new Error(response.data.error || 'Error al anular la venta')
      }
    } catch (error) {
      console.error('Error al anular venta:', error)
      $q.notify({ type: 'negative', message: 'Error al anular la venta' })
      return false
    } finally {
      $q.loading.hide()
      modalMotivoAnulacion.value = false
    }
  }

  // --- DEVOLUCION ---
  const verificarYProcesarDevolucion = async (id, codigo, callbackYaExiste) => {
    try {
      const response = await api.get(`verificardevolucion/${id}/${codigo}`)

      if (response.data.estado === 100) {
        if (response.data.codigo === 1) {
             // Devolucion en proceso
             if(callbackYaExiste) callbackYaExiste(response.data.id)
        } else {
          // Nueva devolucion
          tipo_devolucion.value = codigo
          ventaADevolver.value = id
          modalMotivoDevolucion.value = true
          motivoDevolucion.value = ''
        }
      } else {
        throw new Error(response.data.error || 'Error al verificar devolución')
      }
    } catch (error) {
      console.error('Error al procesar devolución:', error)
      $q.notify({ type: 'negative', message: 'Error al procesar devolución' })
    }
  }

  const confirmarDevolucion = async (callbackSuccess) => {
    if (!motivoDevolucion.value) {
      $q.notify({ type: 'warning', message: 'Ingrese un motivo de devolución' })
      return
    }

    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const idusuario = usuario?.idusuario

      $q.loading.show({ message: 'Registrando devolución...' })

      const formData = new FormData()
      formData.append('ver', 'registroDevolucion')
      formData.append('idventa', ventaADevolver.value)
      formData.append('motivo', motivoDevolucion.value)
      formData.append('idusuario', idusuario)
      formData.append('tipo_dev', tipo_devolucion.value)

      const response = await api.post('', formData)
      
      if (response.data.estado === 100) {
        $q.notify({ type: 'positive', message: 'Devolución registrada correctamente' })
        if(callbackSuccess) callbackSuccess(response.data.id)
      } else {
        throw new Error(response.data.error || 'Error al registrar devolución')
      }
    } catch (error) {
      console.error('Error al registrar devolución:', error)
      $q.notify({ type: 'negative', message: 'Error al registrar devolución' })
    } finally {
      $q.loading.hide()
      modalMotivoDevolucion.value = false
    }
  }

  // --- ESTADO FACTURA/COTIZACION ---
  const verificarEstadoFactura = async (cuf) => {
    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const token = usuario?.factura?.access_token
      const tipo = usuario?.factura?.tipo

      $q.loading.show({ message: 'Validando estado de factura...' })

      const response = await api.get(`estadofactura/${cuf}/${token}/${tipo}`)
      if (response.data.status === 'success') {
        estadoFactura.value = response.data.data.estado
        modalEstadoFactura.value = true
      } else {
        throw new Error(response.data.error || 'Error al verificar estado')
      }
    } catch (error) {
      console.error('Error al verificar estado de factura:', error)
      $q.notify({ type: 'negative', message: 'Error al verificar estado de factura' })
    } finally {
      $q.loading.hide()
    }
  }

  const verificarEstadoCotizacion = async (idcotizacion) => {
    try {
      $q.loading.show({ message: 'Validando estado ...' })

      const response = await api.get(`estadoCotizacion/${idcotizacion}`)
      if (response.data.status === 'success') {
        estadoFactura.value = response.data.data.condicion
        modalEstadoFactura.value = true
      } else {
        throw new Error(response.data.error || 'Error al verificar condicion')
      }
    } catch (error) {
      console.error('Error al verificar condicion de factura:', error)
      $q.notify({ type: 'negative', message: 'Error al verificar condicion de factura' })
    } finally {
      $q.loading.hide()
    }
  }

  return {
    modalMotivoAnulacion,
    modalMotivoDevolucion,
    modalEstadoFactura,
    motivoAnulacionSeleccionado,
    motivoDevolucion,
    estadoFactura,
    opcionesMotivoAnulacion,
    iniciarAnulacionVenta,
    iniciarAnulacionCotizacion,
    confirmarAnulacion,
    verificarYProcesarDevolucion,
    confirmarDevolucion,
    verificarEstadoFactura,
    verificarEstadoCotizacion
  }
}
