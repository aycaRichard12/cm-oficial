<template>
  <q-dialog v-model="localShow" transition-show="scale" transition-hide="scale">
    <q-card class="column full-height" style="width: 90vw; max-width: 900px; height: 80vh; max-height: 90vh;">
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <div class="text-h6">
          <q-icon name="place" class="q-mr-sm" />
          Ubicación Registrada
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup class="text-white" />
      </q-card-section>

      <q-card-section class="col q-pa-none relative-position">
        <InventarioExteriorMapa
           :latitud="latitud"
           :longitud="longitud"
           :readonly="true"
           class="absolute-full"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          flat 
          icon="map" 
          label="Abrir en Google Maps" 
          color="primary" 
          :href="googleMapsUrl" 
          target="_blank" 
        />
        <q-btn flat label="Cerrar" color="grey" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import InventarioExteriorMapa from './InventarioExteriorMapa.vue'

const props = defineProps({
  modelValue: Boolean,
  latitud: [Number, String],
  longitud: [Number, String]
})

const emit = defineEmits(['update:modelValue'])

const localShow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${props.latitud},${props.longitud}`
})
</script>
