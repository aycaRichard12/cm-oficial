<template>
  <div class="row q-col-gutter-sm items-start">
    <div class="col-12 col-sm-6">
      <q-input
        v-model="modelInicial"
        label="Fecha Inicial"
        outlined
        dense
        mask="##/##/####"
        placeholder="dd/mm/yyyy"
        :error="!!errorInicial"
        :error-message="errorInicial"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="modelInicial" mask="DD/MM/YYYY" minimal>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="col-12 col-sm-6">
      <q-input
        v-model="modelFinal"
        label="Fecha Final"
        outlined
        dense
        mask="##/##/####"
        placeholder="dd/mm/yyyy"
        :error="!!errorFinal"
        :error-message="errorFinal"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="modelFinal" mask="DD/MM/YYYY" minimal>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  formatearFechaDDMMYYYY,
  parsearFechaDDMMYYYY,
} from 'src/composables/useFechaRango'

const props = defineProps({
  fechaInicial: { type: [String, Date], default: null },
  fechaFinal: { type: [String, Date], default: null },
})

const emit = defineEmits([
  'update:fechaInicial',
  'update:fechaFinal',
  'update:rangoValido',
])

const errorInicial = ref('')
const errorFinal = ref('')

const modelInicial = computed({
  get: () => formatearFechaDDMMYYYY(props.fechaInicial),
  set: (v) => emit('update:fechaInicial', parsearFechaDDMMYYYY(v)),
})

const modelFinal = computed({
  get: () => formatearFechaDDMMYYYY(props.fechaFinal),
  set: (v) => emit('update:fechaFinal', parsearFechaDDMMYYYY(v)),
})

const validar = () => {
  errorInicial.value = ''
  errorFinal.value = ''
  if (!props.fechaInicial || !props.fechaFinal) {
    emit('update:rangoValido', false)
    return
  }
  const fi = new Date(props.fechaInicial).getTime()
  const ff = new Date(props.fechaFinal).getTime()
  if (isNaN(fi) || isNaN(ff)) {
    emit('update:rangoValido', false)
    return
  }
  if (fi > ff) {
    errorFinal.value = 'La fecha final no puede ser menor a la fecha inicial.'
    emit('update:rangoValido', false)
    return
  }
  if (ff < fi) {
    errorInicial.value = 'La fecha inicial no puede ser mayor a la fecha final.'
    emit('update:rangoValido', false)
    return
  }
  emit('update:rangoValido', true)
}

watch(() => [props.fechaInicial, props.fechaFinal], validar, { immediate: true })
</script>
