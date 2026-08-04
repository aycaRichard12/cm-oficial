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
    const y = this.doc.lastAutoTable.finalY + 5
    const fechaGeneracion = cambiarFormatoFecha(obtenerFechaActualDato())
    this.doc.setFontSize(8)
    this.doc.text(`Fecha hora reporte: ${fechaGeneracion} ${obtenerHora()}`, 14, y, {
      align: 'left',
    })

    if (firma) {
      this.signature.draw(firma, y)
    }
  }

  addPieDePagina() {
    this.headerFooter.drawPieDePagina()
  }
}
