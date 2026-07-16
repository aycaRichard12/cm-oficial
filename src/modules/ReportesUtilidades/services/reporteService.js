import { api } from 'src/boot/axios'

export function getAlmacenes(idEmpresa) {
  return api.get(`listaResponsableAlmacenReportes/${idEmpresa}`).then((res) => res.data)
}

export function getClientes(idEmpresa) {
  return api.get(`listaCliente/${idEmpresa}`).then((res) => res.data)
}
export function getCategoriapProducto(idEmpresa) {
  return api.get(`listaCategoriaproductoArbol/${idEmpresa}`).then((res) => res.data)
}

export function getCampanas(idEmpresa) {
  return api.get(`campanas/${idEmpresa}`).then((res) => res.data)
}

export function getReporte(tipo, params) {
  let baseUrl
  switch (tipo) {
    case 'resumen':
      baseUrl = 'reportes/ventasUtilidadResumen'
      break
    case 'detalle':
      baseUrl = 'reportes/ventasUtilidadDetalle'
      break
    case 'grafico':
      baseUrl = 'reportes/ventasUtilidadGrafico'
      break
    default:
      throw new Error('Tipo de reporte no válido')
  }

  const queryString = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  const url = `${baseUrl}&${queryString}`
  return api.get(url).then((res) => res.data)
}
