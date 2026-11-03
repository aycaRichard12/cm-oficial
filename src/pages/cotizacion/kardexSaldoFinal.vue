<template>
  <div class="q-mt-md">
    <q-card flat class="q-mb-lg q-pa-sm">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-primary text-white">
            <q-card-section class="row flex justify-between">
              <div class="text-body2">{{ $t('ui.valor-total-del-saldo-610e60') }}</div>
              <div class="text-h6 text-weight-bold">
                {{ formatCurrency(saldoFinal.Saldo_Valorado) }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              {{ $t('ui.costo-total-valorado-de-la-existencia-final-0142a9') }}
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-secondary text-white">
            <q-card-section class="row flex justify-between">
              <div class="text-body2">{{ $t('ui.unidades-en-existencia-e55d74') }}</div>
              <div class="text-h6 text-weight-bold">
                {{ saldoFinal.Existencia_Final }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              {{ $t('ui.cantidad-de-unidades-disponibles-en-el-inventario-9d5872') }}
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-teal text-white" data-theme-allow>
            <q-card-section class="row flex justify-between">
              <div class="text-body2">{{ $t('ui.costo-unitario-promedio-1da939') }}</div>
              <div class="text-h6 text-weight-bold">
                {{ formatCurrency(saldoFinal.Precio_Unitario_Promedio_Ponderado_Final) }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              {{ $t('ui.precio-unitario-calculado-mediante-el-promedio-ponde-e45f2d') }}
            </q-tooltip>
          </q-card>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  saldoFinal: {
    type: Object,
    required: true,
  },
})

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return ''
  }
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value)
}
</script>
