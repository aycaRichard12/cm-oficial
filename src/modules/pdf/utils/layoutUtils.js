// src/modules/pdf/utils/layoutUtils.js

/**
 * Calcula el ancho total de la tabla sumando los `cellWidth` de cada columna
 * definidos en `columnStyles`, y calcula el margen izquierdo necesario para
 * centrar la tabla horizontalmente en la página.
 *
 * @param {import('jspdf').jsPDF} doc - Documento jsPDF activo
 * @param {Array<{dataKey: string}>} columns - Definición de columnas de la tabla
 * @param {Object.<string, {cellWidth?: number}>} columnStyles - Estilos por columna
 * @returns {{ marginLeft: number, tableWidth: number }}
 */
export function calcularMargenCentral(doc, columns, columnStyles) {
  const pageWidth = doc.internal.pageSize.getWidth()

  const tableWidth = columns.reduce((total, col) => {
    const style = columnStyles?.[col.dataKey]
    const width = style?.cellWidth ?? 0
    return total + width
  }, 0)

  const marginLeft = (pageWidth - tableWidth) / 2

  return { marginLeft, tableWidth }
}
