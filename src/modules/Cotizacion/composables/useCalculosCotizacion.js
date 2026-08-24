// src/composables/useCalculosCotizacion.js
import { redondear } from 'src/composables/FuncionesG'

/**
 * Calcula el subtotal a partir de la lista de productos.
 * @param {Array} listaProductos
 * @returns {number} Subtotal redondeado.
 */
export function calcularSubtotal(listaProductos) {
  const subtotal = listaProductos.reduce((sub, producto) => {
    const precio = parseFloat(producto.precio)
    const cantidad = parseFloat(producto.cantidad)
    return sub + precio * cantidad
  }, 0)
  return redondear(subtotal)
}

/**
 * Calcula el total aplicando el descuento.
 * @param {number} subtotal
 * @param {number} descuento
 * @returns {{ subtotal: number, descuento: number, ventatotal: number }}
 */
export function calcularTotales(subtotal, descuento) {
  const descuentoAjustado = descuento > subtotal ? subtotal : descuento
  return {
    subtotal: redondear(subtotal),
    descuento: redondear(descuentoAjustado),
    ventatotal: redondear(subtotal - descuentoAjustado),
  }
}

/**
 * Valida y aplica un descuento sobre el subtotal.
 * @param {number} subtotal
 * @param {number} descuentoPropuesto
 * @returns {number} Descuento válido (entre 0 y subtotal).
 */
export function validarDescuento(subtotal, descuentoPropuesto) {
  if (descuentoPropuesto < 0) return 0
  if (descuentoPropuesto > subtotal) return subtotal
  return descuentoPropuesto
}
