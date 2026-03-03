<template>
  <div class="q-table__container q-mt-md" style="max-height: 500px; overflow-y: auto">
    <q-table
      :rows="rows"
      :columns="computedColumns"
      row-key="N°"
      bordered
      flat
      class="q-mt-sm"
      table-class="table-striped"
      table-header-class="thead-dark"
    >
      <template v-slot:body-cell-Opciones="props">
        <q-td
          v-if="Number(estado) !== 1 || permisoInventarioExterno"
          :props="props"
          class="text-nowrap text-center"
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
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePermisosUsuario } from 'src/composables/inventarioExterior/usePermisosUsuario'

const props = defineProps({
  rows: Array,
  columns: Array,
  estado: [Number, String],
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})

const { permisoInventarioExterno, verificarPermisoUsuario } = usePermisosUsuario()

defineEmits(['edit', 'delete'])

const computedColumns = computed(() => {
  if ((Number(props.estado) === 1 && !permisoInventarioExterno.value) || (!props.editar && !props.eliminar)) {
    return props.columns.filter(col => col.name !== 'Opciones')
  }
  return props.columns
})

onMounted(() => {
  verificarPermisoUsuario()
})

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
