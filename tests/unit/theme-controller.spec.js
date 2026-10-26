import { describe, it, expect, vi } from 'vitest'
import { createThemeController } from '../../src/utils/theme-controller.js'

function createStorage(initial = {}, { failWrite = false } = {}) {
  const data = { ...initial }
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      if (failWrite) throw new Error('quota')
      data[key] = value
    },
    data,
  }
}

function createMedia(matches) {
  const listeners = []
  const media = {
    matches,
    addEventListener: (event, handler) => listeners.push(handler),
    removeEventListener: (_event, handler) => {
      const index = listeners.indexOf(handler)
      if (index >= 0) listeners.splice(index, 1)
    },
    emit: (value) => {
      media.matches = value
      listeners.forEach((handler) => handler({ matches: value }))
    },
    listenerCount: () => listeners.length,
  }
  return media
}

function createEventTarget() {
  const listeners = []
  return {
    addEventListener: (event, handler) => listeners.push(handler),
    removeEventListener: (_event, handler) => {
      const index = listeners.indexOf(handler)
      if (index >= 0) listeners.splice(index, 1)
    },
    emit: (event) => listeners.forEach((handler) => handler(event)),
    listenerCount: () => listeners.length,
  }
}

describe('createThemeController', () => {
  it('applies the stored manual choice on init', () => {
    const apply = vi.fn()
    const controller = createThemeController({
      storage: createStorage({ 'mistersofts-cm-theme': 'dark' }),
      media: createMedia(false),
      apply,
    })

    expect(controller.getState()).toEqual({ mode: 'dark', source: 'manual' })
    expect(apply).toHaveBeenCalledWith('dark', 'manual')
  })

  it('follows the system when nothing is stored', () => {
    const apply = vi.fn()
    const controller = createThemeController({
      storage: createStorage(),
      media: createMedia(true),
      apply,
    })

    expect(controller.getState()).toEqual({ mode: 'dark', source: 'system' })
    expect(apply).toHaveBeenCalledWith('dark', 'system')
  })

  it('persists and applies an explicit mode', () => {
    const storage = createStorage()
    const apply = vi.fn()
    const controller = createThemeController({
      storage,
      media: createMedia(false),
      apply,
    })

    controller.setMode('dark')

    expect(storage.data['mistersofts-cm-theme']).toBe('dark')
    expect(controller.getState()).toEqual({ mode: 'dark', source: 'manual' })
    expect(apply).toHaveBeenLastCalledWith('dark', 'manual')
  })

  it('keeps working when storage rejects the write', () => {
    const apply = vi.fn()
    const controller = createThemeController({
      storage: createStorage({}, { failWrite: true }),
      media: createMedia(false),
      apply,
    })

    expect(() => controller.setMode('dark')).not.toThrow()
    expect(controller.getState()).toEqual({ mode: 'dark', source: 'manual' })
    expect(apply).toHaveBeenLastCalledWith('dark', 'manual')
  })

  it('follows live system changes only while the source is system', () => {
    const media = createMedia(false)
    const apply = vi.fn()
    const controller = createThemeController({
      storage: createStorage(),
      media,
      apply,
    })

    media.emit(true)
    expect(controller.getState()).toEqual({ mode: 'dark', source: 'system' })
    expect(apply).toHaveBeenLastCalledWith('dark', 'system')

    controller.setMode('light')
    media.emit(true)
    expect(controller.getState()).toEqual({ mode: 'light', source: 'manual' })
  })

  it('re-applies when another tab changes the stored preference', () => {
    const storage = createStorage({ 'mistersofts-cm-theme': 'light' })
    const eventTarget = createEventTarget()
    const apply = vi.fn()
    const controller = createThemeController({
      storage,
      media: createMedia(false),
      apply,
      eventTarget,
    })

    storage.data['mistersofts-cm-theme'] = 'dark'
    eventTarget.emit({ key: 'mistersofts-cm-theme' })

    expect(controller.getState()).toEqual({ mode: 'dark', source: 'manual' })
    expect(apply).toHaveBeenLastCalledWith('dark', 'manual')
  })

  it('removes its listeners on destroy', () => {
    const media = createMedia(false)
    const eventTarget = createEventTarget()
    const controller = createThemeController({
      storage: createStorage(),
      media,
      apply: vi.fn(),
      eventTarget,
    })

    expect(media.listenerCount()).toBe(1)
    expect(eventTarget.listenerCount()).toBe(1)

    controller.destroy()

    expect(media.listenerCount()).toBe(0)
    expect(eventTarget.listenerCount()).toBe(0)
  })
})
