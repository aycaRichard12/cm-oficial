<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized>
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="picture_as_pdf" size="sm" class="q-mr-sm" />
          Previsualización PDF
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-none full-height">
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          class="full-width full-height"
          style="border: none; min-height: calc(100vh - 50px)"
          title="Previsualización PDF"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pdfUrl: {
    type: String,
    default: null,
  },
})

defineEmits(['update:modelValue'])
</script>
