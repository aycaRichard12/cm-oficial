<template>
  <div class="q-table__container q-mt-md" style="max-height: 500px; overflow-y: auto">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="N°"
      bordered
      flat
      class="q-mt-sm"
      table-class="table-striped"
      table-header-class="thead-dark"
    >
      <template v-slot:body-cell-Opciones="props">
        <q-td
          :props="props"
          class="text-nowrap text-center"
          v-if="estado !== 1"
        >
          <q-btn
            v-if="editar"
            color="primary"
            icon="edit"
            @click="$emit('edit', props.row.id)"
            class="q-mr-sm"
            size="sm"
          />
          <q-btn
            v-if="eliminar"
            color="negative"
            icon="delete"
            @click="$emit('delete', props.row.id)"
            size="sm"
          />
        </q-td>
        <q-td :props="props" class="text-nowrap text-center" v-else>
          <q-btn color="info" icon="edit" class="q-mr-sm" size="sm" disable />
          <q-btn color="info" icon="delete" size="sm" disable />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
defineProps({
  rows: Array,
  columns: Array,
  estado: [Number, String],
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.thead-dark th {
  background-color: #343a40;
  color: white;
}
</style>
