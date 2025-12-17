import { URL_APICM } from './services'
import { URL_APIC } from './services'

// Envío de formularios por POST
export async function peticionPOST(formulario) {
  const datos = new FormData(formulario)

  for (let [clave, valor] of datos.entries()) {
    console.log(`${clave}:`, valor)
  }

  try {
    const response = await fetch(`${URL_APICM}api/`, {
      method: 'POST',
      body: datos,
    })

    if (!response.ok) {
      throw new Error('Error al enviar el formulario')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error en la solicitud:', error)
    throw error
  }
}

// Maneja todas las consultas GET
export async function peticionGET(apiURL) {
  console.log(apiURL)

  try {
    const response = await fetch(apiURL)
    if (!response.ok) {
      throw new Error('Error en la solicitud de la API')
    }

    const data = await response.json()
    // console.log(JSON.stringify(data))
    return data
  } catch (error) {
    console.error('Error al recibir datos de la API:', error)
    throw error
  }
}

// Carga los datos en tablas requeridas
export function llenarDatos(datos, tabla) {
  const idtabla = document.getElementById(tabla)
  if (idtabla) {
    idtabla.innerHTML = datos
  } else {
    console.warn(`Elemento con id '${tabla}' no encontrado.`)
  }
}

// Consulta por ID (u otra clave)
export async function fetch_get_c(url, uk) {
  try {
    const fullUrl = `${URL_APIC}api/${url}/${uk}`
    console.log(fullUrl)

    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error('Error en la respuesta')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al listar :${url}`, error)
    return ['Error', 'Error en el servidor']
  }
}

// Consulta tipo booleano
export async function fetch_get_CT_BOOL(url, uk) {
  try {
    const fullUrl = `${URL_APIC}api/${url}/${uk}`
    console.log(fullUrl)

    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error('Respuesta no válida')
    }

    const textData = await response.text()

    if (textData.trim() === 'true') return true
    if (textData.trim() === 'false') return false

    try {
      return JSON.parse(textData)
    } catch {
      console.warn('La respuesta no es JSON, devolviendo como texto.')
      return textData
    }
  } catch (error) {
    console.error(`Error al listar :${url}`, error)
    return ['Error', 'Error en el servidor']
  }
}
