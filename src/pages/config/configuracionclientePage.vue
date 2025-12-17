<template>
  <q-page>
    <q-btn label="Iniciar Tour" @click="iniciarTour" id="some-element" />

    <div id="tour-elemento-1" class="q-mt-md">Elemento 1</div>
    <q-input id="tour-elemento-2" v-model="texto" label="Ejemplo" />
  </q-page>
</template>

<script setup>
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const driverObj = driver()
const iniciarTour = () => {
  driverObj.highlight({
    element: '#some-element',
    popover: {
      title: 'Title',
      description: 'Description',
    },
  })
}
</script>

<style>
/* Estilos para el tour que coincidan con Quasar */
.driver-popover {
  background-color: var(--q-primary) !important;
  color: white !important;
  border-radius: 8px !important;
}

.driver-popover-title {
  font-size: 1.2rem !important;
  color: white !important;
}
</style>
