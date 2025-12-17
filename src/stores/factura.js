import { defineStore } from 'pinia'
import { validarUsuario } from 'src/composables/FuncionesGenerales'

export const useFacturaStore = defineStore('factura', {
  state: () => ({
    usuario: null,
  }),

  actions: {
    cargarUsuario() {
      this.usuario = validarUsuario()
    },

    obtenerEstadoFactura() {
      if (!this.usuario) this.cargarUsuario()

      const factura = this.usuario?.[0]?.factura
      console.log('Estado de la factura:', factura)
      if (!factura) return false

      return Object.values(factura).every((valor) => valor !== '')
    },
  },
})
