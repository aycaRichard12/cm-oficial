<template>
  <q-table title="Almacenes Asignados" :rows="rows" :columns="columns" row-key="id" flat bordered  id="tablaAlmacenesAsignados">
    <template v-slot:body-cell-opciones="props">
      <q-td align="center">
        <q-btn
          dense
          icon="delete"
          color="negative"
          @click="eliminar(props.row.id)"
          title="Eliminar"
          flat
          id="eliminarAlmacen"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['eliminar'])

const columns = [
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

function eliminar(id) {
  emit('eliminar', id)
}
</script>
