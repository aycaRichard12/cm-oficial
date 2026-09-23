<template>
  <q-page padding>
    <configuracioPU :md5="md5" />
  </q-page>
</template>
<script setup>
import configuracioPU from 'src/components/productoUnico/configuracioPU.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const md5 = idempresa_md5()
</script>
