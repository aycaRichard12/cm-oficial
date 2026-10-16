import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { HeaderFooterBuilder } from './HeaderFooterBuilder'
import { SignatureBuilder } from './SignatureBuilder'
import {
  cambiarFormatoFecha,
  obtenerFechaActualDato,
  obtenerHora,
} from 'src/composables/FuncionesG'

export class PdfDocumentBuilder {
  constructor(userData, options = {}) {
    const { orientation = 'portrait', format = 'a4' } = options
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    })
    this.userData = userData
    this.headerFooter = new HeaderFooterBuilder(this.doc, userData)
    this.signature = new SignatureBuilder(this.doc)
  }

  addEncabezado() {
    this.headerFooter.drawEncabezado()
  }

  addEncabezadoInfo(titulo, fechas, datosIzquierda, datosDerecho, conImpresionEncargado, extras) {
    this.headerFooter.drawEncabezadoInfo(
      titulo,
      fechas,
      datosIzquierda,
      datosDerecho,
      conImpresionEncargado,
      extras,
    )
  }

  addFooterInfo(firma) {
    const lastTable = this.doc.lastAutoTable
    const baseY =
      lastTable && typeof lastTable.finalY === 'number'
        ? lastTable.finalY + 5
        : this.doc.internal.pageSize.getHeight() - 25

    const fechaGeneracion = cambiarFormatoFecha(obtenerFechaActualDato())
    this.doc.setFontSize(8)
    this.doc.text(`Fecha y Hora : ${fechaGeneracion} ${obtenerHora()}`, 14, baseY, {
      align: 'left',
    })

    if (firma) {
      this.signature.draw(firma, baseY)
    }
  }

  addPieDePagina() {
    this.headerFooter.drawPieDePagina()
  }
}
