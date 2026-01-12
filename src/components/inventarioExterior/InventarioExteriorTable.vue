
<template>
  <q-table
    title="Inventario Externo"
    :rows="rows"
    :columns="columns"
    row-key="id"
    bordered
    flat
    class="q-mt-sm"
    table-class="table-striped"
    table-header-class="thead-dark"
  >
    <template v-slot:body-cell-Autorización="props">
      <q-td :props="props" class="text-center">
        <q-btn
          :color="Number(props.row.Autorización) === 1 ? 'positive' : 'negative'"
          @click="$emit('toggleAutorizacion', props.row)"
          :icon="Number(props.row.Autorización) === 1 ? 'thumb_up_alt' : 'thumb_down_alt'"
          size="sm"
        >
        <q-tooltip>Click para autorizar</q-tooltip>
      </q-btn>
      </q-td>
    </template>

    <template v-slot:body-cell-Detalle="props">
      <q-td :props="props" class="text-center">
        <q-btn color="primary" label="Productos" @click="$emit('showDetail', props.row)" size="sm" >
          <q-tooltip>Ver Productos</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template v-slot:body-cell-Opciones="props">
      <q-td :props="props" class="text-nowrap text-center">
        <InventarioExteriorTableActions 
            :row="props.row" 
            :editar="editar" 
            :eliminar="eliminar"
            @edit="(row) => $emit('editItem', row)"
            @delete="(row) => $emit('deleteItem', row)"
            @viewMap="(row) => $emit('viewMap', row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import InventarioExteriorTableActions from './InventarioExteriorTableActions.vue'

defineProps({
  rows: Array,
  columns: Array,
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})

defineEmits(['toggleAutorizacion', 'showDetail', 'editItem', 'deleteItem'])
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
