<template>
  <q-page padding>
    <q-card flat bordered>
      <!-- Header -->
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="shopping_cart" size="sm" class="q-mr-sm" />
          Reporte de Compras por Producto
        </q-toolbar-title>
      </q-toolbar>

      <!-- Filters Section -->
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <label class="text-weight-medium">Producto *</label>
            <q-select
              v-model="productoSeleccionado"
              :options="productosOptions"
              option-value="idProducto"
              option-label="nombreProducto"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              @filter="filterProductos"
              @update:model-value="onProductoChange"
              class="full-width"
              emit-value
              map-options
              :loading="loadingProductos"
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> Sin resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <label class="text-weight-medium">Fecha Inicial *</label>
            <q-input
              v-model="fechaInicio"
              type="date"
              dense
              outlined
              :rules="[(val) => !!val || 'Fecha inicial requerida']"
            />
          </div>
          <div class="col-12 col-md-3">
            <label class="text-weight-medium">Fecha Final *</label>
            <q-input
              v-model="fechaFin"
              type="date"
              dense
              outlined
              :rules="[(val) => !!val || 'Fecha final requerida']"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              color="primary"
              label="Generar Reporte"
              icon="search"
              :loading="loading"
              :disable="!productoSeleccionado || !fechaInicio || !fechaFin"
              @click="generarReporte"
              class="full-width"
              size="md"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Export Options -->
      <q-card-section v-if="compras.length > 0" class="bg-grey-2">
        <div class="row q-col-gutter-md">
          <div class="col-auto">
            <q-btn
              color="positive"
              label="Exportar a Excel"
              icon="file_download"
              @click="exportarExcel"
              flat
            />
          </div>
          <div class="col-auto">
            <q-btn
              color="info"
              label="Exportar a PDF"
              icon="picture_as_pdf"
              @click="exportarPDF"
              flat
            />
          </div>
        </div>
      </q-card-section>

      <!-- Table Section -->
      <q-card-section>
        <BaseFilterableTable
          title="Listado de Compras del Producto"
          :rows="compras"
          :columns="columnas"
          :array-headers="arrayHeaders"
          :sum-columns="sumColumns"
          nombre-column-totales="proveedor"
          row-key="idIngreso"
        >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.estado == 1 ? 'positive' : 'negative'"
                :label="props.row.estado == 1 ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-autorizacion="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.autorizacion == '1' ? 'green' : 'orange'"
                :label="props.row.autorizacion == '1' ? 'Autorizado' : 'No Autorizado'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-totalIngreso="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.totalIngreso) }}
            </q-td>
          </template>

          <template v-slot:body-cell-cantidadIngreso="props">
            <q-td :props="props" class="text-right">
              {{ formatNumber(props.row.cantidadIngreso) }}
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="picture_as_pdf"
                @click="verDetallePDF(props.row.idIngreso)"
                :loading="loadingDetalle && selectedIdIngreso === props.row.idIngreso"
              >
                <q-tooltip>Ver Detalle en PDF</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="info"
                icon="visibility"
                @click="verDetalleModal(props.row)"
              >
                <q-tooltip>Ver Detalles</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </BaseFilterableTable>
      </q-card-section>
    </q-card>

    <!-- PDF Dialog -->
    <q-dialog v-model="showPdfDialog" maximized>
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="picture_as_pdf" size="sm" class="q-mr-sm" />
            Detalle de Compra - PDF
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px)">
          <iframe
            v-if="pdfUrl"
            :src="pdfUrl"
            style="width: 100%; height: 100%; border: none"
            title="Detalle de Compra PDF"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Detail Modal -->
    <q-dialog v-model="showDetailModal" maximized>
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="info" size="sm" class="q-mr-sm" />
            Detalles de la Compra
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <div v-if="detalleSeleccionado" class="row q-col-gutter-lg">
            <!-- Información General -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Información General</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <span class="text-weight-medium">Proveedor:</span>
                      <div>{{ detalleSeleccionado.proveedor }}</div>
                    </div>
                    <div class="col-12">
                      <span class="text-weight-medium">Almacén:</span>
                      <div>{{ detalleSeleccionado.nombreAlmacen }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">Fecha Ingreso:</span>
                      <div>{{ detalleSeleccionado.fechaIngreso }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">N° Factura:</span>
                      <div>{{ detalleSeleccionado.nFactura }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">Cantidad:</span>
                      <div>{{ formatNumber(detalleSeleccionado.cantidadIngreso) }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">Total:</span>
                      <div>{{ formatCurrency(detalleSeleccionado.totalIngreso) }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">Autorización:</span>
                      <div>
                        <q-badge
                          :color="detalleSeleccionado.autorizacion == '1' ? 'green' : 'orange'"
                          :label="
                            detalleSeleccionado.autorizacion == '1' ? 'Autorizado' : 'No Autorizado'
                          "
                        />
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <span class="text-weight-medium">Estado:</span>
                      <div>
                        <q-badge
                          :color="detalleSeleccionado.estado == 1 ? 'positive' : 'negative'"
                          :label="detalleSeleccionado.estado == 1 ? 'Activo' : 'Inactivo'"
                        />
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Productos de la Compra -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Desglose de Productos</div>
                  <q-table
                    v-if="detalleSeleccionado.productos"
                    flat
                    bordered
                    :rows="detalleSeleccionado.productos"
                    :columns="columnasProductos"
                    row-key="idProducto"
                    hide-pagination
                  />
                  <div v-else class="text-grey">No hay productos en esta compra</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReporteProductoCompras } from 'src/composables/useReporteProductoCompras'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { api } from 'boot/axios'
import { validarUsuario, getToken, getTipoFactura } from 'src/composables/FuncionesG'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Composable
const { compras, loading, loadingDetalle, fetchComprasPorProducto, fetchDetalleCompra } =
  useReporteProductoCompras()

// State
const fechaInicio = ref(null)
const fechaFin = ref(null)
const productoSeleccionado = ref(null)
const showPdfDialog = ref(false)
const showDetailModal = ref(false)
const pdfUrl = ref(null)
const selectedIdIngreso = ref(null)
const detalleSeleccionado = ref(null)
const productosOptions = ref([])
const loadingProductos = ref(false)
const todosProductos = ref([])

// Table configuration
const arrayHeaders = [
  'codigoProveedor',
  'proveedor',
  'fechaIngreso',
  'nombreIngreso',
  'nFactura',
  'nombreAlmacen',
  'cantidadIngreso',
  'totalIngreso',
  'autorizacion',
  'estado',
]
const sumColumns = ['totalIngreso', 'cantidadIngreso']

const columnas = [
  {
    name: 'num',
    label: 'N°',
    field: 'num',
    align: 'center',
    sortable: true,
  },
  {
    name: 'codigoProveedor',
    label: 'Código Proveedor',
    field: 'codigoProveedor',
    align: 'left',
    sortable: true,
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fechaIngreso',
    label: 'Fecha Ingreso',
    field: 'fechaIngreso',
    align: 'center',
    sortable: true,
    dataType: 'date',
  },
  {
    name: 'nombreIngreso',
    label: 'Lote Ingreso',
    field: 'nombreIngreso',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nFactura',
    label: 'N° Factura',
    field: 'nFactura',
    align: 'center',
    sortable: true,
  },
  {
    name: 'nombreAlmacen',
    label: 'Almacén',
    field: 'nombreAlmacen',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cantidadIngreso',
    label: 'Cantidad',
    field: 'cantidadIngreso',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'totalIngreso',
    label: 'Total Ingreso',
    field: 'totalIngreso',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'autorizacion',
    label: 'Autorización',
    field: 'autorizacion',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

const columnasProductos = [
  {
    name: 'nombre',
    label: 'Producto',
    field: 'nombre',
    align: 'left',
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'right',
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'right',
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
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

  if (detalle) {
    // Generar PDF simple con jsPDF
    const doc = new jsPDF()

    // Título
    doc.setFontSize(16)
    doc.text('Detalle de Compra', 14, 15)

    // Información general
    doc.setFontSize(10)
    let yPos = 25
    doc.text(`Proveedor: ${detalle.proveedor || 'N/A'}`, 14, yPos)
    yPos += 5
    doc.text(`Almacén: ${detalle.nombreAlmacen || 'N/A'}`, 14, yPos)
    yPos += 5
    doc.text(`Fecha: ${detalle.fechaIngreso || 'N/A'}`, 14, yPos)
    yPos += 5
    doc.text(`Factura: ${detalle.nFactura || 'N/A'}`, 14, yPos)
    yPos += 10

    // Tabla de productos
    if (detalle.productos && detalle.productos.length > 0) {
      const productosData = detalle.productos.map((p) => [
        p.nombre || 'N/A',
        p.cantidad || '0',
        formatCurrency(p.precio),
        formatCurrency(p.subtotal),
      ])

      doc.autoTable({
        head: [['Producto', 'Cantidad', 'Precio', 'Subtotal']],
        body: productosData,
        startY: yPos,
      })
    }

    // Convertir a blob URL para mostrar en iframe
    const pdfBlob = doc.output('blob')

    // Revocar URL anterior si existe
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }

    // Crear nueva URL
    pdfUrl.value = URL.createObjectURL(pdfBlob)

    // Mostrar dialog
    showPdfDialog.value = true
  }

  selectedIdIngreso.value = null
}

const verDetalleModal = async (row) => {
  detalleSeleccionado.value = row
  showDetailModal.value = true
}

const formatCurrency = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

const formatNumber = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

const filterProductos = async (val, update) => {
  loadingProductos.value = true
  try {
    if (val === '') {
      update(() => {
        productosOptions.value = Array.isArray(todosProductos.value) ? todosProductos.value : []
      })
    } else {
      const needle = val.toLowerCase()
      update(() => {
        const source = Array.isArray(todosProductos.value) ? todosProductos.value : []
        productosOptions.value = source.filter((v) =>
          (v.nombreProducto || '').toLowerCase().includes(needle) ||
          (v.codigoProducto || '').toLowerCase().includes(needle),
        )
      })
    }
  } finally {
    loadingProductos.value = false
  }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  try {
    const user = validarUsuario()
    const idEmpresa = user?.[0]?.empresa?.idempresa

    // Endpoints a intentar en orden
    const attempts = []

    // 1) listaProducto (usada en CproductoPage) si tenemos idEmpresa, token y tipo
    try {
      const token = getToken()
      const tipo = getTipoFactura()
      if (idEmpresa && token && tipo) {
        attempts.push(`listaProducto/${idEmpresa}/${token}/${tipo}`)
      }
    } catch {
      // ignore
    }

    // 2) listaProductosDisponiblesVenta (usada en cotizacion)
    if (idEmpresa) {
      attempts.push(`listaProductosDisponiblesVenta/${idEmpresa}`)
    }

    // 3) fallback genérico
    attempts.push('productos')

    let items = []
    let lastError = null

    for (const endpoint of attempts) {
      try {
        console.log('Intentando endpoint productos:', endpoint)
        const response = await api.get(endpoint)
        console.log('Respuesta productos:', endpoint, response)

        let payload = response && response.data ? response.data : response

        // Algunas APIs devuelven { estado: 'ok', datos: [...] }
        if (payload && payload.datos && Array.isArray(payload.datos)) {
          payload = payload.datos
        }

        if (Array.isArray(payload)) {
          items = payload
        } else if (payload && Array.isArray(payload.data)) {
          items = payload.data
        } else if (payload && Array.isArray(payload.productos)) {
          items = payload.productos
        } else if (payload && Array.isArray(payload.datos)) {
          items = payload.datos
        } else {
          // if response is an object where keys are ids, try to convert
          if (payload && typeof payload === 'object') {
            const maybeArray = Object.values(payload).filter((v) => v && typeof v === 'object')
            if (maybeArray.length > 0) items = maybeArray
          }
        }

        if (items && items.length > 0) {
          // éxito, salimos del loop
          lastError = null
          break
        }
      } catch (err) {
        console.warn('Error intentando endpoint', endpoint, err)
        lastError = err
        continue
      }
    }

    if (!items || items.length === 0) {
      console.warn('No se encontraron productos en los endpoints probados', attempts, lastError)
      // Notificar al usuario
      try {
        const { Notify } = await import('quasar')
        Notify.create({ type: 'info', message: 'No se encontraron productos' })
      } catch (err) {
        console.warn('Notify no disponible:', err)
      }
      todosProductos.value = []
      productosOptions.value = []
      return
    }

    // Normalizar campos para q-select (idProducto, nombreProducto, codigoProducto)
    const normalized = items.map((it) => ({
      idProducto: it.idProducto || it.idproducto || it.id || it.id_prod || it.id_producto || null,
      nombreProducto: it.nombreProducto || it.nombre || it.descripcion || it.nombre_producto || '',
      codigoProducto: it.codigoProducto || it.codigo || it.codigo_producto || '',
      ...it,
    })).filter((i) => i.idProducto !== null)

    todosProductos.value = normalized
    productosOptions.value = normalized
  } catch (error) {
    console.error('Error al cargar productos (general):', error)
    todosProductos.value = []
    productosOptions.value = []
  } finally {
    loadingProductos.value = false
  }
}

const exportarExcel = () => {
  if (compras.value.length === 0) return

  const datosExportar = compras.value.map((item) => ({
    'N°': item.num,
    Proveedor: item.proveedor,
    'Código Proveedor': item.codigoProveedor,
    'Fecha Ingreso': item.fechaIngreso,
    Lote: item.nombreIngreso,
    Factura: item.nFactura,
    Almacén: item.nombreAlmacen,
    Cantidad: item.cantidadIngreso,
    Total: formatCurrency(item.totalIngreso),
    Autorización: item.autorizacion == '1' ? 'Autorizado' : 'No Autorizado',
    Estado: item.estado == 1 ? 'Activo' : 'Inactivo',
  }))

  const worksheet = XLSX.utils.json_to_sheet(datosExportar)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Compras')

  const nombreProducto =
    productosOptions.value.find((p) => p.idProducto === productoSeleccionado.value)
      ?.nombreProducto || 'Producto'

  XLSX.writeFile(
    workbook,
    `Reporte_Compras_${nombreProducto}_${fechaInicio.value}_${fechaFin.value}.xlsx`,
  )
}

const exportarPDF = () => {
  if (compras.value.length === 0) return

  const doc = new jsPDF('l', 'mm', 'a4')

  // Título
  doc.setFontSize(14)
  const nombreProducto =
    productosOptions.value.find((p) => p.idProducto === productoSeleccionado.value)
      ?.nombreProducto || 'Producto'
  doc.text(`Reporte de Compras - ${nombreProducto}`, 14, 15)

  // Rango de fechas
  doc.setFontSize(10)
  doc.text(`Período: ${fechaInicio.value} a ${fechaFin.value}`, 14, 22)

  // Tabla
  const datosTabla = compras.value.map((item) => [
    item.num,
    item.proveedor,
    item.fechaIngreso,
    item.nFactura,
    item.nombreAlmacen,
    item.cantidadIngreso,
    formatCurrency(item.totalIngreso),
    item.autorizacion == '1' ? 'Sí' : 'No',
  ])

  doc.autoTable({
    head: [['N°', 'Proveedor', 'Fecha', 'Factura', 'Almacén', 'Cantidad', 'Total', 'Aut.']],
    body: datosTabla,
    startY: 28,
    margin: { top: 28, right: 14, bottom: 14, left: 14 },
    headStyles: {
      fillColor: [13, 110, 253],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  doc.save(`Reporte_Compras_${nombreProducto}_${fechaInicio.value}_${fechaFin.value}.pdf`)
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

  // Cleanup on unmount
  return () => {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
  }
})
</script>

<style scoped>
.sticky-header-table {
  max-height: 600px;
}

.sticky-header-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}
</style>
