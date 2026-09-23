// stores/carritoStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoCtzStore = defineStore('carrito', () => {
  // Estado
  const ventatotal = ref(0)
  const subtotal = ref(0)
  const descuento = ref(0)
  const listaProductos = ref([])
  const pagosDivididos = ref([{ metodoPago: null, monto: 0, porcentaje: 0 }])
  const metodoPago = ref(0)
  const variablePago = ref('directo')
  const credito = ref(false)
  const cantidadPagos = ref(1)
  const montoPagos = ref(0)
  const periodo = ref(30)
  const plazoPersonalizado = ref(0)
  const fechaLimite = ref('')
  const fecha = ref(new Date().toISOString().slice(0, 10))
  const cajabanco = ref(null)
  const idalmacen = ref(0)
  const divisa = ref(0)
  const ipv = ref(0)
  const idusuario = ref(0)
  const idfirma = ref(0)
  const codigosUnicos = ref([])

  // Getters
  const totalSaleAmount = computed(() => ventatotal.value)

  // Acciones
  function calcularPagos() {
    if (credito.value && cantidadPagos.value > 0 && totalSaleAmount.value > 0) {
      montoPagos.value = totalSaleAmount.value / cantidadPagos.value
    }
  }

  function actualizarDesdeLocalStorage() {
    const stored = localStorage.getItem('carritoCO')
    if (stored) {
      const data = JSON.parse(stored)
      ventatotal.value = data.ventatotal ?? 0
      subtotal.value = data.subtotal ?? 0
      descuento.value = data.descuento ?? 0
      listaProductos.value = data.listaProductos ?? []
      pagosDivididos.value = data.pagosDivididos ?? [{ metodoPago: null, monto: 0, porcentaje: 0 }]
      metodoPago.value = data.metodoPago ?? 0
      variablePago.value = data.variablePago ?? 'directo'
      credito.value = data.credito ?? false
      cantidadPagos.value = data.cantidadPagos ?? 1
      montoPagos.value = data.montoPagos ?? 0
      periodo.value = data.periodo ?? 30
      plazoPersonalizado.value = data.plazoPersonalizado ?? 0
      fechaLimite.value = data.fechaLimite ?? ''
      fecha.value = data.fecha ?? new Date().toISOString().slice(0, 10)
      cajabanco.value = data.cajabanco ?? null
      idalmacen.value = data.idalmacen ?? 0
      divisa.value = data.divisa ?? 0
      ipv.value = data.ipv ?? 0
      idusuario.value = data.idusuario ?? 0
      idfirma.value = data.idfirma ?? 0
      codigosUnicos.value = data.codigosUnicos ?? []
    }
  }

  function persistirEnLocalStorage() {
    const toStore = {
      ventatotal: ventatotal.value,
      subtotal: subtotal.value,
      descuento: descuento.value,
      listaProductos: listaProductos.value,
      pagosDivididos: pagosDivididos.value,
      metodoPago: metodoPago.value,
      variablePago: variablePago.value,
      credito: credito.value,
      cantidadPagos: cantidadPagos.value,
      montoPagos: montoPagos.value,
      periodo: periodo.value,
      plazoPersonalizado: plazoPersonalizado.value,
      fechaLimite: fechaLimite.value,
      fecha: fecha.value,
      cajabanco: cajabanco.value,
      idalmacen: idalmacen.value,
      divisa: divisa.value,
      ipv: ipv.value,
      idusuario: idusuario.value,
      idfirma: idfirma.value,
      codigosUnicos: codigosUnicos.value,
    }
    localStorage.setItem('carritoCO', JSON.stringify(toStore))
  }

  return {
    ventatotal,
    subtotal,
    descuento,
    listaProductos,
    pagosDivididos,
    metodoPago,
    variablePago,
    credito,
    cantidadPagos,
    montoPagos,
    periodo,
    plazoPersonalizado,
    fechaLimite,
    fecha,
    cajabanco,
    idalmacen,
    divisa,
    ipv,
    idusuario,
    idfirma,
    codigosUnicos,
    totalSaleAmount,
    calcularPagos,
    actualizarDesdeLocalStorage,
    persistirEnLocalStorage,
  }
})
