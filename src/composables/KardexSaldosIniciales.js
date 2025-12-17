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
  async getAllSaldos() {
    try {
      const response = await axios.get(API_BASE_URL)
      return response.data
    } catch (error) {
      console.error('Error al obtener los saldos:', error)
      throw new Error('No se pudo cargar la lista de saldos.')
    }
  },

  /**
   * Crea un nuevo registro de saldo.
   * @param {Object} saldoData - Los datos del nuevo saldo.
   * @returns {Promise<Object>} Una promesa que resuelve con el registro creado.
   */
  async createSaldo(saldoData) {
    try {
      // La API debe calcular costo_total.
      const response = await axios.post(API_BASE_URL, saldoData)
      return response.data
    } catch (error) {
      console.error('Error al crear el saldo:', error)
      // Lanzar un error con el mensaje de la API si es posible.
      const errorMessage = error.response?.data?.message || 'Error al guardar el nuevo saldo.'
      throw new Error(errorMessage)
    }
  },

  /**
   * Actualiza un registro de saldo existente.
   * @param {number} id_saldo - El ID del saldo a actualizar.
   * @param {Object} saldoData - Los nuevos datos del saldo.
   * @returns {Promise<Object>} Una promesa que resuelve con el registro actualizado.
   */
  //   async updateSaldo(id_saldo, saldoData) {
  //     try {
  //       // Se excluye id_saldo y costo_total, que no deben ser enviados.
  //       //const { id_saldo: id, costo_total, ...dataToSend } = saldoData

  //       const response = await axios.put(`${API_BASE_URL}/${id_saldo}`, dataToSend)
  //       return response.data
  //     } catch (error) {
  //       console.error(`Error al actualizar el saldo ${id_saldo}:`, error)
  //       const errorMessage = error.response?.data?.message || 'Error al actualizar el saldo.'
  //       throw new Error(errorMessage)
  //     }
  //   },

  /**
   * Elimina un registro de saldo por su ID.
   * @param {number} id_saldo - El ID del saldo a eliminar.
   * @returns {Promise<void>} Una promesa que resuelve al finalizar la eliminación.
   */
  async deleteSaldo(id_saldo) {
    try {
      await axios.delete(`${API_BASE_URL}/${id_saldo}`)
    } catch (error) {
      console.error(`Error al eliminar el saldo ${id_saldo}:`, error)
      const errorMessage = error.response?.data?.message || 'Error al eliminar el saldo.'
      throw new Error(errorMessage)
    }
  },
}

export default saldosService
