<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup>
import { useMeta } from 'quasar'
import { useIdle } from '@vueuse/core'
import { LocalStorage, Notify } from 'quasar'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

//import { getNombreEmpresa } from './composables/FuncionesGenerales'
const { idle } = useIdle(900 * 1000)

const metaData = {
  title: 'Comercial', //getNombreEmpresa(),
  titleTemplate: (title) => `${title} - Mistersofts`,
}
watch(idle, (newIdle) => {
  if (newIdle && router.currentRoute.value.path !== '/login') {
    // 1. Mostrar un aviso al usuario
    Notify.create({
      message: 'Tu sesión ha expirado por inactividad',
      color: 'warning',
      icon: 'warning',
    })

    // 2. Limpiar datos locales
    LocalStorage.remove('carrito')
    LocalStorage.remove('carritoCO')
    LocalStorage.remove('mistersofts-cm')
    LocalStorage.remove('mistersofts-cmmenu')

    // 3. (Opcional) Llamar a tu API de logout si la tienes
    // await api.post('/logout')

    // 4. Redirigir al login
    router.push('/login')
  }
})
useMeta(metaData)
</script>
