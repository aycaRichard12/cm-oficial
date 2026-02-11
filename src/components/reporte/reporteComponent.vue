<template>
  <q-page class="q-pa-md">
    <!-- Menú de botones para seleccionar gráficos -->
    <div class="q-mb-md">
      <q-btn-toggle
        v-model="visibleChart"
        toggle-color="primary"
        :options="[
          { label: 'Categorías', value: 'categoria' },
          { label: 'Preferidos', value: 'preferido' },
          { label: 'Monetario', value: 'monetario' },
          { label: 'Almacen', value: 'almacen' },
          { label: 'Clientes', value: 'clientes' },
          { label: 'Todos', value: 'todos' },
        ]"
        class="q-mb-md"
      />
    </div>

    <!-- Gráficos condicionales -->
    <GCategoria v-if="showChart('categoria')" />
    <GpPreferido v-if="showChart('preferido')" class="q-my-md" />
    <GpMonetario v-if="showChart('monetario')" />
    <GpAlmacen v-if="showChart('almacen')" />
    <GpClientes v-if="showChart('clientes')" class="q-my-md" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import GCategoria from './por_Categoria.vue'
import GpPreferido from './producto_preferido.vue'
import GpMonetario from './producto_monetario.vue'
import GpAlmacen from './StockAlmacen.vue'
import GpClientes from './fecha_venta_cliente.vue'
// Controlador del gráfico visible
const visibleChart = ref('categoria') // Por defecto muestra todos

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
