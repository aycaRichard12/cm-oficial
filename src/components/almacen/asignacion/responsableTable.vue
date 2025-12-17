<template>
  <div class="flex justify-between">
    <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
      <q-icon name="add" class="icono" />
      <span class="texto">Nueva Asignación</span>
    </q-btn>
    <div>
      <label for="buscar">Buscar...</label>
      <q-input dense outlined debounce="300" v-model="search" id="buscar" />
    </div>
  </div>
  <q-table
    title="Responsables"
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="search"
    flat
    bordered
  >
    <template v-slot:body-cell-opciones="props">
      <q-td>
        <q-btn-group outline flat>
          <q-btn
            dense
            icon="delete"
            color="negative"
            @click="eliminar(props.row.id)"
            title="Eliminar"
            flat
          />
          <q-btn
            dense
            icon="add_box"
            color="primary"
            @click="asignarAlmacenes(props.row)"
            title="Asignar Almacen"
            flat
          />
        </q-btn-group>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const search = ref('')

const columns = [
  {
    name: 'usuario',
    label: 'Usuario',
    field: (row) => row.usuario?.usuario || '',
    align: 'left',
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: (row) => row.usuario?.nombre || '',
  },
  {
    name: 'apellido',
    label: 'Apellido',
    field: (row) => row.usuario?.apellido || '',
  },
  {
    name: 'cargo',
    label: 'Cargo',
    field: (row) => row.usuario?.cargo || '',
  },
  {
    name: 'opciones',
    label: 'Opciones',
    field: '',
    align: 'center',
  },
]

const emit = defineEmits(['eliminar', 'asignar'])

function eliminar(id) {
  emit('eliminar', id)
}

function asignarAlmacenes(responsable) {
  emit('asignar', responsable)
}
</script>
