import { ref } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesG'


export function useVentas() {
  const ventasValidas = ref([])
  const ventasAnuladas = ref([])
  const ventasDevueltas = ref([])
  const cargando = ref(false)

  const listarDatos = async () => {
    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const idempresa = usuario?.empresa?.idempresa

      const response = await api.get(`listaVentas/${idempresa}`)
      
      if (response.data.estado === 'error') {
        throw new Error(response.data.error)
      }

      const tipoventa = {
        1: 'Factura Compra-Venta',
        0: 'S/Factura',
        2: 'Factura Alquileres',
        24: 'NOTA DE CRÉDITO-DÉBITO',
        3: 'Factura Comercial',
      }

      const estado = {
        1: 'completado',
        2: 'anulada',
        3: 'devuelta',
      }

      ventasValidas.value = response.data
        .filter((u) => u.estado != 2 && u.estado != 3)
        .map((key, index) => {
          const total = parseFloat(key.montototal) + parseFloat(key.descuento)

          return {
            ...key,
            numero: index + 1,
            tipov: tipoventa[key.tipoventa],
            estado: estado[key.estado],
            total: total,
            acciones: '',
            accionSeleccionada: '',
          }
        })
    } catch (error) {
      console.error('Error al listar ventas válidas:', error)
      throw error // Re-throw to handle in component if needed
    }
  }

  const listarDatosANU = async () => {
    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const idempresa = usuario?.empresa?.idempresa

      const response = await api.get(`listadoanulaciones/${idempresa}`)

      if (response.data.estado === 'error') {
        throw new Error(response.data.error)
      }

      const tipoventa = {
        1: 'Factura Compra-Venta',
        0: 'S/Factura',
        2: 'Factura Alquileres',
        24: 'NOTA DE CRÉDITO-DÉBITO',
        3: 'Factura Comercial',
      }

      const motivosanulacion = {
        1: 'FACTURA MAL EMITIDA',
        2: 'NOTA DE CREDITO-DEBITO MAL EMITIDA',
        3: 'DATOS DE EMISION INCORRECTOS',
        4: 'FACTURA O NOTA DE CREDITO-DEBITO DEVUELTA',
      }

      ventasAnuladas.value = response.data.map((key, index) => {
        const mot = isNaN(key.motivo) ? key.motivo : motivosanulacion[key.motivo]

        return {
          ...key,
          numero: index + 1,
          tipov: tipoventa[key.tipoventa],
          motivo: mot,
          acciones: '',
          accionSeleccionada: '',
        }
      })
    } catch (error) {
      console.error('Error al listar ventas anuladas:', error)
      throw error
    }
  }

  const listarDatosDEV = async () => {
    try {
      const usuarioResponse = validarUsuario()
      const usuario = usuarioResponse[0]
      const idempresa = usuario?.empresa?.idempresa

      const response = await api.get(`listadevolucion/${idempresa}`)

      if (response.data.estado === 'error') {
        throw new Error(response.data.error)
      }

      const tipoventa = {
        1: 'Factura Compra-Venta',
        0: 'S/Factura',
        2: 'Factura Alquileres',
        24: 'NOTA DE CRÉDITO-DÉBITO',
        3: 'Factura Comercial',
      }

      ventasDevueltas.value = response.data.map((key, index) => {
        return {
          ...key,
          numero: index + 1,
          tipov: tipoventa[key.tipoventa],
          acciones: '',
          accionSeleccionada: '',
        }
      })
    } catch (error) {
      console.error('Error al listar ventas devueltas:', error)
      throw error
    }
  }
  
  const cargarTodosLosDatos = async () => {
    cargando.value = true
    try {
        await Promise.all([listarDatos(), listarDatosANU(), listarDatosDEV()])
    } finally {
        cargando.value = false
    }
  }

  return {
    ventasValidas,
    ventasAnuladas,
    ventasDevueltas,
    cargando,
    listarDatos,
    listarDatosANU,
    listarDatosDEV,
    cargarTodosLosDatos
  }
}
