import { defineStore } from 'pinia'

export const useCajaStore = defineStore('caja', {
  state: () => ({
    isCajaAbierta: true, // Estado inicial: la caja está abierta
  }),
  actions: {
    setCajaAbierta(estado) {
      this.isCajaAbierta = estado
    },
    // Podrías añadir más acciones, como abrir la caja, obtener el total del sistema, etc.
    abrirCaja() {
      this.setCajaAbierta(true)
      // Aquí podrías llamar a una API para registrar la apertura
    },
    cerrarCaja() {
      this.setCajaAbierta(false)
      // El cierre se maneja en el componente principal, pero aquí podría haber una acción de registro.
    },
  },
})
