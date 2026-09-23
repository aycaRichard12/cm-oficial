// src/modules/Cotizacion/composables/usePago.js
import { ref, computed } from 'vue'

export function usePago(carritoCO) {
  const metodosPagos = ref([])
  const idcajaBancoSeleccionada = ref(null)
  const periodOptions = [
    { label: 'Personalizado', value: 0 },
    { label: '15 días', value: 15 },
    { label: '30 días', value: 30 },
    { label: '60 días', value: 60 },
    { label: '90 días', value: 90 },
  ]

  const totalSaleAmount = computed(() => parseFloat(carritoCO.ventatotal) || 0)
  const totalPaidAmount = computed(() => {
    if (carritoCO.variablePago === 'dividido') {
      return carritoCO.pagosDivididos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
    }
    return 0
  })
  const remainingAmount = computed(() => totalSaleAmount.value - totalPaidAmount.value)

  // ─── Cálculos de crédito ──────────────────────────────────────────────────
  const calculatePayments = () => {
    if (carritoCO.credito && carritoCO.cantidadPagos > 0 && totalSaleAmount.value > 0) {
      carritoCO.montoPagos = (totalSaleAmount.value / carritoCO.cantidadPagos).toFixed(2)
    } else {
      carritoCO.montoPagos = 0
    }
  }

  const calculateDueDate = () => {
    if (!carritoCO.credito || !carritoCO.fecha) return
    const fecha = new Date(carritoCO.fecha)
    let daysToAdd = 0
    const selectedPeriod = Number(carritoCO.periodo)
    if (selectedPeriod === 0) {
      daysToAdd = Number(carritoCO.plazoPersonalizado) || 0
    } else if (selectedPeriod > 0) {
      daysToAdd = selectedPeriod * carritoCO.cantidadPagos
    }
    if (daysToAdd > 0) {
      fecha.setDate(fecha.getDate() + daysToAdd)
      carritoCO.fechaLimite = fecha.toISOString().slice(0, 10)
    } else {
      carritoCO.fechaLimite = ''
    }
  }

  // ─── Pago dividido ────────────────────────────────────────────────────────
  const calculateRemainingAmount = (index) => {
    const payment = carritoCO.pagosDivididos[index]
    const monto = parseFloat(payment.monto) || 0
    if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
      payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
    } else {
      payment.porcentaje = 0
    }
  }

  const calculateAmountFromPercentage = (index) => {
    const payment = carritoCO.pagosDivididos[index]
    const percentage = parseFloat(payment.porcentaje) || 0
    if (percentage >= 0 && percentage <= 100 && totalSaleAmount.value > 0) {
      payment.monto = (totalSaleAmount.value * (percentage / 100)).toFixed(2)
    } else {
      payment.monto = 0
    }
  }

  const addPaymentMethod = () => {
    carritoCO.pagosDivididos.push({ metodoPago: null, monto: 0, porcentaje: 0 })
  }

  const removePaymentMethod = (index) => {
    if (carritoCO.pagosDivididos.length > 1) {
      carritoCO.pagosDivididos.splice(index, 1)
    }
  }

  const handleTipoPagoGeneralChange = (val) => {
    if (val) {
      calculatePayments()
      calculateDueDate()
    }
  }

  return {
    metodosPagos,
    idcajaBancoSeleccionada,
    periodOptions,
    totalSaleAmount,
    totalPaidAmount,
    remainingAmount,
    calculatePayments,
    calculateDueDate,
    calculateRemainingAmount,
    calculateAmountFromPercentage,
    addPaymentMethod,
    removePaymentMethod,
    handleTipoPagoGeneralChange,
  }
}
