<template>
  <q-page class="q-pa-md">
    <div class="container">
      <h2>Bienvenido a Configuracion Producto</h2>
      <p>Este es un ejemplo básico de una página en Quasar.</p>

      <!-- Botón que muestra una alerta al hacer clic -->
      <q-btn label="Haz clic" color="primary" @click="mostrarAlerta" />
    </div>
  </q-page>
</template>

<script setup>
import {} from 'vue'

const mostrarAlerta = () => {
  alert('¡Botón clickeado!')
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
