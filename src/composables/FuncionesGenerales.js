import { useFetchList } from 'src/composables/useFetchList'

// Lee siempre fresco para no usar un valor cacheado del momento de importación
function getUsuarioData() {
  return JSON.parse(localStorage.getItem('yofinanciero'))
}

export function idempresa_md5() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario) {
    return contenidousuario?.[0]?.empresa?.idempresa
  } else {
    console.warn('Sin sesión: idempresa_md5')
    window.location.replace('/#/login')
  }
}
export function getNombreEmpresa() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario) {
    return contenidousuario?.[0]?.empresa?.nombre
  } else {
    return 'Sistema'
  }
}
export function getUsuario() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario) {
    return contenidousuario?.[0]?.nombre
  } else {
    return 'Usuario Desconocido'
  }
}
export function idusuario_md5() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario) {
    return contenidousuario?.[0]?.idusuario
  } else {
    console.warn('Sin sesión: idusuario_md5')
    window.location.replace('/#/login')
  }
}
export function TipoFactura() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario && contenidousuario[0]?.factura) {
    const tipo = contenidousuario[0].factura.tipo
    if (tipo === null || tipo === '' || tipo === undefined || tipo === '0' || tipo === 0) {
      return false
    } else {
      return true
    }
  } else {
    console.warn('Sin sesión: TipoFactura')
    window.location.replace('/#/login')
  }
}
export function expires_in() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario && contenidousuario[0]) {
    return contenidousuario?.[0]?.empresa?.fex
  } else {
    console.warn('Sin sesión: expires_in')
    window.location.replace('/#/login')
  }
}
export function obtenerEstadoFactura() {
  const objetoDesdeLocalStorage = getUsuarioData()
  return Object.values(objetoDesdeLocalStorage[0].factura).every((valor) => valor !== '')
}
export function validarUsuario() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario) {
    return contenidousuario
  } else {
    console.warn('Sin sesión: validarUsuario')
    window.location.replace('/#/login')
  }
}



export async function divisaEmonedaActiva() {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `listaDivisa/${idempresa}/${token}/${tipo}`
    console.log(endpoint)
    const { items: resultado } = useFetchList(endpoint, (key) => ({
      id: key.id,
      nombre: key.nombre,
      tipo: key.tipo,
      codigosin: key.monedasin ? key.monedasin.codigo : null,
    }))

    if (resultado[0] == 'error') {
      console.log(resultado.error)
      throw resultado.error
    }
    console.log(resultado)
    const use = resultado.filter((u) => u.estado == 1)
    const divisaActiva = use.map((key) => ({
      id: key.id,
      nombre: key.nombre,
      tipo: key.tipo,
      codigosin: key.monedasin ? key.monedasin.codigo : null,
    }))[0]

    console.log(divisaActiva)
    return divisaActiva
  } catch (error) {
    console.error(error)
    throw error
  }
}

export function objectToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      formData.append(key, obj[key])
    } else {
      formData.append(key, 0)
    }
  }
  return formData
}
