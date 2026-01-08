<template>
  <div class="flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      class="btn-res q-mt-lg"
      title="Registrar Parametro"
      id="agregarParametro"
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
    <div id="buscarParametro">
      <label for="buscar"> Buscar...</label>
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
    id="tablaParametro"
    :rows="processedRows"
    :columns="columns"
    row-key="id"
    :filter="search"
    :pagination="pagination"
    flat
    bordered
    title="Parametros Obsolescencia"
  >
    <template v-slot:body-cell-color="props">
      <q-td :props="props">
        <q-badge :style="`background-color: ${props.row.color}; width: 100%; height: 24px;`" />
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
          title="Editar"
          flat
          id="editarParametro"
        />
        <q-btn
          icon="delete"
          color="negative"
          dense
          @click="$emit('delete-item', props.row)"
          title="Eliminar"
          flat
          id="eliminarParametro"
        />
      </q-td>
    </template>
  </q-table>
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

defineEmits(['add', 'edit-item', 'delete-item'])

const nombreColores = {
  '#FF0000': 'Rojo',
  '#00FF00': 'Verde',
  '#0000FF': 'Azul',
  '#FFFF00': 'Amarillo',
  '#FFA500': 'Naranja',
  '#800080': 'Morado',
  '#FFC0CB': 'Rosado',
  '#FFFFFF': 'Blanco',
  '#808080': 'Gris',
  '#8B4513': 'Marrón',
  '#87CEEB': 'Celeste',
}

const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  {
    name: 'nombre',
    label: 'Parámetro',
    field: 'nombre',
    align: 'left',
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'center',
  },
  {
    name: 'colorNombre',
    label: 'Nombre color',
    field: 'colorNombre',
    align: 'left',
  },
  {
    name: 'color',
    label: 'Color',
    field: 'color',
    align: 'center',
  },
  {
    name: 'opciones',
    label: 'Opciones',
    field: 'opciones',
    align: 'center',
  },
]

const search = ref('')
const pagination = ref({
  rowsPerPage: 10,
})

const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
    colorNombre: nombreColores[row.color] || 'Desconocido',
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
