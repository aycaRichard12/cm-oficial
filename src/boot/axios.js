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
console.log(process.env.VITE_API_URL)
export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Error en la API:', error.response?.data || error.message)

      // Manejo de errores específicos
      if (error.response?.status === 401) {
        console.warn('No autorizado, redirigiendo a login...')
        // Aquí podrías redirigir a login o hacer logout
      }

      return Promise.reject(error)
    },
  )
})

export { api }
