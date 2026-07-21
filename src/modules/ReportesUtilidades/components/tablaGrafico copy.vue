<template>
  <q-card flat bordered class="erp-report-card">
    <!-- ========== ENCABEZADO PRINCIPAL ========== -->
    <q-card-section class="report-header q-px-lg q-pt-lg q-pb-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-no-wrap">
            {{ title || 'Reporte de Rentabilidad' }}
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
            Período: {{ periodoLabel }}
            <q-separator vertical spaced="md" />
            <q-icon name="monetization_on" size="xs" class="q-mr-xs" />
            Moneda: {{ simbolo }}
          </div>
        </div>
        <div class="col-auto">
          <div class="row q-gutter-sm"></div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- ========== TARJETAS KPI DE RESUMEN ========== -->
    <q-card-section class="kpi-section q-px-lg q-py-md">
      <div class="row q-col-gutter-md">
        <div class="col-6 col-sm-3" v-for="kpi in kpiCards" :key="kpi.label">
          <q-card flat :class="['kpi-card', kpi.colorClass]">
            <q-card-section class="q-pa-md text-center">
              <q-icon :name="kpi.icon" size="28px" class="q-mb-sm" />
              <div class="text-caption text-grey-7 text-weight-medium">
                {{ kpi.label }}
              </div>
              <div class="text-h6 text-weight-bold q-mt-xs">
                {{ kpi.value }}
              </div>
              <div
                v-if="kpi.porcentaje !== null"
                :class="[
                  'text-caption q-mt-xs kpi-badge',
                  kpi.porcentaje >= 0 ? 'positive' : 'negative',
                ]"
              >
                <q-icon
                  :name="kpi.porcentaje >= 0 ? 'trending_up' : 'trending_down'"
                  size="xs"
                  class="q-mr-xs"
                />
                {{ Math.abs(kpi.porcentaje).toFixed(1) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- ========== SECCIÓN TABLA + GRÁFICO (LADO A LADO) ========== -->
    <div class="row q-px-lg q-py-md items-stretch">
      <!-- Columna izquierda: Tabla -->
      <div class="col-12 col-md-6 q-pr-md-none q-pr-md-md">
        <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
          <q-icon name="table_chart" size="sm" class="q-mr-sm text-primary" />
          Desglose por Período
        </div>
        <div class="table-scroll-container">
          <BaseFilterableTable
            ref="refHijo"
            :rows="sortedRows"
            :columns="columns"
            :row-key="rowKey"
            :array-headers="ArrayHeaders"
            :sum-columns="summationHeaders"
            flat
            class="erp-table-fullwidth"
          />
        </div>
      </div>

      <!-- Separador vertical solo en pantallas grandes -->
      <div class="col-auto gt-sm flex items-center q-px-md">
        <q-separator vertical class="full-height" />
      </div>

      <!-- Columna derecha: Gráfico -->
      <div class="col-12 col-md-5">
        <q-card-section
          v-if="chartSeries.length && chartSeries[0]?.data?.length"
          class="chart-section q-pa-none"
        >
          <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
            <q-icon name="bar_chart" size="sm" class="q-mr-sm text-primary" />
            Evolución Comparativa
            <q-tooltip>Haz clic en una barra para ver el detalle en la tabla</q-tooltip>
          </div>
          <div class="chart-container">
            <VueApexCharts
              type="bar"
              height="380"
              :options="chartOptions"
              :series="chartSeries"
              @dataPointSelection="onDataPointSelection"
            />
          </div>
        </q-card-section>
        <q-card-section v-else class="chart-section q-pa-md text-center">
          <q-icon name="bar_chart" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-5 q-mt-md">Sin datos para graficar</div>
          <div class="text-caption text-grey-5 q-mt-sm">
            No se encontraron registros en el período seleccionado
          </div>
        </q-card-section>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  title: { type: String, default: 'Reporte de Rentabilidad' },
  // MODIFICADO: acepta tanto Array como Object
  rows: { type: [Array, Object], required: true },
  columns: { type: Array, required: true },
  // MODIFICADO: valor por defecto 'periodo' para coincidir con los datos
  rowKey: { type: String, default: 'periodo' },
  rowsPerPage: { type: Number, default: 15 },
  divisa: { type: Object, default: () => ({ simbolo: 'Bs', codigo: 'BOB' }) },
})

const refHijo = ref(null)

defineExpose({
  obtenerDatos: () => ejecutarDesdePadre(),
  getActiveFiltersReport,
})

function getActiveFiltersReport() {
  return refHijo.value?.getActiveFiltersReport() ?? {}
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value?.obtenerDatosFiltrados()
  console.log(resultado)
  return resultado
}

/* ------------------------------------------------------------------ */
/*  Constantes
/* ------------------------------------------------------------------ */
const ArrayHeaders = [
  'periodo',
  'venta_bruta',
  'venta_neta',
  'costo_ventas',
  'utilidad',
  'margen_neta',
]

const summationHeaders = ['venta_bruta', 'venta_neta', 'total_vendido', 'costo_ventas', 'utilidad']

/* ------------------------------------------------------------------ */
/*  NUEVA: Normalización de datos de entrada
/* ------------------------------------------------------------------ */
const normalizedRows = computed(() => {
  // Si ya es un array, lo devolvemos directamente
  if (Array.isArray(props.rows)) return props.rows
  // Si es un objeto con las propiedades esperadas, extraemos el array adecuado
  if (props.rows && typeof props.rows === 'object') {
    // Priorizamos 'venta', luego 'total', finalmente array vacío
    return props.rows.venta || props.rows.total || []
  }
  // En cualquier otro caso, devolvemos array vacío
  return []
})

/* ------------------------------------------------------------------ */
/*  Ordenamiento automático por período (basado en normalizedRows)
/* ------------------------------------------------------------------ */
const sortedRows = computed(() => {
  if (!normalizedRows.value.length) return []
  return [...normalizedRows.value].sort((a, b) => {
    const strA = String(a.periodo || '')
    const strB = String(b.periodo || '')
    return strA.localeCompare(strB)
  })
})

/* ------------------------------------------------------------------ */
/*  Computed: símbolo de moneda
/* ------------------------------------------------------------------ */
const simbolo = computed(() => props.divisa?.simbolo || 'Bs')

/* ------------------------------------------------------------------ */
/*  Computed: etiqueta del período
/* ------------------------------------------------------------------ */
const periodoLabel = computed(() => {
  if (!sortedRows.value.length) return 'Sin datos'
  const periodos = sortedRows.value.map((r) => r.periodo).filter(Boolean)
  if (!periodos.length) return 'Sin datos'
  if (periodos.length === 1) return periodos[0]
  return `${periodos[0]} — ${periodos[periodos.length - 1]}`
})

/* ------------------------------------------------------------------ */
/*  Computed: totales para KPI
/* ------------------------------------------------------------------ */
const totales = computed(() => {
  if (!sortedRows.value.length) return {}
  const sum = (key) => sortedRows.value.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
  const ventaBruta = sum('venta_bruta')
  const ventaNeta = sum('venta_neta')
  const costoVentas = sum('costo_ventas')
  const utilidad = sum('utilidad')
  const margen = ventaNeta > 0 ? (utilidad / ventaNeta) * 100 : 0
  return { ventaBruta, ventaNeta, costoVentas, utilidad, margen }
})

/* ------------------------------------------------------------------ */
/*  Computed: tarjetas KPI
/* ------------------------------------------------------------------ */
const kpiCards = computed(() => {
  const t = totales.value
  const fmt = (val) =>
    `${simbolo.value} ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return [
    {
      label: 'Venta Bruta',
      value: fmt(t.ventaBruta || 0),
      icon: 'shopping_cart',
      colorClass: 'kpi-blue',
      porcentaje: null,
    },
    {
      label: 'Venta Neta',
      value: fmt(t.ventaNeta || 0),
      icon: 'receipt_long',
      colorClass: 'kpi-teal',
      porcentaje: null,
    },
    {
      label: 'Costo de Ventas',
      value: fmt(t.costoVentas || 0),
      icon: 'inventory_2',
      colorClass: 'kpi-red',
      porcentaje: null,
    },
    {
      label: 'Margen Neto',
      value: `${(t.margen || 0).toFixed(2)}%`,
      icon: 'trending_up',
      colorClass: 'kpi-green',
      porcentaje: t.margen || 0,
    },
  ]
})

/* ------------------------------------------------------------------ */
/*  Computed: series del gráfico (usa sortedRows)
/* ------------------------------------------------------------------ */
const chartSeries = computed(() => {
  if (!sortedRows.value.length) return []
  const labels = [
    { key: 'venta_bruta', name: `Venta Bruta` },
    { key: 'venta_neta', name: `Venta Neta` },
    { key: 'costo_ventas', name: `Costo Ventas` },
    { key: 'utilidad', name: `Utilidad` },
  ]
  return labels.map((label) => ({
    name: label.name,
    data: sortedRows.value.map((r) => Number(r[label.key]) || 0),
  }))
})

/* ------------------------------------------------------------------ */
/*  Computed: opciones del gráfico
/* ------------------------------------------------------------------ */
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 380,
    stacked: false,
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: false,
        reset: true,
      },
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 600,
      animateGradually: { enabled: true, delay: 100 },
    },
    background: 'transparent',
  },
  colors: ['#1565C0', '#00897B', '#E53935', '#43A047'],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      borderRadiusApplication: 'end',
      columnWidth: '55%',
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['transparent'],
  },
  xaxis: {
    categories: sortedRows.value.map((r) => r.periodo) || [],
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px',
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 500,
        colors: '#546E7A',
      },
    },
    axisBorder: { show: true, color: '#CFD8DC' },
    axisTicks: { show: true, color: '#CFD8DC' },
  },
  yaxis: {
    title: {
      text: `Importe (${simbolo.value})`,
      style: {
        fontSize: '13px',
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 500,
        color: '#607D8B',
      },
    },
    labels: {
      formatter: (val) =>
        val != null
          ? `${simbolo.value} ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
          : `${simbolo.value} 0.00`,
      style: {
        fontSize: '11px',
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        colors: '#78909C',
      },
    },
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val) =>
        `${simbolo.value} ${Number(val).toLocaleString('es-BO', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    style: {
      fontSize: '13px',
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 500,
    markers: { radius: 12 },
    itemMargin: { horizontal: 16, vertical: 4 },
  },
  grid: {
    borderColor: '#ECEFF1',
    strokeDashArray: 4,
    padding: { top: 0, right: 16, bottom: 0, left: 16 },
  },
  noData: {
    text: 'No hay datos disponibles para el gráfico',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      fontSize: '16px',
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#90A4AE',
    },
  },
}))

/* ------------------------------------------------------------------ */
/*  Interacción gráfico → tabla
/* ------------------------------------------------------------------ */
const highlightedRowKey = ref(null)

function onDataPointSelection(event, chartContext, config) {
  const { dataPointIndex } = config
  const periodo = sortedRows.value[dataPointIndex]?.periodo
  if (!periodo) return

  // Resaltar la fila correspondiente en la tabla
  highlightedRowKey.value = periodo
  setTimeout(() => {
    highlightedRowKey.value = null
  }, 3000)
}
</script>

<style scoped>
/* =========================================================== */
/*  TARJETA PRINCIPAL
/* =========================================================== */
.erp-report-card {
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}
.erp-report-card:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.06) !important;
}

/* =========================================================== */
/*  ENCABEZADO
/* =========================================================== */
.report-header {
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
}

/* =========================================================== */
/*  TARJETAS KPI
/* =========================================================== */
.kpi-section {
  background: #fafbfc;
}

.kpi-card {
  border-radius: 14px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.06);
}

.kpi-blue {
  border-top: 4px solid #1565c0;
}
.kpi-teal {
  border-top: 4px solid #00897b;
}
.kpi-red {
  border-top: 4px solid #e53935;
}
.kpi-green {
  border-top: 4px solid #43a047;
}

.kpi-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
}
.kpi-badge.positive {
  background: #e8f5e9;
  color: #2e7d32;
}
.kpi-badge.negative {
  background: #ffebee;
  color: #c62828;
}

/* =========================================================== */
/*  SECCIÓN GRÁFICO (columna derecha ahora)
/* =========================================================== */
.chart-section {
  background: #ffffff;
  border-radius: 14px;
}

.chart-container {
  border-radius: 14px;
  background: #fafbfc;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* =========================================================== */
/*  SECCIÓN TABLA (columna izquierda ahora)
/* =========================================================== */
.table-scroll-container {
  max-height: 380px; /* Altura similar al gráfico */
  overflow-y: auto;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.erp-table-fullwidth :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.erp-table-fullwidth :deep(.q-table) {
  border-radius: 0;
}

.erp-table-fullwidth :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #455a64;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.erp-table-fullwidth :deep(td) {
  font-size: 0.9rem;
  color: #37474f;
}

.erp-table-fullwidth :deep(tr:hover td) {
  background: #f5f8ff !important;
}

/* Fila resaltada tras clic en gráfico */
.erp-table-fullwidth :deep(tr.highlighted-row td) {
  background: #fff3e0 !important;
  transition: background 0.3s ease;
  font-weight: 500;
  box-shadow: inset 0 0 0 1px #ff9800;
}

/* =========================================================== */
/*  RESPONSIVE
/* =========================================================== */
@media (max-width: 1023px) {
  .table-scroll-container {
    max-height: 350px;
  }
}

@media (max-width: 767px) {
  .report-header .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .report-header .col-auto {
    width: 100%;
  }
  .report-header .row.q-gutter-sm {
    justify-content: flex-start;
    width: 100%;
  }

  .kpi-section .row {
    flex-wrap: wrap;
  }
  .kpi-section .col-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .chart-container {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .kpi-section .col-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
