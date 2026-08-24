import { api } from 'src/boot/axios'

export const listarMetodosPagoFactura = async (idempresa, token, tipo) => {
  const response = await api.get(`listaMetodopagoFactura/${idempresa}/${token}/${tipo}`)
  return response.data
}
