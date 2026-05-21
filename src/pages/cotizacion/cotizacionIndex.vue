<template>
  <div v-if="paginaRegistrarCotizacion">
    <div class="q-pa-sm">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Volver a la lista"
        @click="paginaRegistrarCotizacion = false"
      />
    </div>
    <CotizacionPage
      :key="componenteKey"
      @reiniciar="reiniciar"
      @cancelarregistro="paginaRegistrarCotizacion = false"
    />
  </div>
  <div v-else>
    <ListaCotizacionPage
      :key="componenteKey"
      @reiniciar="reiniciar"
      @registrarcotizacion="paginaRegistrarCotizacion = true"
    />
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
  paginaRegistrarCotizacion.value = false
  console.log(componenteKey.value)
}
</script>
