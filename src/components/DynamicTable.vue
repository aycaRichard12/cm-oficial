<template>
  <q-table
    :rows="data"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="localPagination"
    @request="onRequest"
  >
    <template v-slot:top>
      <div class="text-h6">{{ title }}</div>
      <q-space />
      <q-btn color="primary" label="Refresh" @click="$emit('refresh')" :loading="loading" />
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn flat round dense color="primary" icon="edit" @click="$emit('edit', props.row)" />
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete"
          @click="$emit('delete', props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    }),
  },
  title: {
    type: String,
    default: 'Tabla de Datos',
  },
})

const emit = defineEmits(['edit', 'delete', 'refresh', 'update:pagination'])
console.log(props.columns)
// Usamos una copia local para la paginación
const localPagination = ref({ ...props.pagination })

// Actualizamos la copia local cuando cambia la prop
watch(
  () => props.pagination,
  (newVal) => {
    localPagination.value = { ...newVal }
  },
  { deep: true },
)

// Emitimos los cambios de paginación
watch(
  localPagination,
  (newVal) => {
    emit('update:pagination', { ...newVal })
  },
  { deep: true },
)

const onRequest = (requestProps) => {
  localPagination.value = requestProps.pagination
  emit('request', requestProps)
}
</script>
