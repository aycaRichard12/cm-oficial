<template>
  <div class="row q-col-gutter-lg">
    <div class="col-xs-12 col-md-6">
      <q-card class="chart-card" flat>
        <q-card-section class="chart-header">
          <q-icon name="pie_chart" color="primary" size="24px" class="q-mr-md" />
          <div class="text-h6">{{ $t('ui.distribucion-de-inventario-6da390') }}</div>
        </q-card-section>
        <apexchart type="donut" :options="donutOptions" :series="distribucion.series" />
      </q-card>
    </div>
    <div class="col-xs-12 col-md-6">
      <q-card class="chart-card" flat>
        <q-card-section class="chart-header">
          <q-icon name="trending_down" color="negative" size="24px" class="q-mr-md" />
          <div class="text-h6">{{ $t('ui.top-10-menor-stock-30ce1d') }}</div>
        </q-card-section>
        <apexchart
          type="bar"
          :options="barMinOptions"
          :series="[{ name: 'Stock', data: topMenor.map((t) => t.stock) }]"
        />
      </q-card>
    </div>
    <div class="col-xs-12 col-md-6">
      <q-card class="chart-card" flat>
        <q-card-section class="chart-header">
          <q-icon name="trending_up" color="positive" size="24px" class="q-mr-md" />
          <div class="text-h6">{{ $t('ui.top-10-mayor-stock-4c7f2f') }}</div>
        </q-card-section>
        <apexchart
          type="bar"
          :options="barMaxOptions"
          :series="[{ name: 'Stock', data: topMayor.map((t) => t.stock) }]"
        />
      </q-card>
    </div>
    <div class="col-xs-12 col-md-6">
      <q-card class="chart-card" flat>
        <q-card-section class="chart-header">
          <q-icon name="category" color="info" size="24px" class="q-mr-md" />
          <div class="text-h6">{{ $t('ui.cantidad-por-categoria-edc05f') }}</div>
        </q-card-section>
        <apexchart
          type="bar"
          :options="categoriaOptions"
          :series="[{ name: 'Productos', data: stockCategoria.map((c) => c.cantidad) }]"
        />
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { computed } from 'vue'
import { useStock } from '../composables/useStock'

const { distribucionDonut, topMenorStock, topMayorStock, stockPorCategoria } = useStock()

const distribucion = computed(() => distribucionDonut.value)
const topMenor = computed(() => topMenorStock.value)
const topMayor = computed(() => topMayorStock.value)
const stockCategoria = computed(() => stockPorCategoria.value)

const donutOptions = {
  labels: distribucion.value.labels,
  colors: ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'],
  legend: { position: 'bottom' },
  responsive: [
    { breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } },
  ],
}

const barMinOptions = {
  xaxis: { categories: topMenor.value.map((t) => t.nombre), labels: { rotate: -45 } },
  colors: ['#e74c3c'],
  title: { text: i18nT('configProducto.unidadProducto.table.title') },
}
const barMaxOptions = {
  xaxis: { categories: topMayor.value.map((t) => t.nombre), labels: { rotate: -45 } },
  colors: ['#2ecc71'],
}
const categoriaOptions = {
  xaxis: { categories: stockCategoria.value.map((c) => c.categoria), labels: { rotate: -45 } },
}
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--cm-border);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px solid var(--cm-border);
  background: var(--cm-surface-2);
}

.chart-header .text-h6 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--cm-text);
}
</style>
