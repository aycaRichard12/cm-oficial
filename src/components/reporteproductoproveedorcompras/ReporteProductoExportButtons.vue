<template>
  <q-card-section v-if="hasData" class="bg-grey-2">
    <div class="row q-col-gutter-md">
      <div class="col-auto">
        <q-btn
          color="positive"
          label="Exportar a Excel"
          icon="file_download"
          @click="$emit('exportar-excel')"
          flat
        />
      </div>
      <div class="col-auto">
        <q-btn
          color="info"
          label="Previsualizar PDF"
          icon="picture_as_pdf"
          @click="$emit('exportar-pdf')"
          flat
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
