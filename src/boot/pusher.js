import { boot } from 'quasar/wrappers'
import Pusher from 'pusher-js'

// Creamos una instancia que podremos usar en cualquier componente
let pusherInstance = null

export default boot(({ app }) => {
  // Función para conectar Pusher cuando tengas las credenciales de la empresa
  const initPusher = (apiKey, cluster) => {
    if (pusherInstance) pusherInstance.disconnect()

    pusherInstance = new Pusher(apiKey, {
      cluster: cluster,
      forceTLS: true,
    })

    return pusherInstance
  }

  // Hacemos que la función sea accesible vía this.$initPusher en Vue 2
  // o mediante provide/inject en Vue 3
  app.config.globalProperties.$initPusher = initPusher
  app.provide('pusherProvider', initPusher)
})
