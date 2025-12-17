<template>
  <div class="q-pa-md">
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="Registrar Almacen"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">Agregar</span>
      </q-btn>
      <q-btn color="info" outline @click="mostrarReporte" class="btn-res q-mt-lg">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista previa PDF</span>
      </q-btn>
      <div>
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

    <q-table
      title="Almacenes"
      :rows="filteredData"
      :columns="columnas"
      row-key="id"
      :filter="search"
    >
      <template v-slot:header-cell="props">
        <q-th
          :props="props"
          @click="props.col.sortable && props.sort(props.col)"
          class="cursor-pointer text-left no-sort-icon"
          style="white-space: normal; vertical-align: top"
        >
          <div class="flex items-start no-wrap">
            <div class="flex items-center text-weight-bold q-pr-sm">
              {{ props.col.label }}
            </div>
            <ColumnFilter
              v-if="ArrayHeaders.includes(props.col.name)"
              :column="props.col"
              :rows="rows"
              :active-filter="activeFilters[props.col.name]"
              :sort-direction="
                pagination.sortBy === props.col.name
                  ? pagination.descending
                    ? 'desc'
                    : 'asc'
                  : null
              "
              @column-filter-changed="handleFilterChange"
              @column-sort-changed="handleSortChange"
            />
          </div>
        </q-th>
      </template>

      <template v-slot:body-cell-sucursal="props">
        <q-td :props="props">
          <span v-if="props.row.sucursales?.length" class="text-primary text-weight-medium">
            {{ props.row.sucursales[0].nombre }}
          </span>
          <span v-else>-</span>
        </q-td>
      </template>

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
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            title="Eliminar"
            flat
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            title="Cambiar de Estadato"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ColumnFilter from './ColumnFilter.vue'
import { PDFalmacenes } from 'src/utils/pdfReportGenerator'

const activeFilters = ref({})
const props = defineProps({
  rows: { type: Array, required: true, default: () => [] },
  filterMode: { type: String, default: 'client' }, // 'client' o 'server'
})

const emit = defineEmits([
  'add',
  'edit-item',
  'delete-item',
  'toggle-status',
  'mostrarReporte',
  'column-filter-changed',
])

const pdfData = ref(null)
const mostrarModal = ref(false)
const search = ref('')
const ArrayHeaders = [
  'codigo',
  'nombre',
  'direccion',
  'telefono',
  'email',
  'tipoalmacen',
  'stockmin',
  'stockmax',
  'sucursal',
  'estado',
]
const columnas = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'tipoalmacen', label: 'Tipo almacén', field: 'tipoalmacen', align: 'left' },
  { name: 'stockmin', label: 'Stock min', field: 'stockmin' },
  { name: 'stockmax', label: 'Stock max', field: 'stockmax' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

/**
 * Lógica de filtrado de condiciones (simulación).
 */
function evaluateCondition(rowValue, condition) {
  if (!condition.active) return true

  const value = String(rowValue).toLowerCase()
  const v1 = String(condition.value1 || '').toLowerCase()
  const numValue = Number(rowValue)
  const numV1 = Number(condition.value1)
  const numV2 = Number(condition.value2)

  switch (condition.operator) {
    // Texto
    case 'contains':
      return value.includes(v1)
    case 'equals':
      return value === v1
    case 'starts with':
      return value.startsWith(v1)
    case 'ends with':
      return value.endsWith(v1)

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

const pagination = ref({
  sortBy: null, // Columna por la que se ordena
  descending: false, // Dirección del orden
})

/**
 * Función que aplica todos los filtros activos de columna (lógica AND).
 */
const filteredData = computed(() => {
  if (props.filterMode === 'server') {
    return props.rows // No filtrar en cliente, solo devolver las filas que el servidor envíe
  }

  let data = props.rows

  // Lógica AND entre columnas
  Object.keys(activeFilters.value).forEach((colName) => {
    const filter = activeFilters.value[colName]
    const column = columnas.find((c) => c.name === colName)
    if (!filter || !column) return

    data = data.filter((row) => {
      const rowValue = row[column.field]
      let passesFilter = false

      if (filter.type === 'values' && filter.values.length > 0) {
        // Lógica OR: pasa si el valor está en la lista de seleccionados
        // Normaliza el valor para comparación (e.g., para Sucursal)
        let actualValue = rowValue
        if (colName === 'sucursal' && row.sucursales?.length) {
          actualValue = row.sucursales[0].nombre
        }
        passesFilter = filter.values.includes(String(actualValue || '-').trim())
      }

      if (filter.type === 'condition' && filter.condition && filter.condition.active) {
        // Lógica de Condiciones: pasa si se cumple la condición
        passesFilter = evaluateCondition(rowValue, filter.condition)
      }

      return passesFilter
    })
  })
  const { sortBy, descending } = pagination.value
  if (sortBy) {
    // Busca el 'field' correcto en base al 'name' de la columna
    const sortField = columnas.find((c) => c.name === sortBy)?.field || sortBy

    data.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      let comparison = 0
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB
      } else {
        // Asegura comparación de strings
        comparison = String(valA || '').localeCompare(String(valB || ''))
      }

      return descending ? -comparison : comparison
    })
  }
  return data
})

/**
 * Maneja el evento emitido por ColumnFilter.vue
 */
function handleFilterChange(payload) {
  // Asegura que el nombre de columna exista en el payload
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
    // El payload debe contener solo la información necesaria para el backend
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
function handleSortChange(payload) {
  const { column, direction } = payload
  pagination.value.sortBy = direction === null ? null : column.name
  pagination.value.descending = direction === 'desc'
}
function mostrarReporte() {
  const doc = PDFalmacenes(props)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>
<style>
.q-table th.no-sort-icon .q-table__sort-icon {
  display: none !important;
}
</style>
