<template>
  <q-card v-if="rows.length" class="q-mt-md">
    <BaseFilterableTable
      title="Stock De Productos"
      :rows="rows"
      :columns="visibleColumns"
      :arrayHeaders="visibleHeaders"
      :sumColumns="[ 'costototal']"
      row-key="id"
      nombreColumnaTotales="costounitario"
    />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  // These props are less relevant now as BaseFilterableTable computes totals,
  // but keeping them for API compatibility if needed, though they aren't used in BaseFilterableTable directly.
  sumatoriaStock: {
    type: String,
    required: false,
  },
  sumatoriaCostoTotal: {
    type: String,
    required: false,
  },
})

// Compute visible columns by filtering out those that have no data in any row
const visibleColumns = computed(() => {
  return props.columns.filter((col) => {
    // Check if the column name is 'numero', we typically always show the index or handle it differently.
    // But applying the rule "SIN DATOS NO LAS MUESTRES":
    return props.rows.some((row) => {
      // Access property by field name. Handle nested properties if field is a function?
      // BaseFilterableTable uses 'field' string access usually.
      // If field is a function, we might not be able to easy check "value".
      // Let's assume field is string for checking.
      // If field is a function (like costototal), we need to resolve it.
      
      let val;
      if (typeof col.field === 'function') {
        val = col.field(row);
      } else {
        val = row[col.field];
      }
      
      return val !== null && val !== undefined && val !== '';
    })
  })
})

// Extract the names of the visible columns to pass as filterable headers
const visibleHeaders = computed(() => {
  return visibleColumns.value.map(col => col.name)
})
</script>
