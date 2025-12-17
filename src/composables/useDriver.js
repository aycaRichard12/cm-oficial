import { ref } from 'vue'
import Driver from 'driver.js'

export const defineDriver = (options = {}) => {
  const driver = ref(null)

  const initDriver = () => {
    if (!driver.value) {
      driver.value = new Driver({
        className: 'quasar-driver',
        animate: true,
        opacity: 0.75,
        padding: 10,
        allowClose: true,
        doneBtnText: 'Finalizar',
        closeBtnText: 'Cerrar',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        ...options,
      })
    }
    return driver.value
  }

  const startTour = (steps) => {
    try {
      const driverInstance = initDriver()
      driverInstance.defineSteps(steps)
      driverInstance.start()
      return true
    } catch (error) {
      console.error('Error al iniciar tour:', error)
      return false
    }
  }

  return { driver, initDriver, startTour }
}
