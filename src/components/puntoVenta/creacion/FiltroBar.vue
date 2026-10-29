<template>
  <q-row class="q-col-gutter-md items-center">
    <q-col cols="12" md="4">
      <q-btn :label="$t('ui.agregar-87ebee')" icon="add" color="primary" @click="$emit('add')" class="full-width" />
    </q-col>

    <q-col cols="12" md="4">
      <q-select
        v-model="filtroTipoAlmacen"
        :options="tiposAlmacen"
        :label="$t('ui.tipo-de-almacen-b9c1cd')"
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
        :placeholder="$t('common.search')"
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
