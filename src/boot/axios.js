import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// baseURL: 'https://vivasoft.link/app/cm/api/', https://mistersofts.com/app/
//baseURL: 'https://www.mistersofts.com/app/cmv1/api/',
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
})

const apiCt = axios.create({
  baseURL: process.env.VITE_URL_APIC,
  timeout: 10000,
})
export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api // API principal
  app.config.globalProperties.$apiCt = apiCt // API secundaria

  // Interceptors API principal
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

  // Interceptors API secundaria
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
