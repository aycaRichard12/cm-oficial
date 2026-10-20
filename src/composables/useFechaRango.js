// src/composables/useFechaRango.js
import { ref, computed, watch } from 'vue'

/**
 * Convierte una fecha ISO (yyyy-mm-dd) o Date a formato dd/mm/yyyy.
 */
export function formatearFechaDDMMYYYY(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Convierte dd/mm/yyyy a ISO yyyy-mm-dd.
 */
export function parsearFechaDDMMYYYY(str) {
  if (!str || typeof str !== 'string') return null
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = String(m[1]).padStart(2, '0')
  const mm = String(m[2]).padStart(2, '0')
  return `${m[3]}-${mm}-${dd}`
}

/**
 * Composable de rango de fechas con validacion cruzada.
 */
export function useFechaRango({ initialStart = null, initialEnd = null } = {}) {
  const fechaInicial = ref(initialStart)
  const fechaFinal = ref(initialEnd)
  const errorInicial = ref('')
  const errorFinal = ref('')

  const validar = () => {
    errorInicial.value = ''
    errorFinal.value = ''
    if (!fechaInicial.value || !fechaFinal.value) return true
    const fi = new Date(fechaInicial.value).getTime()
    const ff = new Date(fechaFinal.value).getTime()
    if (isNaN(fi) || isNaN(ff)) return true
    if (fi > ff) {
      errorFinal.value = 'La fecha final no puede ser menor a la fecha inicial.'
      return false
    }
    if (ff < fi) {
      errorInicial.value = 'La fecha inicial no puede ser mayor a la fecha final.'
      return false
    }
    return true
  }

  const esRangoValido = computed(() => {
    if (!fechaInicial.value || !fechaFinal.value) return false
    const fi = new Date(fechaInicial.value).getTime()
    const ff = new Date(fechaFinal.value).getTime()
    if (isNaN(fi) || isNaN(ff)) return false
    return fi <= ff
  })

  watch(fechaInicial, (nv) => {
    if (!nv || !fechaFinal.value) { validar(); return }
    if (new Date(nv).getTime() > new Date(fechaFinal.value).getTime()) {
      fechaFinal.value = nv
    }
    validar()
  })

  watch(fechaFinal, (nv) => {
    if (!nv || !fechaInicial.value) { validar(); return }
    if (new Date(nv).getTime() < new Date(fechaInicial.value).getTime()) {
      fechaInicial.value = nv
    }
    validar()
  })

  return {
    fechaInicial,
    fechaFinal,
    errorInicial,
    errorFinal,
    esRangoValido,
    validar,
    formatearFechaDDMMYYYY,
    parsearFechaDDMMYYYY,
  }
}
