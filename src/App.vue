<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup>
import { USUARIOS } from './credenciales'
import { useMeta } from 'quasar'
import { getNombreEmpresa } from './composables/FuncionesGenerales'
// import { idusuario_md5 } from './composables/FuncionesGenerales'
// const idusuario = idusuario_md5()
const metaData = {
  // sets document title
  title: getNombreEmpresa(),
  // optional; sets final title as "Index Page - My Website", useful for multiple level meta
  titleTemplate: (title) => `${title} - Mistersofts`,
}
useMeta(metaData)
const createInitialLocalStorage = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Estamos en PRODUCCIÓN')
  } else {
    iniciarSesion()
  }
}
const iniciarSesion = () => {
  const idx = 2
  const usuario = USUARIOS[idx].usuario
  const menu = USUARIOS[idx].menu
  localStorage.clear()
  if (!localStorage.getItem('yofinanciero')) {
    const userData = usuario
    localStorage.setItem('yofinanciero', JSON.stringify(userData))
  } else {
    console.log("'yofinanciero' already exists.")
  }

  if (!localStorage.getItem('yofinancieromenu')) {
    const menuData = menu
    localStorage.setItem('yofinancieromenu', JSON.stringify(menuData))
  } else {
    console.log("'yofinancieromenu' already exists.")
  }
}
createInitialLocalStorage()
</script>
<style>
/* .zoom-container {
  zoom: 90%; /* Escala visual de toda la app al 70% */
</style>
