<template>
  <div class="row justify-center q-col-gutter-md">
    <div class="col-12 col-md-6">
      <label for="porestado">Filtrar por estado del producto</label>
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
      <label for="porstock">Ordenar por stock</label>
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
  { label: 'Todos', value: 0 },
  { label: 'Activos', value: 1 },
  { label: 'Inactivos', value: 2 },
]

const opcionesOrden = [
  { label: 'Descendente', value: 1 },
  { label: 'Ascendente', value: 2 },
]
</script>
