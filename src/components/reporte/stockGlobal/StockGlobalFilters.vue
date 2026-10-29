<template>
  <div class="row justify-center q-col-gutter-md">
    <div class="col-12 col-md-6">
      <label for="porestado">{{ $t('ui.filtrar-por-estado-del-producto-b20dea') }}</label>
      <q-select
        :model-value="filtroEstado"
        @update:model-value="
          (val) => {
            $emit('update:filtroEstado', val)
            $emit('generar')
          }
        "
        :options="opcionesEstado"
        id="porestado"
        dense
        outlined
        emit-value
        map-options
      />
    </div>
    <div class="col-12 col-md-6">
      <label for="porstock">{{ $t('ui.ordenar-por-stock-c4e9f4') }}</label>
      <q-select
        :model-value="ordenStock"
        @update:model-value="
          (val) => {
            $emit('update:ordenStock', val)
            $emit('generar')
          }
        "
        :options="opcionesOrden"
        id="porstock"
        dense
        outlined
        emit-value
        map-options
      />
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
defineProps({
  filtroEstado: {
    type: Number,
    required: true,
  },
  ordenStock: {
    type: Number,
    required: true,
  },
})

defineEmits(['update:filtroEstado', 'update:ordenStock', 'generar'])

const opcionesEstado = [
  { label: i18nT('ui.todos-a4114a'), value: 0 },
  { label: i18nT('ui.activos-520347'), value: 1 },
  { label: i18nT('ui.inactivos-0d99e0'), value: 2 },
]

const opcionesOrden = [
  { label: i18nT('ui.descendente-a12960'), value: 1 },
  { label: i18nT('ui.ascendente-977850'), value: 2 },
]
</script>
