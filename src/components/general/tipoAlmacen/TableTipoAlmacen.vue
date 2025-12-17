<template>
  <div>
    <!-- <div class="column" style="height: 50px">
      <q-input
        v-model="search"
        debounce="300"
        filled
        dense
        placeholder="Buscar..."
        class="q-mb-md self-end"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div> -->
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="registrar Tipo Almacén"
        id="add"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">Agregar</span>
      </q-btn>

      <div>
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="search"
          dense
          id="buscar"
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
      title="Tipos de Almacén"
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="search"
      id="table"
    >
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="primary"
            dense
            flat
            @click="$emit('edit', props.row)"
            title="Editar"
            id="edit"
          />
          <q-btn
            icon="delete"
            dense
            flat
            color="negative"
            @click="$emit('delete', props.row)"
            title="Eliminar"
            id="delete"
          />
          <q-btn
            title="Cambiar de estado"
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            id="status"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: Array,
})
const search = ref('')
const filteredRows = computed(() => {
  const base = props.rows || []
  const term = search.value.toLowerCase()
  const filtrado = base.filter((row) => {
    const tipo = (row.tipoalmacen || '').toLowerCase()
    const desc = (row.descripcion || '').toLowerCase()
    const estadoText = Number(row.estado) === 1 ? 'activo' : 'inactivo'
    return tipo.includes(term) || desc.includes(term) || estadoText.includes(term)
  })

  return filtrado.map((row, index) => ({
    ...row,
    numero: index + 1, // corrige el index
  }))
})

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'left' },
  { name: 'tipoalmacen', label: 'Nombre', field: 'tipoalmacen', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]
</script>
