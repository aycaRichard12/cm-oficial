// src/modules/Cotizacion/composables/useProducto.js
import { ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { normalizeText, validarUsuario } from 'src/composables/FuncionesG'
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'

export function useProducto(options) {
  // const $q = useQuasar()
  const { idempresa, filtroCategoriaCO, carritoCO } = options
  if (!filtroCategoriaCO) throw new Error('filtroCategoriaCO es requerido en useProducto')

  const esProductoUnico = ref(false)
  const registrarComoProductoUnico = ref(true)
  const CodigosUnicosSeleccionados = ref([])
  const { config } = useProductoConfig(idempresa)

  watch(
    () => config.value.idempresa,
    (val) => {
      if (val) esProductoUnico.value = Boolean(config.value.productounico)
    },
    { deep: true },
  )

  const productosDisponibles = ref([])
  const filteredProducts = ref([])
  const selectedProduct = ref(null)
  const cantidaddisponibleCO = ref('')
  const cantidadCO = ref(0)
  const precioCO = ref(0)
  const idstockCO = ref('')
  const idporcentajeCO = ref('')
  const idproductoalmacenCO = ref('')

  // ─── Cargar productos ─────────────────────────────────────────────────────
  async function listaProductosDisponibles() {
    const user = await validarUsuario()
    const idempresa = user[0]?.empresa?.idempresa
    if (!idempresa || !filtroCategoriaCO.value) {
      productosDisponibles.value = []
      filteredProducts.value = []
      return
    }

    // Limpiar resultados anteriores (del almacén previo) antes de la llamada
    productosDisponibles.value = []
    filteredProducts.value = []

    try {
      const response = await api.get(`listaProductosDisponiblesVenta/${idempresa}`)
      const data = response.data

      // La API puede devolver un array ['error', ...] o un objeto { datos: [...] }
      const isErrorArray = Array.isArray(data) && data[0] === 'error'
      const isErrorObj = data && data.estado === 'error'
      if (isErrorArray || isErrorObj) {
        console.error(isErrorArray ? data[1] : data.error)
        return
      }

      const rawList = Array.isArray(data) ? data : (data.datos ?? [])

      let use = rawList.filter(
        (u) => Number(u.idporcentaje) === Number(filtroCategoriaCO.value),
      )

      if (carritoCO.listaProductos.length > 0) {
        use = use.filter(
          (u) => !carritoCO.listaProductos.some((cp) => cp.idproductoalmacen === u.id),
        )
      }

      productosDisponibles.value = use.map((p) => ({
        ...p,
        display: `${p.codigo} - ${p.descripcion}`,
      }))
      filteredProducts.value = productosDisponibles.value
    } catch (error) {
      console.error('Error cargando productos:', error)
      productosDisponibles.value = []
      filteredProducts.value = []
    }
  }

  // ─── Filtros para QSelect ────────────────────────────────────────────────
  function filterProduct(val, update) {
    update(() => {
      const needle = normalizeText(val).toLowerCase()
      filteredProducts.value = productosDisponibles.value.filter((v) =>
        normalizeText(v.display).toLowerCase().includes(needle),
      )
    })
  }

  function setProductInputValue(val) {
    // Solo anular la selección si el texto no coincide con ningún producto
    // Y no hay ningún producto ya elegido (idproductoalmacenCO vacío).
    // Si hay producto seleccionado y Quasar limpia el input al cerrar el
    // dropdown, NO debemos perder la selección.
    if (idproductoalmacenCO.value) return
    if (!productosDisponibles.value.some((p) => p.display === val)) {
      selectedProduct.value = null
    }
  }

  function elegirUnProducto(product) {
    if (product) {
      selectedProduct.value = product          // ← persiste la referencia completa
      cantidaddisponibleCO.value = product.stock
      precioCO.value = product.precio
      idstockCO.value = product.idstock
      idporcentajeCO.value = product.idporcentaje
      idproductoalmacenCO.value = product.id
      cantidadCO.value = 1
    } else {
      resetProductoInputs()
    }
  }

  function resetProductoInputs() {
    selectedProduct.value = null
    cantidaddisponibleCO.value = ''
    cantidadCO.value = 1
    precioCO.value = 1
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
  }

  function guardarCodigosEnVenta(codigos) {
    CodigosUnicosSeleccionados.value = codigos
    cantidadCO.value = codigos.length
  }

  return {
    esProductoUnico,
    registrarComoProductoUnico,
    CodigosUnicosSeleccionados,
    productosDisponibles,
    filteredProducts,
    selectedProduct,
    cantidaddisponibleCO,
    cantidadCO,
    precioCO,
    idstockCO,
    idporcentajeCO,
    idproductoalmacenCO,
    listaProductosDisponibles,
    filterProduct,
    setProductInputValue,
    elegirUnProducto,
    resetProductoInputs,
    guardarCodigosEnVenta,
  }
}
