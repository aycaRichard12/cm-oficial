import { ref } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from '../FuncionesGenerales'
import { Notify } from 'quasar'

export function useReporteProductoCompras() {
  const compras = ref([])
  const detalleCompra = ref(null)
  const loading = ref(false)
  const loadingDetalle = ref(false)

  // Obtener ID de empresa del usuario
  const getIdEmpresa = () => {
    return idempresa_md5()
  }

  /**
   * Obtener historial de compras de un producto
   * @param {number|string} idProducto - ID del producto
   * @param {string} fechaInicio - Formato YYYY-MM-DD
   * @param {string} fechaFin - Formato YYYY-MM-DD
   */
  const fetchComprasPorProducto = async (idProducto, fechaInicio, fechaFin) => {
    loading.value = true
    try {
      const endpoint = `reporteProductoProveedoresCompras/${idProducto}/${fechaInicio}/${fechaFin}`

      // console.log('Fetching compras pro producto:', endpoint)

      const response = await api.get(endpoint)
      const data = response.data
      console.log('Datos recibidos del API:', data)
      // Agregar número de fila y normalizar datos si es necesario
      compras.value = data.map((item, index) => ({
        ...item,

        num: index + 1,
      }))

      console.log('Compras obtenidas:', compras.value)

      if (compras.value.length === 0) {
        Notify.create({
          type: 'warning',
          message: 'No se encontraron compras para este producto en el rango de fechas.',
          position: 'top-right',
        })
      } else {
        Notify.create({
          type: 'positive',
          message: `Se encontraron ${compras.value.length} registros`,
          position: 'top-right',
        })
      }

      return compras.value
    } catch (error) {
      console.error('Error al obtener compras:', error)
      Notify.create({
        type: 'negative',
        message: 'Error al obtener el reporte',
        position: 'top-right',
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

      // La API devuelve un array, tomamos el primer elemento?
      // Según ejemplo del usuario: /detalleCompra/334/...
      // Asumimos que retorna el objeto o array.
      // Generalmente estas APIs devuelven un array [ { ...datos, detalle: [...] } ]

      if (Array.isArray(data) && data.length > 0) {
        detalleCompra.value = data[0]
      } else {
        detalleCompra.value = data
      }

      // Si necesitamos mapear estructura para el modal:
      // El modal espera: proveedor, nombreAlmacen, fechaIngreso, nFactura, cantidadIngreso, totalIngreso, autorizacion, estado, productos[]
      // Verificaremos la estructura real en tiempo de ejecución, pero por ahora guardamos todo.

      return detalleCompra.value
    } catch (error) {
      console.error('Error al obtener detalle:', error)
      Notify.create({
        type: 'negative',
        message: 'Error al cargar detalle',
        position: 'top-right',
      })
      return null
    } finally {
      loadingDetalle.value = false
    }
  }

  return {
    compras,
    detalleCompra,
    loading,
    loadingDetalle,
    fetchComprasPorProducto,
    fetchDetalleCompra,
  }
}
