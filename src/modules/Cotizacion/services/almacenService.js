import { api, apiCt } from 'src/boot/axios'

export const listarAlmacenesResponsable = async (idempresa) => {
  const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
  return response.data
}

export const listarPuntoVentaFacturaCotizacion = async (idusuario) => {
  const response = await api.get(`listaPuntoVentaFacturaCotizacion/${idusuario}`)
  return response.data
}

export const listarCajaBancos = async (idempresa) => {
  const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)
  return response.data
}
