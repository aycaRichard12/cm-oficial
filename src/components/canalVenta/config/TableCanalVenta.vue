<template>
  <div class="q-pa-md">
    <div class="flex justify-between">
      <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
        <q-icon name="add" class="icono" />
        <span class="texto">Agregar</span>
      </q-btn>

      <!-- <div class="col flex items-center justify-end">
        <q-input v-model="search" placeholder="Buscar" dense outlined class="q-ml-md">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div> -->
      <div>
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="search"
          id="buscar"
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: white"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="processedRows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      :filter="search"
      class="sticky-table"
      title="Canal Venta"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn
            icon="edit"
            color="primary"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            flat
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            flat
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'canal', label: 'Canal', field: 'canal', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

const search = ref('')

const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
</script>

<style scoped>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
