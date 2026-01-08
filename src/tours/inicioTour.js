export async function getGuia(ruta, nombreExport) {
  // Busca todos los archivos que coincidan con el patrón en la carpeta actual y subcarpetas
  const modules = import.meta.glob(['./Tour_*.js', './*/Tour_*.js','./*/*/Tour_*.js'])

  // Normalizamos el nombre del archivo buscado
  const archivoBuscado = `Tour_${ruta}.js`.toLowerCase()

  for (const path in modules) {
    // Si la ruta del archivo termina con el nombre que buscamos (ej: /tour_estadodeproducto.js)
    if (path.toLowerCase().endsWith(archivoBuscado)) {
      try {
        const modulo = await modules[path]()
        return modulo[`Tour_${nombreExport}`]
      } catch (error) {
        console.error(`Error al cargar el tour ${path}:`, error)
        return null
      }
    }
  }

  console.warn(`No se encontró el tour para: ${ruta}`)
  return null
}
