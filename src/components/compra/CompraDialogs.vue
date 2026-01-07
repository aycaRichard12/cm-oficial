<template>
  <div>
    <q-dialog
      :model-value="mostrarModal"
      @update:model-value="$emit('update:mostrarModal', $event)"
      full-width
      full-height
    >
    
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="$emit('update:mostrarModal', false)" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      :model-value="credito"
      @update:model-value="$emit('update:credito', $event)"
    >
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">Registrar Datos para Credito</div>
          <q-btn icon="close" dense flat round @click="$emit('update:credito', false)" />
        </q-card-section>
        <q-card-section>
          <pagos-credito :compra="compra" @cerrar="$emit('cerrarCredito')"></pagos-credito>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import pagosCredito from './pagosCredito.vue'

defineProps({
  mostrarModal: {
    type: Boolean,
    default: false,
  },
  pdfData: {
    type: String,
    default: null,
  },
  credito: {
    type: Boolean,
    default: false,
  },
  compra: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['update:mostrarModal', 'update:credito', 'cerrarCredito'])
</script>
