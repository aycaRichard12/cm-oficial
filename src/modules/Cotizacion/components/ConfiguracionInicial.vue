<template>
  <q-card-section class="q-pa-lg">
    <q-form ref="cotizacionFormRef">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-4">
          <label class="text-weight-bold cm-text q-mb-sm block label-cotizacion">
            {{ $t('ui.almacen-origen-3ef997') }} <span class="text-negative">*</span>
          </label>
          <q-select
            :model-value="filtroAlmacenCO"
            :options="almacenesOptions"
            emit-value
            map-options
            option-value="idalmacen"
            option-label="almacen"
            :rules="almacenRules"
            @update:model-value="$emit('update:filtroAlmacenCO', $event)"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          />
        </div>

        <div class="col-12 col-md-4">
          <label class="text-weight-bold cm-text q-mb-sm block label-cotizacion">
            {{ $t('ui.categoria-de-precio-f572ba') }} <span class="text-negative">*</span>
          </label>
          <q-select
            :model-value="filtroCategoriaCO"
            :options="categoriasOptions"
            emit-value
            map-options
            option-value="id"
            option-label="nombre"
            :rules="categoriaRules"
            @update:model-value="$emit('update:filtroCategoriaCO', $event)"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          />
        </div>

        <div class="col-12 col-md-4">
          <label class="text-weight-bold cm-text q-mb-sm block label-cotizacion">
            {{ $t('ui.punto-venta-612259') }} <span class="text-negative">*</span>
          </label>
          <q-select
            :model-value="puntoVenta"
            @update:model-value="$emit('update:puntoVenta', $event)"
            :options="puntosVenta"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            :rules="puntoVentaRules"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          />
        </div>
      </div>
    </q-form>
  </q-card-section>
</template>

<script setup>
import { almacenRules, categoriaRules, puntoVentaRules } from '../validators/cotizacionValidators'

defineProps({
  filtroAlmacenCO: [Number, null],
  almacenesOptions: Array,
  filtroCategoriaCO: [Number, null],
  categoriasOptions: Array,
  puntoVenta: [Object, null],
  puntosVenta: Array,
})
defineEmits([
  'almacen-change',
  'categoria-change',
  'update:filtroAlmacenCO',
  'update:filtroCategoriaCO',
  'update:puntoVenta',
])
</script>
