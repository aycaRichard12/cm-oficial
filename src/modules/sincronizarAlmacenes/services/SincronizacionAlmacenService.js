// src/modules/sincronizarAlmacenes/services/SincronizacionAlmacenService.js
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

/**
 * Servicio responsable de:
 *  - Listar almacenes del usuario autenticado.
 *  - Ejecutar la sincronización de kardex de un almacén específico.
 *
 * Endpoints backend:
 *  GET  /api/listarAlmacenesPorUsuario/{idempresa_md5}/{idusuario_md5}
 *  POST /api/sincronizarKardexAlmacen/{idAlmacen}   (fallback a GET si el backend responde 405)
 */
export class SincronizacionAlmacenService {
  async listarAlmacenes() {
    const idempresa = idempresa_md5()
    const idusuario = idusuario_md5()
    if (!idempresa || !idusuario) {
      throw new Error('Sesión inválida: no se encontró idempresa o idusuario en localStorage.')
    }

    const { data } = await api.get(`listarAlmacenesPorUsuario/${idempresa}/${idusuario}`)
    if (!data || data.estado !== 'exito') {
      throw new Error(data?.mensaje || 'No se pudo obtener el listado de almacenes.')
    }
    return Array.isArray(data.data) ? data.data : []
  }

  async sincronizar(idAlmacen) {
    if (idAlmacen == null || idAlmacen === '') {
      throw new Error('El parámetro idAlmacen es obligatorio.')
    }
    const path = `sincronizarKardexAlmacen/${idAlmacen}`

    try {



      const { data } = await api.get(path)
      return data
    } catch (error) {
      if (error?.response?.status === 405) {
        const { data } = await api.get(path)
        return data
      }
      throw error
    }
  }
}
