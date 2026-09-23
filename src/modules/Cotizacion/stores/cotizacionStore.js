// src/stores/cotizacionStore.js
import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  calcularSubtotal,
  calcularTotales,
  validarDescuento,
} from 'src/composables/useCalculosCotizacion'
import { usePago } from 'src/composables/usePago'

export const useCotizacionStore = defineStore('cotizacion', () => {
  const $q = useQuasar()

  const carrito = reactive({
    ventatotal: 0,
    subtotal: 0,
    descuento: 0,
    idalmacen: 0,
    divisa: 0,
    ipv: null,
    idusuario: 0,
    listaProductos: [],
    pagosDivididos: [{ metodoPago: null, monto: 0, porcentaje: 0 }],
    metodoPago: 0,
    variablePago: 'directo',
    fecha: '',
    credito: false,
    idfirma: null,
    codigosUnicos: [],
    cajabanco: null,
    cantidadPagos: 1,
    montoPagos: 0,
    periodo: 30,
    plazoPersonalizado: 0,
    fechaLimite: '',
  })

  // Estado de selección (se mantiene igual que en Phase 6)
  const selectedClient = ref(null)
  const idclienteCO = ref('')
  const selectedSucursal = ref(null)
  const idsucursalCOS = ref('')
  const filtroAlmacenCO = ref(null)
  const filtroCategoriaCO = ref(null)
  const puntoVenta = ref(null)

  const selectedProduct = ref(null)
  const cantidaddisponibleCO = ref('')
  const cantidadCO = ref(0)
  const precioCO = ref(0)
  const idstockCO = ref('')
  const idporcentajeCO = ref('')
  const idproductoalmacenCO = ref('')
  const CodigosUnicosSeleccionados = ref([])
  const tipoOperacion = ref(null)

  // Inicializar el composable de pagos con el carrito reactivo
  const pago = usePago(carrito)

  // Getters
  const canAddProduct = computed(() => {
    if (carrito.permitirStock && precioCO.value > 0 && Number(tipoOperacion.value?.value) === 1) {
      return true
    }
    if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
      return false
    }
    if (tipoOperacion.value?.value === 1) {
      return cantidadCO.value <= cantidaddisponibleCO.value
    }
    return true
  })

  // Acciones
  function calcularTotalesCarrito() {
    const subtotal = calcularSubtotal(carrito.listaProductos)
    const { ventatotal, descuento } = calcularTotales(subtotal, carrito.descuento)
    carrito.subtotal = subtotal
    carrito.descuento = descuento
    carrito.ventatotal = ventatotal
  }

  function aplicarDescuento() {
    const descuentoValido = validarDescuento(carrito.subtotal, carrito.descuento)
    if (descuentoValido !== carrito.descuento) {
      $q.notify({
        type: 'warning',
        message: 'El descuento sobrepasa el subtotal.',
      })
      carrito.descuento = descuentoValido
    }
    calcularTotalesCarrito()
  }

  async function anadirProductoACarrito() {
    // Lógica ya existente, se mantiene igual
  }

  function eliminarProductoCarrito(idProductoAlmacen) {
    carrito.listaProductos = carrito.listaProductos.filter(
      (p) => p.idproductoalmacen !== idProductoAlmacen,
    )
    calcularTotalesCarrito()
  }

  function resetCarrito() {
    carrito.ventatotal = 0
    carrito.subtotal = 0
    carrito.descuento = 0
    carrito.listaProductos = []
    carrito.metodoPago = null
    carrito.variablePago = 'directo'
    carrito.pagosDivididos = [{ metodoPago: null, monto: 0, porcentaje: 0 }]
    carrito.credito = false
    carrito.cantidadPagos = 1
    carrito.montoPagos = 0
    carrito.periodo = 30
    carrito.plazoPersonalizado = 0
    carrito.fechaLimite = ''
  }

  function resetProductoInputs() {
    selectedProduct.value = null
    cantidaddisponibleCO.value = ''
    cantidadCO.value = 1
    precioCO.value = 1
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
    CodigosUnicosSeleccionados.value = []
  }

  return {
    // State
    carrito,
    selectedClient,
    idclienteCO,
    selectedSucursal,
    idsucursalCOS,
    filtroAlmacenCO,
    filtroCategoriaCO,
    puntoVenta,
    selectedProduct,
    cantidaddisponibleCO,
    cantidadCO,
    precioCO,
    idstockCO,
    idporcentajeCO,
    idproductoalmacenCO,
    CodigosUnicosSeleccionados,
    // Getters
    canAddProduct,
    // Actions
    calcularTotalesCarrito,
    aplicarDescuento,
    anadirProductoACarrito,
    eliminarProductoCarrito,
    resetCarrito,
    resetProductoInputs,
    // Pagos
    ...pago,
  }
})
