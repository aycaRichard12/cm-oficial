<template>
  <q-page class="q-pa-md">
    <div class="container">
      <h2>{{ $t('ui.bienvenido-a-configuracion-producto-5a57e0') }}</h2>
      <p>{{ $t('ui.este-es-un-ejemplo-basico-de-una-pagina-en-quasar-8cf44b') }}</p>

      <!-- Botón que muestra una alerta al hacer clic -->
      <q-btn :label="$t('ui.haz-clic-cd37a9')" color="primary" @click="mostrarAlerta" />
    </div>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import {} from 'vue'

const mostrarAlerta = () => {
  alert(i18nT('ui.boton-clickeado-31e4de'))
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  color: #42b983;
}

p {
  font-size: 18px;
}

.q-btn {
  margin-top: 20px;
}
</style>
