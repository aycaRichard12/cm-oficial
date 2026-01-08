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
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
          @click="$emit('toggle-status', props.row)"
        >
          <q-tooltip>Autorizar Operación</q-tooltip>
        </q-btn>
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
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Autorizado" outline />
        <q-badge color="red" v-else label="No Autorizado" outline />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
defineProps(['rows', 'loading'])
defineEmits(['on-delete'])

const columns = [
  { name: 'id', align: 'left', label: 'N°', field: 'id', sortable: true },
  { name: 'usuario', align: 'left', label: 'Usuario', field: 'usuario', sortable: true },
  { name: 'codigo', align: 'left', label: 'Código', field: 'codigo', sortable: true },
  { name: 'operacion', align: 'left', label: 'Operación', field: 'operacion' },
  { name: 'estado', align: 'left', label: 'Estado', field: 'estado' },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]
</script>
