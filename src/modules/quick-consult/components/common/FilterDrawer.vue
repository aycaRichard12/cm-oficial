<!-- src/modules/quick-consult/components/common/FilterDrawer.vue -->
<template>
  <q-dialog v-model="isOpen" position="bottom" full-width>
    <q-card style="border-radius: 16px 16px 0 0">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Filtros avanzados</q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-gutter-md">
        <!-- Filtro por categoría -->
        <div>
          <div class="text-subtitle2 q-mb-xs">Categoría</div>
          <q-select
            v-model="localCategory"
            :options="categoryOptions"
            label="Seleccionar categoría"
            dense
            outlined
            clearable
            emit-value
            map-options
            options-dense
          />
        </div>

        <!-- Filtro por rango de precios -->
        <div>
          <div class="text-subtitle2 q-mb-xs">Rango de precio</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.number="localMinPrice"
                type="number"
                label="Precio mínimo"
                dense
                outlined
                clearable
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="localMaxPrice"
                type="number"
                label="Precio máximo"
                dense
                outlined
                clearable
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Limpiar todo" @click="clearAll" color="negative" />
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn label="Aplicar" color="primary" @click="applyFilters" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuickConsultProductStore } from '../../stores/productStore'
import { useQuickConsultUiStore } from '../../stores/uiStore'

const productStore = useQuickConsultProductStore()
const uiStore = useQuickConsultUiStore()
const { selectedCategory, priceRange } = storeToRefs(productStore)

// Estado local del formulario
const localCategory = ref(selectedCategory.value)
const localMinPrice = ref(priceRange.value.min)
const localMaxPrice = ref(priceRange.value.max)

// Opciones de categorías únicas desde los productos cargados
const categoryOptions = computed(() => {
  const cats = new Set()
  productStore.products.forEach((p) => {
    if (p.categoria) cats.add(p.categoria)
  })
  return Array.from(cats)
    .sort()
    .map((cat) => ({ label: cat, value: cat }))
})

// Control de apertura/cierre
const isOpen = computed({
  get: () => uiStore.isFilterDrawerOpen,
  set: (val) => uiStore.setFilterDrawerOpen(val),
})

// Aplicar filtros
const applyFilters = () => {
  productStore.setCategory(localCategory.value || null)
  productStore.setPriceRange(localMinPrice.value || null, localMaxPrice.value || null)
  uiStore.setFilterDrawerOpen(false)
}

// Limpiar todos los filtros
const clearAll = () => {
  localCategory.value = null
  localMinPrice.value = null
  localMaxPrice.value = null
  productStore.clearFilters()
  uiStore.setFilterDrawerOpen(false)
}

// Sincronizar estado local cuando se abre el diálogo (para reflejar cambios externos)
watch(isOpen, (open) => {
  if (open) {
    localCategory.value = selectedCategory.value
    localMinPrice.value = priceRange.value.min
    localMaxPrice.value = priceRange.value.max
  }
})
</script>

<style scoped>
.q-dialog__card {
  max-height: 70vh;
}
</style>
