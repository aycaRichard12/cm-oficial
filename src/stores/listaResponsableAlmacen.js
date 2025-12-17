import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

// ... (mismo import y setup)

export const useAlmacenStore = defineStore('almacen', () => {
  const $q = useQuasar()
  const almacenesResponsable = ref([]) // Resultado del Endpoint 1
  const almacenes = ref([]) // Resultado del Endpoint 2
  // ... (otros refs si son necesarios)

  async function listaAlmacenes() {
    try {
      const idempresa = idempresa_md5()
      const idusuario = idusuario_md5()

      if (!idempresa || !idusuario) {
        console.error('Datos de usuario insuficientes.')
        return
      }

      const endpoint1 = `/listaResponsableAlmacenReportes/${idempresa}`
      const endpoint2 = `/listaResponsableAlmacen/${idempresa}` // Endpoint hipotético 2

      // ⚠️ Ejecutamos ambas promesas simultáneamente
      const [response1, response2] = await Promise.all([api.get(endpoint1), api.get(endpoint2)])

      // --- Procesar Respuesta 1 (Almacenes Responsable) ---
      const resultado1 = response1.data
      if (Array.isArray(resultado1)) {
        const userAlmacenes = resultado1.filter((u) => u.idusuario == idusuario)
        almacenes.value = userAlmacenes
      } else {
        console.error('Error en Respuesta 1:', resultado1)
      }

      // --- Procesar Respuesta 2 (Todos los Almacenes) ---
      const resultado2 = response2.data
      if (Array.isArray(resultado2)) {
        const userAlmacenes = resultado2.filter((u) => u.idusuario == idusuario)
        almacenesResponsable.value = userAlmacenes
      } else {
        console.error('Error en Respuesta 2:', resultado2)
      }
      console.log(almacenes.value)
      console.log(almacenesResponsable.value)
    } catch (error) {
      console.error('Error en carga de almacenes consolidada:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar una o ambas listas de almacenes.',
      })
    }
  }

  return {
    almacenesResponsable,
    almacenes,
    listaAlmacenes,
  }
})
