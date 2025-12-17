<template>
  <div>
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('new-item')"
        class="btn-res q-mt-lg"
        title="Registrar Categoria"
      >
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
      :filter="search"
      title="Categorias"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="primary"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            title="Editar"
            flat
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            title="Eliminar"
            flat
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            title="Cambiar de Estado"
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

defineEmits(['new-item', 'edit-item', 'delete-item', 'status-change'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'categoria', label: 'Categorías', field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const search = ref('')

// Procesamos las filas para adaptarlas a la estructura que necesitamos
const processedRows = computed(() => {
  return props.rows.map((item, index) => ({
    id: item.id,
    numero: index + 1,
    categoria: item.idp == 0 ? item.nombre : '', // Mostrar en categoría solo si es padre
    subcategoria: item.idp != 0 ? item.nombre : '', // Mostrar en subcategoría solo si es hijo
    descripcion: item.descripcion,
    estado: item.estado,
    originalData: item, // Mantenemos los datos originales por si los necesitamos
  }))
})
</script>

<style scoped></style>
