import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { getGuia } from 'src/tours/inicioTour'

export const guiarInicio = async (ruta, nombreExport = 'default') => {
  try {
    console.log(`Ruta solicitada: ${ruta}, export: ${nombreExport}`)

    const posiblesSteps = await getGuia(ruta, nombreExport)

    if (!Array.isArray(posiblesSteps)) {
      console.warn('El módulo no devolvió un array de steps')
      return
    }

    const steps = posiblesSteps.filter((step) => document.querySelector(step.element))

    if (steps.length > 0) {
      const driverObj = driver({ showProgress: true }) // se instancia nuevo
      driverObj.setSteps(steps)
      driverObj.drive()
    } else {
      console.log('No hay elementos disponibles para el tour')
    }
  } catch (error) {
    console.error(`Error al cargar tour de ${ruta}:`, error)
  }
}
