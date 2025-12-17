<template>
  <!-- <div
    class="q-pa-md flex flex-center min-h-screen bg-gradient-to-br from-primary to-secondary text-white"
  >
    <q-card class="q-pa-xl text-center bg-transparent shadow-none">
      <div class="flex flex-col items-center space-y-4">
        <q-icon name="emoji_emotions" size="64px" color="white" />

        <h1 class="text-3xl font-bold">
          {{ saludo }}
        </h1>

        <p class="text-lg opacity-90">
          {{ mensaje }}
        </p>
      </div>
    </q-card>
  </div> -->
  <q-page :style-fn="myTweak" padding> </q-page>
</template>

<script setup>
// import { ref, computed, onMounted } from 'vue'

// Router para navegación

// Simula obtener el nombre del usuario (puedes reemplazar por tu store o API)
// const nombreUsuario = ref('Richard')

// Mensajes dinámicos
// const saludo = computed(() => {
//   const hora = new Date().getHours()
//   if (hora < 12) return `¡Buenos días, ${nombreUsuario.value}!`
//   if (hora < 19) return `¡Buenas tardes, ${nombreUsuario.value}!`
//   return `¡Buenas noches, ${nombreUsuario.value}!`
// })

// const mensaje = ref('Bienvenido al sistema de gestión, esperamos que tengas un gran día.')

// // Efecto al cargar
// onMounted(() => {
//   console.log(`Bienvenida mostrada para ${nombreUsuario.value}`)
// })
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, var(--q-color-primary), var(--q-color-secondary));
}
</style>
