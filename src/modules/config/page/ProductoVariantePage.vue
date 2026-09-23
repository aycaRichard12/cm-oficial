<template>
  <q-page padding>
    <ConfiguracionProductoVariante :md5="md5" />
  </q-page>
</template>
<script setup>
import ConfiguracionProductoVariante from '../components/ConfiguracionProductoVariante.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const md5 = idempresa_md5()
</script>
