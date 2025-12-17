let driverInstance = null

export default async ({ app }) => {
  const initializeDriver = async () => {
    if (!driverInstance) {
      try {
        // Intento 1: Carga normal
        const Driver = (await import('driver.js')).default
        await import('driver.js/dist/driver.css')
        driverInstance = new Driver({
          className: 'quasar-driver-tour',
          animate: true,
          opacity: 0.75,
        })
      } catch (e) {
        console.warn('No se pudo cargar Driver.js normalmente:', e)

        // Intento 2: Carga desde CDN
        try {
          await loadDriverFromCDN()
          const Driver = window.Driver
          driverInstance = new Driver({
            className: 'quasar-driver-tour',
            animate: true,
            opacity: 0.75,
          })
        } catch (cdnError) {
          console.error('Falló la carga desde CDN:', cdnError)
          driverInstance = { startTour: () => {} }
        }
      }
    }
    return driverInstance
  }

  const startTour = async (steps) => {
    const driver = await initializeDriver()
    if (driver && driver.defineSteps) {
      driver.defineSteps(steps)
      driver.start()
      return true
    }
    return false
  }

  // Provee el servicio
  app.provide('driver', { startTour })
  app.config.globalProperties.$driver = { startTour }
}

async function loadDriverFromCDN() {
  return new Promise((resolve, reject) => {
    if (window.Driver) return resolve()

    // Cargar CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/driver.js@0.9.8/dist/driver.min.css'

    // Cargar JS
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/driver.js@0.9.8/dist/driver.min.js'
    script.onload = resolve
    script.onerror = reject

    document.head.appendChild(link)
    document.head.appendChild(script)
  })
}
