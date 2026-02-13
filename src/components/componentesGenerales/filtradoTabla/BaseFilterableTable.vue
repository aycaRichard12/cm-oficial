<template>
  <q-table
    :title="title"
    :rows="filteredData"
    :columns="columns"
    :row-key="rowKey"
    :filter="search"
    v-model:pagination="pagination"
    :virtual-scroll="true"
    wrap-cells
  >
    <template v-slot:header-cell="props">
      <q-th
        :props="props"
        class="cursor-pointer text-left no-sort-icon"
        style="white-space: normal; vertical-align: top"
      >
        <div class="flex items-start no-wrap">
          <div class="flex items-center text-weight-bold q-pr-sm">
            {{ props.col.label }}
          </div>
          <ColumnFilter
            v-if="arrayHeaders.includes(props.col.name)"
            :column="props.col"
            :rows="preFilteredRowsForColumn(props.col)"
            :active-filter="activeFilters[props.col.name]"
            :sort-direction="
              pagination.sortBy === props.col.name ? (pagination.descending ? 'desc' : 'asc') : null
            "
            :data-type="props.col.dataType || 'text'"
            @column-filter-changed="handleFilterChange"
            @column-sort-changed="handleSortChange"
          />
        </div>
      </q-th>
    </template>
    <template v-slot:bottom-row>
      <q-tr class="text-weight-bold bg-grey-3">
        <q-td v-for="col in columns" :key="col.name" :class="[`text-right`]">
          <span v-if="totales[col.name] !== undefined">
            {{ totales[col.name] }}
          </span>
          <span v-else-if="col.name === props.nombreColumnaTotales" class="font-bold">
            Total General :
          </span>
          <span v-else></span>
        </q-td>
      </q-tr>
    </template>

    <template v-for="(_, slot) in $slots" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </q-table>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import ColumnFilter from './ColumnFilter.vue' // Asegúrate de que la ruta sea correcta

const props = defineProps({
  title: { type: String, default: 'Datos' },
  nombreColumnaTotales: { type: String, default: 'nombreColumnaTotales' },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  arrayHeaders: { type: Array, default: () => [] }, // Columnas que permiten filtrado
  sumColumns: { type: Array, default: () => [] }, // Columnas que permiten filtrado
  rowKey: { type: String, default: 'id' },
  search: { type: String, default: '' },
  filterMode: { type: String, default: 'client' }, // 'client' o 'server'
})

console.log(props.sumColumns)
console.log(props.rows)

const emit = defineEmits(['column-filter-changed'])
defineExpose({ obtenerDatosFiltrados: () => filteredData.value, getActiveFiltersReport })

const activeFilters = ref({})
const pagination = ref({
  sortBy: null,
  descending: false,
  rowsPerPage: 5,
})
// Cálculo de totales para columnas especificadas

const totales = computed(() => {
  const totals = {}
  props.sumColumns.forEach((colName) => {
    totals[colName] = filteredData.value.reduce((sum, row) => {
      const value = parseFloat(row[colName])

      return sum + (isNaN(value) ? 0 : value)
    }, 0)
    totals[colName] = Number(totals[colName].toFixed(2))
  })
  console.log(totals)
  return totals
})
// Forzar cálculo inicial
// --- Lógica de Filtrado y Ordenamiento ---

/**
 * Función que evalúa la condición lógica para un valor dado, basándose en el tipo de dato.
 * @param {any} rowValue - El valor de la fila a evaluar.
 * @param {object} condition - Objeto de condición (operator, value1, value2, active).
 * @param {string} dataType - Tipo de dato de la columna ('text', 'number', 'date').
 */
function evaluateCondition(rowValue, condition, dataType) {
  if (!condition.active) return true

  // Normalizar valores de condición a string para consistencia, pero convertir para la comparación
  const v1Str = String(condition.value1 || '').toLowerCase()
  //const v2Str = String(condition.value2 || '').toLowerCase()
  const rowValueStr = String(rowValue || '').toLowerCase()

  if (dataType === 'number') {
    const numValue = Number(rowValue)
    const numV1 = Number(condition.value1)
    const numV2 = Number(condition.value2)

    if (isNaN(numValue) || isNaN(numV1)) return false // Si no son números válidos, no pasa

    switch (condition.operator) {
      case 'equals':
        return numValue === numV1
      case 'not equals':
        return numValue !== numV1
      case '>':
        return numValue > numV1
      case '<':
        return numValue < numV1
      case '>=':
        return numValue >= numV1
      case '<=':
        return numValue <= numV1
      case 'between':
        return numValue >= numV1 && numValue <= numV2
      default:
        return false
    }
  }

  if (dataType === 'date') {
    // Asumimos formato YYYY-MM-DD para comparación estricta
    const dateValue = new Date(rowValue)
    const dateV1 = new Date(condition.value1)
    const dateV2 = new Date(condition.value2)

    // Comparamos el valor de tiempo (milisegundos)
    const timeValue = dateValue.getTime()
    const timeV1 = dateV1.getTime()
    const timeV2 = dateV2.getTime()

    // Validación básica de fechas válidas
    if (isNaN(timeValue) || isNaN(timeV1)) return false

    switch (condition.operator) {
      case 'equals':
        return rowValue === condition.value1 // Comparación estricta de string YYYY-MM-DD
      case 'before': // <
        return timeValue < timeV1
      case 'after': // >
        return timeValue > timeV1
      case 'between':
        if (isNaN(timeV2)) return false
        return timeValue >= timeV1 && timeValue <= timeV2
      default:
        return false
    }
  }

  // Condición Textual (Default)
  switch (condition.operator) {
    case 'contains':
      return rowValueStr.includes(v1Str)
    case 'equals':
      return rowValueStr === v1Str
    case 'starts with':
      return rowValueStr.startsWith(v1Str)
    case 'ends with':
      return rowValueStr.endsWith(v1Str)
    default:
      return false
  }
}
// ---------------------------
// Helpers
// ---------------------------
function getByPath(obj, path) {
  if (!obj || !path) return undefined
  // soporta 'cliente.nombre' o ['cliente','nombre']
  if (Array.isArray(path)) {
    return path.reduce((o, k) => (o ? o[k] : undefined), obj)
  }
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
}

/**
 * Normaliza y convierte el valor para una comparación robusta (smartCompare).
 * SE HA CORREGIDO: Se eliminó la limpieza agresiva de caracteres para permitir
 * el ordenamiento alfanumérico natural (natural sort).
 */
function normalizeValue(v) {
  if (v == null) return null

  let s = String(v).trim()

  if (s === '') return null

  // --- Lógica de Detección de Fechas (se mantiene) ---

  // detectar fecha dd/mm/yyyy o dd-mm-yyyy
  const dm = s.match(/^(\d{1,2})[-](\d{1,2})[-](\d{2,4})$/)
  if (dm) {
    const day = Number(dm[1])
    const month = Number(dm[2]) - 1
    const year = Number(dm[3].length === 2 ? '20' + dm[3] : dm[3])
    return new Date(year, month, day)
  }

  // detectar formato yyyy-mm-dd ó yyyy/mm/dd
  const ym = s.match(/^(\d{4})[-](\d{1,2})[-](\d{1,2})$/)
  if (ym) {
    const year = Number(ym[1])
    const month = Number(ym[2]) - 1
    const day = Number(ym[3])
    return new Date(year, month, day)
  }

  // --- Lógica de Detección de Números (revisada) ---

  // Intentar convertir a número solo si la cadena es puramente numérica (aceptando punto/coma como decimal)
  const sForNum = s.replace(',', '.')
  const num = Number(sForNum)

  // Usamos una regex estricta para asegurar que es un número puro.
  if (!isNaN(num) && sForNum.match(/^-?\d+(\.\d+)?$/)) {
    return num
  }

  // --- Lógica de Texto ---

  // texto normalizado (manteniendo el string original)
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// ---------------------------
// smartCompare robusto
// ---------------------------
function universalCompare(a, b) {
  const A = normalizeValue(a)
  const B = normalizeValue(b)

  // nulls al final
  if (A === null && B === null) return 0
  if (A === null) return 1
  if (B === null) return -1

  // fechas
  if (A instanceof Date && B instanceof Date) {
    return A.getTime() - B.getTime()
  }

  // números
  if (typeof A === 'number' && typeof B === 'number') {
    return A - B
  }

  // texto (uso de localeCompare con numeric: true para ordenamiento natural/alfanumérico)
  return String(A).localeCompare(String(B), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

/**
 * Aplica todos los filtros activos de columna (lógica AND) y la ordenación.
 */
const filteredData = computed(() => {
  let data = Array.isArray(props.rows) ? props.rows.slice() : []

  // Aplicar filtros de columna (no el filtro global 'search')
  Object.keys(activeFilters.value).forEach((col) => {
    const filterPayload = activeFilters.value[col]
    const column = props.columns.find((c) => c.name === col)

    if (!filterPayload || !column) return

    data = data.filter((row) => {
      const rowValue = getByPath(row, column.field) // Usar getByPath para campos anidados

      if (filterPayload.type === 'values' && filterPayload.values.length > 0) {
        // Filtrado por valores múltiples
        return filterPayload.values.includes(String(rowValue || '-').trim())
      } else if (
        filterPayload.type === 'condition' &&
        filterPayload.condition &&
        filterPayload.condition.active
      ) {
        // Filtrado por condición (>, <, between, contains, etc.)
        return evaluateCondition(rowValue, filterPayload.condition, column.dataType || 'text')
      }
      return true
    })
  })

  // ORDENAMIENTO robusto y estable
  if (pagination.value.sortBy) {
    const sortKey = pagination.value.sortBy
    const desc = pagination.value.descending

    data = data.slice().sort((a, b) => {
      // Usar getByPath en el ordenamiento para campos anidados
      const valA = getByPath(a, sortKey)
      const valB = getByPath(b, sortKey)

      const result = universalCompare(valA, valB)
      return desc ? -result : result
    })
  }
  return data
})

/**
 * Proporciona las filas a ColumnFilter.vue para que calcule los valores únicos,
 * respetando el filtrado de las OTRAS columnas.
 */
function preFilteredRowsForColumn(currentColumn) {
  let data = props.rows

  // Aplicar todos los filtros MENOS el filtro de la columna actual
  Object.keys(activeFilters.value).forEach((colName) => {
    if (colName === currentColumn.name) return // Omitir el filtro de la columna actual

    const filter = activeFilters.value[colName]
    const column = props.columns.find((c) => c.name === colName)
    if (!filter || !column) return

    data = data.filter((row) => {
      // Usar el field para acceder al valor en la fila
      const rowValue = getByPath(row, column.field)

      if (filter.type === 'values' && filter.values.length > 0) {
        return filter.values.includes(String(rowValue || '-').trim())
      } else if (filter.type === 'condition' && filter.condition && filter.condition.active) {
        // PASAR EL TIPO DE DATO DE LA COLUMNA AL EVALUAR
        return evaluateCondition(rowValue, filter.condition, column.dataType || 'text')
      }
      return true
    })
  })
  return data
}

// --- Manejadores de Eventos ---

function handleFilterChange(payload) {
  const colName = payload.column.name

  if (payload.values?.length > 0 || (payload.condition && payload.condition.active)) {
    // Aplica o actualiza el filtro
    activeFilters.value = { ...activeFilters.value, [colName]: payload }
  } else {
    // Elimina el filtro si no hay valores/condición activa
    delete activeFilters.value[colName]
    activeFilters.value = { ...activeFilters.value } // Forzar reactividad
  }

  // Notifica al componente padre si el modo es "server"
  if (props.filterMode === 'server') {
    const serverPayload = {}
    Object.keys(activeFilters.value).forEach((key) => {
      serverPayload[key] = {
        type: activeFilters.value[key].type,
        values: activeFilters.value[key].values,
        condition: activeFilters.value[key].condition,
      }
    })
    emit('column-filter-changed', serverPayload)
  }
}
/**
 * Aplica las reglas de conteo (<= 3 elementos: listar, > 3 elementos: 'Todos')
 * a una lista de valores.
 * @param {Array<string>} values - La lista de valores a formatear.
 * @returns {string} - El string formateado.
 */
function getUnfilteredResult(values) {
  const totalCount = values.length

  if (totalCount === 0) {
    return 'Sin Datos'
  }

  if (totalCount <= 3) {
    // Si el total es 3 o menos: listarlos.
    return values.join(', ')
  } else {
    // Si el total es más de 3: retornar "Todos".
    return 'Todos'
  }
}

/**
 * Obtiene un string formateado con los valores seleccionados para un filtro de columna.
 * @param {string} colName - El nombre de la columna (campo en activeFilters).
 * @returns {string} - El string formateado según las reglas.
 */
function getSelectedFilterValues(colName) {
  const filterPayload = activeFilters.value[colName]
  const column = props.columns.find((c) => c.name === colName)

  if (!column) {
    return 'N/A'
  }

  // Usamos props.rows para obtener la base de datos de la columna antes de cualquier filtro
  // Nota: Si quieres que el 'Todos' o la lista de valores SÓLO refleje los datos visibles por otros filtros,
  // usa 'preFilteredRowsForColumn(column)' aquí, como lo hiciste antes.
  const allUniqueValues = [
    ...new Set(props.rows.map((row) => String(getByPath(row, column.field) || '-').trim())),
  ].sort()

  // --- 1. Caso: SIN FILTRAR (el filtro no existe o no está activo/completo) ---
  if (!filterPayload || (filterPayload.type === 'values' && filterPayload.values.length === 0)) {
    // Usamos la función auxiliar para aplicar las reglas de conteo
    return getUnfilteredResult(allUniqueValues)
  }

  // --- 2. Caso: FILTRO DE VALORES ('values') ACTIVO ---
  if (filterPayload.type === 'values' && filterPayload.values.length > 0) {
    const selectedValues = filterPayload.values

    // Si la selección incluye todos los valores únicos (ej. el único elemento existente):
    if (selectedValues.length === allUniqueValues.length) {
      // Usamos la función auxiliar para aplicar las reglas de conteo, SIN RECURSIÓN
      return getUnfilteredResult(allUniqueValues)
    }

    // Si la selección es parcial: concatenar los seleccionados con salto de línea al tercer elemento.
    return selectedValues
      .map((val, index) => {
        // Salto de línea después del tercer elemento (índice 2) si hay más elementos
        if (index === 2 && selectedValues.length > 3) {
          return val + ',\n' // Agregar coma y salto de línea
        }
        return val
      })
      .join(', ')
      .replace(/,\n, /g, ',\n') // Limpiar comas extra si el salto de línea fue el último
  }

  // --- 3. Caso: FILTRO DE CONDICIÓN ('condition') ACTIVO ---
  if (
    filterPayload.type === 'condition' &&
    filterPayload.condition &&
    filterPayload.condition.active
  ) {
    const { operator, value1, value2 } = filterPayload.condition
    let conditionString = `[${operator}`

    if (value1) {
      conditionString += ` ${value1}`
    }

    if (operator === 'between' && value2) {
      conditionString += ` y ${value2}`
    }
    conditionString += `]`

    return conditionString
  }

  return 'Todos'
}

/**
 * Obtiene un objeto con todos los filtros activos de columna formateados.
 * @returns {object} - { columna1: 'valor1, valor2', columna2: 'Todos', ... }
 */
function getActiveFiltersReport() {
  const filtersReport = {}
  props.arrayHeaders.forEach((colName) => {
    // Si la columna es filtrable, obtenemos su valor formateado
    filtersReport[colName] = getSelectedFilterValues(colName)
  })
  return filtersReport
}

function handleSortChange(payload) {
  console.log('Sort changed:', payload)
  const { column, direction } = payload
  pagination.value.sortBy = direction === null ? null : column.name
  pagination.value.descending = direction === 'desc'
}
</script>

<style>
/* Estilo para ocultar el icono de ordenación por defecto de q-table */
.q-table th.no-sort-icon .q-table__sort-icon {
  display: none !important;
}
</style>
