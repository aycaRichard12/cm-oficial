<template>
  <div v-if="data" class="dashboard-widget">
    <!-- Encabezado del Dashboard -->
    <q-card class="header-card q-mb-md" flat bordered>
      <q-card-section class="bg-gradient-header text-white q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="analytics" size="md" class="q-mr-md" />
          <div>
            <div class="text-caption text-white text-opacity-8">
              Indicadores del período seleccionado
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Grid de 3 columnas: Venta, Cotización, Total -->
    <div class="cards-grid q-mb-md">
      <q-card v-for="cat in orderedCategories" :key="cat.key" class="breakdown-card" flat bordered>
        <q-card-section class="bg-grey-2 q-px-md q-py-sm">
          <span class="text-subtitle2 text-uppercase text-grey-8 text-weight-bold">
            {{ cat.label }}
          </span>
        </q-card-section>
        <q-separator />

        <q-list class="q-pa-sm">
          <!-- Bloque 1: Venta Neta -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bold text-grey-9">
                Venta neta
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h6 text-weight-bold text-primary">
                {{ formatNumber(data[cat.key]?.venta_neta) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Subcomponentes indentados (Desglose) -->
          <div class="sub-items-container q-pl-md q-pr-sm q-pb-sm">
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-body2 text-grey-7">Precio venta</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-body1 text-grey-9">
                  {{ formatNumber(data[cat.key]?.venta_bruta) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item dense>
              <q-item-section>
                <q-item-label class="text-body2 text-grey-7">Descuento</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-body1 text-negative">
                  - {{ formatNumber(data[cat.key]?.descuentos) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <q-separator inset class="q-my-sm" />

          <!-- Bloque 2: Costo de Ventas -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-subtitle1 text-grey-9"> Costo de ventas </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h6 text-grey-9">
                {{ formatNumber(data[cat.key]?.costo_ventas) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Línea final de cálculo -->
          <q-separator class="q-mt-md q-mx-md" color="grey-5" size="2px" />

          <!-- Resultado: Utilidad o Pérdida -->
          <q-item class="q-mt-sm q-mb-xs">
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold text-grey-10">
                Utilidad o Pérdida
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h5 text-weight-bolder text-positive">
                {{ formatNumber(data[cat.key]?.utilidad) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- Banner informativo -->
    <q-banner rounded dense class="info-banner bg-grey-1 text-grey-7">
      <template v-slot:avatar>
        <q-icon name="info" color="grey-6" size="sm" />
      </template>
      <span class="text-caption">
        Los indicadores corresponden al rango de fechas y filtros seleccionados.
      </span>
    </q-banner>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, default: () => ({}) },
  divisa: { type: Object, default: () => ({}) },
  currency: { type: String, default: 'Bs.' },
})

// Orden específico: Venta, Cotización, Total
const orderedCategories = [
  { key: 'venta', label: 'Venta' },
  { key: 'cotizacion', label: 'Cotización' },
  { key: 'total', label: 'Total' },
]

// Función para formatear números (2 decimales fijos y separador de miles si es necesario)
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.dashboard-widget {
  width: 100%;
}

/* Encabezado */
.header-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.bg-gradient-header {
  background: linear-gradient(135deg, #004d40, #26a69a);
}

/* Grid de tarjetas: 3 columnas responsivas */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Cada tarjeta */
.breakdown-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
  height: fit-content;
}

.breakdown-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* Subítems visuales */
.sub-items-container {
  border-left: 3px solid #f0f0f0;
  margin-left: 16px;
}

/* Banner informativo */
.info-banner {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* Responsive: en pantallas pequeñas se apilan */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
