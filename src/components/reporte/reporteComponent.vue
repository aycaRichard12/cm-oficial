<template>
  <q-page class="q-pa-md">
    <!-- Menú de navegación táctil y responsive -->
    <div class="q-mb-md" style="border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1)">
      <q-tabs
        v-model="visibleChart"
        dense
        class="bg-white text-grey-8"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab name="clientes" label="Clientes" icon="people" />
        <q-tab name="categoria" label="Categorías" icon="category" />
        <q-tab name="preferido" label="Preferidos" icon="star" />
        <q-tab name="monetario" label="Monetario" icon="payments" />
        <q-tab name="almacen" label="Almacén" icon="store" />
        <q-tab name="todos" label="Todos" icon="dashboard" />
      </q-tabs>
    </div>

    <!-- Gráficos condicionales -->
    <GpClientes v-if="showChart('clientes')" class="q-my-md" />
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
import GpClientes from './fecha_venta_cliente.vue'
// Controlador del gráfico visible
const visibleChart = ref('clientes') // Por defecto muestra todos

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
