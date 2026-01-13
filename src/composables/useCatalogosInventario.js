
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { validarUsuario, normalizeText } from 'src/composables/FuncionesG'

export function useCatalogosInventario() {
  const almacenOptions = ref([])
  const clientesOptions = ref([])
  const filteredClientesOptions = ref([]) 
  const sucursalOptions = ref([])
  const filteredSucursalOptions = ref([]) 
  const productosOptions = ref([])
  const filteredProductosOptions = ref([])
  const loadingProductos = ref(false)

  async function listaAlmacenes() {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const idusuario = contenidousuario[0]?.idusuario

    if (!idempresa) {
      console.error('ID de empresa no disponible.')
      return
    }

    const endpoint = `listaResponsableAlmacen/${idempresa}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        almacenOptions.value = [{ label: 'Error al cargar almacenes', value: '' }]
      } else {
        let filteredAlmacenes = resultado
        if (idusuario) {
          filteredAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
        }
        almacenOptions.value = [
          { label: 'Seleccione un Almacén', value: '' },
          ...filteredAlmacenes.map((key) => ({ label: key.almacen, value: String(key.idalmacen) })),
        ]
      }
    } catch (error) {
      console.error('Error al obtener lista de almacenes:', error)
      almacenOptions.value = [{ label: 'Error de red', value: '' }]
    }
  }

  async function listaCliente() {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    if (!idempresa) {
      console.error('ID de empresa no disponible para lista de clientes.')
      return
    }

    const endpoint = `listaCliente/${idempresa}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        clientesOptions.value = []
      } else {
        clientesOptions.value = resultado.map((option) => ({
          label: `${option.codigo} - ${option.nombre} - ${option.nit}`,
          value: option.id,
          originalData: option,
        }))
        filteredClientesOptions.value = clientesOptions.value
      }
    } catch (error) {
      console.error('Error al obtener lista de clientes:', error)
      clientesOptions.value = []
    }
  }

  async function selectSucursal(idcliente) {
    if (!idcliente) {
      sucursalOptions.value = []
      filteredSucursalOptions.value = []
      return
    }
    const endpoint = `listaSucursal/${idcliente}`
    try {
      const response = await api.get(endpoint)
      const data = response.data
      if (data && data.length > 0) {
        sucursalOptions.value = data.map((option) => ({
          label: option.nombre,
          value: option.id,
          clientId: idcliente,
        }))
      } else {
        sucursalOptions.value = []
      }
      filteredSucursalOptions.value = sucursalOptions.value
    } catch (error) {
      console.error('Error al obtener sucursales:', error)
      sucursalOptions.value = []
    }
  }

  async function listaProductosDisponibles(almacenId, registroId) {
    if (!almacenId || !registroId) {
        // Fallback for cases where we rely on localStorage
        const datosMov = JSON.parse(localStorage.getItem('detalleInventario'))
        if (!datosMov || !datosMov.almacen || !datosMov.idregistro) {
            console.error('Datos de movimiento no disponibles para listar productos.')
            productosOptions.value = []
            filteredProductosOptions.value = []
            return
        }
        almacenId = datosMov.almacen
        registroId = datosMov.idregistro
    }

    loadingProductos.value = true
    const endpoint = `listaProductosInvExterno/${almacenId}/${registroId}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        productosOptions.value = []
      } else {
        productosOptions.value = resultado.map((option) => ({
          label: `${option.codigo} - ${option.descripcion}`,
          value: String(option.idproductoalmacen),
          idproductoalmacen: option.idproductoalmacen,
        }))
        filteredProductosOptions.value = productosOptions.value
      }
    } catch (error) {
      console.error('Error al obtener productos disponibles:', error)
      productosOptions.value = []
    } finally {
      loadingProductos.value = false
    }
  }
  
  function filterProductos(val, update) {
    if (val === '') {
      update(() => {
        filteredProductosOptions.value = productosOptions.value
      })
      return
    }
    update(() => {
      const needle = normalizeText(val).toLowerCase()
      filteredProductosOptions.value = productosOptions.value.filter(
        (v) => normalizeText(v.label).toLowerCase().indexOf(needle) > -1,
      )
    })
  }

  return {
    almacenOptions,
    clientesOptions,
    filteredClientesOptions,
    sucursalOptions,
    filteredSucursalOptions,
    productosOptions,
    filteredProductosOptions,
    loadingProductos,
    listaAlmacenes,
    listaCliente,
    selectSucursal,
    listaProductosDisponibles,
    filterProductos
  }
}
