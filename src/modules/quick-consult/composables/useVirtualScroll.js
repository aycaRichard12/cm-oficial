/**
 * Configuración base para QVirtualScroll
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Configuración para QVirtualScroll
 */
export function useVirtualScroll(options = {}) {
  const {
    itemHeight = 56, // altura estimada por fila (píxeles)
    buffer = 5, // número extra de items fuera del viewport
  } = options

  return {
    virtualScrollItemSize: itemHeight,
    virtualScrollSliceSize: buffer,
    virtualScrollSliceOffset: buffer,
  }
}
