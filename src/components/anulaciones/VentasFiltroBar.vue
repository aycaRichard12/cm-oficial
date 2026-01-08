<template>
  <div class="row q-col-gutter-x-md q-mb-md">
    <div class="col-12 col-md-3">
      <label for="almacen">Almacén</label>
      <q-select
        :model-value="almacen"
        @update:model-value="$emit('update:almacen', $event)"
        :options="almacenesOptions"
        id="almacen"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        outlined
        dense
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="tipoventa">Tipo de venta</label>
      <q-select
        :model-value="tipo"
        @update:model-value="$emit('update:tipo', $event)"
        :options="tiposVentaOptions"
        id="tipoventa"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        outlined
        dense
        class="col"
      />
    </div>

    <div class="col-12 col-md-6 flex justify-end">
      <div class="col-12 col-md-6">
        <label for="buscar">Buscar...</label>
        <q-input 
          :model-value="busqueda"
          @update:model-value="$emit('update:busqueda', $event)"
          id="buscar" 
          dense 
          outlined 
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>

          <template v-slot:after>
            <q-select
              :model-value="columna"
              @update:model-value="$emit('update:columna', $event)"
              :options="columnasBusqueda"
              label="Columna"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              style="min-width: 120px"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  almacen: { type: Number, default: 0 },
  tipo: { type: Number, default: 0 },
  busqueda: { type: String, default: '' },
  columna: { type: Number, default: 0 },
  almacenesOptions: { type: Array, default: () => [] },
  tiposVentaOptions: { type: Array, default: () => [] },
  columnasBusqueda: { type: Array, default: () => [] }
})

defineEmits(['update:almacen', 'update:tipo', 'update:busqueda', 'update:columna'])
</script>
