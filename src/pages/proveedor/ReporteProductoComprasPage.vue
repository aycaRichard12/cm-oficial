<template>
  <q-page padding>
    <q-card flat bordered>
      <!-- Header -->
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="shopping_cart" size="sm" class="q-mr-sm" />
          {{ $t('ui.reporte-de-compras-segun-producto-f74b71') }}
        </q-toolbar-title>
      </q-toolbar>

      <!-- Filters Section -->
      <ReporteProductoFiltros
        v-model:producto-seleccionado="productoSeleccionado"
        v-model:fecha-inicio="fechaInicio"
        v-model:fecha-fin="fechaFin"
        :productos-options="productosOptions"
        :loading-productos="loadingProductos"
        :loading="loading"
        @generar="generarReporte"
        @filter="filterProductos"
      />

      <!-- Export Options -->
      <ReporteProductoExportButtons
        :has-data="compras.length > 0"
        @exportar-excel="handleExportarExcel"
        @exportar-pdf="handleExportarPDF"
      />

      <!-- Table Section -->
      <q-card-section>
        <BaseFilterableTable
          id="reporteTabla"
          ref="miTabla"
          :title="$t('ui.listado-de-compras-del-producto-2cdd5c')"
          :rows="compras"
          :columns="columnas"
          :array-headers="arrayHeaders"
          :sum-columns="sumColumns"
          nombre
          row-key="idIngreso"
          nombreColumnaTotales="almacen"
        >
          <template v-slot:body-cell-estadoIngreso="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.estadoIngreso == 1 ? 'positive' : 'negative'"
                :label="props.row.estadoIngreso == 1 ? $t('common.active') : $t('common.inactive')"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-autorizacion="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.autorizacion == '1' ? 'green' : 'orange'"
                :label="props.row.autorizacion == '1' ? $t('ui.autorizado-b4fb49') : $t('ui.no-autorizado-988c4e')"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-tipoCompra="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.tipoCompra == 1 ? 'blue' : 'purple'"
                :label="props.row.tipoCompra == 1 ? $t('ui.credito-f05ef4') : $t('ui.contado-447b89')"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.total) }}
            </q-td>
          </template>

          <template v-slot:body-cell-cantidad="props">
            <q-td :props="props" class="text-right">
              {{ formatNumber(props.row.cantidad) }}
            </q-td>
          </template>

          <template v-slot:body-cell-precioUnitario="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.precioUnitario) }}
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                id="previsualizarPdf"
                flat
                round
                dense
                color="primary"
                icon="picture_as_pdf"
                @click="verDetallePDF(props.row.idIngreso)"
                :loading="loadingDetalle && selectedIdIngreso === props.row.idIngreso"
              >
                <q-tooltip>{{ $t('ui.previsualizar-pdf-05088d') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </BaseFilterableTable>
      </q-card-section>
    </q-card>

    <!-- PDF Preview Modal -->
    <PdfPreviewModal v-model="showPdfModal" :pdf-url="pdfUrl" />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { ref, onMounted } from 'vue'
import { useReporteProductoCompras } from 'src/composables/reporteproductoproveedorcompras/useReporteProductoCompras'
import { useProductoSelector } from 'src/composables/reporteproductoproveedorcompras/useProductoSelector'
import { usePdfPreview } from 'src/composables/reporteproductoproveedorcompras/usePdfPreview'
import { useReporteExport } from 'src/composables/reporteproductoproveedorcompras/useReporteExport'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import ReporteProductoFiltros from 'src/components/reporteproductoproveedorcompras/ReporteProductoFiltros.vue'
import ReporteProductoExportButtons from 'src/components/reporteproductoproveedorcompras/ReporteProductoExportButtons.vue'
import PdfPreviewModal from 'src/components/reporteproductoproveedorcompras/PdfPreviewModal.vue'
import { PDF_DETALLE_COMPRA_PROVEEDOR } from 'src/utils/pdfReportGenerator'

// Composables
const { compras, loading, loadingDetalle, fetchComprasPorProducto, fetchDetalleCompra } =
  useReporteProductoCompras()

const { productosOptions, loadingProductos, filterProductos, cargarProductos } =
  useProductoSelector()

const { showPdfModal, pdfUrl, openPdfPreview } = usePdfPreview()

const { formatCurrency, formatNumber, exportarExcel, generarPDF } = useReporteExport()

const divisaActiva = useCurrencyStore().simbolo

// State
const fechaInicio = ref(null)
const fechaFin = ref(null)
const productoSeleccionado = ref(null)
const selectedIdIngreso = ref(null)
const miTabla = ref(null)

// Table configuration
const arrayHeaders = [
  'indice',
  'codigoProveedor',
  'proveedor',
  'fechaIngreso',
  'nombreIngreso',
  'nFactura',
  'almacen',
  'cantidad',
  'precioUnitario',
  'total',
  'tipoCompra',
  'autorizacion',
  'estadoIngreso',
]
const sumColumns = ['total', 'cantidad', 'precioUnitario']

const columnas = [
  {
    name: 'indice',
    label: i18nT('cotizacion.table.number'),
    field: 'indice',
    align: 'center',
  },
  {
    name: 'fechaIngreso',
    label: i18nT('ui.fecha-ingreso-83de8b'),
    field: 'fechaIngreso',
    align: 'center',

    dataType: 'date',
  },
  {
    name: 'codigoProveedor',
    label: i18nT('ui.cod-proveedor-523886'),
    field: 'codigoProveedor',
    align: 'left',
  },
  {
    name: 'proveedor',
    label: i18nT('compras.supplier'),
    field: 'proveedor',
    align: 'left',
  },
  {
    name: 'nombreIngreso',
    label: i18nT('ui.lote-ingreso-359f4d'),
    field: 'nombreIngreso',
    align: 'left',
  },
  {
    name: 'nFactura',
    label: i18nT('ui.n-factura-5a62ff'),
    field: 'nFactura',
    align: 'center',
  },
  {
    name: 'tipoCompra',
    label: i18nT('ui.tipo-compra-7a683f'),
    field: 'tipoCompra',
    align: 'center',
  },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    field: 'almacen',
    align: 'left',
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    field: 'cantidad',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'precioUnitario',
    label: `Precio Unit. (${divisaActiva})`,
    field: 'precioUnitario',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'total',
    label: `Total (${divisaActiva})`,
    field: 'total',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'autorizacion',
    label: i18nT('ui.autorizacion-077400'),
    field: 'autorizacion',
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'estadoIngreso',
    label: i18nT('ui.estado-ingreso-2bd19e'),
    field: 'estadoIngreso',
    align: 'center',
  },
  {
    name: 'acciones',
    label: i18nT('common.actions'),
    field: 'acciones',
    align: 'center',
  },
]

// Methods
const generarReporte = async () => {
  if (!productoSeleccionado.value || !fechaInicio.value || !fechaFin.value) {
    return
  }
  await fetchComprasPorProducto(productoSeleccionado.value, fechaInicio.value, fechaFin.value)
}

const verDetallePDF = async (idIngreso) => {
  selectedIdIngreso.value = idIngreso
  const detalle = await fetchDetalleCompra(idIngreso)
  selectedIdIngreso.value = null

  if (detalle) {
    // Preparar datos para PDF
    const detalleParaPDF = {
      ...detalle,
      nombreAlmacen: detalle.almacen,
      nFactura: detalle.nfactura,
      codigoIngreso: detalle.codigoIngreso || '-',
      detalle: detalle.detalle || [],
      proveedor: {
        nombre:
          typeof detalle.proveedor === 'object' ? detalle.proveedor.nombre : detalle.proveedor,
        codigo:
          typeof detalle.proveedor === 'object'
            ? detalle.proveedor.codigo
            : detalle.codigoProveedor,
      },
    }

    const doc = PDF_DETALLE_COMPRA_PROVEEDOR(detalleParaPDF)
    openPdfPreview(doc)
  }
}

const handleExportarExcel = () => {
  const nombreProducto =
    productosOptions.value.find((p) => p.idProducto === productoSeleccionado.value)
      ?.nombreProducto || i18nT('inventario.product')

  exportarExcel(compras.value, nombreProducto, fechaInicio.value, fechaFin.value)
}

const handleExportarPDF = () => {
  const nombreProducto =
    productosOptions.value.find((p) => p.idProducto === productoSeleccionado.value)
      ?.nombreProducto || i18nT('inventario.product')

  // Obtener las columnas visibles de la tabla
  const visibleColumnsFromTable = miTabla.value?.obtenerColumnasVisibles() || []

  const doc = generarPDF(
    compras.value,
    nombreProducto,
    fechaInicio.value,
    fechaFin.value,
    visibleColumnsFromTable,
  )
  if (doc) {
    openPdfPreview(doc)
  }
}

// Initialize dates on mount
onMounted(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')

  // Set default to first day of current month and today
  fechaInicio.value = `${year}-${month}-01`
  fechaFin.value = `${year}-${month}-${day}`

  // Cargar productos
  cargarProductos()
})
</script>
