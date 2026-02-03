import { defineStore } from 'pinia'
import { api } from 'boot/axios' // Usando el alias de axios de Quasar
import Pusher from 'pusher-js'

export const usePusherStore = defineStore('pusher', {
  state: () => ({
    pusher: null,
    channel: null,
    isLoaded: false,
  }),

  actions: {
    async cargarYConectar(idEmpresa, idUsuario) {
      console.log(idEmpresa)
      try {
        // 1. Llamada a tu API para obtener credenciales
        const point = `services/getCredencialesPusher/${idEmpresa}`
        console.log(point)
        const response = await api.get(point)
        console.log(response)
        // Asumiendo que tu API devuelve: { key: '...', cluster: '...' }
        const data = response.data
        if (data['estado'] == 'exito') {
          const { key, cluster } = data.credenciales

          // 2. Configurar Pusher
          this.pusher = new Pusher(key, {
            cluster: cluster,
            forceTLS: true,
          })

          // 3. Suscribirse al canal privado del usuario
          this.channel = this.pusher.subscribe(`user-channel-${idUsuario}`)

          this.isLoaded = true
          console.log('✅ Pusher conectado y canal suscrito')
        } else {
          console.error('Error al Obtener los credenciales')
        }
      } catch (error) {
        console.error('❌ Error cargando credenciales:', error)
      }
    },

    // Función para escuchar eventos dinámicamente
    escucharEvento(nombreEvento, callback) {
      if (this.channel) {
        this.channel.bind(nombreEvento, callback)
      }
    },
  },
})
