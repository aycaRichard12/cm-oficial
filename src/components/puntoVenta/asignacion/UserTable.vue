<template>
<div class="row items-center justify-between q-col-gutter-md q-mb-md">

  <!-- Título -->
  <div class="col-12 col-md-auto">
    <div class="text-h5 text-weight-bold text-primary">
      Asignación de Responsables
    </div>
    <div class="text-subtitle2 text-grey-7">
      Seleccione un usuario para gestionar sus puntos de venta
    </div>
  </div>

  <!-- Buscador -->
  <div class="col-12 col-md-3">
    <q-input
      v-model="filter"
      dense
      outlined
      debounce="300"
      placeholder="Buscar usuario..."
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
  </div>

</div>

  <q-table
    id="tableUsuarios"
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
          id="agregarPuntosVenta"
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
