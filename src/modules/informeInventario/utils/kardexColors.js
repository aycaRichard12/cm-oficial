// src/modules/informeInventario/utils/kardexColors.js

export const KARDEX_COLORS = Object.freeze({
  saldoInicial: {
    hex: '#FFEB9C',
    hexBody: '#FFF9C4',
    rgb: [255, 235, 156],
    rgbBody: [255, 249, 196],
    cssClass: 'kdx-saldo-inicial',
  },
  entradas: {
    hex: '#FFCC80',
    hexBody: '#FFE0B2',
    rgb: [255, 204, 128],
    rgbBody: [255, 224, 178],
    cssClass: 'kdx-entradas',
  },
  salidas: {
    hex: '#C8E6C9',
    hexBody: '#E8F5E9',
    rgb: [200, 230, 201],
    rgbBody: [232, 245, 233],
    cssClass: 'kdx-salidas',
  },
  saldoFinal: {
    hex: '#B3E5FC',
    hexBody: '#E1F5FE',
    rgb: [179, 229, 252],
    rgbBody: [225, 245, 254],
    cssClass: 'kdx-saldo-final',
  },
  totales: {
    hex: '#E0E0E0',
    rgb: [224, 224, 224],
  },
})
