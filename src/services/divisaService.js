// services/divisaService.js
import { api } from 'boot/axios'

export async function obtenerDivisaActiva(idempresa, token = '', tipoFactura = '') {
  const endpoint = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
  const response = await api.get(endpoint)
  const data = response.data?.data || response.data

  if (!Array.isArray(data)) {
    throw new Error('Formato de respuesta inválido')
  }

  const divisaActiva = data
    .filter((item) => Number(item.estado) === 1)
    .map((item) => ({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo,
      codigosin: item.monedasin?.codigo || null,
      simbolo: item.tipo || '$',
      valor: item.valor,
      locale: item.locale || 'es-CO',
      current: item.current || 'COP',
    }))[0]

  if (!divisaActiva) {
    throw new Error('No se encontró divisa activa')
  }

  console.log(divisaActiva)
  return divisaActiva
}
