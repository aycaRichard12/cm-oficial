<template>
  <div v-if="paginaRegistrarCotizacion">
    <CotizacionPage :key="componenteKey" @reiniciar="reiniciar" />
  </div>
  <div v-else>
    <ListaCotizacionPage :key="componenteKey" @reiniciar="reiniciar" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CotizacionPage from './CotizacionPage.vue'
import ListaCotizacionPage from './ListaCotizacionPage.vue'

const paginaRegistrarCotizacion = ref(false)
const componenteKey = ref(0)

function reiniciar() {
  componenteKey.value++
  console.log(componenteKey.value)
}
</script>
