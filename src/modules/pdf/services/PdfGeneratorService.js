// src/modules/pdf/services/PdfGeneratorService.js
import { PdfDocumentBuilder } from '../builders/PdfDocumentBuilder'
import { TableBuilder } from '../builders/TableBuilder'
import { ReportDataService } from './ReportDataService'

export class PdfGeneratorService {
  constructor() {
    this.dataService = new ReportDataService()
  }

  async generateReport(options) {
    const { columns, datos, titulo, columnStyles, headerColumnStyles } = options
    const userData = options.userData || (await this.dataService.getUserData())

    const docBuilder = new PdfDocumentBuilder(userData)
    docBuilder.addEncabezado()
    docBuilder.addEncabezadoInfo(
      titulo,
      options.fechas,
      options.datosIzquierda,
      options.datosDerecho,
      options.conImpresionEncargado,
      options.extras,
    )

    const tableBuilder = new TableBuilder(docBuilder.doc)
    tableBuilder.draw({
      columns,
      datos,
      columnStyles,
      headerColumnStyles,
      marginTop: 55, // podría ser configurable
      añadirDescricionAdcional: options.añadirDescricionAdcional,
    })

    // Firma y fecha
    docBuilder.addFooterInfo(options.firma)
    docBuilder.addPieDePagina()

    return docBuilder.doc
  }
}
