<template>
  <q-card-section v-if="hasData" class="bg-grey-2">
    <div class="row q-col-gutter-md">
      <div class="col-auto">
        <q-btn
          color="positive"
          :label="$t('ui.exportar-a-excel-1569c7')"
          icon="file_download"
          @click="$emit('exportar-excel')"
          flat
          id="botonExcel"
        />
      </div>
      <div class="col-auto">
        <q-btn
          color="info"
          :label="$t('ui.previsualizar-pdf-05088d')"
          icon="picture_as_pdf"
          @click="$emit('exportar-pdf')"
          flat
          id="botonPdf"
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup>
defineProps({
  hasData: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['exportar-excel', 'exportar-pdf'])
</script>
