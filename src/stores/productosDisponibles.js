import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesG'

export const useProductosDisponibleAlmacen = defineStore('productos-disponibles-almacen', () => {
  const $q = useQuasar()
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function listaProductos(idalmacen) {
    loading.value = true
    error.value = null

    try {
      const contenidousuario = validarUsuario()

      if (!contenidousuario || contenidousuario.length === 0) {
        error.value = 'Contenido de usuario no encontrado'
        $q.notify({
          type: 'negative',
          message: 'No se pudo validar la información del usuario',
        })
        return
      }

      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const idusuario = contenidousuario[0]?.idusuario

      if (!idempresa || !idusuario) {
        error.value = 'Falta idempresa o idusuario en el contenido de usuario'
        $q.notify({
          type: 'negative',
          message: 'Información incompleta del usuario',
        })
        return
      }

      const endpoint = `listaProductoAlmacen/${idempresa}`
      const response = await api.get(endpoint)
      console.log(response)
      if (!response.data) {
        error.value = 'La respuesta del servidor no contiene datos'
        $q.notify({
          type: 'negative',
          message: 'Error en la respuesta del servidor',
        })
        return
      }

      const resultado = response.data

      if (Array.isArray(resultado) && resultado[0] === 'error') {
        error.value = resultado.error || 'Error desconocido desde la API'
        $q.notify({
          type: 'negative',
          message: `Error al cargar productos: ${error.value}`,
        })
        return
      }

      if (Array.isArray(resultado)) {
        const res = resultado.filter((u) => u.idalmacen == idalmacen)
        console.log(res)
        productos.value = res.map((u) => {
          return {
            value: u.id,
            label: u.codigo + ' - ' + u.descripcion,
          }
        })
      } else {
        error.value = 'Formato de datos inesperado'
        $q.notify({
          type: 'negative',
          message: 'Los datos recibidos no tienen el formato esperado',
        })
      }
    } catch (err) {
      error.value = err.message || 'Error al obtener productos'
      console.error('Error al obtener productos:', err)
      $q.notify({
        type: 'negative',
        message: 'No se pudo conectar con el servidor',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    listaProductos,
  }
})
