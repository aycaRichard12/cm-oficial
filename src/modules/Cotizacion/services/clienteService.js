import { api } from 'src/boot/axios'

export const listarClientes = async (idempresa) => {
  const response = await api.get(`listaCliente/${idempresa}`)
  return response.data
}

export const listarSucursales = async (clienteId) => {
  const response = await api.get(`listaSucursal/${clienteId}`)
  return response.data
}

export const registrarCliente = async (formData) => {
  const response = await api.post('', formData)
  return response.data
}

export const obtenerConfiguracionClientesAlmacen = async (idempresa) => {
  const response = await api.get(`configuracionclientesAlmacenEstadoActual/${idempresa}`)
  return response.data
}
