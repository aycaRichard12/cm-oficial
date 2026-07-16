<template>
  <div v-if="data" class="dashboard-widget">
    <!-- Encabezado del Dashboard -->

    <!-- Tarjeta de desglose financiero -->
    <q-card class="breakdown-card q-mb-md" flat bordered>
      <q-card class="header-card" flat bordered>
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
      <q-separator />

      <q-list class="q-pa-sm">
        <!-- Bloque 1: Venta Neta -->
        <q-item>
          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-bold text-grey-9">
              Venta neta periodo ({{ divisa.simbolo || currency }})
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-h6 text-weight-bold text-primary">
              {{ data.venta_neta || '0' }}
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
              <q-item-label class="text-body1 text-grey-9">{{
                data.venta_bruta || '0'
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item dense>
            <q-item-section>
              <q-item-label class="text-body2 text-grey-7">Descuento</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-body1 text-negative"
                >- {{ data.descuentos || '0' }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </div>

        <q-separator inset class="q-my-sm" />

        <!-- Bloque 2: Costo de Ventas -->
        <q-item>
          <q-item-section>
            <q-item-label class="text-subtitle1 text-grey-9">
              Costo de ventas ({{ divisa.simbolo || currency }})
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-h6 text-grey-9">
              {{ data.costo_ventas || '0' }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Línea final de cálculo -->
        <q-separator class="q-mt-md q-mx-md" color="grey-5" size="2px" />

        <!-- Resultado: Utilidad o Pérdida -->
        <q-item class="q-mt-sm q-mb-xs">
          <q-item-section>
            <q-item-label class="text-h6 text-weight-bold text-grey-10">
              Utilidad o Pérdida ({{ divisa.simbolo || currency }})
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-h5 text-weight-bolder text-positive">
              {{ data.utilidad || '0' }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Banner informativo -->
    <q-banner rounded dense class="info-banner bg-grey-1 text-grey-7">
      <template v-slot:avatar>
        <q-icon name="info" color="grey-6" size="sm" />
      </template>
      <span class="text-caption"
        >Los indicadores corresponden al rango de fechas y filtros seleccionados.</span
      >
    </q-banner>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, default: () => ({}) },
  divisa: { type: Object, default: () => ({}) },
  currency: { type: String, default: 'Bs.' },
})
</script>

<style scoped>
.dashboard-widget {
  max-width: 500px; /* Recomendado para mantener la legibilidad, puedes quitarlo si necesitas 100% de ancho */
  /* margin: 0 auto; */
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

/* Tarjeta del desglose */
.breakdown-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
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
</style>
