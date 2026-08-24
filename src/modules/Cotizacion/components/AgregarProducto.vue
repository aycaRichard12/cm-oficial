<template>
  <div class="row q-col-gutter-lg items-end">
    <div class="col-12 col-md-4">
      <div class="flex justify-between items-center q-mb-sm">
        <label class="text-weight-bold text-grey-9 block label-cotizacion">
          Producto o Servicio <span class="text-negative">*</span>
        </label>
        <q-checkbox
          v-if="esProductoUnico"
          :model-value="registrarComoProductoUnico"
          @update:model-value="$emit('update:registrarComoProductoUnico', $event)"
          size="xs"
          label="Producto Único"
          color="secondary"
        />
      </div>
      <q-select
        :model-value="selectedProduct"
        :options="filteredProducts"
        option-value="id"
        option-label="display"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        outlined
        dense
        bg-color="white"
        class="premium-input"
        @filter="$emit('filter-product', $event)"
        @input-value="$emit('set-product-input', $event)"
        @update:model-value="$emit('elegir-producto', $event)"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> No hay resultados </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <div class="col-12 col-md-2">
      <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion"
        >Stock Actual</label
      >
      <q-input
        :model-value="cantidaddisponibleCO"
        readonly
        outlined
        dense
        bg-color="grey-2"
        hide-bottom-space
        class="premium-input text-center"
        placeholder="0"
      >
        <template v-slot:prepend>
          <q-icon name="inventory_2" size="xs" color="grey-7" />
        </template>
      </q-input>
    </div>

    <div class="col-12 col-md-2">
      <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
        Cantidad <span class="text-negative">*</span>
      </label>
      <q-input
        :model-value="cantidadCO"
        @update:model-value="$emit('update:cantidadCO', $event)"
        type="number"
        :rules="cantidadRules"
        :readonly="esProductoUnico && registrarComoProductoUnico"
        required
        outlined
        dense
        bg-color="white"
        hide-bottom-space
        class="premium-input text-center"
      />
    </div>

    <div class="col-12 col-md-3">
      <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
        Precio unitario <span class="text-negative">*</span>
      </label>
      <q-input
        :model-value="precioCO"
        @update:model-value="$emit('update:precioCO', $event)"
        type="number"
        :rules="precioRules"
        :readonly="!permisosStore.tienePermiso('editarprecioventa')"
        required
        outlined
        dense
        bg-color="white"
        hide-bottom-space
        class="premium-input"
      >
        <template v-slot:append>
          <div
            class="bg-grey-2 text-primary text-weight-bolder text-subtitle2 q-px-sm rounded-borders currency-append"
          >
            {{ divisaActiva.tipo }}
          </div>
        </template>
      </q-input>
    </div>

    <div class="col-12 col-md-1 flex justify-center">
      <q-btn
        icon="add_shopping_cart"
        color="secondary"
        unelevated
        class="full-width shadow-3 btn-add-product"
        :disable="!canAddProduct"
        @click="$emit('anadir-producto')"
      >
        <q-tooltip
          class="bg-secondary text-subtitle2 shadow-4"
          anchor="top middle"
          self="bottom middle"
        >
          Añadir al carrito
        </q-tooltip>
      </q-btn>
    </div>
  </div>

  <UniqueProductSelector
    v-if="esProductoUnico"
    :product-id="idproductoalmacenCO"
    :is-unique="esProductoUnico && registrarComoProductoUnico"
    :cantidad-requerida="cantidadCO"
    @update:selection="$emit('guardar-codigos', $event)"
    class="q-mt-md"
  />
</template>

<script setup>
import UniqueProductSelector from 'src/components/venta/UniqueProductSelector.vue'
import { cantidadRules, precioRules } from '../validators/cotizacionValidators'

defineProps({
  esProductoUnico: Boolean,
  registrarComoProductoUnico: Boolean,
  selectedProduct: [Object, null],
  filteredProducts: Array,
  cantidaddisponibleCO: String,
  cantidadCO: Number,
  precioCO: Number,
  idproductoalmacenCO: String,
  canAddProduct: Boolean,
  divisaActiva: Object,
  permisosStore: Object,
})

defineEmits([
  'filter-product',
  'set-product-input',
  'elegir-producto',
  'anadir-producto',
  'guardar-codigos',
  'update:registrarComoProductoUnico',
  'update:cantidadCO',
  'update:precioCO',
])
</script>
