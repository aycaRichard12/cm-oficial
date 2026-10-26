import { describe, it, expect, vi } from 'vitest'
import { withLightCapture } from '../../src/utils/with-light-capture.js'

function createElement() {
  const classes = new Set()
  return {
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
  }
}

describe('withLightCapture', () => {
  it('adds the light class during capture and removes it afterwards', async () => {
    const element = createElement()
    const capture = vi.fn(async () => {
      expect(element.classList.contains('cm-light-capture')).toBe(true)
    })

    await withLightCapture(element, capture)

    expect(capture).toHaveBeenCalledTimes(1)
    expect(element.classList.contains('cm-light-capture')).toBe(false)
  })

  it('removes the class even when the capture rejects', async () => {
    const element = createElement()

    await expect(
      withLightCapture(element, async () => {
        throw new Error('pdf failed')
      }),
    ).rejects.toThrow('pdf failed')

    expect(element.classList.contains('cm-light-capture')).toBe(false)
  })

  it('tolerates a missing element', async () => {
    await expect(withLightCapture(null, async () => 'ok')).resolves.toBe('ok')
  })
})
