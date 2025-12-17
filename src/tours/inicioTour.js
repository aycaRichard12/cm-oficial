export async function getGuia(ruta, nombreExport) {
  const modulo = await import(`./Tour_${ruta}.js`)
  const name = `Tour_${nombreExport}`
  return modulo[name]
}
