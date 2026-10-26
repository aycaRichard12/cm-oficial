// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggle from '../../src/components/ThemeToggle.vue'
import { useThemeStore } from '../../src/stores/theme.js'

describe('ThemeToggle accessibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const QBtnStub = {
    inheritAttrs: false,
    emits: ['click'],
    template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
  }

  function mountToggle() {
    return mount(ThemeToggle, {
      global: {
        stubs: {
          'q-btn': QBtnStub,
          'q-tooltip': true,
        },
      },
    })
  }

  it('exposes an accessible name that describes the next action', () => {
    const store = useThemeStore()
    store.mode = 'light'
    const wrapper = mountToggle()
    const button = wrapper.get('button')

    expect(button.attributes('aria-label')).toBe('Cambiar a modo oscuro')
    expect(button.attributes('aria-pressed')).toBe('false')
  })

  it('announces the pressed state in dark mode', () => {
    const store = useThemeStore()
    store.mode = 'dark'
    const wrapper = mountToggle()
    const button = wrapper.get('button')

    expect(button.attributes('aria-label')).toBe('Cambiar a modo claro')
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('delegates the click to the store', async () => {
    const store = useThemeStore()
    store.mode = 'light'
    store.toggle = vi.fn()
    const wrapper = mountToggle()

    await wrapper.get('button').trigger('click')

    expect(store.toggle).toHaveBeenCalledTimes(1)
  })
})
