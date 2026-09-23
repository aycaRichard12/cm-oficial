import { api } from 'src/boot/axios'

export const registrarCotizacion = async (formData) => {
  const response = await api.post('', formData)
  return response.data
}

export const detallesCotizacion = async (id, idempresa) => {
  const response = await api.get(`detallesCotizacion/${id}/${idempresa}`)
  return response.data
}

export const listarLeyendaCotizacion = async (idempresa) => {
  const response = await api.get(`listaLeyendaCotizacion/${idempresa}`)
  return response.data
}

export const listarLeyendaFactura = async (idempresa, token, tipoFactura) => {
  const response = await api.get(`listaLeyendaFactura/${idempresa}/${token}/${tipoFactura}`)
  return response.data
}

export const listarDivisa = async (idempresa, token, tipoFactura) => {
  let endpoint = `listaDivisa/${idempresa}`
  if (token && tipoFactura) {
    endpoint = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
  }
  const response = await api.get(endpoint)
  return response.data
}
