<template>
  <q-card-section class="q-pb-sm">
    <div class="row q-col-gutter-md items-start">
      <!-- Producto -->
      <div class="col-12 col-md-4">
        <q-select
          :model-value="productoSeleccionado"
          @update:model-value="updateProducto"
          :options="productosOptions"
          option-value="idProducto"
          option-label="nombreProducto"
          label="Producto *"
          outlined
          dense
          use-input
          fill-input
          hide-selected
          emit-value
          map-options
          :loading="loadingProductos"
          @filter="onFilter"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="inventory_2" class="text-primary" />
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Sin resultados </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Fecha inicial -->
      <div class="col-12 col-md-3">
        <q-input
          :model-value="fechaInicio"
          @update:model-value="updateFechaInicio"
          type="date"
          label="Fecha inicial *"
          dense
          outlined
          :rules="[(val) => !!val || 'Fecha inicial requerida']"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>

      <!-- Fecha final -->
      <div class="col-12 col-md-3">
        <q-input
          :model-value="fechaFin"
          @update:model-value="updateFechaFin"
          type="date"
          label="Fecha final *"
          dense
          outlined
          :rules="[(val) => !!val || 'Fecha final requerida']"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>

      <!-- Botón -->
      <div class="col-12 col-md-2 flex items-end">
        <q-btn
          color="primary"
          label="Generar"
          icon="search"
          :loading="loading"
          :disable="!productoSeleccionado || !fechaInicio || !fechaFin"
          @click="$emit('generar')"
          class="full-width"
          unelevated
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup>
defineProps({
  productoSeleccionado: {
    type: [Number, String],
    default: null,
  },
  fechaInicio: {
    type: String,
    default: null,
  },
  fechaFin: {
    type: String,
    default: null,
  },
  productosOptions: {
    type: Array,
    default: () => [],
  },
  loadingProductos: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:productoSeleccionado',
  'update:fechaInicio',
  'update:fechaFin',
  'generar',
  'filter',
])

const updateProducto = (value) => {
  emit('update:productoSeleccionado', value)
}

const updateFechaInicio = (value) => {
  emit('update:fechaInicio', value)
}

const updateFechaFin = (value) => {
  emit('update:fechaFin', value)
}

const onFilter = (val, update) => {
  emit('filter', val, update)
}
</script>
