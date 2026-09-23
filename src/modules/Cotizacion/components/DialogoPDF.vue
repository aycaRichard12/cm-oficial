<template>
  <q-dialog
    :model-value="mostrar"
    @update:model-value="$emit('update:mostrar', $event)"
    full-width
    full-height
    transition-show="scale"
    transition-hide="scale"
    @hide="$emit('reiniciar')"
  >
    <q-card class="q-pa-none shadow-10" style="height: 100%; max-width: 100%; border-radius: 0">
      <q-card-section class="row items-center q-pb-none bg-dark text-white q-py-sm">
        <div class="text-h6 flex items-center q-px-sm">
          <q-icon name="picture_as_pdf" class="q-mr-sm text-red-4" size="md" /> Vista previa de PDF
        </div>
        <q-space />
        <q-btn flat round icon="close" v-close-popup class="bg-grey-8" size="sm" />
      </q-card-section>

      <q-separator color="grey-9" />
      <q-card-section class="q-pa-none bg-grey-3" style="height: calc(100% - 54px)">
        <iframe
          v-if="pdfData"
          :src="pdfData"
          style="width: 100%; height: 100%; border: none"
        ></iframe>
        <div v-else-if="isMobile && mobileFallbackUrl" class="mobile-success">
          <q-icon name="check_circle" color="positive" size="2em" />
          <p>
            Comprobante generado. Si no se abrió automáticamente, podés descargarlo manualmente.
          </p>
          <a :href="mobileFallbackUrl" download="comprobante.pdf" class="download-link"
            >Descargar comprobante</a
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  mostrar: Boolean,
  pdfData: String,
  isMobile: Boolean,
  mobileFallbackUrl: String,
})
defineEmits(['reiniciar', 'update:mostrar'])
</script>
