import { defineStore } from 'pinia'
// 👇 LA LÍNEA MÁS IMPORTANTE A CAMBIAR
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const useDriverStore = defineStore('driver', {
  state: () => ({
    driver: new driver({}),
  }),
  actions: {
    startTour(steps) {
      if (steps && steps.length > 0) {
        this.driver.defineSteps(steps)
        this.driver.start()
      } else {
        console.warn('Driver.js: No se proporcionaron pasos para el tour.')
      }
    },
    resetTour() {
      this.driver.reset()
    },
  },
})
