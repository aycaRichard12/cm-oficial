// src/modules/quick-consult/services/api.js
import { api } from 'src/boot/axios' // instancia real de axios
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

/**
 * Obtiene el ID de empresa encriptado (MD5) una sola vez
 */
const EMPRESA_ID = idempresa_md5()

/**
 * Obtiene los almacenes asignados a un usuario específico
 * @param {string|number} usuarioId - ID del usuario
 * @param {string|number} empresaId - ID de la empresa
 */
export async function fetchWarehouses(usuarioId, empresaId) {
  const endpoint = `/listaResponsableAlmacen/${empresaId}`
  const { data } = await api.get(endpoint)

  if (data[0] === 'error') {
    throw new Error(data.error || 'Error al cargar almacenes')
  }

  // Mapeo puro de datos
  return data
    .filter((item) => item.idusuario == usuarioId)
    .map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
      codigosin: item.sucursales[0]?.codigosin || '',
    }))
}

/**
 * Obtiene las categorías de precio disponibles para un almacén
 * @param {number} empresaId - ID de la empresa
 * @param {number} almacenId - ID del almacén para filtrar
 */
export async function fetchPriceCategories(empresaId, almacenId) {
  const endpoint = `/listarCategoriaPrecioVenta/${empresaId}`
  const { data } = await api.get(endpoint)

  if (data[0] === 'error') {
    throw new Error(data.error || 'Error al cargar categorías')
  }

  // Filtrado y mapeo puro
  return data
    .filter((item) => item.estado == 1 && item.idalmacen == almacenId)
    .map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
}

/**
 * Productos: lista de productos disponibles para la venta
 * @param {number} almacenId - ID del almacén seleccionado
 * @param {number} categoriaPrecioId - ID de la categoría de precio
 * @param {number|null} campaignId - ID de la campaña activa (opcional)
 * @returns {Promise<{data: Array}>}
 */
export async function fetchProducts(almacenId, categoriaPrecioId, campaignId = null) {
  console.log(campaignId)
  const endpoint = `/listaProductosDisponiblesVenta/${EMPRESA_ID}`
  const { data } = await api.get(endpoint)

  if (data[0] === 'error') {
    throw new Error(data.error || 'Error al cargar productos')
  }

  // Filtrar por categoría de precio (idporcentaje)
  let productos = data.datos.filter((p) => p.idporcentaje == categoriaPrecioId)

  // Si hay campaña activa, después se aplicarán los precios de campaña
  // (la sobreescritura del precio se hace en el store, no aquí)

  return { data: productos }
}

/**
 * Campañas activas para un almacén
 * @param {number} almacenId
 * @returns {Promise<{data: Array}>}
 */
export async function fetchCampaigns(almacenId) {
  const endpoint = `/campanas/${EMPRESA_ID}`
  const { data } = await api.get(endpoint)

  if (data[0] === 'error') {
    throw new Error(data.error || 'Error al cargar campañas')
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const campanasActivas = data.filter((c) => {
    if (c.idalmacen != almacenId || Number(c.estado) !== 1) return false
    if (c.fechainicio && c.fechafinal) {
      const inicio = new Date(c.fechainicio)
      const fin = new Date(c.fechafinal)
      fin.setHours(23, 59, 59, 999)
      return hoy >= inicio && hoy <= fin
    }
    return true
  })

  return { data: campanasActivas }
}

/**
 * Precios de campaña para una campaña y categoría de precio específicas
 * @param {number} campaignId
 * @param {number} categoryPriceId
 * @returns {Promise<Map<number, number>>} Mapa de idproductoalmacen -> precio
 */
export async function fetchCampaignPrices(campaignId, categoryPriceId) {
  // URL base de la API de campañas (puede variar, se ajusta a la real)
  const URL_APICM = import.meta.env.VITE_API_CM_URL || '' // Si existe variable global
  const endpointCategorias = `${URL_APICM}api/listacategoriapreciocampaña/${campaignId}`
  const categorias = await peticionGET(endpointCategorias) // función global (ver nota)

  const categoriaCorrespondiente = categorias.find(
    (cat) => cat.idcategoriaprecio == categoryPriceId,
  )

  if (!categoriaCorrespondiente) {
    return new Map()
  }

  const endpointPrecios = `${URL_APICM}api/listapreciocampaña/${campaignId}`
  const todosLosPrecios = await peticionGET(endpointPrecios)

  const preciosFiltrados = todosLosPrecios.filter(
    (precio) => precio.idcategoriacampaña == categoriaCorrespondiente.id,
  )

  const mapa = new Map()
  preciosFiltrados.forEach((item) => {
    mapa.set(item.idproductoalmacen, parseFloat(item.precio))
  })

  return mapa
}

/**
 * Función auxiliar para peticiones GET (similar a la usada en el código original)
 * Se asume que existe globalmente o se importa. Si no, se puede implementar con axios.
 */
async function peticionGET(url) {
  const response = await api.get(url)
  return response.data
}
