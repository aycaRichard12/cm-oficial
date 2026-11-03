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
import { t as i18nT } from 'src/i18n/runtime'
import { computed } from 'vue'
import { useStockStore } from '../store/stockStore'
//import { useCurrencyStore } from 'src/stores/currencyStore'

const store = useStockStore()
//const currencyStore = useCurrencyStore()

const kpis = computed(() => [
  {
    title: i18nT('ui.total-productos-2b18bc'),
    icon: 'inventory',
    color: 'blue',
    value: store.totalProductos,
    subtitle: i18nT('ui.activos-en-almacen-eaec44'),
  },
  {
    title: i18nT('ui.disponibles-61af94'),
    icon: 'check_circle',
    color: 'green',
    value: store.productosDisponibles,
    subtitle: i18nT('ui.stock-15-92110a'),
  },
  {
    title: i18nT('ui.stock-bajo-2c94db'),
    icon: 'warning',
    color: 'yellow',
    value: store.productosStockBajo,
    subtitle: i18nT('ui.5-a-15-unidades-210bc2'),
  },
  {
    title: i18nT('ui.stock-critico-679f22'),
    icon: 'error',
    color: 'orange',
    value: store.productosStockCritico,
    subtitle: i18nT('ui.5-unidades-0ade8c'),
  },
  {
    title: i18nT('ui.agotados-ec43f2'),
    icon: 'highlight_off',
    color: 'red',
    value: store.productosAgotados,
    subtitle: i18nT('ui.stock-0-97283b'),
  },
  {
    title: i18nT('ui.valor-inventario-a8fb07'),
    icon: 'attach_money',
    color: 'teal',
    value: store.valorTotalInventario,
    subtitle: i18nT('ui.precio-venta-1d5cc1'),
  },
])
</script>

<style scoped>
.kpi-card {
  background: var(--cm-surface);
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
