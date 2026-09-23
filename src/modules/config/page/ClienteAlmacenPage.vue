<template>
  <q-page padding>
    <ConfiguracioClienteAlmacen :md5="md5" />
  </q-page>
</template>
<script setup>
import ConfiguracioClienteAlmacen from '../components/ConfiguracioClienteAlmacen.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const md5 = idempresa_md5()
</script>
