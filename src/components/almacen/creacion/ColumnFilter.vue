<template>
  <q-btn
    :icon="filterActive || sortActive ? 'filter_list' : 'filter_list'"
    :color="filterActive || sortActive ? 'blue' : 'grey'"
    size="sm"
    flat
    round
    dense
    class="q-ml-xs"
    aria-label="Filtro y orden de columna"
  >
    <q-badge v-if="filterCount > 0" color="red" floating>{{ filterCount }}</q-badge>
    <q-icon
      v-if="sortDirection === 'asc'"
      name="arrow_upward"
      size="1.1em"
      style="position: absolute; top: -5px; right: -5px"
      color="blue"
    />
    <q-icon
      v-if="sortDirection === 'desc'"
      name="arrow_downward"
      size="1.1em"
      style="position: absolute; top: -5px; right: -5px"
      color="blue"
    />

    <q-menu>
      <q-card style="min-width: 300px">
        <q-list dense padding>
          <q-item clickable v-close-popup @click="applySort('asc')">
            <q-item-section avatar style="min-width: 36px">
              <q-icon name="arrow_upward" />
            </q-item-section>
            <q-item-section>Ordenar de menor a mayor</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="applySort('desc')">
            <q-item-section avatar style="min-width: 36px">
              <q-icon name="arrow_downward" />
            </q-item-section>
            <q-item-section>Ordenar de mayor a menor</q-item-section>
          </q-item>
          <q-item v-if="sortDirection" clickable v-close-popup @click="clearSort">
            <q-item-section avatar style="min-width: 36px">
              <q-icon name="sort" />
            </q-item-section>
            <q-item-section>Quitar orden</q-item-section>
          </q-item>
        </q-list>

        <q-separator />

        <q-tabs
          v-model="tab"
          dense
          class="text-grey-7"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="values" label="Valores" />
          <q-tab name="condition" label="Condiciones" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated style="max-height: 400px; overflow-y: auto">
          <q-tab-panel name="values" class="q-pa-sm">
            <q-input v-model="quickSearch" dense debounce="300" placeholder="Buscar valor...">
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>

            <q-checkbox v-model="selectAll" label="Seleccionar todo" dense class="q-mt-sm" />

            <q-list style="max-height: 200px; overflow-y: auto" separator>
              <q-item v-for="val in filteredUniqueValues" :key="val" dense tag="label">
                <q-item-section avatar>
                  <q-checkbox v-model="localSelectedValues" :val="val" dense />
                </q-item-section>
                <q-item-section>{{ val }} ({{ valueCounts[val] || 0 }})</q-item-section>
              </q-item>
              <q-item v-if="!filteredUniqueValues.length" dense>
                <q-item-section class="text-caption text-grey">No hay resultados.</q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="condition" class="q-pa-sm">
            <q-select
              v-model="localCondition.operator"
              :options="getConditionOptions(dataType)"
              label="Operador"
              dense
              class="q-mb-md"
            />
            <q-input
              v-if="localCondition.operator !== 'between'"
              v-model="localCondition.value1"
              :label="getLabelForValue(dataType)"
              dense
              debounce="300"
              :type="dataType === 'number' ? 'number' : 'text'"
            />
            <div v-else>
              <q-input
                v-model="localCondition.value1"
                label="Valor Inicial"
                dense
                debounce="300"
                class="q-mb-sm"
                :type="dataType === 'number' ? 'number' : 'text'"
              />
              <q-input
                v-model="localCondition.value2"
                label="Valor Final"
                dense
                debounce="300"
                :type="dataType === 'number' ? 'number' : 'text'"
              />
            </div>
            <q-checkbox
              v-model="localCondition.active"
              label="Activar Condición"
              dense
              class="q-mt-sm"
            />
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <div class="q-pa-sm flex justify-end q-gutter-sm">
          <q-btn label="Limpiar" color="negative" flat @click="clearFilter" />
          <q-btn label="Cancelar" color="grey" flat v-close-popup />
          <q-btn label="Aplicar" color="primary" @click="applyFilter" v-close-popup />
        </div>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  column: { type: Object, required: true },
  rows: { type: Array, required: true },
  activeFilter: { type: Object, default: () => ({}) },
  sortDirection: { type: String, default: null },
  dataType: { type: String, default: 'text' }, // Nuevo prop: 'text', 'number', 'date'
})

const emit = defineEmits(['column-filter-changed', 'column-sort-changed'])

const tab = ref('values')
const quickSearch = ref('')

const allUniqueValues = computed(() => {
  const values = {}
  props.rows.forEach((row) => {
    // Usa el campo para obtener el valor
    const rowValue = row[props.column.field]

    // CASO ESPECIAL: Si es una columna para una propiedad dentro de un array (como 'sucursal' con row.sucursales[0].nombre)
    // El componente padre debe asegurarse de que la prop 'rows' pasada a ColumnFilter ya contenga
    // el valor plano o se debe manejar la lógica aquí si es conocida (ej. para 'sucursal' en almacenTable)
    const val = String(rowValue || '-').trim()
    values[val] = (values[val] || 0) + 1
  })
  return Object.keys(values).sort()
})

const valueCounts = computed(() => {
  const counts = {}
  props.rows.forEach((row) => {
    const val = String(row[props.column.field] || '-').trim()
    counts[val] = (counts[val] || 0) + 1
  })
  return counts
})

const localSelectedValues = ref([])
const localCondition = ref({
  active: false,
  operator: props.dataType === 'number' ? 'equals' : 'contains', // Operador inicial por defecto
  value1: null,
  value2: null,
})

// Inicializar estado local con el filtro activo pasado por prop
watch(
  () => props.activeFilter,
  (newFilter) => {
    if (newFilter.type === 'values') {
      localSelectedValues.value = newFilter.values || []
      localCondition.value = {
        active: false,
        operator: localCondition.value.operator,
        value1: null,
        value2: null,
      }
    } else if (newFilter.type === 'condition') {
      // Usar la condición existente si está activa, sino resetear la de 'values'
      localCondition.value = newFilter.condition
      localSelectedValues.value = []
    } else {
      localSelectedValues.value = []
      localCondition.value = {
        active: false,
        operator: localCondition.value.operator,
        value1: null,
        value2: null,
      }
    }
  },
  { immediate: true, deep: true },
)

// Lógica para el checkbox "Seleccionar todo"
const selectAll = computed({
  get: () =>
    localSelectedValues.value.length === allUniqueValues.value.length &&
    allUniqueValues.value.length > 0,
  set: (val) => {
    // Asegurarse de que solo selecciona los valores visibles tras la búsqueda rápida
    localSelectedValues.value = val ? filteredUniqueValues.value : []
  },
})

// Filtrar valores únicos por búsqueda rápida
const filteredUniqueValues = computed(() => {
  if (!quickSearch.value) return allUniqueValues.value
  const searchLower = quickSearch.value.toLowerCase()
  return allUniqueValues.value.filter((val) => String(val).toLowerCase().includes(searchLower))
})

// --- ESTADO ACTIVO ---
const filterActive = computed(
  () => localSelectedValues.value.length > 0 || localCondition.value.active,
)
const sortActive = computed(() => !!props.sortDirection)

const filterCount = computed(() => {
  if (localSelectedValues.value.length > 0) return localSelectedValues.value.length
  if (localCondition.value.active) return 1
  return 0
})

// --- FUNCIONES DE ORDENAMIENTO ---
function applySort(direction) {
  emit('column-sort-changed', {
    column: props.column,
    direction: direction,
  })
}

function clearSort() {
  applySort(null)
}

// --- FUNCIONES DE FILTRO ---
function getConditionOptions(dataType) {
  if (dataType === 'number') {
    return ['equals', 'not equals', '>', '<', '>=', '<=', 'between']
  } else if (dataType === 'date') {
    return ['before', 'after', 'between']
  }
  // Default: 'text'
  return ['contains', 'equals', 'starts with', 'ends with']
}

function getLabelForValue(dataType) {
  if (dataType === 'number') return 'Valor Numérico'
  if (dataType === 'date') return 'Fecha (YYYY-MM-DD)'
  return 'Texto'
}

function clearFilter() {
  localSelectedValues.value = []
  localCondition.value = {
    active: false,
    operator: props.dataType === 'number' ? 'equals' : 'contains',
    value1: null,
    value2: null,
  }
  applyFilter()
}

function applyFilter() {
  let payload = { column: props.column, type: null, values: [], condition: null }

  if (tab.value === 'values' && localSelectedValues.value.length > 0) {
    payload.type = 'values'
    // IMPORTANTE: Solo enviamos los valores seleccionados del modo 'values'
    payload.values = localSelectedValues.value
  } else if (tab.value === 'condition' && localCondition.value.active) {
    payload.type = 'condition'
    // IMPORTANTE: Normalizamos los valores de condición a string para su manejo en la tabla base
    payload.condition = {
      ...localCondition.value,
      value1: localCondition.value.value1 !== null ? String(localCondition.value.value1) : null,
      value2: localCondition.value.value2 !== null ? String(localCondition.value.value2) : null,
    }
  } else {
    // Limpiar filtro si no hay selección/condición activa
    payload = { column: props.column }
  }

  emit('column-filter-changed', payload)
}
</script>
