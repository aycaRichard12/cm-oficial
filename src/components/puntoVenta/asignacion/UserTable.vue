<template>
  <div class="flex justify-end">
    <div class="q-mb-md">
      <label for="buscar">Buscar...</label>
      <q-input dense outlined debounce="300" v-model="filter" id="buscar" />
    </div>
  </div>

  <q-table
    bordered
    title="Usuarios"
    :rows="processedRows"
    :columns="columnas"
    :filter="filter"
    row-key="id"
  >
    <template v-slot:body-cell-opciones="props">
      <q-td class="text-center">
        <q-btn
          color="primary"
          icon="add"
          round
          size="sm"
          @click="asignarPuntoVenta(props.row)"
          title="Asignar Puntos de Venta"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  users: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const filter = ref('')

const columnas = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'apellido', label: 'Apellido', field: 'apellido', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargo', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const processedRows = computed(() => {
  return props.users.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
const emit = defineEmits(['asignar'])

function asignarPuntoVenta(usuario) {
  emit('asignar', usuario)
}
</script>
