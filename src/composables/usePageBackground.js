/**
 * usePageBackground
 * -----------------
 * Gestiona el estilo de fondo del area de contenido (<router-view>) en MainLayout.
 *
 * Reglas:
 *  - Si la ruta define `meta.showBackground === true`  -> SIEMPRE muestra el fondo.
 *  - Si la ruta define `meta.showBackground === false` -> NUNCA muestra el fondo.
 *  - Si no hay meta, se autodetecta: muestra el fondo SOLO cuando la pagina
 *    no tiene contenido visible (paginas vacias / placeholders).
 *
 * La deteccion de contenido se hace observando el DOM renderizado por el
 * <router-view> mediante un MutationObserver, por lo que funciona tambien con
 * contenido cargado de forma asincrona (API, tablas, etc.).
 */
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const CONTENT_SELECTOR =
  'input, textarea, select, button, img, table, canvas, video, iframe, [role="img"]'

function isSpinner(el) {
  if (!el || !el.classList) return false
  if (el.classList.contains('q-spinner')) return true
  try {
    return !!el.querySelector('.q-spinner')
  } catch {
    return false
  }
}

function elementHasContent(el) {
  if (!el || el.nodeType !== 1) return false
  // Texto visible
  if ((el.textContent || '').trim().length > 0) return true
  // Controles / media
  if (el.querySelector(CONTENT_SELECTOR)) return true
  // Hijos con dimensiones visibles (excluye spinners de carga)
  const children = Array.from(el.children || [])
  for (const child of children) {
    if (isSpinner(child)) continue
    if (child.offsetWidth > 0 || child.offsetHeight > 0) {
      if ((child.textContent || '').trim().length > 0) return true
      if (child.querySelector(CONTENT_SELECTOR)) return true
    }
  }
  return false
}

export function usePageBackground(routerViewRef) {
  const route = useRoute()
  const $q = useQuasar()
  const publicBase = import.meta.env.BASE_URL
  const hasContent = ref(false)

  let observer = null
  let debounceTimer = null
  let retryTimers = []

  const getRootEl = () => {
    const v = routerViewRef ? routerViewRef.value : null
    if (!v) return null
    if (v.$el && v.$el.nodeType === 1) return v.$el
    if (v.nodeType === 1) return v
    return null
  }

  const reevaluate = () => {
    hasContent.value = elementHasContent(getRootEl())
  }

  const scheduleReevaluate = (delay = 0) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(reevaluate, delay)
  }

  const detachObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  const attachObserver = () => {
    detachObserver()
    const el = getRootEl()
    if (!el) return
    observer = new MutationObserver(() => {
      const current = getRootEl()
      if (current !== el) {
        // El nodo raiz cambio: reenganchar al nuevo
        attachObserver()
      }
      scheduleReevaluate(50)
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true })
  }

  const clearRetryTimers = () => {
    retryTimers.forEach((t) => clearTimeout(t))
    retryTimers = []
  }

  const refresh = async () => {
    clearRetryTimers()
    await nextTick()
    await nextTick()
    reevaluate()
    attachObserver()
    retryTimers.push(
      setTimeout(() => {
        reevaluate()
        attachObserver()
      }, 250),
    )
    retryTimers.push(
      setTimeout(() => {
        reevaluate()
        attachObserver()
      }, 900),
    )
  }

  watch(() => route.fullPath, refresh, { immediate: true })

  onMounted(() => {
    refresh()
  })

  onBeforeUnmount(() => {
    detachObserver()
    if (debounceTimer) clearTimeout(debounceTimer)
    clearRetryTimers()
  })

  const shouldShowBackground = computed(() => {
    const meta = route.meta || {}
    if (meta.showBackground === true) return true
    if (meta.showBackground === false) return false
    return !hasContent.value
  })

  const pageBackgroundStyle = computed(() => {
    const baseStyle = {
      backgroundColor: 'var(--cm-bg)',
      overflowY: 'auto',
      height: '100%',
    }
    if (!shouldShowBackground.value) {
      return baseStyle
    }
    const isHome = route.path.replace('/', '') === ''
    const fileName = $q.dark.isActive && isHome ? 'fondodark.png' : 'fondo.png'
    return {
      ...baseStyle,
      backgroundImage: `url('${publicBase}${fileName}')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'min(60%, 900px)',
    }
  })

  return { pageBackgroundStyle, shouldShowBackground, hasContent }
}
