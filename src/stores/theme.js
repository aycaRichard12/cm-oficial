import { defineStore } from 'pinia'
import { Dark } from 'quasar'
import { createThemeController } from 'src/utils/theme-controller'

let controller = null

const memoryStorage = {
  value: null,
  getItem() {
    return this.value
  },
  setItem(_key, value) {
    this.value = value
  },
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light',
    source: 'system',
    initialized: false,
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
  },

  actions: {
    init() {
      if (this.initialized) return

      const hasWindow = typeof window !== 'undefined'
      const media = hasWindow
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : { matches: false }
      const storage = hasWindow ? window.localStorage : memoryStorage

      controller = createThemeController({
        storage,
        media,
        eventTarget: hasWindow ? window : undefined,
        apply: (mode) => {
          Dark.set(mode === 'dark')
          this.mode = mode
        },
      })

      const state = controller.getState()
      this.mode = state.mode
      this.source = state.source
      this.initialized = true
    },

    toggle() {
      if (!controller) this.init()

      controller.setMode(this.mode === 'dark' ? 'light' : 'dark')

      const state = controller.getState()
      this.mode = state.mode
      this.source = state.source
    },
  },
})
