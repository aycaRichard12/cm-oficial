import { Platform } from 'quasar'
export function verificarTamanoPantallaYRedirigir(doc) {
  if (Platform.is.mobile || window.innerWidth < 768) {
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank')
    return null
  }
  return doc
}
