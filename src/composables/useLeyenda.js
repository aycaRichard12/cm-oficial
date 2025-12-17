import { ref } from 'vue'
import { api } from 'boot/axios'
import { getToken } from './FuncionesG'
import { getTipoFactura } from './FuncionesG'
import { idempresa_md5 } from './FuncionesGenerales'
const idempresa = idempresa_md5()
const tipoFactura = getTipoFactura()
const token = getToken()

export function useLeyenda() {
  const leyenda = ref(null)
  const loading = ref(false)
  const error = ref(null)

  try {
    if (!idempresa || !tipoFactura || !token) {
      throw new Error('Datos incompletos para cargar leyenda')
    }
  } catch (err) {
    error.value = err
    console.error('Error de validación de usuario o datos faltantes:', err.message)
    leyenda.value = {
      id: null,
      codigosin: '',
    }
    return {
      leyenda,
      loading,
      error,
      cargarLeyendaActivo: async () => {}, // función vacía en caso de error inmediato
    }
  }

  const cargarLeyendaActivo = async () => {
    loading.value = true
    error.value = null

    try {
      const endpoint = `listaLeyendaFactura/${idempresa}/${token}/${tipoFactura}`
      console.log('Consultando endpoint:', endpoint)

      const response = await api.get(endpoint)
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : []

      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }

      console.log('Respuesta de leyenda:', data)

      const leyendaActiva = data
        .filter((item) => Number(item.estado) === 1)
        .map((item) => ({
          id: item.id,
          codigosin: item.leyendasin.codigo,
        }))[0]

      if (!leyendaActiva) {
        throw new Error('No se encontró leyenda activa')
      }

      leyenda.value = leyendaActiva
      console.log('Leyenda activa cargada:', leyendaActiva)
    } catch (err) {
      error.value = err
      console.error('Error al cargar leyenda:', err.message)

      leyenda.value = {
        id: null,
        codigosin: '',
      }

      if (err.message.includes('Sesión inválida')) {
        window.location.assign('../../app/')
      }
    } finally {
      loading.value = false
    }
  }

  return {
    leyenda,
    loading,
    error,
    cargarLeyendaActivo,
  }
}
