// src/modules/Cotizacion/composables/useCarrito.js
import { reactive, computed, watch } from 'vue'
import { redondear } from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesG'
export function useCarrito(options) {
  const $q = useQuasar()
  const {
    divisa,
    idempresa,
    tipoOperacion,
    permitirStock,
    selectedProduct,
    cantidadCO,
    precioCO,
    idproductoalmacenCO,
    idstockCO,
    idporcentajeCO,
    cantidaddisponibleCO,
    CodigosUnicosSeleccionados,
    listaProductosDisponibles,
    resetProductoInputs,
    carritoExistente, // <--- nuevo parámetro
  } = options

  // Estado del carrito
  const carritoCO =
    carritoExistente ||
    reactive({
      ventatotal: 0,
      subtotal: 0,
      descuento: 0,
      idalmacen: 0,
      divisa: divisa?.id || 0,
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

  // Computed: monto total de la venta
  const totalSaleAmount = computed(() => parseFloat(carritoCO.ventatotal) || 0)

  // Computed: si se puede agregar producto
  const canAddProduct = computed(() => {
    if (permitirStock.value && precioCO.value > 0 && Number(tipoOperacion.value?.value) === 1) {
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

  // ─── Métodos ──────────────────────────────────────────────────────────────
  async function anadirProductoACarrito() {
    if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
      $q.notify({
        type: 'info',
        message: 'Llene todos los campos para poder cargar productos.',
      })
      return false
    }

    if (Number(tipoOperacion.value?.value) === 1) {
      if (cantidadCO.value > cantidaddisponibleCO.value && !permitirStock.value) {
        $q.notify({ type: 'warning', message: 'La cantidad excede el stock disponible.' })
        return false
      }
    }

    const nuevoProducto = {
      num: carritoCO.listaProductos.length + 1,
      idproductoalmacen: idproductoalmacenCO.value,
      cantidad: cantidadCO.value,
      precio: precioCO.value,
      idstock: idstockCO.value,
      idporcentaje: idporcentajeCO.value,
      candiponible: cantidaddisponibleCO.value,
      descripcion: selectedProduct.value.descripcion,
      descripcionAdicional: '',
      codigo: selectedProduct.value.codigo,
      despachado:
        Number(selectedProduct.value.stock) == 0 ||
        Number(selectedProduct.value.stock) < Number(cantidadCO.value)
          ? 2
          : 1,
      codigosUnicos: [...CodigosUnicosSeleccionados.value],
    }
    const user = await validarUsuario()
    const userId = user[0]?.idusuario
    carritoCO.idusuario = userId
    carritoCO.idempresa = idempresa
    carritoCO.divisa = divisa?.id || 0
    carritoCO.listaProductos.push(nuevoProducto)
    carritoCO.codigosUnicos = [...carritoCO.codigosUnicos, ...CodigosUnicosSeleccionados.value]

    calcularTotalesCarrito()
    if (listaProductosDisponibles) await listaProductosDisponibles()
    resetProductoInputs()
    return true
  }

  function eliminarProductoCarrito(idProductoAlmacen) {
    carritoCO.listaProductos = carritoCO.listaProductos.filter(
      (p) => p.idproductoalmacen !== idProductoAlmacen,
    )
    calcularTotalesCarrito()
    if (listaProductosDisponibles) listaProductosDisponibles()
  }

  function calcularTotalesCarrito() {
    carritoCO.subtotal = carritoCO.listaProductos.reduce((sub, producto) => {
      const precio = parseFloat(producto.precio)
      const cantidad = parseFloat(producto.cantidad)
      return sub + precio * cantidad
    }, 0)

    if (carritoCO.subtotal === 0) carritoCO.descuento = 0
    carritoCO.ventatotal = carritoCO.subtotal - carritoCO.descuento

    carritoCO.subtotal = redondear(carritoCO.subtotal)
    carritoCO.ventatotal = redondear(carritoCO.ventatotal)
    carritoCO.descuento = redondear(carritoCO.descuento)
  }

  function aplicarDescuento() {
    if (carritoCO.descuento > carritoCO.subtotal) {
      $q.notify({
        type: 'warning',
        message: 'El descuento sobrepasa el subtotal.',
      })
      carritoCO.descuento = carritoCO.subtotal
    }
    calcularTotalesCarrito()
  }

  function resetCarrito() {
    carritoCO.ventatotal = 0
    carritoCO.subtotal = 0
    carritoCO.descuento = 0
    carritoCO.listaProductos = []
    carritoCO.metodoPago = 0
    carritoCO.variablePago = 'directo'
    carritoCO.pagosDivididos = [{ metodoPago: null, monto: 0, porcentaje: 0 }]
    carritoCO.credito = false
    carritoCO.cantidadPagos = 1
    carritoCO.montoPagos = 0
    carritoCO.periodo = 30
    carritoCO.plazoPersonalizado = 0
    carritoCO.fechaLimite = ''
    localStorage.removeItem('carritoCO')
  }

  const validarDescripcion = (scope, row) => {
    const producto = carritoCO.listaProductos.find(
      (p) => Number(p.idproductoalmacen) === Number(row.idproductoalmacen),
    )
    if (producto) {
      producto.descripcionAdicional = scope.value
      scope.set()
    }
  }

  // Persistencia en localStorage
  watch(
    carritoCO,
    (newVal) => {
      localStorage.setItem('carritoCO', JSON.stringify(newVal))
    },
    { deep: true },
  )

  return {
    carritoCO,
    totalSaleAmount,
    canAddProduct,
    anadirProductoACarrito,
    eliminarProductoCarrito,
    calcularTotalesCarrito,
    aplicarDescuento,
    resetCarrito,
    validarDescripcion,
  }
}
