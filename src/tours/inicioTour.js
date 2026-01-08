export async function getGuia(ruta, nombreExport) {
  const paths = [`./Tour_${ruta}.js`, `./administracion/Tour_${ruta}.js`]

  let modulo = null

  for (const path of paths) {
    try {
      modulo = await import(/* @vite-ignore */ path)
      if (modulo) break
    } catch {
      // Continue to next path
    }
  }

  if (!modulo) {
    console.warn(`No se encontró el tour para ${ruta} en ninguna de las rutas esperadas.`)
    return null
  }

  const name = `Tour_${nombreExport}`
  return modulo[name]
}
