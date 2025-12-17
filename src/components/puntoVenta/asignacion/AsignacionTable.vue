<template>
  <div>
    <div class="flex justify-center">
      <div style="width: 400px">
        <label for="alamacen">Almacén</label>
        <q-select
          v-model="filterWarehouse"
          :options="warehouses"
          id="alamacen"
          outlined
          dense
          emit-value
          map-options
          option-value="id"
          option-label="name"
          @update:model-value="$emit('loadAssignments', filterWarehouse)"
        />
      </div>
    </div>

    <q-table
      v-if="filterWarehouse"
      :rows="processedRows"
      :columns="columns"
      :filter="filter"
      row-key="id"
      class="my-sticky-table q-mt-md"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar..." />
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-center">
          <q-btn
            round
            color="negative"
            icon="delete"
            dense
            @click="$emit('delete', props.row.id)"
            flat
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  assignments: {
    type: Array,
    required: true,
    default: () => [],
  },
  warehouses: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const filter = ref('')
const filterWarehouse = ref(null)
const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'center',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'center',
    field: 'descripcion',
    sortable: true,
  },
  {
    name: 'opciones',
    label: 'Opciones',
    align: 'center',
    field: 'opciones',
    sortable: false,
  },
]
const processedRows = computed(() => {
  if (!filterWarehouse.value) return []
  return props.assignments.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
</script>
