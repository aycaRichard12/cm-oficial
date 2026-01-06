<!-- components/TableLeyendas.vue -->
<template>
  <div>
    <div class="flex justify-between">
      <q-btn
        id="add"
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="Registrar Leyenda"
      >
        <q-icon name="add" class="icono" />

        <span class="texto">Agregar</span>
      </q-btn>
      <div>
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="busqueda"
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

    <!-- <div class="col flex items-center justify-end">
      <q-input
        dense
        outlined
        debounce="300"
        v-model="busqueda"
        placeholder="Buscar"
        class="q-mb-md"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div> -->

    <!-- Tabla -->
    <q-table
      id="table"
      title="Leyendas"
      :rows="filtradas"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      :filter="busqueda"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-acciones="props">
        <q-td align="center">
          <q-btn
            id="edit"
            icon="edit"
            color="primary"
            dense
            flat
            @click="$emit('edit', props.row)"
            title="Editar"
          />
          <q-btn
            id="delete"
            icon="delete"
            dense
            flat
            color="negative"
            @click="$emit('delete', props.row)"
            title="Eliminar"
          />
          <q-btn
            title="Cambiar Estado"
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
  leyendas: Array,
})

const busqueda = ref('')

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'texto', label: 'Leyenda', field: 'texto', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
// const filtradas = computed(() =>
//   props.leyendas.filter((l) => l.texto.toLowerCase().includes(busqueda.value.toLowerCase())),
// )
const filtradas = computed(() => {
  const term = busqueda.value.toLowerCase()
  const base = props.leyendas || []
  const filtrado = !term
    ? base
    : base.filter((row) => {
        const texto = (row.texto || '').toLowerCase()
        const estado = Number(row.estado) === 1 ? 'activo' : 'inactivo'
        return texto.includes(term) || estado.includes(term)
      })

  return filtrado.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
</script>
