<template>
  <q-page padding class="dashboard-vendedor">
    <!-- Header -->
    <div class="header-section q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="text-h4 q-my-none">{{ $t('ui.dashboard-de-inventario-5646ea') }}</h1>
          <p class="text-subtitle2 text-grey q-mt-sm">
            {{ $t('ui.gestion-de-almacen-y-stock-en-tiempo-real-85cf55') }}
          </p>
        </div>
        <div class="text-right">
          <div class="sync-status">
            <q-icon :name="store.loading ? 'sync' : 'check_circle'" :color="store.loading ? 'primary' : 'green'" size="24px" :class="{ 'spin': store.loading }" />
            <div class="text-caption q-ml-sm">
              <div class="text-weight-medium">{{ $t('ui.ultima-sincronizacion-140b86') }}</div>
              <div class="text-grey">{{ formatTime(store.lastSync) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros de almacén y categoría precio -->
    <q-card class="filter-card q-mb-lg" flat>
      <q-card-section class="row items-center q-gutter-md">
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-select
            v-model="store.almacenSeleccionado"
            :options="store.almacenes"
            :label="$t('inventario.warehouse')"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="cambiarAlmacen"
            class="filter-input"
          >
            <template v-slot:prepend>
              <q-icon name="warehouse" />
            </template>
          </q-select>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-select
            v-model="store.categoriaPrecioSeleccionada"
            :options="store.categoriasPrecio"
            :label="$t('ui.categoria-precio-30f1a7')"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="cambiarCategoria"
            class="filter-input"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-2">
          <q-input
            v-model="store.fechaFin"
            :label="$t('cotizacion.table.date')"
            type="date"
            dense
            outlined
            @update:model-value="refrescar"
            class="filter-input"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-auto text-right">
          <q-btn
            icon="refresh"
            @click="refrescar"
            :loading="store.loading"
            color="primary"
            unelevated
            :label="$t('ui.refrescar-513362')"
            class="refresh-btn"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- KPIs -->
    <div class="q-mb-lg">
      <h2 class="text-h6 q-mb-md text-weight-medium">{{ $t('ui.indicadores-clave-b87fd5') }}</h2>
      <DashboardStats />
    </div>

    <!-- Gráficos -->
    <div class="q-mb-lg">
      <h2 class="text-h6 q-mb-md text-weight-medium">{{ $t('ui.analisis-de-inventario-a8fa61') }}</h2>
      <InventoryCharts />
    </div>

    <!-- Alertas y Tabla -->
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-4">
        <StockAlerts />
      </div>
      <div class="col-xs-12 col-md-8">
        <InventoryTable />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useStockStore } from 'src/components/dasboardVendedor/store/stockStore'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { useIntervalFn } from '@vueuse/core'
import DashboardStats from 'src/components/dasboardVendedor/components/DashboardStats.vue'
import StockAlerts from 'src/components/dasboardVendedor/components/StockAlerts.vue'
import InventoryTable from 'src/components/dasboardVendedor/components/InventoryTable.vue'
import InventoryCharts from 'src/components/dasboardVendedor/components/InventoryCharts.vue'

const store = useStockStore()
const currencyStore = useCurrencyStore()

const { pause, resume } = useIntervalFn(
  () => {
    if (!store.loading) store.refrescarDatos()
  },
  30000,
  { immediate: false },
)

async function cambiarAlmacen() {
  await store.cargarCategoriasPrecio()
}
async function cambiarCategoria() {
  await store.cargarReporte()
}
async function refrescar() {
  await store.cargarReporte()
}

function formatTime(date) {
  if (!date) return 'Nunca'
  return new Date(date).toLocaleTimeString()
}

// --- SOLUCIÓN NATIVA PARA REEMPLAZAR USEPAGEVISIBILITY ---
function manejarCambioVisibilidad() {
  if (document.visibilityState === 'visible') {
    refrescar()
  }
}

onMounted(async () => {
  await Promise.all([store.cargarAlmacenes(), currencyStore.cargarDivisaActiva()])
  resume()
  // Escuchamos el evento nativo del navegador
  document.addEventListener('visibilitychange', manejarCambioVisibilidad)
})

onUnmounted(() => {
  pause()
  // Limpiamos el evento al destruir el componente
  document.removeEventListener('visibilitychange', manejarCambioVisibilidad)
})
onUnmounted(() => pause())
</script>

<style scoped>
.dashboard-vendedor {
  background: linear-gradient(135deg, var(--cm-surface-2) 0%, var(--cm-bg) 100%);
  min-height: 100vh;
}

.header-section {
  background: var(--cm-surface);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: -24px -24px 0 -24px;
  padding: 32px 24px;
  border-bottom: 3px solid #1976d2;
}

.sync-status {
  display: flex;
  align-items: center;
  background: var(--cm-surface-2);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #1976d2;
}

.sync-status .spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.filter-card {
  border: 1px solid var(--cm-border);
  border-radius: 12px;
  background: var(--cm-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.filter-card :deep(.q-field__control) {
  padding: 8px 12px;
}

.filter-input :deep(.q-icon) {
  margin-right: 8px;
  color: #1976d2;
}

.refresh-btn {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white; /* theme-allow */
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transform: translateY(-2px);
}

h2 {
  color: var(--cm-text);
  border-bottom: 2px solid #1976d2;
  padding-bottom: 12px;
  display: inline-block;
}
</style>
