<template>
  <q-select
    v-model="accionSeleccionada"
    :options="opciones"
    label="Acción"
    dense
    emit-value
    map-options
    @update:model-value="onAccionChange"
    style="min-width: 150px"
  />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  row: { type: Object, required: true },
  opciones: { type: Array, required: true }
})

const emit = defineEmits(['accion'])

const accionSeleccionada = ref('')

const onAccionChange = (val) => {
  if (val) {
    emit('accion', { row: props.row, accion: val })
    // Reset selection nicely
    setTimeout(() => {
      accionSeleccionada.value = ''
    }, 100)
  }
}
</script>
