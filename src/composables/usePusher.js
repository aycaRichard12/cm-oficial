export function usePusher() {
  const initPusher = async (userIdMd5) => {
    try {
      // Cargamos la librería solo cuando se llama a la función
      const { default: Pusher } = await import('pusher-js')

      const pusher = new Pusher('0bc643ef8d66124dac64', {
        cluster: 'sa1',
        authEndpoint: process.env.VITE_API_URL,
        auth: {
          params: { user_id: userIdMd5, ver: 'authPusher' },
        },
      })

      // usePusher.js
      const channel = pusher.subscribe(`private-user-${userIdMd5}`)

      // 1. Confirmar que la suscripción fue aceptada por el backend
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Conectado legalmente al canal privado')
      })

      // 2. Escuchar el evento que enviarás desde PHP
      channel.bind('nueva-notificacion', (data) => {
        console.log('🔔 ¡Llegó una notificación!', data)
        // Aquí disparas el $q.notify de Quasar
      })
      console.log('Pusher conectado dinámicamente')
    } catch (error) {
      console.error('Error cargando Pusher:', error)
    }
  }

  return { initPusher }
}
