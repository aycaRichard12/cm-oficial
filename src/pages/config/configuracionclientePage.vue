<template>
  <q-page>
    <q-btn :label="$t('ui.iniciar-tour-62e5b0')" @click="iniciarTour" id="some-element" />

    <div id="tour-elemento-1" class="q-mt-md">{{ $t('ui.elemento-1-d8bff0') }}</div>
    <q-input id="tour-elemento-2" v-model="texto" :label="$t('ui.ejemplo-26ddea')" />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const driverObj = driver()
const iniciarTour = () => {
  driverObj.highlight({
    element: '#some-element',
    popover: {
      title: i18nT('ui.title-768e0c'),
      description: i18nT('ui.description-55f8eb'),
    },
  })
}
</script>

<style>
/* Estilos para el tour que coincidan con Quasar */
.driver-popover {
  background-color: var(--q-primary) !important;
  color: white !important; /* theme-allow */
  border-radius: 8px !important;
}

.driver-popover-title {
  font-size: 1.2rem !important;
  color: white !important; /* theme-allow */
}
</style>
