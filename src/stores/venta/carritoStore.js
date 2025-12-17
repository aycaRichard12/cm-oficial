import { defineStore } from 'pinia'
import { decimas, redondear } from 'src/composables/FuncionesGenerales'
import { useCurrencyStore } from '../currencyStore'

export const useCarritoStore = defineStore('carrito', {
  state: () => ({
    carrito: [],
    descuento: 0,
    listaProductosFactura: [],
  }),

  getters: {
    subTotal: (state) => state.carrito.reduce((sum, item) => sum + item.subtotal, 0),
    total: (state) => state.subTotal - state.descuento,
  },

  actions: {
    inicializarCarrito() {
      const carritoGuardado = localStorage.getItem('carrito')
      if (carritoGuardado) {
        const { listaProductos, descuento } = JSON.parse(carritoGuardado)
        this.carrito = listaProductos || []
        this.descuento = descuento || 0
      }
    },

    agregarProducto({ producto, cantidad, precioUnitario }) {
      const nuevoProducto = {
        idproductoalmacen: producto.originalData.idalmacen,
        cantidad,
        precio: precioUnitario,
        idstock: producto.originalData.idstock,
        idporcentaje: producto.originalData.idporcentaje,
        candiponible: producto.originalData.stock,
        descripcion: producto.originalData.descripcion,
        codigo: producto.originalData.codigo,
        id: producto.originalData.id,
        subtotal: precioUnitario * cantidad,
        datosAdicionales: producto.originalData.datosAdicionales,
      }

      this.carrito.push(nuevoProducto)
      this.guardarEnLocalStorage()
    },

    eliminarProducto(id) {
      this.carrito = this.carrito.filter((item) => item.id !== id)
      this.guardarEnLocalStorage()
    },

    actualizarDescuento(valor) {
      this.descuento = valor
      this.guardarEnLocalStorage()
    },

    guardarEnLocalStorage() {
      const currencyStore = useCurrencyStore()
      const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || {}

      const datos = {
        ...carritoGuardado,
        listaProductos: this.carrito,
        listaProductosFactura: this.generarListaFactura(),
        ventatotal: this.total,
        subtotal: this.subTotal,
        descuento: this.descuento,
        iddivisa: currencyStore.divisa.id,
      }

      localStorage.setItem('carrito', JSON.stringify(datos))
    },

    generarListaFactura() {
      return this.carrito.map((producto) => ({
        codigoProducto: producto.codigo,
        codigoActividadSin: producto.originalData.actividadsin,
        codigoProductoSin: producto.originalData.codigosin,
        descripcion: producto.descripcion,
        unidadMedida: producto.originalData.unidadsin,
        precioUnitario: producto.precio,
        subTotal: decimas(redondear(producto.cantidad * producto.precio)),
        cantidad: producto.cantidad,
        numeroSerie: '',
        montoDescuento: 0,
        numeroImei: '',
        codigoNandina: producto.originalData.codigonandina,
      }))
    },
  },
})
