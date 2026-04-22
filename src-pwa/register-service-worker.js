import { register } from 'register-service-worker'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (/* registration */) {
    // console.log('New content is available; please refresh.')
    import('quasar').then(({ Notify }) => {
      Notify.create({
        color: 'primary',
        icon: 'cloud_download',
        message: 'Hay una nueva versión disponible.',
        timeout: 0,
        multiLine: true,
        actions: [
          { label: 'Actualizar', color: 'yellow', handler: () => { window.location.reload() } },
          { label: 'Descartar', color: 'white', handler: () => {} }
        ]
      })
    })
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
    import('quasar').then(({ Notify }) => {
      Notify.create({
        color: 'negative',
        icon: 'wifi_off',
        message: 'No hay conexión a internet. La aplicación está en modo offline.'
      })
    })
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
