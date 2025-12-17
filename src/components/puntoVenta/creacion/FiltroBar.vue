<template>
  <q-row class="q-col-gutter-md items-center">
    <q-col cols="12" md="4">
      <q-btn label="Agregar" icon="add" color="primary" @click="$emit('add')" class="full-width" />
    </q-col>

    <q-col cols="12" md="4">
      <q-select
        v-model="filtroTipoAlmacen"
        :options="tiposAlmacen"
        label="Tipo de almacén"
        emit-value
        map-options
        dense
        outlined
        clearable
        class="full-width"
      />
    </q-col>

    <q-col cols="12" md="4">
      <q-input
        v-model="search"
        placeholder="Buscar..."
        dense
        outlined
        debounce="300"
        class="full-width"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-col>
  </q-row>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tiposAlmacen: Array,
  filtroTipoAlmacen: String,
  search: String,
})
const search = ref({ ...props.search })
const filtroTipoAlmacen = ref({ ...props.filtroTipoAlmacen })

defineEmits(['update:filtroTipoAlmacen', 'update:search', 'add'])
</script>
