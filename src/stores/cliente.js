import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'

export const useClienteStore = defineStore('cliente', {
  state: () => ({
    clientes: [],
    sucursales: [],
    clienteSeleccionado: null,
    sucursalSeleccionada: null,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    clienteActual: (state) => state.clienteSeleccionado,
    sucursalActual: (state) => state.sucursalSeleccionada,
    hasClientes: (state) => state.clientes.length > 0,
    hasSucursales: (state) => state.sucursales.length > 0,
    datosCompletos: (state) => state.clienteSeleccionado && state.sucursalSeleccionada,
  },

  actions: {
    async cargarClientes(forceRefresh = false) {
      try {
        // Verificar si ya tenemos datos y no forzar refresh
        if (this.clientes.length > 0 && !forceRefresh) return

        const contenidousuario = validarUsuario()
        const idempresa = contenidousuario[0]?.empresa?.idempresa

        if (!idempresa) {
          throw new Error('No se pudo obtener el ID de la empresa del usuario')
        }

        const { data } = await api.get(`listaCliente/${idempresa}`)

        this.clientes = data.map((cliente) => ({
          ...cliente,
          displayName: `${cliente.codigo} - ${cliente.nombre}`,
        }))

        this.error = null
        this.lastUpdated = new Date()
      } catch (error) {
        this.error = error
        console.error('Error en cargarClientes:', error)
        throw error
      }
    },

    async cargarSucursales(idcliente) {
      try {
        if (!idcliente) {
          throw new Error('ID de cliente no proporcionado')
        }

        // Limpiar selección actual de sucursal
        this.sucursalSeleccionada = null

        const { data } = await api.get(`listaSucursal/${idcliente}`)

        this.sucursales = data
        this.error = null

        // Si solo hay una sucursal, seleccionarla automáticamente
        if (data.length === 1) {
          this.sucursalSeleccionada = data[0]
        }

        return data
      } catch (error) {
        this.error = error
        console.error('Error en cargarSucursales:', error)
        throw error
      }
    },

    seleccionarCliente(cliente) {
      if (!cliente || !cliente.id) {
        throw new Error('Cliente inválido proporcionado')
      }

      this.clienteSeleccionado = cliente
      this.sucursalSeleccionada = null

      // Cargar sucursales automáticamente al seleccionar cliente
      return this.cargarSucursales(cliente.id)
    },

    seleccionarSucursal(sucursal) {
      if (!sucursal) {
        this.sucursalSeleccionada = null
        return
      }

      const encontrada = this.sucursales.find((s) => s.id === sucursal.id || s.id === sucursal)

      if (!encontrada) {
        throw new Error('La sucursal seleccionada no pertenece al cliente actual')
      }

      this.sucursalSeleccionada = encontrada
    },

    resetSeleccion() {
      this.clienteSeleccionado = null
      this.sucursalSeleccionada = null
      this.sucursales = []
    },

    async refreshData() {
      try {
        await this.cargarClientes(true)

        if (this.clienteSeleccionado) {
          await this.cargarSucursales(this.clienteSeleccionado.id)
        }
      } catch (error) {
        console.error('Error al refrescar datos:', error)
        throw error
      }
    },
  },

  // Persistencia del store (opcional)
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'clienteStore',
        storage: localStorage,
        paths: ['clienteSeleccionado', 'sucursalSeleccionada'],
      },
    ],
  },
})
