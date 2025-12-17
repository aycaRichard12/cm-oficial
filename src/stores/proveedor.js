import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
export const useProveedorStore = defineStore('proveedor', {
  state: () => ({
    lista: [],
  }),
  actions: {
    async getProveedor() {
      try {
        const res = await api.get(`listaProveedor/${idempresa}`)
        this.lista = res.data.map((p) => ({
          nombre: p.nombre,
          telefono: p.telefono.replace(/\D/g, ''), // Limpio para WhatsApp
        }))
      } catch (error) {
        console.error('Error al cargar proveedores', error)
      }
    },
  },
})
