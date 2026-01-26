import { ref } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario } from './FuncionesG'
import { Notify } from 'quasar'

export function useReporteProveedorCompras() {
  const compras = ref([])
  const detalleCompra = ref(null)
  const loading = ref(false)
  const loadingDetalle = ref(false)

  // Obtener ID de empresa del usuario
  const getIdEmpresa = () => {
    const contenidousuario = validarUsuario()
    return contenidousuario[0]?.empresa?.idempresa || 'c0c7c76d30bd3dcaefc96f40275bdc0a'
  }

  /**
   * Obtener listado de compras por rango de fechas
   * @param {string} fechaInicio - Formato YYYY-MM-DD
   * @param {string} fechaFin - Formato YYYY-MM-DD
   */
  const fetchCompras = async (fechaInicio, fechaFin) => {
    loading.value = true
    try {
      const idEmpresa = getIdEmpresa()
      const endpoint = `reporteProveedorCompras/${idEmpresa}/${fechaInicio}/${fechaFin}`
      
      console.log('Fetching compras:', endpoint)
      
      const response = await api.get(endpoint)
      const data = response.data
      
      // Agregar número de fila a cada compra
      compras.value = data.map((item, index) => ({
        ...item,
        num: index + 1
      }))
      
      console.log('Compras obtenidas:', compras.value)
      
      Notify.create({
        type: 'positive',
        message: `Se encontraron ${compras.value.length} compras`,
        position: 'top-right',
        timeout: 2000
      })
      
      return compras.value
    } catch (error) {
      console.error('Error al obtener compras:', error)
      Notify.create({
        type: 'negative',
        message: 'Error al obtener el reporte de compras',
        position: 'top-right',
        timeout: 3000
      })
      compras.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalle de una compra específica
   * @param {number|string} idCompra - ID de la compra
   */
  const fetchDetalleCompra = async (idCompra) => {
    loadingDetalle.value = true
    try {
      const idEmpresa = getIdEmpresa()
      const endpoint = `detalleCompra/${idCompra}/${idEmpresa}`
      
      console.log('Fetching detalle compra:', endpoint)
      
      const response = await api.get(endpoint)
      const data = response.data
      
      // La API devuelve un array, tomamos el primer elemento
      detalleCompra.value = data[0] || null
      
      console.log('Detalle compra obtenido:', detalleCompra.value)
      
      return detalleCompra.value
    } catch (error) {
      console.error('Error al obtener detalle de compra:', error)
      Notify.create({
        type: 'negative',
        message: 'Error al obtener el detalle de la compra',
        position: 'top-right',
        timeout: 3000
      })
      detalleCompra.value = null
      return null
    } finally {
      loadingDetalle.value = false
    }
  }

  /**
   * Limpiar datos
   */
  const clearData = () => {
    compras.value = []
    detalleCompra.value = null
  }

  return {
    // State
    compras,
    detalleCompra,
    loading,
    loadingDetalle,
    
    // Methods
    fetchCompras,
    fetchDetalleCompra,
    clearData
  }
}

