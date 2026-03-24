<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card  text-primary"
      >
        <q-card-section>
          <div class="text-h6">
            <q-icon name="check_circle" size="sm" class="q-mr-xs" />
            Clientes Activos
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesActivos }}
          </div>
          <div class="text-caption opacity-80">Compraron en últimos 30 días</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card  text-orange">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-xs" />
            En Riesgo
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesEnRiesgo }}
          </div>
          <div class="text-caption opacity-80">Sin compra 30-90 días</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card text-negative">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="cancel" size="sm" class="q-mr-xs" />
            Inactivos
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.clientesInactivos }}
          </div>
          <div class="text-caption opacity-80">Más de 90 días sin compra</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="kpi-card text-cyan">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="shopping_cart" size="sm" class="q-mr-xs" />
            Ventas {{ new Date().getFullYear() }}
          </div>
          <div class="text-h3 text-weight-bold q-mt-sm">
            {{ kpis.totalVentasAño }}
          </div>
          <div class="text-caption opacity-80">Total del año actual</div>
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
