<template>
  <q-table
    title="Lista de Categorías"
    :rows="categorias"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :rows-per-page-options="[10, 25, 50, 100]"
    no-data-label="No se encontraron categorías de precios."
  >
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge :color="props.row.estado === 1 ? 'green' : 'red'">
          {{ props.row.estado === 1 ? 'Activo' : 'Inactivo' }}
        </q-badge>
      </q-td>
    </template>

    <template v-slot:body-cell-acciones="props">
      <q-td :props="props">
        <q-btn
          icon="edit"
          flat
          round
          dense
          color="primary"
          @click="$emit('editar', props.row)"
          title="Editar"
        />
        <q-btn
          :icon="props.row.estado === 1 ? 'toggle_off' : 'toggle_on'"
          flat
          round
          dense
          :color="props.row.estado === 1 ? 'red' : 'green'"
          @click="$emit('cambiar-estado', props.row)"
          :title="props.row.estado === 1 ? 'Desactivar' : 'Activar'"
        />
        <q-btn
          icon="delete"
          flat
          round
          dense
          color="negative"
          @click="$emit('eliminar', props.row)"
          title="Eliminar"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// --- Definición de Props ---
defineProps({
  categorias: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// --- Definición de Emits ---
defineEmits(['editar', 'eliminar', 'cambiar-estado'])

// --- Configuración de QTable ---
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre_categoria',
    label: 'Nombre',
    field: 'nombre_categoria',
    align: 'left',
    sortable: true,
  },
  {
    name: 'porcentaje',
    label: 'Porcentaje (%)',
    field: 'porcentaje',
    align: 'right',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]
</script>
