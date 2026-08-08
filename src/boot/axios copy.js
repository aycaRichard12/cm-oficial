// import { defineBoot } from '#q-app/wrappers'
// import axios from 'axios'
// import axiosRetry from 'axios-retry'
// import PQueue from 'p-queue'

// // ─── Cola para API principal (1 petición a la vez) ───
// const queue = new PQueue({ concurrency: 1 })

// const api = axios.create({
//   baseURL: process.env.VITE_API_URL,
//   timeout: 10000,
// })

// axiosRetry(api, {
//   retries: 2,
//   retryDelay: (retryCount) => retryCount * 1000,
//   retryCondition: (error) =>
//     axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500,
// })

// api.interceptors.request.use((config) => {
//   return queue.add(async () => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     return config
//   })
// })

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('Error en la API principal:', error.response?.data || error.message)
//     if (error.response?.status === 401) {
//       console.warn('No autorizado API principal')
//     }
//     return Promise.reject(error)
//   },
// )

// // ─── API secundaria (VITE_URL_APIC) ───
// const apiCt = axios.create({
//   baseURL: process.env.VITE_URL_APIC,
//   timeout: 10000,
// })

// const queueCt = new PQueue({ concurrency: 1 })

// axiosRetry(apiCt, {
//   retries: 2,
//   retryDelay: (retryCount) => retryCount * 1000,
//   retryCondition: (error) =>
//     axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500,
// })

// apiCt.interceptors.request.use((config) => {
//   return queueCt.add(async () => {
//     await new Promise((resolve) => setTimeout(resolve, 200))
//     return config
//   })
// })

// apiCt.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('Error en la API secundaria:', error.response?.data || error.message)
//     if (error.response?.status === 401) {
//       console.warn('No autorizado API secundaria')
//     }
//     return Promise.reject(error)
//   },
// )

// // ─── Tercera API (VITE_URL_APIP) ───
// const apiP = axios.create({
//   baseURL: process.env.VITE_URL_APIP,
//   timeout: 10000,
// })

// const queueP = new PQueue({ concurrency: 1 })

// axiosRetry(apiP, {
//   retries: 2,
//   retryDelay: (retryCount) => retryCount * 1000,
//   retryCondition: (error) =>
//     axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500,
// })

// apiP.interceptors.request.use((config) => {
//   return queueP.add(async () => {
//     await new Promise((resolve) => setTimeout(resolve, 200))
//     return config
//   })
// })

// apiP.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('Error en la API terciaria:', error.response?.data || error.message)
//     if (error.response?.status === 401) {
//       console.warn('No autorizado API terciaria')
//     }
//     return Promise.reject(error)
//   },
// )

// export default defineBoot(({ app }) => {
//   // Exponer las instancias globalmente
//   app.config.globalProperties.$axios = axios
//   app.config.globalProperties.$api = api
//   app.config.globalProperties.$apiCt = apiCt
//   app.config.globalProperties.$apiP = apiP
// })

//export { api, apiCt, apiP }
