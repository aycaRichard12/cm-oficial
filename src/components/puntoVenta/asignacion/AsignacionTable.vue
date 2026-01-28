<template>
  <div class="assignment-management">
    <!-- Header con filtro principal -->
    <q-slide-transition>
      <q-card class="management-header q-mb-lg" flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-col-gutter-lg">
            <div class="col">
              <div class="text-h6 text-weight-medium text-grey-9 q-mb-xs">
                Filtro de Asignaciones
              </div>
              <div class="text-subtitle2 text-grey-6">
                Seleccione un almacén para visualizar sus asignaciones
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Campo de filtro principal -->
          <div class="filter-container" id="filtrarAlmacenes">
            <div class="row items-end q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="filterWarehouse"
                  :options="warehouses"
                  id="alamacen"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="id"
                  option-label="name"
                  @update:model-value="$emit('loadAssignments', filterWarehouse)"
                  class="animated-filter-select"
                  placeholder="Seleccione un almacén..."
                  behavior="menu"
                  dropdown-icon="expand_more"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" size="sm" color="primary" class="q-mr-xs" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      v-if="filterWarehouse"
                      name="check_circle"
                      color="positive"
                      size="xs"
                      class="q-mr-xs"
                    />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <div class="filter-status q-pa-sm bg-grey-2 rounded-borders">
                  <div class="row items-center">
                    <q-icon name="info" size="sm" color="info" class="q-mr-sm" />
                    <div class="text-caption">
                      <span v-if="filterWarehouse" class="text-weight-medium">
                        Mostrando asignaciones del almacén seleccionado
                      </span>
                      <span v-else class="text-grey-6">
                        Seleccione un almacén para ver las asignaciones
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>

    <!-- Tabla de resultados con animación -->

    <div v-if="filterWarehouse" class="assignments-table-container">
      <q-card class="assignments-card shadow-1" flat bordered>
        <!-- Header de la tabla -->
        <q-card-section class="bg-grey-1">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-h6 text-weight-medium text-grey-9">Asignaciones Registradas</div>
              <div class="text-caption text-grey-6">
                {{ processedRows.length }} registros encontrados
              </div>
            </div>

            <div class="col-auto">
              <q-input
                dense
                debounce="300"
                v-model="filter"
                placeholder="Buscar en asignaciones..."
                outlined
                class="search-input"
                style="min-width: 300px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
                <template v-slot:append>
                  <q-icon v-if="filter" name="clear" class="cursor-pointer" @click="filter = ''" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Tabla de datos -->
        <q-table
          :rows="processedRows"
          :columns="columns"
          :filter="filter"
          row-key="id"
          class="my-sticky-table"
          flat
          bordered
          :loading="!processedRows.length"
          loading-label="Cargando asignaciones..."
          no-data-label="No se encontraron asignaciones"
        >
          <!-- Header personalizado -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-grey-2 text-grey-8">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Celdas del cuerpo -->
          <template v-slot:body-cell-opciones="props">
            <!-- Columna de opciones -->
            <q-td :props="props" class="text-center options-cell" id="opciones">
              <q-btn
                round
                color="negative"
                icon="delete"
                dense
                @click="$emit('delete', props.row.id)"
                flat
                class="action-button"
                :ripple="{ center: true }"
                size="sm"
              >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Eliminar asignación
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Información adicional -->
      <div class="table-info q-mt-md">
        <q-card flat class="bg-grey-1">
          <q-card-section class="q-py-xs">
            <div class="row items-center justify-center">
              <q-icon name="info" size="xs" color="info" class="q-mr-sm" />
              <div class="text-caption text-grey-7">
                Las asignaciones eliminadas no se pueden recuperar. Verifique antes de proceder.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assignment-management {
  animation: fadeIn 0.5s ease-out;
}

.management-header {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.management-header:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.filter-container {
  padding: 8px 0;
}

.filter-label {
  display: flex;
  align-items: center;
}

.filter-hint {
  font-size: 0.875rem;
  line-height: 1.4;
}

.filter-status {
  border-left: 4px solid var(--q-info);
  animation: slideInRight 0.3s ease-out;
}

.animated-filter-select :deep(.q-field__control) {
  transition: all 0.2s ease;
  border-radius: 8px;
  min-height: 48px;
}

.animated-filter-select :deep(.q-field__control:hover) {
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.animated-filter-select :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary);
  box-shadow: 0 2px 12px rgba(var(--q-primary-rgb), 0.15);
}

.assignments-table-container {
  animation: slideUp 0.4s ease-out;
}

.assignments-card {
  border-radius: 12px;
  overflow: hidden;
}

.search-input :deep(.q-field__control) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-input :deep(.q-field__control:hover) {
  border-color: var(--q-primary);
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: rgba(var(--q-primary-rgb), 0.04) !important;
  transform: translateY(-1px);
}

.options-cell {
  min-width: 80px;
}

.action-button {
  transition: all 0.2s ease !important;
}

.action-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.action-button:active {
  transform: scale(0.95);
}

.empty-state {
  animation: fadeIn 0.6s ease-out;
}

.empty-card {
  border-radius: 12px;
  border-style: dashed;
  border-width: 2px;
  border-color: var(--q-grey-3);
  background-color: var(--q-grey-1);
}

.empty-icon {
  animation: pulse 2s ease-in-out infinite;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .management-header {
    border-radius: 8px;
  }

  .search-input {
    min-width: 100% !important;
    margin-top: 16px;
  }

  .filter-container .row {
    flex-direction: column;
  }

  .filter-container .col-md-6 {
    width: 100%;
  }

  .assignments-card {
    border-radius: 8px;
  }
}

@media (max-width: 599px) {
  .empty-card {
    padding: 32px 16px !important;
  }

  .table-info .text-caption {
    font-size: 0.75rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .assignment-management,
  .management-header,
  .animated-filter-select :deep(.q-field__control),
  .table-row,
  .action-button,
  .empty-state,
  .empty-icon,
  .assignments-table-container,
  .filter-status {
    transition: none !important;
    animation: none !important;
  }

  .table-row:hover {
    transform: none !important;
  }

  .action-button:hover {
    transform: none !important;
  }
}

/* Estados de focus para accesibilidad */
.animated-filter-select :deep(.q-field--focused) {
  outline: 2px solid rgba(var(--q-primary-rgb), 0.3);
  outline-offset: 2px;
}

.search-input :deep(.q-field--focused) {
  outline: 2px solid rgba(var(--q-primary-rgb), 0.3);
  outline-offset: 2px;
}

.action-button:focus-visible {
  outline: 2px solid var(--q-negative);
  outline-offset: 2px;
}
</style>
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  assignments: {
    type: Array,
    required: true,
    default: () => [],
  },
  warehouses: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const filter = ref('')
const filterWarehouse = ref(null)
const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'center',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'center',
    field: 'descripcion',
    sortable: true,
  },
  {
    name: 'opciones',
    label: 'Opciones',
    align: 'center',
    field: 'opciones',
    sortable: false,
  },
]
const processedRows = computed(() => {
  if (!filterWarehouse.value) return []
  return props.assignments.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
</script>
