import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { idusuario_md5, idempresa_md5 } from './FuncionesGenerales'

export const useOperacionesPermitidas = defineStore('permitidos', {
  // ===============================
  // STATE
  // ===============================
  state: () => ({
    operacionesPermitidas: [],
    cargado: false,
  }),

  // ===============================
  // GETTERS
  // ===============================
  getters: {
    /**
     * Verifica si una operación está permitida
     * @param {String} codigo
     */
    tienePermiso: (state) => {
      return (codigo) => state.operacionesPermitidas.some((op) => op.codigo === codigo)
    },

    /**
     * Devuelve todas las operaciones permitidas
     */
    todas: (state) => state.operacionesPermitidas,
  },

  // ===============================
  // ACTIONS
  // ===============================
  actions: {
    async cargarPermisos() {
      try {
        const idusuario = idusuario_md5()
        const idempresa = idempresa_md5()

        const response = await api.get(`listarOperaciones/${idempresa}`)
        console.log('Respuesta de listarOperaciones:', response)
        const data = response.data
        this.operacionesPermitidas = data.data.filter(
          (item) => item.idusuario === idusuario && item.estado === 1,
        )

        this.cargado = true
      } catch (error) {
        console.error('Error al cargar permisos:', error)
        this.operacionesPermitidas = []
        this.cargado = false
      }
    },
  },
})
