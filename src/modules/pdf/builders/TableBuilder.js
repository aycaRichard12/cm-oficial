// src/modules/pdf/builders/TableBuilder.js
import autoTable from 'jspdf-autotable'
import { calcularMargenCentral } from '../utils/layoutUtils'

export class TableBuilder {
  constructor(doc, defaultFontSize = 8, defaultCellPadding = 1) {
    this.doc = doc
    this.fontSize = defaultFontSize
    this.cellPadding = defaultCellPadding
  }

  draw({ columns, datos, columnStyles, headerColumnStyles, marginTop, drawPageHeader, añadirDescricionAdcional }) {
    const { marginLeft, tableWidth } = calcularMargenCentral(this.doc, columns, columnStyles)

    autoTable(this.doc, {
      columns,
      body: datos,
      styles: {
        overflow: 'linebreak',
        fontSize: this.fontSize,
        cellPadding: this.cellPadding,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        fontSize: this.fontSize,
        halign: 'center',
      },
      margin: { top: marginTop || 55, bottom: 20, left: marginLeft, right: marginLeft },
      tableWidth,
      theme: 'plain',
      didParseCell: (data) =>
        this._parseCell(data, columnStyles, headerColumnStyles, añadirDescricionAdcional),
      didDrawCell: (data) => this._drawCell(data),
      didDrawPage: (data) => {
        if (data.pageNumber > 1 && drawPageHeader) {
          drawPageHeader(this.doc)
        }
      },
    })
  }

  _parseCell(data, columnStyles, headerColumnStyles, añadirDescricionAdcional) {
    const key = data.column.dataKey
    if (data.section === 'head') {
      if (headerColumnStyles[key]) {
        Object.assign(data.cell.styles, headerColumnStyles[key])
      }
    } else if (data.section === 'body') {
      if (columnStyles[key]) {
        Object.assign(data.cell.styles, columnStyles[key])
      }
      this._handleExtraDescription(data, añadirDescricionAdcional)
      this._handleBoldTags(data)
      if (key === 'imagen' && data.row.raw?.rawImagenBase64) {
        data.cell.styles.minCellHeight = 25
      }
    }
  }

  _drawCell(data) {
    if (data.column.dataKey === 'imagen' && data.cell.section === 'body') {
      const rawImg = data.row.raw?.rawImagenBase64
      if (rawImg) {
        try {
          this.doc.addImage(
            rawImg,
            'JPEG',
            data.cell.x + 2,
            data.cell.y + 2,
            data.cell.width - 4,
            data.cell.height - 4,
            undefined,
            'FAST',
          )
        } catch (e) {
          console.warn('Error agregando imagen', e)
        }
      }
    }
    if (data.section === 'head') {
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      const { x, y, width, height } = data.cell
      this.doc.line(x, y, x + width, y)
      this.doc.line(x, y + height, x + width, y + height)
    }
  }

  _handleExtraDescription(data, config) {
    if (!config) return
    const configs = Array.isArray(config) ? config : [config]
    for (const cfg of configs) {
      if (data.column.dataKey === cfg.columna && data.row.raw[cfg.campo]) {
        const desc = data.row.raw[cfg.campo].toString().trim()
        if (desc) {
          const mainText = Array.isArray(data.cell.text)
            ? data.cell.text.join('\n')
            : data.cell.text
          data.cell.text = [mainText, '   ' + desc]
          break
        }
      }
    }
  }

  _handleBoldTags(data) {
    if (Array.isArray(data.cell.text)) {
      data.cell.text.forEach((text, i) => {
        if (typeof text === 'string' && text.includes('<b>')) {
          data.cell.text[i] = text.replace(/<b>/g, '').replace(/<\/b>/g, '')
          data.cell.styles.fontStyle = 'bold'
        }
      })
    }
  }
}
