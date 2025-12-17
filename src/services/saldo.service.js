// services/saldosService.js
import axios from 'axios'
// URL base de la API. Asume que tu API está en este endpoint.
// ¡Asegúrate de cambiar esto por la URL real de tu backend!
const API_BASE_URL = process.env.VITE_API_URL

/**
 * Servicio para interactuar con la API de Saldos Iniciales por Método.
 */
const saldosService = {
  /**
   * Obtiene todos los registros de saldos iniciales.
   * @returns {Promise<Array<Object>>} Una promesa que resuelve con la lista de saldos.
   */
  async getAllSaldos(idProducto) {
    try {
      const response = await axios.get(`${API_BASE_URL}/listarSaldos/${idProducto}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener los saldos:', error)
      throw new Error('No se pudo cargar la lista de saldos.')
    }
  },

  /**
   * Actualiza un registro de saldo existente.
   * @param {number} id_saldo - El ID del saldo a actualizar.
   * @param {Object} saldoData - Los nuevos datos del saldo.
   * @returns {Promise<Object>} Una promesa que resuelve con el registro actualizado.
   */
  async updateSaldo(saldoData) {
    try {
      console.log(saldoData)
      // Se excluye id_saldo y costo_total, que no deben ser enviados.

      const response = await axios.post(`${API_BASE_URL}`, saldoData)
      console.log(response)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar el saldo :`, error)
    }
  },

  /**
   * Elimina un registro de saldo por su ID.
   * @param {number} id_saldo - El ID del saldo a eliminar.
   * @returns {Promise<void>} Una promesa que resuelve al finalizar la eliminación.
   */
  async deleteSaldo(id_saldo) {
    try {
      console.log(id_saldo)
      const response = await axios.get(`${API_BASE_URL}/eliminarSaldo/${id_saldo}`)
      console.log(response)
    } catch (error) {
      console.error(`Error al eliminar el saldo ${id_saldo}:`, error)
    }
  },
}

export default saldosService
