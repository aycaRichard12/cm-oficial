/**
 * Composable para debouncing de funciones
 * @param {Function} fn - Función a ejecutar después del delay
 * @param {number} delay - Milisegundos de espera (default 300)
 * @returns {Function} Función debounced
 */
export function useDebounce(fn, delay = 300) {
  let timeoutId = null

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debounced
}
