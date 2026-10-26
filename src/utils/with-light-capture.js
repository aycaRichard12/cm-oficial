export const LIGHT_CAPTURE_CLASS = 'cm-light-capture'

export async function withLightCapture(element, capture) {
  const target = element && element.classList ? element : null
  if (target) target.classList.add(LIGHT_CAPTURE_CLASS)

  try {
    return await capture()
  } finally {
    if (target) target.classList.remove(LIGHT_CAPTURE_CLASS)
  }
}
