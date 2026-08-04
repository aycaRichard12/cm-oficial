import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import PQueue from 'p-queue'

// ─── Cola para API principal (1 petición a la vez) ───
const queue = new PQueue({ concurrency: 1 })

const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000, // tiempo máximo de espera de respuesta
})

// Cada petición pasa por la cola y además espera 200 ms antes de devolver la config
api.interceptors.request.use((config) => {
  return queue.add(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300)) // 200 ms de retardo
    return config
  })
})

// API secundaria con su propia cola y retardo
const apiCt = axios.create({
  baseURL: process.env.VITE_URL_APIC,
  timeout: 10000,
})

const queueCt = new PQueue({ concurrency: 1 })
apiCt.interceptors.request.use((config) => {
  return queueCt.add(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return config
  })
})

export default defineBoot(({ app }) => {
  // Exponer las instancias globalmente
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  app.config.globalProperties.$apiCt = apiCt

  // Interceptor de respuesta para la API principal
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Error en la API principal:', error.response?.data || error.message)
      if (error.response?.status === 401) {
        console.warn('No autorizado API principal')
      }
      return Promise.reject(error)
    },
  )

  // Interceptor de respuesta para la API secundaria
  apiCt.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Error en la API secundaria:', error.response?.data || error.message)
      if (error.response?.status === 401) {
        console.warn('No autorizado API secundaria')
      }
      return Promise.reject(error)
    },
  )
})

export { api, apiCt }
