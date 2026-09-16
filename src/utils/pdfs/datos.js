// src/modules/pdf/utils/pdfUserData.js
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
import { validarUsuario } from 'src/composables/FuncionesG'

// Estado interno del módulo
let datosPdf = null
let promesaInicializacion = null

/**
 * Inicializa y cachea los datos del usuario para PDFs.
 * Es idempotente: múltiples llamadas reutilizan la misma promesa.
 * @returns {Promise<Object>} Datos listos para PdfGeneratorService.userData
 */
export async function initPdfReportGenerator() {
  // Si ya se inicializó, devolvemos lo cacheado
  if (datosPdf) return datosPdf

  // Si hay una inicialización en curso, esperamos a esa misma promesa
  if (promesaInicializacion) return promesaInicializacion

  promesaInicializacion = (async () => {
    const contenidousuario = validarUsuario()
    const datosUsuario = contenidousuario[0]

    const logoEmpresa = datosUsuario.empresa.logo
    const logoBase64 = await cargarLogoBase64(logoEmpresa)

    datosPdf = {
      logoBase64,
      nombreEmpresa: datosUsuario.empresa.nombre,
      direccionEmpresa: datosUsuario.empresa.direccion,
      encargadoNombre: datosUsuario.nombre,
      cargo: datosUsuario.cargo,
      pais: datosUsuario.empresa.opais,
      estado: datosUsuario.empresa.oestado,
      ciudad: datosUsuario.empresa.ociudad,
      nit: datosUsuario.empresa.nit,
      telefono: datosUsuario.empresa.telefono,
      celular: datosUsuario.empresa.ocelular,
      email: datosUsuario.empresa.email,
      web: datosUsuario.empresa.ositioweb,
    }

    promesaInicializacion = null
    return datosPdf
  })()

  return promesaInicializacion
}

/**
 * Devuelve los datos del usuario para PDFs.
 * Si aún no se ha inicializado, lo hace automáticamente.
 * @returns {Promise<Object>}
 */
export async function getDatosUsuario() {
  return datosPdf ?? initPdfReportGenerator()
}

/**
 * Devuelve SOLO el base64 del logo (compatibilidad con `getLogoBase64`).
 * @returns {string}
 */
export function getLogoBase64() {
  return datosPdf?.logoBase64 ?? ''
}

/**
 * Permite invalidar la caché (útil si el usuario cambia de sesión).
 */
export function resetPdfReportGenerator() {
  datosPdf = null
  promesaInicializacion = null
}
