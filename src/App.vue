<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup>
import { useMeta } from 'quasar'
//import { getNombreEmpresa } from './composables/FuncionesGenerales'

const metaData = {
  title: 'Comercial', //getNombreEmpresa(),
  titleTemplate: (title) => `${title} - Mistersofts`,
}
useMeta(metaData)
</script>
