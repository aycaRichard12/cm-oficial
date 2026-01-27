import { ref } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario, getToken, getTipoFactura } from '../FuncionesG'
import { Notify } from 'quasar'

/**
 * Composable para manejar la selección y carga de productos
 * Principio de Responsabilidad Única: Solo maneja productos
 */
export function useProductoSelector() {
  const productosOptions = ref([])
  const loadingProductos = ref(false)
  const todosProductos = ref([])

  const filterProductos = async (val, update) => {
    loadingProductos.value = true
    try {
      if (val === '') {
        update(() => {
          productosOptions.value = Array.isArray(todosProductos.value) ? todosProductos.value : []
        })
      } else {
        const needle = val.toLowerCase()
        update(() => {
          const source = Array.isArray(todosProductos.value) ? todosProductos.value : []
          productosOptions.value = source.filter(
            (v) =>
              (v.nombreProducto || '').toLowerCase().includes(needle) ||
              (v.codigoProducto || '').toLowerCase().includes(needle),
          )
        })
      }
    } finally {
      loadingProductos.value = false
    }
  }

  const cargarProductos = async () => {
    loadingProductos.value = true
    try {
      const user = validarUsuario()
      const idEmpresa = user?.[0]?.empresa?.idempresa
      //opcionales
      const token = getToken()
      const tipo = getTipoFactura()

      if (!idEmpresa ) {
        console.warn('Faltan datos para cargar productos', { idEmpresa })
        return
      }

      const endpoint = `listaProducto/${idEmpresa}/${token}/${tipo}`
      const response = await api.get(endpoint)
      const data = response.data
      console.log('productos nuevos', data)

      if (Array.isArray(data)) {
        todosProductos.value = data.map((obj, index) => ({
          ...obj,
          idProducto: obj.idProducto || obj.id || obj.idproducto,
          nombreProducto: obj.nombre + ' - ' + obj.codigo +' - '+ obj.descripcion,
          numero: index + 1,
        }))
        productosOptions.value = todosProductos.value
      } else {
        console.warn('Respuesta de productos no es array:', data)
        todosProductos.value = []
        productosOptions.value = []
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
      todosProductos.value = []
      productosOptions.value = []

      Notify.create({
        type: 'negative',
        message: 'No se pudieron cargar los productos',
      })
    } finally {
      loadingProductos.value = false
    }
  }

  return {
    productosOptions,
    loadingProductos,
    todosProductos,
    filterProductos,
    cargarProductos,
  }
}
