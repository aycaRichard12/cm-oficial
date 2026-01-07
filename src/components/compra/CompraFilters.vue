<template>
  <div class="row q-col-gutter-x-md flex justify-between q-mb-md">
    <div class="col-12 col-md-4">
      <label for="almacen">Seleccione un Almacén</label>
      <q-select
        :model-value="filtroAlmacen"
        @update:model-value="$emit('update:filtroAlmacen', $event)"
        :options="almacenes"
        id="almacen"
        clearable
        dense
        outlined
        
      />
    </div>
    <div class="col-12 col-md-2">
      <label for="buscar">Buscar...</label>
      <q-input
        dense
        debounce="300"
        :model-value="busqueda"
        @update:model-value="$emit('update:busqueda', $event)"
        id="buscar"
        outlined
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
defineProps({
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
  filtroAlmacen: {
    type: Object,
    default: null,
  },
  busqueda: {
    type: String,
    default: '',
  },
})

defineEmits(['update:filtroAlmacen', 'update:busqueda'])
</script>
