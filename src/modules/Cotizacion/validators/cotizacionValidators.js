// src/validators/cotizacionValidators.js

import { required, positive, requiredPositive } from './commonValidators'

// Reglas generales de cotización
export const tipoOperacionRules = required('Campo requerido')
export const fechaRules = required('Campo requerido')
export const clienteRules = required('Campo requerido')
export const sucursalRules = required('Campo requerido')
export const canalVentaRules = required('Seleccione un canal')
export const almacenRules = required('Campo requerido')
export const categoriaRules = required('Campo requerido')
export const puntoVentaRules = required('Campo requerido')

// Reglas de producto
export const cantidadRules = positive('Debe ser mayor a 0')
export const precioRules = positive('Debe ser mayor a 0')

// Reglas de método de pago
export const metodoPagoRules = required('Seleccione un método de pago')
export const paymentMetodoPagoRules = required('Requerido')
export const paymentMontoRules = required('Requerido')
export const paymentPorcentajeRules = required('Requerido')

// Reglas de crédito
export const cantidadPagosRules = requiredPositive('Requerido')
export const plazoPersonalizadoRules = required('Requerido')
