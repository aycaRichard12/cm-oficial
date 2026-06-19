<template>
  <q-badge :color="color" class="q-px-sm q-py-xs" rounded>
    {{ label }}
    <q-tooltip>
      {{ tooltip }}
    </q-tooltip>
  </q-badge>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  asignada: Boolean,
})

const color = computed(() => (props.asignada ? 'positive' : 'warning'))
const label = computed(() => (props.asignada ? 'Asignada' : 'Sin asignar'))
const tooltip = computed(() =>
  props.asignada
    ? 'Pertenece a una sucursal grande'
    : 'No está vinculada a ninguna sucursal grande',
)
</script>
