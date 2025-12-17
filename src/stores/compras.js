import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompraStore = defineStore('compra', () => {
  const compraPendiente = ref(null)

  function registrarCompra(compra) {
    compraPendiente.value = compra
  }

  function eliminarCompra() {
    compraPendiente.value = null
  }

  return { compraPendiente, registrarCompra, eliminarCompra }
})
