<!-- src/modules/quick-consult/components/common/SearchBar.vue -->
<template>
  <div class="search-bar q-pa-sm bg-white">
    <q-input
      ref="searchInputRef"
      v-model="localSearchTerm"
      outlined
      dense
      rounded
      placeholder="Buscar por nombre, código o código de barras..."
      class="search-input"
      @update:model-value="onSearchInput"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
      <template #append>
        <q-icon v-if="localSearchTerm" name="clear" class="cursor-pointer" @click="clearSearch" />
        <q-btn
          flat
          round
          dense
          icon="filter_alt"
          :color="hasActiveFilters ? 'primary' : 'grey-7'"
          @click="$emit('open-filter')"
        >
          <q-badge v-if="hasActiveFilters" color="primary" floating rounded />
        </q-btn>
      </template>
    </q-input>
    <div v-if="showResultsCount" class="results-count text-caption text-grey-6 q-ml-sm">
      {{ resultsCount }} producto{{ resultsCount !== 1 ? 's' : '' }}
    </div>
  </div>
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
.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e0e0e0;
}
.search-input {
  width: 100%;
}
.results-count {
  margin-top: 4px;
}
</style>
