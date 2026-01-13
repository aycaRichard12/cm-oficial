
import { ref } from 'vue'

export function useGeolocalizacion() {
  const cargando = ref(false)
  const error = ref(null)

  const obtenerPosicion = () => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        error.value = 'Geolocalización no soportada por el navegador'
        reject(error.value)
        return
      }

      cargando.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          cargando.value = false
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => {
          cargando.value = false
          switch (err.code) {
            case err.PERMISSION_DENIED:
              error.value = 'Permiso denegado para obtener ubicación.'
              break
            case err.POSITION_UNAVAILABLE:
              error.value = 'Información de ubicación no disponible.'
              break
            case err.TIMEOUT:
              error.value = 'Tiempo de espera agotado.'
              break
            default:
              error.value = 'Error desconocido al obtener ubicación.'
          }
          reject(error.value)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  return {
    cargando,
    error,
    obtenerPosicion
  }
}
