// src/modules/pdf/utils/rowUtils.js
import { decimas } from 'src/composables/FuncionesG'

export function crearFilaTotalGeneral(label, columnasTotales, colSpan = 6) {
  const fila = [
    {
      content: label,
      colSpan,
      styles: {
        halign: 'right',
        fontStyle: 'bold',
        lineWidth: { top: 0.3, bottom: 0.3 },
        lineColor: [0, 0, 0],
      },
    },
  ]

  columnasTotales.forEach((col) => {
    fila.push({
      content: decimas(col.valor),
      styles: {
        halign: col.halign || 'center',
        fontStyle: 'bold',
        lineWidth: { top: 0.3, bottom: 0.3 },
        lineColor: [0, 0, 0],
      },
    })
  })

  return fila
}
