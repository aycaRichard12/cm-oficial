<template>
  <div class="row q-col-gutter-md q-mb-md items-center">
    <div class="col-12 col-sm-6 col-md-3">
      <q-input
        v-model="searchModel"
        dense
        outlined
        label="Buscar sucursal"
        clearable
        debounce="300"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-6 col-sm-3 col-md-2">
      <q-select v-model="paisModel" :options="paises" outlined dense label="País" clearable />
    </div>
    <div class="col-6 col-sm-3 col-md-2">
      <q-select
        v-model="municipioModel"
        :options="municipios"
        outlined
        dense
        label="Municipio"
        clearable
      />
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <q-select
        v-model="statusModel"
        :options="statusOptions"
        outlined
        dense
        label="Estado"
        emit-value
        map-options
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  search: String,
  pais: String,
  municipio: String,
  status: String,
  paises: Array,
  municipios: Array,
})

const emit = defineEmits(['update:search', 'update:pais', 'update:municipio', 'update:status'])

const searchModel = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val),
})
const paisModel = computed({
  get: () => props.pais,
  set: (val) => emit('update:pais', val),
})
const municipioModel = computed({
  get: () => props.municipio,
  set: (val) => emit('update:municipio', val),
})
const statusModel = computed({
  get: () => props.status,
  set: (val) => emit('update:status', val),
})

const statusOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Asignadas', value: 'assigned' },
  { label: 'No asignadas', value: 'unassigned' },
]
</script>
