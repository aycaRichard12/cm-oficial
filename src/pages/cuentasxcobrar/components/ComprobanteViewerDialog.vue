<template>
  <q-dialog v-model="model" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column full-height">
      <q-card-section class="bg-primary text-white row items-center q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Visor de Comprobante</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="col q-pa-none flex flex-center bg-grey-3 overflow-hidden">
        <iframe
          v-if="imagenSeleccionada && imagenSeleccionada.toLowerCase().includes('.pdf')"
          :src="imagenSeleccionada"
          class="full-width full-height border-none"
        ></iframe>
        <q-img v-else :src="imagenSeleccionada" class="full-width full-height" fit="contain" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  imagenSeleccionada: String
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
