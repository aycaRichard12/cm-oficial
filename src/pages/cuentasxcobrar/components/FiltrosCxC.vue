<template>
  <div class="row q-col-gutter-x-md q-mb-md">
    <div
      v-if="opcionesAlmacenes.length > 1"
      class="col-12 col-md-3"
      id="filtroalmacencuentasporcobrar"
    >
      <label class="text-caption text-weight-medium">Almacén</label>
      <q-select
        :model-value="filtroAlmacen"
        @update:model-value="(val) => $emit('update:filtroAlmacen', val)"
        :options="opcionesAlmacenes"
        id="almacen"
        dense
        outlined
        style="min-width: 200px"
        map-options
        class="q-mr-sm"
      />
    </div>

    <div v-else-if="opcionesAlmacenes.length === 1" class="col-12 col-md-3">
      <label class="text-caption text-weight-medium">Almacén</label>
      <q-input :model-value="opcionesAlmacenes[0].label" dense outlined readonly class="q-mr-sm" />
    </div>

    <div class="col-12 col-md-3" id="filtroestadocuentasporcobrar">
      <label class="text-caption text-weight-medium">Tipo</label>
      <q-select
        :model-value="filtroEstado"
        @update:model-value="(val) => $emit('update:filtroEstado', val)"
        :options="opcionesTipo"
        id="estado"
        dense
        outlined
        map-options
        clearable
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  opcionesAlmacenes: Array,
  filtroAlmacen: Object,
  filtroEstado: Object,
  opcionesTipo: Array
})

defineEmits(['update:filtroAlmacen', 'update:filtroEstado'])
</script>
