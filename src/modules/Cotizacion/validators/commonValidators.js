// src/validators/commonValidators.js

/**
 * Validador de campo requerido.
 * @param {string} message - Mensaje de error.
 * @returns {Array<Function>} Regla Quasar.
 */
export const required = (message = 'Campo requerido') => [(val) => !!val || message]

/**
 * Validador de número positivo mayor a 0.
 * @param {string} message - Mensaje de error.
 * @returns {Array<Function>} Regla Quasar.
 */
export const positive = (message = 'Debe ser mayor a 0') => [(val) => Number(val) > 0 || message]

/**
 * Validador de campo requerido y número positivo.
 * @param {string} message - Mensaje de error.
 * @returns {Array<Function>} Regla Quasar.
 */
export const requiredPositive = (message = 'Requerido') => [
  (val) => (!!val && Number(val) > 0) || message,
]
