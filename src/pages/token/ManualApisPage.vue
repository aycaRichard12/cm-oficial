<template>
  <q-page padding>
    <q-btn
      color="primary"
      text-color="white"
      :label="$t('configuracion.tokensApis.btn')"
      icon="token"
      @click="modalGenerartoken = true"
    />
    <q-dialog v-model="modalGenerartoken">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>{{ $t('configuracion.tokensApis.title') }}</div>
          <q-btn color="primary" icon="close" @click="modalGenerartoken = false" />
        </q-card-section>
        <q-card-section>
          <generar-token-page></generar-token-page>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-card> <manual-page></manual-page> </q-card>
  </q-page>
</template>
<script setup>
import GenerarTokenPage from './GenerarTokenPage.vue'
import manualPage from './ManualPage.vue'
import { ref } from 'vue'
const modalGenerartoken = ref(false)
</script>
