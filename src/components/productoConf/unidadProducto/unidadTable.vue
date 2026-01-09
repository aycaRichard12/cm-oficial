<template>
  <div class="flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      unelevated
      class="btn-res q-mt-lg"
      title="Registrar Unidad"
      id="agregarUnidadMedidaProducto"
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
    <div id="buscarUnidadMedidaProducto">
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

  <q-table title="Unidades" :rows="ordenados" :columns="columns" row-key="id" :filter="search" id="tablaUnidadMedidaProducto">
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
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
          id="editarUnidadMedidaProducto"
        />
        <q-btn
          icon="delete"
          color="negative"
          dense
          @click="$emit('delete-item', props.row)"
          title="Eliminar"
          flat
          id="eliminarUnidadMedidaProducto"
        />
        <q-btn
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
          @click="$emit('toggle-status', props.row)"
          title="Cambiar de Estado"
          id="cambiarEstadoUnidadMedidaProducto"
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

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' , id: 'numeroUnidadMedidaProducto'},
  { name: 'nombre', label: 'Unidad', field: 'nombre', align: 'left' , id: 'nombreUnidadMedidaProducto'},
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' , id: 'descripcionUnidadMedidaProducto'},
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' , id: 'estadoUnidadMedidaProducto'},
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' , id: 'opcionesUnidadMedidaProducto'},
]
const ordenados = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)
const search = ref('')
</script>

<style scoped>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
