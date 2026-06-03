import { api } from 'boot/axios' // Ajusta según tu configuración de Quasar
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const ID_EMPRESA = idempresa_md5()

export const stockService = {
  // Obtener lista de almacenes activos
  getAlmacenes() {
    return api.get(`listaAlmacen/${ID_EMPRESA}`)
  },

  // Obtener categorías de precio por empresa
  getCategoriasPrecio() {
    return api.get(`listarCategoriaPrecioVenta/${ID_EMPRESA}`)
  },

  // Obtener reporte de stock por almacén, empresa y fecha (fecha opcional)
  getReporteStock(almacenId, fechaFin = null) {
    const fecha = fechaFin || new Date().toISOString().split('T')[0]
    const endpoint = `reporteproductoalmacen/${almacenId}/${ID_EMPRESA}/${fecha}`
    return api.get(endpoint)
  },
}
