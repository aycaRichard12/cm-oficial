//src\modules\configurarsucursalSin\services\sucursalService.js
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { getTipoFactura } from 'src/composables/FuncionesG'

export const getSmallSucursales = async () => {
  const idempresa = idempresa_md5()
  console.log(idempresa)
  const res = await api.get(`ListarSucursalesEmpresa/${idempresa}`)
  if (res.data.estado === 'success') return res.data.data
  throw new Error('Error al obtener sucursales pequeñas')
}

export const getBigSucursales = async (token) => {
  console.log(token)
  const tipo = getTipoFactura()
  console.log(tipo)
  const res = await api.get(`listaSucursalSin/sucursales/${token}/${tipo}/1`)
  console.log(res.data)
  if (res.data.status === 'success') return res.data.data
  throw new Error('Error al obtener sucursales grandes')
}

export const asignarCodigo = async (idsucursalcontable, codigoSucursal) => {
  console.log(idsucursalcontable)
  console.log(codigoSucursal)
  const idempresa = idempresa_md5()
  const res = await api.get(
    `asignarCodigoSucursalEmpresa/${idempresa}/${idsucursalcontable}/${codigoSucursal}`,
  )
  if (res.data.estado === 'success') return res.data
  throw new Error(res.data.mensaje || 'Error en la asignación')
}

//quitarCodigoSucursalSinEmpresa
export const quitarCodigo = async (idsucursalcontable) => {
  const idempresa = idempresa_md5() // asegúrate de que esté disponible
  const res = await api.get(`quitarCodigoSucursalSinEmpresa/${idempresa}/${idsucursalcontable}`)
  if (res.data.estado === 'success') return res.data
  throw new Error(res.data.mensaje || 'Error al quitar la asignación')
}
