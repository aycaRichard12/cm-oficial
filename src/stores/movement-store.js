import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
// src/stores/movement-store.js

export const useMovementStore = defineStore('movement', {
  state: () => ({
    originStores: [],
    destinationStores: [], // Agregamos aquí para centralizar
    isLoadingOriginStores: false,
    isLoadingDestinationStores: false,
    errorOriginStores: null,
    errorDestinationStores: null,
  }),

  actions: {
    async fetchOriginStores() {
      this.isLoadingOriginStores = true
      this.errorOriginStores = null

      const idempresa = idempresa_md5()
      const idusuario = idusuario_md5()

      if (!idempresa || !idusuario) {
        console.warn(
          'idempresa o idusuario no definido. Saltando llamada API para almacenes de origen.',
        )
        this.isLoadingOriginStores = false
        this.errorOriginStores = new Error('ID de empresa o usuario faltante.')
        return
      }

      try {
        const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
        const StoresAsignados = response.data.filter((u) => u.idusuario === idusuario)

        // console.log('id del usuario', idusuario)
        // console.log(
        //   'id del usuario',
        //   response.data.filter((u) => u.idusuario),
        // )
        // console.log('Almacenes asignados al usuario:', StoresAsignados)
        this.originStores = StoresAsignados.map((item) => ({
          label: item.almacen,
          value: item.idalmacen,
        }))
      } catch (error) {
        console.error('Error al cargar almacenes de origen en el store:', error)
        this.errorOriginStores = error
        throw error
      } finally {
        this.isLoadingOriginStores = false
      }
    },

    async fetchDestinationStores() {
      this.isLoadingDestinationStores = true
      this.errorDestinationStores = null

      const idempresa = idempresa_md5()
      // No necesitamos idusuario para almacenes de destino generalmente
      if (!idempresa) {
        console.warn('idempresa no definida. Saltando llamada API para almacenes de destino.')
        this.isLoadingDestinationStores = false
        this.errorDestinationStores = new Error('ID de empresa faltante.')
        return
      }

      try {
        const response = await api.get(`listaAlmacen/${idempresa}`)
        console.log('Response data (listaAlmacen):', response.data)

        // Filtramos por estado y excluimos los que ya están en originStores
        console.log('Current originStores in Pinia:', this.originStores)
        const almacenesOrigenValues = new Set(this.originStores.map((s) => s.value))
        console.log('Set of origin store values (for exclusion):', almacenesOrigenValues)

        // Corrected filter callback && !almacenesOrigenValues.has(u.id),
        const StoresActives = response.data.filter((u) => Number(u.estado) == 1)
        console.log('Filtered active destination stores:', StoresActives)

        this.destinationStores = StoresActives.map((item) => ({
          label: item.nombre, // Assuming 'nombre' is the display name
          value: item.id, // Assuming 'id' is the unique identifier
        }))
      } catch (error) {
        console.error('Error al cargar almacenes de destino en el store:', error)
        this.errorDestinationStores = error
        throw error // Re-throw to allow component to catch and notify
      } finally {
        this.isLoadingDestinationStores = false
      }
    },
  },
})
