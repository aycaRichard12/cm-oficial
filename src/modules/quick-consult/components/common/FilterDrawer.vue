<!-- src/modules/quick-consult/components/common/FilterDrawer.vue -->
<template>
  <q-dialog v-model="isOpen" position="bottom" full-width>
    <q-card class="filter-drawer-card">
      <!-- ENCABEZADO MEJORADO -->
      <q-toolbar class="bg-primary text-white q-px-md q-py-sm">
        <q-icon name="filter_alt" size="24px" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-medium">
          Filtros avanzados
          <span class="text-caption text-weight-regular q-ml-sm" style="opacity: 0.8">
            Refina tu búsqueda
          </span>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup>
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
            Cerrar panel
          </q-tooltip>
        </q-btn>
      </q-toolbar>

      <!-- CONTENIDO CON SECCIONES MEJORADAS -->
      <q-card-section class="q-pa-md q-gutter-lg">
        <!-- Sección: Categoría -->
        <div class="filter-section">
          <div class="filter-section-header row items-center q-mb-sm">
            <q-icon name="category" size="20px" color="primary" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-medium">Categoría</span>
          </div>
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
            class="filter-select"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="18px" color="grey-6" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="localCategory"
                name="close"
                class="cursor-pointer"
                @click.stop="localCategory = null"
              />
            </template>
            <q-tooltip anchor="top middle" self="bottom middle">
              Filtra productos por su categoría
            </q-tooltip>
          </q-select>
        </div>

        <q-separator spaced />

        <!-- Sección: Rango de precio -->
        <div class="filter-section">
          <div class="filter-section-header row items-center q-mb-sm">
            <q-icon name="attach_money" size="20px" color="primary" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-medium">Rango de precio</span>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localMinPrice"
                type="number"
                label="Precio mínimo"
                dense
                outlined
                clearable
                class="price-input"
              >
                <template v-slot:prepend>
                  <q-icon name="trending_up" size="18px" color="grey-6" />
                </template>
                <q-tooltip anchor="top middle" self="bottom middle">
                  Precio mínimo (mayor o igual)
                </q-tooltip>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localMaxPrice"
                type="number"
                label="Precio máximo"
                dense
                outlined
                clearable
                class="price-input"
              >
                <template v-slot:prepend>
                  <q-icon name="trending_down" size="18px" color="grey-6" />
                </template>
                <q-tooltip anchor="top middle" self="bottom middle">
                  Precio máximo (menor o igual)
                </q-tooltip>
              </q-input>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- ACCIONES MEJORADAS -->
      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn
          flat
          label="Limpiar todo"
          icon="delete_sweep"
          @click="clearAll"
          color="negative"
          no-caps
        >
          <q-tooltip anchor="top middle" self="bottom middle">
            Eliminar todos los filtros
          </q-tooltip>
        </q-btn>
        <q-btn flat label="Cancelar" icon="close" v-close-popup color="grey-7" no-caps />
        <q-btn
          label="Aplicar"
          icon="check"
          color="primary"
          @click="applyFilters"
          unelevated
          no-caps
          class="apply-btn"
        >
          <q-tooltip anchor="top middle" self="bottom middle"> Aplicar filtros y cerrar </q-tooltip>
        </q-btn>
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
/* ===== TARJETA PRINCIPAL ===== */
.filter-drawer-card {
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  background-color: white;
}

/* ===== SECCIONES DE FILTRO ===== */
.filter-section {
  width: 100%;
}

.filter-section-header {
  margin-bottom: 8px;
}

/* ===== ESTILOS DE INPUTS Y SELECTS ===== */
.filter-select :deep(.q-field__control),
.price-input :deep(.q-field__control) {
  transition: all 0.2s ease;
  border-radius: 12px;
}

.filter-select :deep(.q-field__control:hover),
.price-input :deep(.q-field__control:hover) {
  background-color: #f8fafc;
}

.filter-select :deep(.q-field__control:focus-within),
.price-input :deep(.q-field__control:focus-within) {
  box-shadow: 0 0 0 2px rgba(0, 77, 64, 0.2);
  border-color: #004d40;
}

/* Mejora del label */
.filter-select :deep(.q-field__label),
.price-input :deep(.q-field__label) {
  font-weight: 500;
}

/* ===== BOTÓN APLICAR ===== */
.apply-btn {
  min-width: 100px;
  transition: transform 0.1s ease;
}

.apply-btn:active {
  transform: scale(0.97);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 599px) {
  .filter-drawer-card {
    max-height: 90vh;
  }

  .q-toolbar .text-caption {
    display: none; /* Ocultar subtítulo en móvil para ahorrar espacio */
  }

  .filter-section-header .text-subtitle1 {
    font-size: 1rem;
  }

  .q-card-actions {
    flex-wrap: wrap;
    justify-content: stretch;
  }

  .q-card-actions .q-btn {
    flex: 1;
    margin: 4px 0;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .apply-btn {
    min-width: 120px;
  }
}
</style>
