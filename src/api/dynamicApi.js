import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const createApiService = (endpoint) => {
  const $q = useQuasar()

  // Función específica para autorización
  const toggleAutorizacion = async (id, currentValue) => {
    try {
      const newValue = currentValue === '1' ? '0' : '1'
      const response = await api.put(`/${endpoint}/${id}/autorizacion`, {
        autorizacion: newValue,
      })

      $q.notify({
        type: 'positive',
        message: `Autorización ${newValue === '1' ? 'activada' : 'desactivada'}`,
      })

      return response.data
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al actualizar autorización',
      })
      throw error
    }
  }

  return {
    // Métodos CRUD estándar
    getAll: async (params = {}) => {
      const response = await api.get(`/${endpoint}`, { params })
      return response.data
    },

    getById: async (id) => {
      const response = await api.get(`/${endpoint}/${id}`)
      return response.data
    },

    create: async (data) => {
      const response = await api.post(`/${endpoint}`, data)
      return response.data
    },

    update: async (id, data) => {
      const response = await api.put(`/${endpoint}/${id}`, data)
      return response.data
    },

    delete: async (id) => {
      const response = await api.delete(`/${endpoint}/${id}`)
      return response.data
    },

    // Métodos especializados
    toggleAutorizacion, // Exponemos la función específica

    customRequest: async (config) => {
      const response = await api(config)
      return response.data
    },

    getCustom: async (path, params = {}) => {
      const response = await api.get(`${endpoint}/${path}`, { params })
      return response.data
    },
  }
}

export default createApiService
