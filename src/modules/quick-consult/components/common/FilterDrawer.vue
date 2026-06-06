<template>
  <q-drawer
    v-model="uiStore.isFilterDrawerOpen"
    side="right"
    overlay
    bordered
    class="bg-grey-1"
    :width="300"
  >
    <div class="column full-height">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Filtros</q-toolbar-title>
        <q-btn flat round dense icon="close" @click="uiStore.setFilterDrawerOpen(false)" />
      </q-toolbar>

      <div class="col scroll q-pa-md">
        <!-- Búsqueda -->
        <div class="q-mb-lg">
          <div class="text-subtitle2 q-mb-xs">Búsqueda rápida</div>
          <q-input
            v-model="searchTerm"
            placeholder="Nombre, código o barras..."
            outlined
            dense
            clearable
            @update:model-value="onFilterChange"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Categorías -->
        <div class="q-mb-lg">
          <div class="text-subtitle2 q-mb-xs">Categoría</div>
          <q-select
            v-model="selectedCategory"
            :options="categories"
            outlined
            dense
            clearable
            placeholder="Todas las categorías"
            @update:model-value="onFilterChange"
          />
        </div>

        <!-- Rango de Precios -->
        <div class="q-mb-lg">
          <div class="text-subtitle2 q-mb-sm">Rango de precio (BOB)</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.number="priceMin"
                type="number"
                label="Min"
                outlined
                dense
                @update:model-value="onFilterChange"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="priceMax"
                type="number"
                label="Max"
                outlined
                dense
                @update:model-value="onFilterChange"
              />
            </div>
          </div>
        </div>
      </div>

      <q-separator />

      <div class="q-pa-md bg-white">
        <q-btn
          label="Limpiar Filtros"
          color="grey-7"
          flat
          class="full-width q-mb-sm"
          @click="clearFilters"
        />
        <q-btn
          label="Aplicar"
          color="primary"
          class="full-width"
          @click="uiStore.setFilterDrawerOpen(false)"
        />
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuickConsultProductStore } from '../../stores/productStore'
import { useQuickConsultUiStore } from '../../stores/uiStore'

const productStore = useQuickConsultProductStore()
const uiStore = useQuickConsultUiStore()

const searchTerm = ref(productStore.searchTerm)
const selectedCategory = ref(productStore.selectedCategory)
const priceMin = ref(productStore.priceRange.min)
const priceMax = ref(productStore.priceRange.max)

// Obtener categorías únicas de los productos cargados
const categories = computed(() => {
  const cats = productStore.products
    .map((p) => p.categoria)
    .filter((c) => !!c)
  return [...new Set(cats)].sort()
})

// Sincronizar cambios de UI a Store
const onFilterChange = () => {
  productStore.setSearchTerm(searchTerm.value || '')
  productStore.setCategory(selectedCategory.value)
  productStore.setPriceRange(priceMin.value, priceMax.value)
}

// Limpiar filtros
const clearFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = null
  priceMin.value = null
  priceMax.value = null
  productStore.clearFilters()
}

// Sincronizar desde el store (por si se limpian desde fuera)
watch(() => productStore.searchTerm, (val) => { searchTerm.value = val })
watch(() => productStore.selectedCategory, (val) => { selectedCategory.value = val })
watch(() => productStore.priceRange, (val) => {
  priceMin.value = val.min
  priceMax.value = val.max
}, { deep: true })
</script>

<style scoped>
.scroll {
  overflow-y: auto;
}
</style>
