<template>
  <q-table
    title="Operaciones Registradas"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :loading="loading"
    flat
    bordered
  >
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" class="q-gutter-xs">
        <q-btn
          icon="delete"
          color="negative"
          dense
          flat
          round
          @click="$emit('on-delete', props.row.id_operacion)"
        >
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
defineProps(['rows', 'loading'])
defineEmits(['on-delete'])

const columns = [
  { name: 'id_operacion', align: 'left', label: 'ID', field: 'id_operacion', sortable: true },
  { name: 'codigo', align: 'left', label: 'Código', field: 'codigo', sortable: true },
  { name: 'operacion', align: 'left', label: 'Operación', field: 'operacion' },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]
</script>
