<!-- src/modules/quick-consult/components/common/SearchBar.vue -->
<template>
  <q-card flat bordered class="search-bar-card">
    <div class="search-bar q-pa-md">
      <!-- Fila principal: input + acciones en escritorio -->
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md">
          <q-input
            ref="searchInputRef"
            v-model="localSearchTerm"
            borderless
            dense
            rounded
            placeholder="Buscar por nombre, código o código de barras..."
            class="search-input"
            @update:model-value="onSearchInput"
          >
            <template #prepend>
              <q-icon name="search" size="22px" color="primary" />
            </template>
            <template #append>
              <q-btn
                v-if="localSearchTerm"
                flat
                round
                dense
                icon="close"
                class="clear-btn"
                @click="clearSearch"
              >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Limpiar búsqueda
                </q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="filter_alt"
                :color="hasActiveFilters ? 'primary' : 'grey-7'"
                class="filter-btn"
                @click="$emit('open-filter')"
              >
                <q-badge
                  v-if="hasActiveFilters"
                  color="secondary"
                  rounded
                  floating
                  class="filter-badge"
                  transparent
                />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  {{ hasActiveFilters ? 'Filtros activos' : 'Abrir filtros' }}
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <!-- Contador de resultados (alineado a la derecha en escritorio) -->
        <div v-if="showResultsCount && resultsCount >= 0" class="col-12 col-md-auto">
          <div class="results-count">
            <q-icon name="sell" size="16px" class="q-mr-xs" color="secondary" />
            <span class="text-weight-medium">
              {{ resultsCount }} producto{{ resultsCount !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDebounce } from '../../composables/useDebounce'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  resultsCount: {
    type: Number,
    default: 0,
  },
  showResultsCount: {
    type: Boolean,
    default: true,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'open-filter', 'clear'])

const localSearchTerm = ref(props.modelValue)
const searchInputRef = ref(null)

// Debounce para emitir el cambio de búsqueda
const debouncedEmit = useDebounce((value) => {
  emit('update:modelValue', value)
}, 300)

const onSearchInput = (value) => {
  debouncedEmit(value)
}

const clearSearch = () => {
  localSearchTerm.value = ''
  emit('update:modelValue', '')
  emit('clear')
  searchInputRef.value?.focus()
}

// Sincronizar cambios externos
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localSearchTerm.value) {
      localSearchTerm.value = newVal
    }
  },
)

// Auto-foco al montar
import { onMounted } from 'vue'
onMounted(() => {
  searchInputRef.value?.focus()
})
</script>

<style scoped>
/* ===== CONTENEDOR PRINCIPAL ===== */
.search-bar-card {
  background-color: white;
  border-radius: 16px;
  transition: box-shadow 0.2s ease;
  margin-bottom: 4px;
}

.search-bar {
  background-color: transparent;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* ===== INPUT DE BÚSQUEDA ===== */
.search-input :deep(.q-field__control) {
  background-color: #f5f7fb;
  border-radius: 48px;
  padding: 0 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.search-input :deep(.q-field__control:hover) {
  background-color: #edf2f7;
}

.search-input :deep(.q-field__control:focus-within) {
  background-color: white;
  border-color: #004d40;
  box-shadow: 0 0 0 3px rgba(0, 77, 64, 0.1);
}

.search-input :deep(.q-field__native) {
  font-size: 1rem;
  padding: 12px 0;
}

/* Placeholder más claro */
.search-input :deep(.q-field__native::-webkit-input-placeholder) {
  color: #94a3b8;
  font-weight: 400;
}

/* ===== BOTÓN LIMPIAR ===== */
.clear-btn {
  transition: all 0.2s ease;
  margin-right: 4px;
}

.clear-btn:hover {
  background-color: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* ===== BOTÓN FILTRO ===== */
.filter-btn {
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: rgba(0, 77, 64, 0.08);
  transform: scale(1.02);
}

/* Badge flotante mejorado */
.filter-badge {
  top: 2px;
  right: 2px;
  min-width: 10px;
  height: 10px;
  padding: 0;
  border-radius: 10px;
  box-shadow: 0 0 0 1px white;
}

/* ===== CONTADOR DE RESULTADOS ===== */
.results-count {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 32px;
  padding: 6px 16px;
  color: #1e293b;
  font-size: 0.875rem;
  white-space: nowrap;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.results-count span {
  color: #004d40;
  font-weight: 600;
  margin-left: 4px;
}

/* ===== RESPONSIVIDAD ===== */
@media (max-width: 767px) {
  .search-bar {
    padding: 12px;
  }

  .results-count {
    justify-content: center;
    width: 100%;
    margin-top: 12px;
    white-space: normal;
    gap: 8px;
  }

  .search-input :deep(.q-field__native) {
    font-size: 0.9rem;
    padding: 10px 0;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .results-count {
    padding: 4px 14px;
  }
}

/* Mejora en el sticky para dar sensación de elevación al hacer scroll */
.search-bar-card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.03);
}
</style>
