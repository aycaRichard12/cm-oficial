<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para reportes de inventario detallado -->
          <q-icon name="analytics" size="md" class="q-mr-sm" />
          {{ $t('ui.reporte-de-stock-individual-09d7e0') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.consulta-detallada-de-existencias-y-movimientos-por-367bef') }}
        </div>
      </div>
    </div>

    <ReporteStockProductosIndividual />
  </q-page>
</template>
<script setup>
import ReporteStockProductosIndividual from 'src/components/producto/reportes/ReporteStockProductosIndividual.vue'
</script>
