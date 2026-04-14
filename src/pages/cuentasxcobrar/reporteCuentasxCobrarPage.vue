<template>
  <q-page ref="pageRef" class="q-pa-md bg-grey-1">
    <!-- Header and Filters Card -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title class="text-weight-bold"> Configuración de Reporte </q-toolbar-title>
      </q-toolbar>

      <q-card-section class="q-pt-sm q-pb-md">
        <q-form @submit.prevent="generateReport">
          <div class="row q-col-gutter-md items-center justify-between">
            <!-- Selector de Tipo -->
            <div class="col-12 col-sm-auto">
              <div class="column items-center">
                <div class="text-caption text-grey-7 q-mb-xs">Tipo de Reporte</div>
                <q-toggle
                  v-model="tipoReporte"
                  color="primary"
                  size="lg"
                  dense
                  @update:model-value="cambiarTipoReporteLabel"
                />
                <div class="text-weight-bold text-primary">
                  {{ tipoReporte ? 'Al Corte' : 'Por Periodo' }}
                </div>
              </div>
            </div>

            <!-- Inputs de Fecha -->
            <div class="col-12 col-sm row q-col-gutter-sm justify-center">
              <div v-if="!tipoReporte" class="col-12 col-sm-5 max-width-200">
                <q-input
                  v-model="startDate"
                  label="Fecha Inicio"
                  type="date"
                  dense
                  outlined
                  stack-label
                  :rules="[(val) => !!val || 'Requerido']"
                  hide-bottom-space
                  id="fechaini"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-5 max-width-200">
                <q-input
                  v-model="endDate"
                  label="Fecha Fin"
                  type="date"
                  dense
                  outlined
                  stack-label
                  :rules="!tipoReporte ? [validateEndDate] : [(val) => !!val || 'Requerido']"
                  hide-bottom-space
                  id="fechafin"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Botón Generar -->
            <div class="col-12 col-sm-auto text-center">
              <q-btn
                id="btngenerarreportecredito"
                label="Generar Reporte"
                color="primary"
                icon="analytics"
                unelevated
                padding="8px 20px"
                @click="generateReport"
                :loading="loading"
                :disable="!idmd5 || (!startDate && !tipoReporte) || !endDate"
                class="full-width-xs shadow-1"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <!-- Alert Banners -->
      <q-card-section v-if="!idmd5 || reportError" class="q-pt-none">
        <q-banner v-if="!idmd5" dense rounded class="bg-warning text-dark q-mb-sm">
          <template v-slot:avatar>
            <q-icon name="warning" color="orange" />
          </template>
          No se encontró sesión de usuario válida.
        </q-banner>

        <q-banner v-if="reportError" dense rounded class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ reportError }}
        </q-banner>
      </q-card-section>
    </q-card>

    <!-- Table Results Card -->
    <q-card flat bordered class="shadow-2">
      <q-card-section class="q-py-sm bg-grey-2 border-bottom">
        <div class="row justify-between items-center no-wrap">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="summarize" color="primary" size="sm" />
            <div class="text-subtitle2 text-weight-medium text-grey-8">
              {{
                processedReportData.length > 0
                  ? `Total: ${processedReportData.length} registros`
                  : 'Resultados'
              }}
            </div>
          </div>

          <div class="row q-gutter-sm">
            <q-btn
              id="btnexportarexcelreportecredito"
              icon="file_download"
              label="Excel"
              color="positive"
              unelevated
              dense
              padding="xs md"
              @click="exportToXLSX"
              :disable="processedReportData.length === 0 || loading"
            >
              <q-tooltip>Exportar a Excel</q-tooltip>
            </q-btn>
            <q-btn
              id="btnpdfreportecredito"
              label="PDF"
              color="indigo"
              icon="picture_as_pdf"
              unelevated
              dense
              padding="xs md"
              @click="printFilteredTable"
              :disable="processedReportData.length === 0 || loading"
            >
              <q-tooltip>Exportar a PDF</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div ref="hijoRef" id="tablareportecreditos">
          <ReporteCreditosTable
            ref="tablaCreditosRef"
            :rows="processedReportData"
            :loading="loading"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- PDF Modal -->
    <q-dialog
      v-model="mostrarModal"
      full-width
      full-height
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="column no-wrap" style="background: rgba(0, 0, 0, 0.8)">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Vista Previa del Reporte</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col q-pa-none">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { date, useQuasar } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, decimas, redondear } from 'src/composables/FuncionesG'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { PDFreporteCreditos } from 'src/utils/pdfReportGenerator'
import { exportToXLSX_Reporte_Creditos } from 'src/utils/XCLReportImport'
import ReporteCreditosTable from 'src/components/cuentasxCobrar/Reportes/ReporteCreditosTable.vue'
import { primerDiaDelMes } from 'src/composables/FuncionesG'

const mostrarModal = ref(false)
const pdfData = ref(null)
const $q = useQuasar()
const almacenes = useAlmacenStore()
const tipoReporte = ref(false)

// --- Variables reactivas ---
const idmd5 = ref('')
const startDate = ref(primerDiaDelMes().toISOString().slice(0, 10))
const endDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const reportData = ref([])
const loading = ref(false)
const reportError = ref(null)
const hijoRef = ref(null)
const pageRef = ref(null)
const tablaCreditosRef = ref(null)

const keyEstado = {
  1: 'Activo',
  2: 'Finalizado',
  3: 'Atrasado',
  4: 'Anulado',
  5: '',
}

// Configuración de paginación
const pagination = ref({
  sortBy: 'fechaventa',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
})

async function scrollToCreditos() {
  await nextTick()

  if ($q.screen.lt.md && pageRef.value && hijoRef.value) {
    pageRef.value.$el.scrollTo({
      top: hijoRef.value.offsetTop,
      behavior: 'smooth',
    })
  }
}

const validateEndDate = (val) => {
  if (!val) return 'Seleccione una fecha válida'
  if (startDate.value && val < startDate.value) {
    return 'La fecha fin no puede ser menor que la fecha inicio'
  }
  return true
}

const cambiarTipoReporteLabel = () => {
  // Opcional: podrías limpiar la fecha de inicio al cambiar a "Al Corte" si lo deseas
}
const printFilteredTable = () => {
  const data = tablaCreditosRef.value?.obtenerDatosFiltrados() || []
  const visibleColumns = tablaCreditosRef.value?.obtenerColumnasVisibles() || []
  const doc = PDFreporteCreditos(data, startDate.value, endDate.value, null, null, visibleColumns)

  // Liberar URL anterior si existe
  if (pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
  }

  const blob = doc.output('blob')
  pdfData.value = URL.createObjectURL(blob)
  mostrarModal.value = true
}

// Limpiar la URL de objeto al cerrar el modal o desmontar el componente
watch(mostrarModal, (val) => {
  if (!val && pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
    pdfData.value = null
  }
})

onBeforeUnmount(() => {
  if (pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
  }
})

const processedReportData = computed(() => {
  let data = [...reportData.value]
  return mapRows(data)
})

const mapRows = (data) => {
  if (data.length === 0) return []

  return data.map((row, index) => {
    let fecha1 = new Date()
    let fecha2 = new Date(row.fechalimite)

    fecha1 = Math.floor(fecha1.getTime() / (1000 * 3600 * 24))
    fecha2 = Math.floor(fecha2.getTime() / (1000 * 3600 * 24))
    let dias = fecha1 - fecha2

    const almacen = almacenes.almacenes.find((a) => Number(a.idalmacen) === Number(row.idalmacen))

    return {
      numFactura: row.numFactura,
      tipo_cobro: row.tipo_cobro,
      idventa: row.idventa,
      idcredito: row.idcredito,
      idcliente: row.idcliente,
      numero: index + 1,
      fechaventa: cambiarFormatoFecha(row.fechaventa),
      razonsocial: row.razonsocial,
      sucursal: row.sucursal,
      almacen: almacen ? almacen.almacen : 'N/A',
      fechalimite: cambiarFormatoFecha(row.fechalimite),
      ncuotas: row.ncuotas,
      cuotasprocesadas: row.cuotaspagadas || 0,
      valorcuotas: decimas(redondear(parseFloat(row.valorcuotas))),
      totalventa: decimas(redondear(parseFloat(row.montoventa))),
      totalcobrado:
        row.totalcobrado == null ? '0.00' : decimas(redondear(parseFloat(row.totalcobrado))),
      saldo: decimas(redondear(parseFloat(row.saldo))),
      totalatrasado: Number(row.estado) === 3 ? decimas(redondear(parseFloat(row.saldo))) : '0.00',
      totalanulado: Number(row.estado) === 4 ? decimas(redondear(parseFloat(row.saldo))) : '0.00',
      moradias: dias < 0 ? '0.00' : decimas(dias),
      estado: row.estado,
      estadoLabel: keyEstado[Number(row.estado)] || '',
      idalmacen: row.idalmacen,
      montoventa: row.montoventa,
      cuotaspagadas: row.cuotaspagadas,
      idsucursal: row.idsucursal,
    }
  })
}

const generateReport = async () => {
  if (!idmd5.value) {
    $q.notify({ type: 'negative', message: 'No hay ID MD5 disponible.' })
    return
  }
  if (!startDate.value || !endDate.value) {
    $q.notify({ type: 'negative', message: 'Seleccione fechas.' })
    return
  }

  loading.value = true
  reportError.value = null
  reportData.value = []

  try {
    let point = tipoReporte.value
      ? `reporteCreditosAlCorte/${idmd5.value}/${startDate.value}/${endDate.value}`
      : `reportecreditos/${idmd5.value}/${startDate.value}/${endDate.value}`

    console.log(point)
    const response = await api.get(point)

    if (response.data.estado === 'exito') {
      reportData.value = response.data.data
      pagination.value.rowsNumber = reportData.value.length

      if (reportData.value.length === 0) {
        $q.notify({ type: 'info', message: 'Sin registros.', timeout: 2000 })
      } else {
        $q.notify({
          type: 'positive',
          message: `Éxito: ${reportData.value.length} registros.`,
          timeout: 1000,
        })
      }
      scrollToCreditos()
    } else {
      reportError.value = response.data.mensaje || 'Error API.'
    }
  } catch (error) {
    console.error(error)
    reportError.value = 'Error al obtener el reporte.'
  } finally {
    loading.value = false
  }
}

const exportToXLSX = () => {
  const data = tablaCreditosRef.value?.obtenerDatosFiltrados() || []
  const visibleColumns = tablaCreditosRef.value?.obtenerColumnasVisibles() || []
  if (data.length === 0) return

  $q.notify({ message: 'Preparando Excel...', color: 'green', icon: 'file_download' })
  exportToXLSX_Reporte_Creditos(data, startDate.value, endDate.value, null, null, visibleColumns)
}

onMounted(async () => {
  const storedMd5 = idusuario_md5()
  if (storedMd5) {
    idmd5.value = storedMd5
    almacenes.listaAlmacenes()
  }
})
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
  width: 100%;
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
@media (max-width: 599px) {
  .full-width-xs {
    width: 100%;
  }
}
</style>
