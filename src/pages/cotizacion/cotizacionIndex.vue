<template>
  <CotizacionPage :key="componenteKey" @reiniciar="reiniciar" />
</template>

<script setup>
import { ref } from 'vue'
import CotizacionPage from './CotizacionPage.vue'

const componenteKey = ref(0)

function reiniciar() {
  componenteKey.value++
  console.log(componenteKey.value)
}
</script>
