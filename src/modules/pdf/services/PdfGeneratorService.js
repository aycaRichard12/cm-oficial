import { PdfDocumentBuilder } from '../builders/PdfDocumentBuilder'
import { TableBuilder } from '../builders/TableBuilder'
import { ReportDataService } from './ReportDataService'
import { Dialog } from 'quasar'

const STORAGE_KEY = 'ultimaConfigPDF'

export class PdfGeneratorService {
  constructor() {
    this.dataService = new ReportDataService()
  }

  // Recupera la última configuración guardada o devuelve un valor por defecto
  _getDefaultConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const config = JSON.parse(stored)
        if (config.orientation && config.format) {
          return config
        }
      }
    } catch (e) {
      console.error(e)
      // Si hay error, ignoramos y usamos el default
    }
    return { orientation: 'portrait', format: 'a4' }
  }

  // Guarda la configuración en localStorage
  _saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }

  // Muestra el diálogo y devuelve la configuración elegida
  async _solicitarConfiguracion() {
    const defaultConfig = this._getDefaultConfig()
    const defaultValue = `${defaultConfig.orientation}-${defaultConfig.format}`

    return new Promise((resolve) => {
      Dialog.create({
        title: 'Configuración del PDF',
        message: 'Seleccione orientación y tamaño de hoja',
        options: {
          type: 'radio',
          model: defaultValue,
          items: [
            { label: 'Vertical - A4', value: 'portrait-a4' },
            { label: 'Vertical - Carta', value: 'portrait-letter' },
            { label: 'Vertical - Oficio', value: 'portrait-legal' },
            { label: 'Horizontal - A4', value: 'landscape-a4' },
            { label: 'Horizontal - Carta', value: 'landscape-letter' },
            { label: 'Horizontal - Oficio', value: 'landscape-legal' },
          ],
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          const [orientation, format] = data.split('-')
          const config = { orientation, format }
          this._saveConfig(config)
          resolve(config)
        })
        .onCancel(() => {
          resolve(null)
        })
    })
  }

  async generateReport(options) {
    // Si ya se pasaron explícitamente, se usan; si no, se pregunta al usuario
    let orientation = options.orientation
    let format = options.format

    if (!orientation || !format) {
      const config = await this._solicitarConfiguracion()
      if (!config) {
        throw new Error('Generación cancelada por el usuario')
      }
      orientation = config.orientation
      format = config.format
    }

    const { columns, datos, titulo, columnStyles, headerColumnStyles } = options
    const userData = options.userData || (await this.dataService.getUserData())

    const docBuilder = new PdfDocumentBuilder(userData, { orientation, format })
    docBuilder.addEncabezado()
    docBuilder.addEncabezadoInfo(
      titulo,
      options.fechas,
      options.datosIzquierda,
      options.datosDerecho,
      options.conImpresionEncargado,
      options.extras,
    )

    // Ajuste dinámico del margen superior según orientación
    const marginTop = orientation === 'landscape' ? 40 : 55

    const tableBuilder = new TableBuilder(docBuilder.doc)
    tableBuilder.draw({
      columns,
      datos,
      columnStyles,
      headerColumnStyles,
      marginTop,
      drawPageHeader: () => {
        docBuilder.addEncabezado()
        docBuilder.addEncabezadoInfo(
          titulo,
          options.fechas,
          options.datosIzquierda,
          options.datosDerecho,
          options.conImpresionEncargado,
          options.extras,
        )
      },
      añadirDescricionAdcional: options.añadirDescricionAdcional,
    })

    docBuilder.addFooterInfo(options.firma)
    docBuilder.addPieDePagina()

    return docBuilder.doc
  }
}
