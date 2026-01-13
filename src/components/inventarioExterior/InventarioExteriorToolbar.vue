
<template>
  <div class="row flex justify-between">
    <div>
      <q-btn color="primary" @click="$emit('toggleForm')" class="btn-res q-mt-lg">
        <q-icon name="save" class="icono" />
        <span class="texto">{{ formCollapse ? 'Cancelar Registro' : 'Nuevo Registro' }}</span>
      </q-btn>
    </div>

    <div class="col-12 col-md-4">
      <label for="almacen">Seleccione un Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenOptions"
        id="almacen"
        emit-value
        outlined
        map-options
        clearable
        name="filtroALmacen"
        dense
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="buscar">Buscar...</label>
      <q-input dense debounce="300" v-model="searchQuery" placeholder="Buscar..."></q-input>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formCollapse: Boolean,
  almacenOptions: Array,
  filtroAlmacen: String,
  searchQuery: String
})

const emit = defineEmits(['toggleForm', 'update:filtroAlmacen', 'update:searchQuery'])

const filtroAlmacen = computed({
  get: () => props.filtroAlmacen,
  set: (val) => emit('update:filtroAlmacen', val)
})

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
})
</script>
