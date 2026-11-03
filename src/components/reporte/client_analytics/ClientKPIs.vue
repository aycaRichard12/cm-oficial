<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card  text-primary"
      >
        <q-card-section>
          <div class="text-h6">
            <q-icon name="check_circle" size="sm" class="q-mr-xs" />
            {{ $t('ui.clientes-activos-a818a9') }}
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesActivos }}
          </div>
          <div class="text-caption opacity-80">{{ $t('ui.compraron-en-ultimos-30-dias-a6b447') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card  text-orange">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-xs" />
            {{ $t('ui.en-riesgo-6c41bf') }}
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesEnRiesgo }}
          </div>
          <div class="text-caption opacity-80">{{ $t('ui.sin-compra-30-90-dias-0fff6c') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card text-negative">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="cancel" size="sm" class="q-mr-xs" />
            {{ $t('ui.inactivos-0d99e0') }}
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesInactivos }}
          </div>
          <div class="text-caption opacity-80">{{ $t('ui.mas-de-90-dias-sin-compra-77f909') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card text-cyan">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="shopping_cart" size="sm" class="q-mr-xs" />
            {{ $t('ui.ventas-9aac1a') }} {{ new Date().getFullYear() }}
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.totalVentasAño }}
          </div>
          <div class="text-caption opacity-80">{{ $t('ui.total-del-ano-actual-2666e6') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  kpis: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.kpi-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.opacity-80 {
  opacity: 0.8;
}
</style>
