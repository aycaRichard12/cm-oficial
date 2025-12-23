<template>
  <q-card v-if="rows.length" class="q-mt-md">
    <q-table
      title="Stock De Productos"
      :rows="rows"
      :columns="columns"
      row-key="id"
      bordered
      flat
      separator="cell"
    >
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="10" class="text-right">Sumatorias</q-td>
          <q-td class="text-right">{{ sumatoriaStock }}</q-td>
          <q-td class="text-right">{{ sumatoriaCostoTotal }}</q-td>
          <q-td></q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  sumatoriaStock: {
    type: String,
    required: true,
  },
  sumatoriaCostoTotal: {
    type: String,
    required: true,
  },
})
</script>
