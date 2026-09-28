// src/modules/pdf/services/CatalogoPdfService.js
import { PdfDocumentBuilder } from '../builders/PdfDocumentBuilder'
import { CatalogoCardBuilder } from '../builders/CatalogoCardBuilder'
import { ReportDataService } from './ReportDataService'
import { imagen as IMAGEN_BASE_URL } from 'src/boot/url'

export class CatalogoPdfService {
  constructor() {
    this.dataService = new ReportDataService()
  }

  async generate(options = {}) {
    const {
      productos,
      almacenNombre = 'Todos los Almacenes',
      divisaActiva = '',
      orientation = 'portrait',
      format = 'a4',
    } = options

    if (!Array.isArray(productos)) {
      throw new Error('CatalogoPdfService: "productos" debe ser un arreglo plano')
    }

    const userData = options.userData || (await this.dataService.getUserData())
    const docBuilder = new PdfDocumentBuilder(userData, { orientation, format })

    const drawHeader = () => {
      docBuilder.addEncabezado()
      docBuilder.addEncabezadoInfo(
        'CATÁLOGO DE PRODUCTOS',
        null,
        {
          titulo: 'DATOS DEL REPORTE',
          campos: [{ label: 'Almacén', valor: almacenNombre }],
        },
        {
          titulo: 'DATOS DEL ENCARGADO',
          campos: [
            { label: '', valor: userData.encargadoNombre || '' },
            { label: '', valor: userData.cargo || '' },
          ],
        },
        true,
        null,
      )
    }

    drawHeader()

    const productosConImagen = await this._prepararImagenes(productos)
    const cardBuilder = new CatalogoCardBuilder(docBuilder.doc)
    const pageHeight = docBuilder.doc.internal.pageSize.getHeight()
    const pageWidth = docBuilder.doc.internal.pageSize.getWidth()
    const dosColumnas = pageWidth > 140

    let startY = 55
    let colIndex = 0

    for (const item of productosConImagen) {
      if (!cardBuilder.cabeEnPagina(startY, pageHeight)) {
        docBuilder.doc.addPage()
        drawHeader()
        startY = 45
        colIndex = 0
      }

      const x = dosColumnas
        ? colIndex === 0
          ? cardBuilder.margenIzquierdo
          : cardBuilder.margenIzquierdo +
            cardBuilder.anchoTarjeta +
            cardBuilder.separacionHorizontal
        : cardBuilder.margenIzquierdo

      cardBuilder.draw(item, x, startY, divisaActiva)

      colIndex++
      if (colIndex > (dosColumnas ? 1 : 0)) {
        colIndex = 0
        startY += cardBuilder.altoTarjeta + cardBuilder.separacionVertical
      }
    }

    docBuilder.addPieDePagina()
    return docBuilder.doc
  }

  async _prepararImagenes(productos) {
    return Promise.all(
      productos.map(async (item) => {
        if (!item || !item.imagen) return { ...item, imagenBase64: null }
        try {
          const url = /^https?:\/\//i.test(item.imagen)
            ? item.imagen
            : `${IMAGEN_BASE_URL}${item.imagen}`
          const base64 = await this._convertirImagenARutaBase64(url)
          return { ...item, imagenBase64: base64 }
        } catch (e) {
          console.warn('CatalogoPdfService: no se pudo cargar imagen', item.codigo, e)
          return { ...item, imagenBase64: null }
        }
      }),
    )
  }

  _convertirImagenARutaBase64(url) {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Entorno sin DOM'))
        return
      }
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/jpeg'))
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`))
      img.src = url
    })
  }
}
