<template>
  <q-page padding>
    <q-card flat bordered>
      <!-- Header -->
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="shopping_cart" size="sm" class="q-mr-sm" />
          Reportes de Compras según Proveedor
        </q-toolbar-title>
      </q-toolbar>

      <!-- Filters Section -->
      <q-card-section class="q-pb-sm">
        <div class="row q-col-gutter-md items-start" id="filtroFechas">
          <!-- Proveedor -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedProveedor"
              :options="proveedoresOptions"
              label="Proveedor"
              dense
              outlined
              use-input
              input-debounce="0"
              behavior="menu"
              @filter="filterProveedores"
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="apartment" class="text-primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Fecha Inicial -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="fechaInicio"
              type="date"
              dense
              outlined
              label="Fecha Inicial *"
              :rules="[(val) => !!val || 'Fecha inicial requerida']"
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <!-- Fecha Final -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="fechaFin"
              type="date"
              dense
              outlined
              label="Fecha Final *"
              :rules="[(val) => !!val || 'Fecha final requerida']"
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <!-- Generar Reporte Button -->
          <div class="col-12 col-md-2 flex items-end" id="generarReporte">
            <q-btn
              color="primary"
              label="Generar"
              icon="search"
              :loading="loading"
              :disable="!fechaInicio || !fechaFin || !selectedProveedor"
              @click="generarReporte"
              class="full-width"
              unelevated
            />
          </div>
        </div>
      </q-card-section>

      <!-- Export Options -->
      <q-card-section v-if="filteredCompras.length > 0" class="bg-grey-2">
        <div class="row q-col-gutter-md">
          <div class="col-auto">
            <q-btn
              color="positive"
              label="Exportar a Excel"
              icon="file_download"
              @click="generarExcel"
              flat
              id="exportarExcel"
            />
          </div>
          <div class="col-auto">
            <q-btn
              color="info"
              label="Previsualizar PDF"
              icon="picture_as_pdf"
              @click="generarPDF"
              flat
              id="exportarPDF"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Table Section -->
      <q-card-section>
        <BaseFilterableTable
          id="reporteCompras"
          ref="miTabla"
          title="Listado de Compras"
          :rows="filteredCompras"
          :columns="columnas"
          :array-headers="arrayHeaders"
          :sum-columns="sumColumns"
          row-key="idIngreso"
          nombreColumnaTotales="nombreAlmacen"
        >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.estado === 'Activo' ? 'positive' : 'negative'"
                :label="props.row.estado"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-autorizacion="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.autorizacion === 'Autorizado' ? 'green' : 'orange'"
                :label="props.row.autorizacion"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-totalIngreso="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.totalIngreso) }}
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                id="verDetallePDF"
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import { useReporteProveedorCompras } from 'src/composables/useReporteProveedorCompras'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import {
  PDF_DETALLE_COMPRA_PROVEEDOR,
  PDF_REPORTE_COMPRAS_GENERAL,
} from 'src/utils/pdfReportGenerator'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { api } from 'boot/axios'
import { validarUsuario, cambiarFormatoFecha } from 'src/composables/FuncionesG'

const divisaActiva = useCurrencyStore()

// Composable
const { compras, detalleCompra, loading, loadingDetalle, fetchCompras, fetchDetalleCompra } =
  useReporteProveedorCompras()

// State
const fechaInicio = ref(null)
const fechaFin = ref(null)
const showPdfDialog = ref(false)
const pdfUrl = ref(null)
const selectedIdIngreso = ref(null)
const selectedProveedor = ref(null)
const $q = useQuasar()

// Table configuration
const miTabla = ref(null)
const arrayHeaders = [
  'codigoProveedor',
  'proveedor',
  'fechaIngreso',
  'nombreIngreso',
  'nFactura',
  'nombreAlmacen',
  'autorizacion',
  'estado',
]

//devolver con 2 decimales
const sumColumns = ['totalIngreso']

const columnas = [
  {
    name: 'num',
    label: 'N°',
    field: 'num',
    align: 'center',
  },
  {
    name: 'codigoProveedor',
    label: 'Código Proveedor',
    field: 'codigoProveedor',
    align: 'left',
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',
  },
  {
    name: 'fechaIngreso',
    label: 'Fecha Ingreso',
    field: 'fechaIngreso',
    align: 'center',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'nombreIngreso',
    label: 'Nombre Ingreso',
    field: 'nombreIngreso',
    align: 'left',
  },
  {
    name: 'nFactura',
    label: 'N° Factura',
    field: 'nFactura',
    align: 'center',
  },
  {
    name: 'nombreAlmacen',
    label: 'Almacén',
    field: 'nombreAlmacen',
    align: 'left',
  },
  {
    name: 'totalIngreso',
    label: `Total Ingreso (${divisaActiva.simbolo})`,
    field: 'totalIngreso',
    align: 'right',

    dataType: 'number',
  },
  {
    name: 'autorizacion',
    label: 'Autorización',
    field: 'autorizacion',
    align: 'center',
    dataType: 'text',
    format: (val) => {
      return val === '1' ? 'Autorizado' : 'No Autorizado'
    },
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

//formatear autorizacion

// Computed
// Removed computed proveedoresList since we will fetch it directly
const proveedoresList = ref([])

const proveedoresOptions = ref([])

const filterProveedores = (val, update) => {
  if (val === '') {
    update(() => {
      proveedoresOptions.value = proveedoresList.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    proveedoresOptions.value = proveedoresList.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

// watch removed as we load explicitly
// watch(proveedoresList, (newVal) => {
//   proveedoresOptions.value = newVal
// })

const appliedProveedor = ref(null)

const filteredCompras = computed(() => {
  let data = compras.value || []
  if (appliedProveedor.value) {
    // Si la opción seleccionada contiene ' - ', la separamos y usamos el nombre (proveedor) para filtrar.
    const proveedorSeleccionadoNombre = appliedProveedor.value.includes('-')
      ? appliedProveedor.value.substring(appliedProveedor.value.indexOf('-') + 1).trim()
      : appliedProveedor.value.trim()

    data = data.filter((c) => c.proveedor === proveedorSeleccionadoNombre)
  }
  return data.map((item) => ({
    ...item,
    estado: item.estado == 1 ? 'Activo' : 'Inactivo',
    autorizacion: item.autorizacion == '1' ? 'Autorizado' : 'No Autorizado',
    // Preserve original values if needed for other logic, but for this table/report strings are better
    estado_raw: item.estado,
    autorizacion_raw: item.autorizacion,
  }))
})

// Methods
const generarReporte = async () => {
  if (!fechaInicio.value || !fechaFin.value || !selectedProveedor.value) {
    return
  }
  await fetchCompras(fechaInicio.value, fechaFin.value)

  appliedProveedor.value = selectedProveedor.value

  const cantidadResultados = filteredCompras.value.length

  if (cantidadResultados > 0) {
    $q.notify({
      type: 'positive',
      message: `Se encontraron ${cantidadResultados} compras del proveedor seleccionado`,
      position: 'top-right',
      timeout: 2000,
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'No se encontraron compras para el proveedor en este rango de fechas',
      position: 'top-right',
      timeout: 2000,
    })
  }
}

const generarPDF = () => {
  if (filteredCompras.value.length === 0) {
    $q.notify({
      message: 'No hay datos para generar el reporte',
      color: 'warning',
      icon: 'warning',
    })
    return
  }

  // Obtener las columnas visibles de la tabla
  const visibleColumnsFromTable = miTabla.value?.obtenerColumnasVisibles() || []

  const filters = {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    proveedor: selectedProveedor.value,
  }

  const doc = PDF_REPORTE_COMPRAS_GENERAL(filteredCompras.value, filters, visibleColumnsFromTable)
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

const generarExcel = () => {
  if (filteredCompras.value.length === 0) {
    $q.notify({
      message: 'No hay datos para exportar',
      color: 'warning',
      icon: 'warning',
    })
    return
  }

  const dataToExport = filteredCompras.value.map((item, index) => ({
    'N°': index + 1,
    'Código Proveedor': item.codigoProveedor,
    Proveedor: item.proveedor,
    'Fecha Ingreso': item.fechaIngreso,
    'Nombre Ingreso': item.nombreIngreso,
    'N° Factura': item.nFactura,
    Almacén: item.nombreAlmacen,
    'Total Ingreso': parseFloat(item.totalIngreso || 0),
    Autorización: item.autorizacion,
    Estado: item.estado,
  }))

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Compras')

  XLSX.writeFile(wb, `Reporte_Compras_${fechaInicio.value}_${fechaFin.value}.xlsx`)
}

const verDetallePDF = async (idIngreso) => {
  selectedIdIngreso.value = idIngreso
  const detalle = await fetchDetalleCompra(idIngreso)
  console.log('detalle', detalle)
  if (detalle) {
    // Generar PDF
    const doc = PDF_DETALLE_COMPRA_PROVEEDOR(detalleCompra.value)

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

const formatCurrency = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

async function loadRows() {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa || 'c0c7c76d30bd3dcaefc96f40275bdc0a'
    const response = await api.get(`listaProveedor/${idempresa}`)

    const data = response.data
    if (Array.isArray(data)) {
      // If elements are objects, try to find a name property
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        proveedoresList.value = data
          .map((p) => {
            const nombre = p.nombre || p.proveedor || JSON.stringify(p)
            const nit = p.nit ? ` ${p.nit}` : ''
            return `${nit}-${nombre}`
          })
          .sort()
      } else {
        proveedoresList.value = data.sort()
      }
    } else {
      proveedoresList.value = []
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos de proveedores',
    })
  }
}

// Initialize dates on mount
onMounted(async () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')

  // Set default to first day of current month and today
  fechaInicio.value = `${year}-${month}-01`
  fechaFin.value = `${year}-${month}-${day}`

  await loadRows()
})

// Cleanup on unmount
onMounted(async () => {
  await divisaActiva.cargarDivisaActiva()

  if (!divisaActiva.divisa) {
    console.error('No se pudo cargar la divisa')
    return
  }
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
