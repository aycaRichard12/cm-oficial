<template>
  <div class="q-mt-md">
    <q-card flat class="q-mb-lg q-pa-sm">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-primary text-white">
            <q-card-section class="row flex justify-between">
              <div class="text-body2">Valor Total del Saldo</div>
              <div class="text-h6 text-weight-bold">
                {{ formatCurrency(saldoFinal.Saldo_Valorado) }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Costo total valorado de la existencia final.
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-secondary text-white">
            <q-card-section class="row flex justify-between">
              <div class="text-body2">Unidades en Existencia</div>
              <div class="text-h6 text-weight-bold">
                {{ saldoFinal.Existencia_Final }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Cantidad de unidades disponibles en el inventario.
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-teal text-white">
            <q-card-section class="row flex justify-between">
              <div class="text-body2">Costo Unitario Promedio</div>
              <div class="text-h6 text-weight-bold">
                {{ formatCurrency(saldoFinal.Precio_Unitario_Promedio_Ponderado_Final) }}
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Precio unitario calculado mediante el promedio ponderado.
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
