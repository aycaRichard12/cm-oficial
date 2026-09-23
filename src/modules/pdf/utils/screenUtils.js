import { Platform } from 'quasar'

export function verificarTamanoPantallaYRedirigir(doc) {
  const esMovil = Platform.is.mobile || window.innerWidth < 768
  const blobUrl = doc.output('bloburl')
  if (esMovil) {
    // Crear URL del PDF como blob

    // Intentar abrir en nueva pestaña
    const nuevaVentana = window.open(blobUrl, '_blank')

    // Si el pop‑up fue bloqueado, forzar descarga
    if (!nuevaVentana) {
      const enlace = document.createElement('a')
      enlace.href = blobUrl
      enlace.download = 'comprobante.pdf'
      document.body.appendChild(enlace)
      enlace.click()
      document.body.removeChild(enlace)
    }

    // Devolver la URL para que el componente pueda mostrar un enlace manual
    return blobUrl
  }

  // Escritorio: no hacer nada especial
  return null
}
