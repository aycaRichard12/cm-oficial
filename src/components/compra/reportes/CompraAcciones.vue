<template>
  <!-- Botones Reportes -->
  <div class="col-8 q-mt-lg flex justify-between q-gutter-sm q-mb-lg">
    <!-- Recargar -->
    <q-btn
      color="primary"
      outline
      class="btn-res"
      @click="$emit('recargar')"
      id="btnRecargarReporte"
      :loading="loading"
    >
      <q-icon name="refresh" class="icono" />
      <span class="texto">Recargar</span>
    </q-btn>

    <!-- PDF -->
    <q-btn
      color="negative"
      outline
      class="btn-res"
      @click="$emit('imprimirReporte')"
      id="btnImprimirPDF"
    >
      <q-icon name="picture_as_pdf" class="icono" />
      <span class="texto">Vista Previa PDF</span>
    </q-btn>

    <!-- Excel -->
    <q-btn
      color="positive"
      outline
      class="btn-res"
      @click="$emit('exportarExcel')"
      id="btnExportarExcel"
    >
      <q-icon name="table_view" class="icono" />
      <span class="texto">Exportar Excel</span>
    </q-btn>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
})
defineEmits(['imprimirReporte', 'exportarExcel', 'recargar'])
</script>
