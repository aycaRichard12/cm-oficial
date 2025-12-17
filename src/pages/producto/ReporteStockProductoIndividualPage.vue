<template>
  <q-page padding>
    <div class="col-12 q-mb-md">
      <div class="row items-center">
        <!-- Botón Volver -->
        <!-- <q-btn
          color="secondary"
          class="btn-res"
          id="btnregistrarcompra"
          to="/registrarcompra"
          icon="arrow_back"
          label="Volver"
          no-caps
        /> -->

        <!-- Título -->
        <div class="titulo q-ma-md">Stock Producto Individual</div>
      </div>
    </div>

    <ReporteStockProductosIndividual />
  </q-page>
</template>
<script setup>
import ReporteStockProductosIndividual from 'src/components/producto/reportes/ReporteStockProductosIndividual.vue'
</script>
