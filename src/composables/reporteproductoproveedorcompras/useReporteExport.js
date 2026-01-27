import * as XLSX from 'xlsx'
import { PDF_REPORTE_COMPRAS_PRODUCTO } from 'src/utils/pdfReportGenerator'

/**
 * Composable para manejar exportación de reportes
 * Principio de Responsabilidad Única: Solo maneja exportaciones
 */
export function useReporteExport() {
  const formatCurrency = (value) => {
    if (!value) return '0.00'
    return parseFloat(value).toFixed(2)
  }

  const formatNumber = (value) => {
    if (!value) return '0.00'
    return parseFloat(value).toFixed(2)
  }

  const exportarExcel = (compras, nombreProducto, fechaInicio, fechaFin) => {
    if (!compras || compras.length === 0) return

    const datosExportar = compras.map((item) => ({
      'N°': item.indice,
      'Fecha Ingreso': item.fechaIngreso,
      'Código Proveedor': item.codigoProveedor,
      Proveedor: item.proveedor,
      'Lote Ingreso': item.nombreIngreso,
      'N° Factura': item.nFactura,
      'Tipo Compra': item.tipoCompra == 1 ? 'Crédito' : 'Contado',
      Almacén: item.almacen,
      Cantidad: formatNumber(item.cantidad),
      'Precio Unitario': formatCurrency(item.precioUnitario),
      Total: formatCurrency(item.total),
      Autorización: item.autorizacion == '1' ? 'Autorizado' : 'No Autorizado',
      'Estado Ingreso': item.estadoIngreso == 1 ? 'Activo' : 'Inactivo',
    }))

    const worksheet = XLSX.utils.json_to_sheet(datosExportar)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Compras')

    XLSX.writeFile(
      workbook,
      `Reporte_Compras_${nombreProducto}_${fechaInicio}_${fechaFin}.xlsx`,
    )
  }

  const generarPDF = (compras, nombreProducto, fechaInicio, fechaFin) => {
    if (!compras || compras.length === 0) return null

    const filters = {
      producto: nombreProducto,
      fechaInicio,
      fechaFin,
    }

    return PDF_REPORTE_COMPRAS_PRODUCTO(compras, filters)
  }

  return {
    formatCurrency,
    formatNumber,
    exportarExcel,
    generarPDF,
  }
}
