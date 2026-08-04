<template>
  <div class="row items-center justify-between q-mb-sm">
    <!-- Botones Reportes -->
    <div class="col-8 q-mt-lg flex justify-end q-gutter-sm">
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
  </div>
</template>

<script setup>
defineEmits(['imprimirReporte', 'exportarExcel'])
</script>
