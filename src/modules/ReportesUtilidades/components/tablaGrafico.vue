<template>
  <div>
    <!-- Iteramos sobre las secciones con datos -->
    <div v-for="seccion in secciones" :key="seccion.key" class="q-mb-xl">
      <q-card flat bordered class="erp-report-card">
        <!-- Encabezado de sección -->
        <q-card-section class="report-header q-px-lg q-pt-lg q-pb-md">
          <div class="text-h5 text-weight-bold text-primary">{{ seccion.label }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
            Período: {{ seccion.periodoLabel }}
            <q-separator vertical spaced="md" />
            <q-icon name="monetization_on" size="xs" class="q-mr-xs" />
            Moneda: {{ simbolo }}
          </div>
        </q-card-section>

        <q-separator />

        <!-- Tarjetas KPI de la sección -->
        <q-card-section class="kpi-section q-px-lg q-py-md">
          <div class="row q-col-gutter-md">
            <div class="col-6 col-sm-3" v-for="kpi in seccion.kpiCards" :key="kpi.label">
              <q-card flat :class="['kpi-card', kpi.colorClass]">
                <q-card-section class="q-pa-md text-center">
                  <q-icon :name="kpi.icon" size="28px" class="q-mb-sm" />
                  <div class="text-caption text-grey-7 text-weight-medium">{{ kpi.label }}</div>
                  <div class="text-h6 text-weight-bold q-mt-xs">{{ kpi.value }}</div>
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

        <!-- Tabla + Gráfico lado a lado -->
        <div class="row q-px-lg q-py-md items-stretch">
          <!-- Columna izquierda: Tabla -->
          <div class="col-12 q-pr-md-none q-pr-md-md">
            <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
              <q-icon name="table_chart" size="sm" class="q-mr-sm text-primary" />
              Desglose por Período
            </div>
            <div class="table-scroll-container">
              <BaseFilterableTable
                :rows="seccion.sortedRows"
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
          <div class="col-12">
            <q-card-section
              v-if="seccion.chartSeries.length && seccion.chartSeries[0]?.data?.length"
              class="chart-section q-pa-none"
            >
              <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
                <q-icon name="bar_chart" size="sm" class="q-mr-sm text-primary" />
                Evolución Comparativa
              </div>
              <div class="chart-container">
                <VueApexCharts
                  type="bar"
                  height="380"
                  :options="seccion.chartOptions"
                  :series="seccion.chartSeries"
                />
              </div>
            </q-card-section>
            <q-card-section v-else class="chart-section q-pa-md text-center">
              <q-icon name="bar_chart" size="64px" color="grey-5" />
              <div class="text-h6 text-grey-5 q-mt-md">Sin datos para graficar</div>
            </q-card-section>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Estado vacío general -->
    <div v-if="!secciones.length" class="text-center q-pa-xl">
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="text-h6 text-grey-5 q-mt-md">Sin datos disponibles</div>
      <div class="text-caption text-grey-5 q-mt-sm">
        No se encontraron registros en el período seleccionado
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  title: { type: String, default: 'Reporte de Rentabilidad' },
  rows: { type: [Array, Object], required: true },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'periodo' },
  rowsPerPage: { type: Number, default: 15 },
  divisa: { type: Object, default: () => ({ simbolo: 'Bs', codigo: 'BOB' }) },
})

const ArrayHeaders = [
  'periodo',
  'venta_bruta',
  'venta_neta',
  'costo_ventas',
  'utilidad',
  'margen_neta',
]
const summationHeaders = ['venta_bruta', 'venta_neta', 'costo_ventas', 'utilidad']

const simbolo = computed(() => props.divisa?.simbolo || 'Bs')

/* ------------------------------------------------------------------ */
/*  Construir los datos de cada sección (total, venta, cotización)
/* ------------------------------------------------------------------ */
function getSectionLabel(key) {
  switch (key) {
    case 'total':
      return 'Total'
    case 'venta':
      return 'Venta'
    case 'cotizacion':
      return 'Cotización'
    default:
      return key
  }
}

function buildSectionData(label, rows) {
  // Ordenar por período
  const sorted = [...rows].sort((a, b) =>
    String(a.periodo || '').localeCompare(String(b.periodo || '')),
  )

  // Calcular totales para KPIs
  const sum = (key) => sorted.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
  const ventaBruta = sum('venta_bruta')
  const ventaNeta = sum('venta_neta')
  const costoVentas = sum('costo_ventas')
  const utilidad = sum('utilidad')
  const margen = ventaNeta > 0 ? (utilidad / ventaNeta) * 100 : 0

  const fmt = (val) =>
    `${simbolo.value} ${Number(val).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const kpiCards = [
    {
      label: 'Venta Bruta',
      value: fmt(ventaBruta || 0),
      icon: 'shopping_cart',
      colorClass: 'kpi-blue',
      porcentaje: null,
    },
    {
      label: 'Venta Neta',
      value: fmt(ventaNeta || 0),
      icon: 'receipt_long',
      colorClass: 'kpi-teal',
      porcentaje: null,
    },
    {
      label: 'Costo de Ventas',
      value: fmt(costoVentas || 0),
      icon: 'inventory_2',
      colorClass: 'kpi-red',
      porcentaje: null,
    },
    {
      label: 'Margen Neto',
      value: `${margen.toFixed(2)}%`,
      icon: 'trending_up',
      colorClass: 'kpi-green',
      porcentaje: margen || 0,
    },
  ]

  // Series del gráfico
  const chartSeries = [
    { name: 'Venta Bruta', data: sorted.map((r) => Number(r.venta_bruta) || 0) },
    { name: 'Venta Neta', data: sorted.map((r) => Number(r.venta_neta) || 0) },
    { name: 'Costo Ventas', data: sorted.map((r) => Number(r.costo_ventas) || 0) },
    { name: 'Utilidad', data: sorted.map((r) => Number(r.utilidad) || 0) },
  ]

  // Opciones del gráfico específicas para esta sección
  // Dentro de buildSectionData, reemplaza el objeto chartOptions por:
  const chartOptions = {
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
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
        zoomedArea: {
          fill: { color: '#90CAF9', opacity: 0.4 },
          stroke: { color: '#1565C0', opacity: 0.6, width: 1 },
        },
      },
      selection: {
        enabled: true,
        type: 'x',
        fill: { color: '#24292e', opacity: 0.1 },
        stroke: { width: 1, color: '#24292e', opacity: 0.3 },
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
        animateGradually: { enabled: true, delay: 100 },
      },
      background: 'transparent',
    },
    // ... el resto de opciones (colors, plotOptions, etc.) permanece igual
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
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    xaxis: {
      categories: sorted.map((r) => r.periodo),
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
            ? `${simbolo.value} ${Number(val).toLocaleString('es-BO', {
                minimumFractionDigits: 2,
              })}`
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
      style: { fontSize: '13px', fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' },
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
      text: 'No hay datos disponibles',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontSize: '16px',
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#90A4AE',
      },
    },
  }

  // Período label
  const periodos = sorted.map((r) => r.periodo).filter(Boolean)
  const periodoLabel =
    periodos.length === 0
      ? 'Sin datos'
      : periodos.length === 1
        ? periodos[0]
        : `${periodos[0]} — ${periodos[periodos.length - 1]}`

  return {
    key: label,
    label,
    periodoLabel,
    sortedRows: sorted,
    kpiCards,
    chartSeries,
    chartOptions,
  }
}

const secciones = computed(() => {
  // Si es un array, lo tratamos como "Venta" (compatibilidad)
  if (Array.isArray(props.rows)) {
    return [buildSectionData('Venta', props.rows)]
  }
  if (!props.rows || typeof props.rows !== 'object') return []

  const keys = ['total', 'venta', 'cotizacion']
  return keys
    .map((key) => {
      const arr = props.rows[key]
      if (!arr || !arr.length) return null
      return buildSectionData(getSectionLabel(key), arr)
    })
    .filter(Boolean)
})
</script>

<style scoped>
/* (Mantén EXACTAMENTE los mismos estilos que tenías antes, no los modifiqué) */
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
.report-header {
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
}
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
.table-scroll-container {
  max-height: 380px;
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
.erp-table-fullwidth :deep(tr.highlighted-row td) {
  background: #fff3e0 !important;
  transition: background 0.3s ease;
  font-weight: 500;
  box-shadow: inset 0 0 0 1px #ff9800;
}
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
