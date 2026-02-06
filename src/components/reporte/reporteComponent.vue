<template>
  <q-page class="q-pa-md">
    <!-- Menú de botones para seleccionar gráficos -->
    <div class="q-mb-md">
      <q-btn-toggle
        v-model="visibleChart"
        toggle-color="primary"
        :options="[
          { label: 'Todos', value: 'todos' },
          { label: 'Categorías', value: 'categoria' },
          { label: 'Preferidos', value: 'preferido' },
          { label: 'Monetario', value: 'monetario' },
          { label: 'Almacen', value: 'almacen' },
        ]"
        class="q-mb-md"
      />
    </div>

    <!-- Gráficos condicionales -->
    <GCategoria v-if="showChart('categoria')" />
    <GpPreferido v-if="showChart('preferido')" class="q-my-md" />
    <GpMonetario v-if="showChart('monetario')" />
    <GpAlmacen v-if="showChart('almacen')" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import GCategoria from './por_Categoria.vue'
import GpPreferido from './producto_preferido.vue'
import GpMonetario from './producto_monetario.vue'
import GpAlmacen from './StockAlmacen.vue'
// Controlador del gráfico visible
const visibleChart = ref('todos') // Por defecto muestra todos

// Función para determinar qué gráficos mostrar
const showChart = (chartName) => {
  return visibleChart.value === 'todos' || visibleChart.value === chartName
}
</script>

<style scoped>
/* Estilos adicionales si los necesitas */
.q-btn-toggle {
  border-radius: 8px;
}
</style>
