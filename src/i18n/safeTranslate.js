// Traduccion defensiva para vue-i18n.
// vue-i18n compila los mensajes en runtime; si la compilacion falla, el error
// se propaga de forma sincrona al llamador de t() y puede abortar flujos de
// datos (por ejemplo la carga de lotes en extravioPage.vue).
// Este helper captura ese fallo y devuelve una version legible del mensaje.

const warnedKeys = new Set()

const LITERAL_INTERPOLATION_RE = /\{\s*'([^']*)'\s*\}/g
const NAMED_INTERPOLATION_RE = /\{(\w+)\}/g
const LINKED_MESSAGE_RE = /@(?:\.\w+)?:/g

function interpolate(raw, params) {
  if (!params || typeof params !== 'object') return raw
  return raw.replace(NAMED_INTERPOLATION_RE, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  )
}

function sanitizeRawMessage(raw) {
  return String(raw)
    .replace(LITERAL_INTERPOLATION_RE, '$1') // {'|'} -> |
    .replace(/\|/g, '·') // separador de plural -> separador visible
    .replace(LINKED_MESSAGE_RE, '') // @:clave / @.lower:clave -> sin prefijo
}

function resolveGlobal(i18n) {
  return i18n && i18n.global ? i18n.global : i18n
}

function resolveLocale(i18n) {
  const global = resolveGlobal(i18n)
  const locale = global && global.locale
  if (typeof locale === 'string') return locale
  if (locale && typeof locale.value === 'string') return locale.value
  return null
}

function resolveRawMessage(i18n, key) {
  try {
    const global = resolveGlobal(i18n)
    if (!global || typeof global.tm !== 'function') return null
    const raw = global.tm(key)
    if (typeof raw === 'string') return raw
    if (raw && typeof raw === 'object') {
      const locale = resolveLocale(i18n)
      if (locale && typeof raw[locale] === 'string') return raw[locale]
      const first = Object.values(raw).find((value) => typeof value === 'string')
      if (first) return first
    }
  } catch (error) {
    // tm() puede no estar disponible en builds runtime-only; se ignora.
  }
  return null
}

/**
 * Traduce de forma segura.
 * @param {object} i18n Instancia de vue-i18n (con .global) o composer.
 * @param {string} key Clave de traduccion.
 * @param {object} [params] Parametros de interpolacion.
 * @returns {string}
 */
export function safeTranslate(i18n, key, params) {
  if (!i18n) return key
  try {
    const global = resolveGlobal(i18n)
    return global.t(key, params)
  } catch (error) {
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key)
      console.warn(
        `[i18n] No se pudo compilar el mensaje "${key}". Se muestra sin formato.`,
        error && error.message ? error.message : error,
      )
    }
    const raw = resolveRawMessage(i18n, key)
    return raw ? interpolate(sanitizeRawMessage(raw), params) : key
  }
}

export function resetSafeTranslateWarnings() {
  warnedKeys.clear()
}

export default safeTranslate
