// src/composables/useDivisa.js
import { ref } from 'vue'
import { api } from 'boot/axios'

function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (!contenidousuario) {
    localStorage.clear()
    window.location.assign('../../app/')
    throw new Error('Sesión inválida') // Importante: lanzar error
  }
  return contenidousuario
}
const contenidousuario = validarUsuario()
const empresa = contenidousuario[0]?.empresa
const factura = contenidousuario[0]?.factura

export function useLeyenda() {
  const leyenda = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const cargarLeyendaActivo = async () => {
    loading.value = true
    error.value = null
    try {
      const endpoint = `listaLeyendaFactura/${empresa.idempresa}/${factura.access_token}/${factura.tipo}`
      const response = await api.get(endpoint)
      const data = response.data?.data || response.data
      console.log(data)
      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }

      const leyendaActiva = data
        .filter((item) => {
          return Number(item.estado) === 1
        })
        .map((item) => ({
          id: item.id,
          codigosin: item.leyendasin.codigo,
        }))[0]
      if (!leyendaActiva) {
        throw new Error('No se encontró divisa activa')
      }
      console.log(leyendaActiva)

      leyenda.value = leyendaActiva
    } catch (err) {
      error.value = err
      console.error('Error al cargar divisa:', err)

      // Valores por defecto
      leyenda.value = {
        id: null,

        codigosin: '',
      }

      // Opcional: redirigir si es error de autenticación
      if (err.message.includes('Sesión inválida')) {
        window.location.assign('../../app/')
      }
    }
  }
  return {
    leyenda,
    loading,
    error,
    cargarLeyendaActivo,
  }
}
