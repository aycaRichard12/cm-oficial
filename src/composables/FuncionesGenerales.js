import { useFetchList } from 'src/composables/useFetchList'

//vapp
const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
export function idempresa_md5() {
  if (contenidousuario) {
    return contenidousuario?.[0]?.empresa?.idempresa
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}
export function getNombreEmpresa() {
  if (contenidousuario) {
    return contenidousuario?.[0]?.empresa?.nombre
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}
export function getUsuario() {
  if (contenidousuario) {
    return contenidousuario?.[0]?.nombre
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}
export function idusuario_md5() {
  if (contenidousuario) {
    return contenidousuario?.[0]?.idusuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}
export function TipoFactura() {
  if (contenidousuario && contenidousuario[0]?.factura) {
    const tipo = contenidousuario[0].factura.tipo

    // Verificar si está vacío, null o undefined
    if (tipo === null || tipo === '' || tipo === undefined || tipo === '0' || tipo === 0) {
      return false // está vacío
    } else {
      return true // tiene valor
    }
  } else {
    alert('Hubo un problema con la sesión, por favor vuelva a iniciar sesión.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}

export function expires_in() {
  if (contenidousuario && contenidousuario[0]) {
    return contenidousuario?.[0]?.empresa?.fex
  } else {
    alert('Hubo un problema con la sesión, por favor vuelva a iniciar sesión.')
    console.log('Los elementos no existen en localStorage')
    window.location.href = '/app/dashboard'
  }
}
export function obtenerEstadoFactura() {
  const objetoDesdeLocalStorage = JSON.parse(localStorage.getItem('yofinanciero'))
  console.log(objetoDesdeLocalStorage)
  return Object.values(objetoDesdeLocalStorage[0].factura).every((valor) => valor !== '')
}
export function validarUsuario() {
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.href = '/app/dashboard'
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
