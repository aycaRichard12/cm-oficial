import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

export function usePermisosUsuario() {
  const permisoInventarioExterno = ref(false)
  const loadingPermisos = ref(false)
  const permisos = ref([])

  async function verificarPermisoUsuario() {
    loadingPermisos.value = true
    try {
      const IDMD5 = idempresa_md5()
      const idUsuarioMD5 = idusuario_md5()
      
      const { data: response } = await api.get(`listarOperaciones/${IDMD5}`)

      if (!response?.data || !Array.isArray(response.data)) {
        console.error('Respuesta inválida de permisos')
        return
      }

      // Guardamos todas las operaciones del usuario
      permisos.value = response.data.filter(
        item => item.idusuario === idUsuarioMD5 && item.estado === 1
      )

      // Flag para inventario externo
      permisoInventarioExterno.value = permisos.value.some(
        item => item.codigo === 'inventarioexterno'
      )

      // console.log('Permisos cargados:', permisos.value)
      // console.log('Permiso inventario externo:', permisoInventarioExterno.value)

    } catch (error) {
      console.error('Error al verificar permisos del usuario:', error)
      permisoInventarioExterno.value = false
    } finally {
      loadingPermisos.value = false
    }
  }

  return {
    permisoInventarioExterno,
    permisos,
    loadingPermisos,
    verificarPermisoUsuario
  }
}
