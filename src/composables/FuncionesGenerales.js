import { useFetchList } from 'src/composables/useFetchList'

function getUsuarioData() {
  try {
    const data = localStorage.getItem('mistersofts-cm')
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Error parseando datos de usuario:', e)
    return null
  }
}

export function generarCodigo() {
  const fecha = new Date()

  // Fecha y hora compacta: YYMMDDHHMMSS
  const tiempo =
    String(fecha.getFullYear()).slice(-2) +
    String(fecha.getMonth() + 1).padStart(2, '0') +
    String(fecha.getDate()).padStart(2, '0') +
    String(fecha.getHours()).padStart(2, '0') +
    String(fecha.getMinutes()).padStart(2, '0') +
    String(fecha.getSeconds()).padStart(2, '0')

  // Letras permitidas
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  // Función para generar letras aleatorias
  const generarLetras = (cantidad) => {
    let resultado = ''

    for (let i = 0; i < cantidad; i++) {
      resultado += letras[Math.floor(Math.random() * letras.length)]
    }

    return resultado
  }

  // Letras al inicio y al final
  const inicio = generarLetras(2)
  const final = generarLetras(2)

  // Parte numérica aleatoria
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')

  // Código final
  const codigo = `${inicio}${tiempo}${random}${final}`

  return codigo
}

export function idempresa_md5() {
  const contenidousuario = getUsuarioData()
  return contenidousuario?.[0]?.empresa?.idempresa || null
}

export function getNombreEmpresa() {
  const contenidousuario = getUsuarioData()
  return contenidousuario?.[0]?.empresa?.nombre || 'Sistema'
}

export function getUsuario() {
  const contenidousuario = getUsuarioData()
  return contenidousuario?.[0]?.nombre || 'Usuario Desconocido'
}

export function idusuario_md5() {
  const contenidousuario = getUsuarioData()
  return contenidousuario?.[0]?.idusuario || null
}

export function TipoFactura() {
  const contenidousuario = getUsuarioData()
  if (contenidousuario && contenidousuario[0]?.factura) {
    const tipo = contenidousuario[0].factura.tipo
    return !(tipo === null || tipo === '' || tipo === undefined || tipo === '0' || tipo === 0)
  }
  return false
}

export function expires_in() {
  const contenidousuario = getUsuarioData()
  return contenidousuario?.[0]?.empresa?.fex || null
}

export function obtenerEstadoFactura() {
  const objetoDesdeLocalStorage = getUsuarioData()
  if (!objetoDesdeLocalStorage || !objetoDesdeLocalStorage[0]?.factura) return false
  return Object.values(objetoDesdeLocalStorage[0].factura).every((valor) => valor !== '')
}

export function validarUsuario() {
  return getUsuarioData()
}

export async function divisaEmonedaActiva() {
  try {
    const contenidousuario = validarUsuario()
    if (!contenidousuario) throw new Error('Usuario no válido')
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
