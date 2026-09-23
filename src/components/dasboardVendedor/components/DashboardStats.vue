<template>
  <div class="row q-col-gutter-lg">
    <div v-for="kpi in kpis" :key="kpi.title" class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
      <div class="kpi-card" :style="{ borderLeftColor: kpi.color }">
        <div class="kpi-header">
          <q-icon :name="kpi.icon" :color="kpi.color" size="28px" />
          <div class="kpi-title">{{ kpi.title }}</div>
        </div>
        <div class="kpi-value">{{ kpi.value }}</div>
        <div class="kpi-subtitle">{{ kpi.subtitle }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStockStore } from '../store/stockStore'
//import { useCurrencyStore } from 'src/stores/currencyStore'

const store = useStockStore()
//const currencyStore = useCurrencyStore()

const kpis = computed(() => [
  {
    title: 'Total Productos',
    icon: 'inventory',
    color: 'blue',
    value: store.totalProductos,
    subtitle: 'Activos en almacén',
  },
  {
    title: 'Disponibles',
    icon: 'check_circle',
    color: 'green',
    value: store.productosDisponibles,
    subtitle: 'Stock > 15',
  },
  {
    title: 'Stock Bajo',
    icon: 'warning',
    color: 'yellow',
    value: store.productosStockBajo,
    subtitle: '5 a 15 unidades',
  },
  {
    title: 'Stock Crítico',
    icon: 'error',
    color: 'orange',
    value: store.productosStockCritico,
    subtitle: '< 5 unidades',
  },
  {
    title: 'Agotados',
    icon: 'highlight_off',
    color: 'red',
    value: store.productosAgotados,
    subtitle: 'Stock = 0',
  },
  {
    title: 'Valor Inventario',
    icon: 'attach_money',
    color: 'teal',
    value: store.valorTotalInventario,
    subtitle: 'Precio venta',
  },
])
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  opacity: 0.05;
  border-radius: 50%;
}

.kpi-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kpi-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.kpi-subtitle {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}
</style>
