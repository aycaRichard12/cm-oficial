
<template>
  <q-table
  id="tableExterno"
    :title="$t('ui.inventario-externo-b41a8a')"
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
          v-if="Number(props.row.Autorización) !== 1"
          id="btnAutorizacion"
          color="negative"
          @click="$emit('toggleAutorizacion', props.row)"
          icon="thumb_down_alt"
          size="sm"
        >
          <q-tooltip>{{ $t('ui.click-para-autorizar-b14f5e') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          id="btnAutorizado"
          color="positive"
          icon="thumb_up_alt"
          size="sm"
          flat
          disable
          style="cursor: default; opacity: 1"
        >
          <q-tooltip>{{ $t('ui.ya-autorizado-no-se-puede-desactivar-a6d396') }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template v-slot:body-cell-Detalle="props">
      <q-td :props="props" class="text-center">
        <q-btn color="primary" :label="$t('ui.productos-14e2a6')" @click="$emit('showDetail', props.row)" size="sm" id="btnDetalle">
          <q-tooltip>{{ $t('ui.ver-productos-247831') }}</q-tooltip>
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
  color: var(--cm-on-primary);
}
</style>
