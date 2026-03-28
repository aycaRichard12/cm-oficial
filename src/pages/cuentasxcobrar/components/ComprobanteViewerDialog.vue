<template>
  <q-dialog v-model="model" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column full-height">
      <q-card-section class="bg-primary text-white row items-center q-py-sm">
        <q-icon :name="esPdf ? 'picture_as_pdf' : 'image'" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">
          Visor de {{ esPdf ? 'PDF' : 'Imagen' }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="col q-pa-none bg-grey-3 overflow-hidden relative-position">
        <template v-if="imagenSeleccionada">
          <iframe
            v-if="esPdf"
            :key="imagenSeleccionada"
            :src="imagenSeleccionada"
            class="full-width full-height border-none"
            style="min-height: 100%; position: absolute; top: 0; left: 0;"
            title="Visor PDF"
          ></iframe>
          <q-img 
            v-else 
            :src="imagenSeleccionada" 
            class="full-width full-height" 
            fit="contain" 
          />
        </template>
        <div v-else class="full-width full-height flex flex-center text-grey-7">
          <q-icon name="error_outline" size="md" class="q-mr-sm" />
          No se ha seleccionado ningún archivo
        </div>
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

const esPdf = computed(() => {
  if (!props.imagenSeleccionada) return false
  return props.imagenSeleccionada.toLowerCase().split('?')[0].endsWith('.pdf')
})
</script>
