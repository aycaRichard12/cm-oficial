import { api } from 'src/boot/axios'

export const listarCanalVentaActivos = async (idempresa) => {
  const response = await api.get(`listaCanalVentaActivos/${idempresa}`)
  return response.data
}

export const listarCategoriaPrecioVenta = async (idempresa) => {
  const response = await api.get(`listarCategoriaPrecioVenta/${idempresa}`)
  return response.data
}

export const listarProductosDisponiblesVenta = async (idempresa) => {
  const response = await api.get(`listaProductosDisponiblesVenta/${idempresa}`)
  return response.data
}
