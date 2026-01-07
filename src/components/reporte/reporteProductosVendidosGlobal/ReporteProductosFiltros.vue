<template>
  <div class="row justify-center q-col-gutter-x-md q-mt-md">
    <div class="col-12 col-md-3">
      <label for="almacen">Filtrar por almacén</label>
      <q-select
        id="almacen"
        :model-value="almacenSeleccionado"
        @update:model-value="$emit('update:almacenSeleccionado', $event)"
        :options="almacenesOptions"
        outlined
        dense
        emit-value
        map-options
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="cliente">Filtrar por razón social</label>
      <q-select
        id="cliente"
        :model-value="clienteSeleccionado"
        @update:model-value="$emit('update:clienteSeleccionado', $event)"
        :options="clientesOptions"
        option-label="label"
        option-value="value"
        use-input
        outlined
        dense
        emit-value
        map-options
        clearable
        @filter="onFilterClientes"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> Sin resultados </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
    <div class="col-12 col-md-3">
      <label for="sucursal">Filtrar por sucursal</label>
      <q-select
        id="sucursal"
        :model-value="sucursalSeleccionada"
        @update:model-value="$emit('update:sucursalSeleccionada', $event)"
        :options="sucursalesOptions"
        option-label="label"
        option-value="value"
        use-input
        outlined
        dense
        emit-value
        map-options
        @filter="onFilterSucursales"
        clearable
        :disable="!clienteSeleccionado"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> Sin resultados </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
// Nota: para los eventos @filter, usaremos funciones pasadas desde el padre o
// emitiremos un evento 'filterClientes' que el padre maneje.
// Vuetify/Quasar @filter(val, update) es un poco tricky de re-emitir tal cual
// Mejor pasamos las funciones filterClientes y filterSucursales como Props o manejamos el evento.
// En este caso, emitiremos 'filterClientes' con (val, update).

defineProps({
  almacenSeleccionado: [Number, String],
  almacenesOptions: Array,
  clienteSeleccionado: [Number, String, Object],
  clientesOptions: Array,
  sucursalSeleccionada: [Number, String, Object],
  sucursalesOptions: Array,
  onFilterClientes: Function,
  onFilterSucursales: Function,
})

defineEmits([
  'update:almacenSeleccionado',
  'update:clienteSeleccionado',
  'update:sucursalSeleccionada',
])
</script>
