<template>
  <div class="row justify-center q-col-gutter-x-md q-mt-md">
    <div class="col-12 col-md-3" id="almacenVendidos">
      <label for="almacen">Filtrar por almacén</label>
      <q-select
        id="almacen"
        v-model="localAlmacen"
        :options="almacenesOptions"
        outlined
        dense
        emit-value
        map-options
      />
    </div>
    <div class="col-12 col-md-3" id="clienteVendidos">
      <label for="cliente">Filtrar por razón social</label>
      <q-select
        id="cliente"
        v-model="localCliente"
        :options="clientesOptions"
        option-label="label"
        option-value="value"
        use-input
        outlined
        dense
        emit-value
        map-options
        clearable
        @filter="(val, update) => onFilterClientes(val, update)"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> Sin resultados </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
    <div class="col-12 col-md-3" id="sucursalVendidos">
      <label for="sucursal">Filtrar por sucursal</label>
      <q-select
        id="sucursal"
        v-model="localSucursal"
        :options="sucursalesOptions"
        option-label="label"
        option-value="value"
        use-input
        outlined
        dense
        emit-value
        map-options
        @filter="(val, update) => onFilterSucursales(val, update)"
        clearable
        :disable="!localCliente"
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
import { computed } from 'vue'

const props = defineProps({
  almacenSeleccionado: [Number, String],
  almacenesOptions: Array,
  clienteSeleccionado: [Number, String, Object],
  clientesOptions: Array,
  sucursalSeleccionada: [Number, String, Object],
  sucursalesOptions: Array,
  onFilterClientes: Function,
  onFilterSucursales: Function,
})

const emit = defineEmits([
  'update:almacenSeleccionado',
  'update:clienteSeleccionado',
  'update:sucursalSeleccionada',
])

const localAlmacen = computed({
  get: () => props.almacenSeleccionado,
  set: (val) => emit('update:almacenSeleccionado', val)
})

const localCliente = computed({
  get: () => props.clienteSeleccionado,
  set: (val) => emit('update:clienteSeleccionado', val)
})

const localSucursal = computed({
  get: () => props.sucursalSeleccionada,
  set: (val) => emit('update:sucursalSeleccionada', val)
})
</script>
