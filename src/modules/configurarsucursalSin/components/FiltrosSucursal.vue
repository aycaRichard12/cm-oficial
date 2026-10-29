<template>
  <div class="row q-col-gutter-md q-mb-md items-center">
    <div class="col-12 col-sm-6 col-md-3">
      <q-input
        v-model="searchModel"
        dense
        outlined
        :label="$t('ui.buscar-sucursal-ed898b')"
        clearable
        debounce="300"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-6 col-sm-3 col-md-2">
      <q-select v-model="paisModel" :options="paises" outlined dense :label="$t('ui.pais-0c664f')" clearable />
    </div>
    <div class="col-6 col-sm-3 col-md-2">
      <q-select
        v-model="municipioModel"
        :options="municipios"
        outlined
        dense
        :label="$t('ui.municipio-9e8609')"
        clearable
      />
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <q-select
        v-model="statusModel"
        :options="statusOptions"
        outlined
        dense
        :label="$t('cotizacion.table.status')"
        emit-value
        map-options
      />
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
  { label: i18nT('ui.todas-8a3c34'), value: 'all' },
  { label: i18nT('ui.asignadas-c5e188'), value: 'assigned' },
  { label: i18nT('ui.no-asignadas-93e23c'), value: 'unassigned' },
]
</script>
