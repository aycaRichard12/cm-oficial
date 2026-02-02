import { computed, ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

export function useCredencialesServicioForm() {
  const $q = useQuasar()
  const loading = ref(false)
  const loadingServices = ref(false)
  const idEmpresa = idempresa_md5()

  // Available services list
  const availableServices = ref([])

  // Form data structure
  const formData = ref({
    id: null,
    id_soft_externo: null,
    credenciales: {
      app_id: '',
      key: '',
      secret: '',
      cluster: '',
    },
  })

  // Validation rules
  const validationRules = {
    id_soft_externo: [(val) => !!val || 'Debe seleccionar un servicio'],
    app_id: [(val) => !!val || 'El App ID es obligatorio'],
    key: [(val) => !!val || 'La Key es obligatoria'],
    secret: [(val) => !!val || 'El Secret es obligatorio'],
    cluster: [(val) => !!val || 'El Cluster es obligatorio'],
  }

  // Check if form is in edit mode
  const isEditMode = computed(() => formData.value.id !== null)

  /**
   * Load available services from API
   */
  const loadServices = async () => {
    loadingServices.value = true
    try {
      const response = await api.get('services/listar')
      console.log('Servicios cargados:', response.data)

      // Filter only active services (estado can be string "1" or number 1)
      availableServices.value = response.data
        .filter((service) => service.estado == 1) // Use == to handle both string and number
        .map((service) => ({
          label: service.nombre,
          value: service.id, // Keep as string since API returns string IDs
          slug: service.slug,
          description: service.descripcion,
        }))
      
      console.log('Servicios activos disponibles:', availableServices.value)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar la lista de servicios',
        icon: 'report_problem',
        timeout: 3000,
      })
    } finally {
      loadingServices.value = false
    }
  }

  /**
   * Toggle credential status (1 = active, 2 = inactive)
   */
  const toggleStatus = async (credentialId, currentStatus) => {
    try {
      const newStatus = currentStatus == 1 ? 2 : 1
      const response = await api.get(
        `services/cambiarEstadoCredencialesServicio/${newStatus}/${credentialId}`
      )
      console.log('Estado actualizado:', response.data)

      $q.notify({
        type: 'positive',
        message: `Estado actualizado a ${newStatus == 1 ? 'Activo' : 'Inactivo'}`,
        icon: 'check_circle',
        timeout: 2000,
      })

      return { success: true, newStatus }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al actualizar el estado',
        icon: 'report_problem',
        timeout: 3000,
      })
      return { success: false }
    }
  }

  /**
   * Initialize form with data (for editing)
   */
  const initializeForm = (data = null) => {
    if (data) {
      formData.value = {
        id: data.id_empresa_soft || null,
        // Keep id_soft_externo as string to match with select options
        id_soft_externo: data.id_soft_externo ? String(data.id_soft_externo) : null,
        credenciales: {
          app_id: data.credenciales?.app_id || '',
          key: data.credenciales?.key || '',
          secret: data.credenciales?.secret || '',
          cluster: data.credenciales?.cluster || '',
        },
      }
      console.log('Formulario inicializado con:', formData.value)
    } else {
      resetForm()
    }
  }

  /**
   * Delete credential
   */
  const deleteCredential = async (credentialId) => {
    try {
      const response = await api.get(
        `services/eliminarCredencialesServicio/${credentialId}`
      )
      console.log('Credencial eliminada:', response.data)

      $q.notify({
        type: 'positive',
        message: 'Credencial eliminada exitosamente',
        icon: 'check_circle',
        timeout: 2000,
      })

      return { success: true }
    } catch (error) {
      console.error('Error al eliminar credencial:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar la credencial',
        icon: 'report_problem',
        timeout: 3000,
      })
      return { success: false }
    }
  }

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    formData.value = {
      id: null,
      id_soft_externo: null,
      credenciales: {
        app_id: '',
        key: '',
        secret: '',
        cluster: '',
      },
    }
  }

  /**
   * Build payload for API request
   */
  const buildPayload = () => {
    if (isEditMode.value) {
      // Payload for editing (now includes id_soft_externo)
      return {
        ver: 'editarCredencialesServicio',
        id: formData.value.id,
        id_soft_externo: formData.value.id_soft_externo, // Allow changing service
        credenciales: {
          app_id: formData.value.credenciales.app_id,
          key: formData.value.credenciales.key,
          secret: formData.value.credenciales.secret,
          cluster: formData.value.credenciales.cluster,
        },
      }
    } else {
      // Payload for registration
      return {
        ver: 'registrarCredencialesServicio',
        idmd5: idEmpresa,
        id_soft_externo: formData.value.id_soft_externo, // Already a string
        credenciales: {
          app_id: formData.value.credenciales.app_id,
          key: formData.value.credenciales.key,
          secret: formData.value.credenciales.secret,
          cluster: formData.value.credenciales.cluster,
        },
      }
    }
  }

  /**
   * Submit form data to API
   */
  const submitForm = async () => {
    loading.value = true
    try {
      const payload = buildPayload()
      console.log('Payload enviado:', payload)

      const response = await api.post('services/', payload)

      console.log('Respuesta del servidor:', response.data)

      $q.notify({
        type: 'positive',
        message: isEditMode.value
          ? 'Credenciales actualizadas exitosamente'
          : 'Credenciales registradas exitosamente',
        icon: 'check',
        timeout: 2000,
      })

      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al guardar credenciales:', error)

      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        'Error al guardar las credenciales'

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'report_problem',
        timeout: 3000,
      })

      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    formData,
    loading,
    loadingServices,
    availableServices,
    validationRules,
    isEditMode,
    loadServices,
    toggleStatus,
    deleteCredential,
    initializeForm,
    resetForm,
    submitForm,
  }
}
