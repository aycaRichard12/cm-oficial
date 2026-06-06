<!-- src/modules/quick-consult/pages/QuickConsultPage.vue -->
<template>
  <q-page class="quick-consult-page">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Consulta Rápida de Productos</q-toolbar-title>
      <q-btn flat round dense icon="shopping_cart" @click="toggleCartSheet">
        <q-badge
          v-if="cartStore.totalItems > 0"
          color="red"
          floating
          rounded
          :label="cartStore.totalItems"
        />
      </q-btn>
    </q-toolbar>

    <!-- Selectores de Almacén y Categoría de Precio -->
    <div class="row q-col-gutter-sm q-pa-sm bg-grey-2">
      <div class="col-12 col-sm-6">
        <q-select
          v-model="selectedWarehouse"
          :options="warehouses"
          label="Almacén"
          outlined
          dense
          bg-color="white"
          :loading="isLoadingWarehouses"
          @update:model-value="onWarehouseChange"
        >
          <template v-slot:prepend>
            <q-icon name="storefront" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-sm-6">
        <q-select
          v-model="selectedCategory"
          :options="priceCategories"
          label="Categoría de Precio"
          outlined
          dense
          bg-color="white"
          :loading="isLoadingCategories"
          :disable="!selectedWarehouse"
          @update:model-value="onCategoryChange"
        >
          <template v-slot:prepend>
            <q-icon name="payments" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <SearchBar
      v-model="productStore.searchTerm"
      :results-count="productStore.filteredProducts.length"
      :has-active-filters="productStore.hasActiveFilters"
      @open-filter="openFilterDrawer"
      @clear="handleClearSearch"
    />

    <q-inner-loading
      :showing="uiStore.isLoadingProducts || isLoadingWarehouses || isLoadingCategories"
      label="Actualizando..."
    />

    <!-- Estado vacío o lista -->
    <div
      v-if="!uiStore.isLoadingProducts && productStore.filteredProducts.length === 0"
      class="empty-state"
    >
      <q-icon name="inventory" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-7">No hay productos que coincidan</div>
      <div class="text-caption text-grey-6">Prueba con otros filtros o cambia la selección</div>
      <q-btn flat color="primary" label="Limpiar filtros" @click="productStore.clearFilters()" />
    </div>

    <ProductList
      v-else-if="!uiStore.isLoadingProducts"
      :products="productStore.filteredProducts"
      @add="handleAddToCart"
      class="col"
    />

    <!-- Panel de filtros avanzados -->
    <FilterDrawer />
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useQuickConsultProductStore } from '../stores/productStore'
import { useQuickConsultCartStore } from '../stores/cartStore'
import { useQuickConsultUiStore } from '../stores/uiStore'
import ProductList from '../components/catalog/ProductList.vue'
import SearchBar from '../components/common/SearchBar.vue'
import FilterDrawer from '../components/common/FilterDrawer.vue'
import { fetchWarehouses, fetchPriceCategories } from '../services/api'
import { validarUsuario } from 'src/composables/FuncionesG'

const $q = useQuasar()
const productStore = useQuickConsultProductStore()
const cartStore = useQuickConsultCartStore()
const uiStore = useQuickConsultUiStore()

// State para la selección de negocio
const warehouses = ref([])
const selectedWarehouse = ref(null)
const priceCategories = ref([])
const selectedCategory = ref(null)

const isLoadingWarehouses = ref(false)
const isLoadingCategories = ref(false)

// Abrir panel de filtros
const openFilterDrawer = () => {
  uiStore.setFilterDrawerOpen(true)
}

// Manejar limpieza de búsqueda desde SearchBar
const handleClearSearch = () => {
  productStore.setSearchTerm('')
}

/**
 * 1. Estado Inicial: Cargar almacenes del usuario
 */
const setupInitialData = async () => {
  isLoadingWarehouses.value = true
  try {
    const userData = validarUsuario()
    const usuarioId = userData[0]?.idusuario
    const empresaId = userData[0]?.empresa?.idempresa

    if (!usuarioId || !empresaId) throw new Error('Datos de usuario no encontrados')

    const data = await fetchWarehouses(usuarioId, empresaId)
    warehouses.value = data

    // Selección automática del primero
    if (warehouses.value.length > 0) {
      selectedWarehouse.value = warehouses.value[0]
      // El watch se encargará de cargar las categorías
    }
  } catch (error) {
    console.error('Error al cargar almacenes iniciales:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  } finally {
    isLoadingWarehouses.value = false
  }
}

/**
 * 2. Lógica de Reactividad: Cargar categorías al cambiar almacén
 */
const fetchCategoriesForWarehouse = async (almacenId) => {
  isLoadingCategories.value = true
  try {
    const userData = validarUsuario()
    const empresaId = userData[0]?.empresa?.idempresa

    const categories = await fetchPriceCategories(empresaId, almacenId)
    priceCategories.value = categories

    // Selección automática de la primera categoría
    if (priceCategories.value.length > 0) {
      selectedCategory.value = priceCategories.value[0]
      // El watch se encargará de cargar los productos
    } else {
      selectedCategory.value = null
      productStore.products = [] // Limpiar productos si no hay categorías
    }
  } catch (error) {
    console.error('Error al cargar categorías de precio:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar categorías de precio' })
  } finally {
    isLoadingCategories.value = false
  }
}

/**
 * 3. Persistencia y Filtrado: Cargar productos al cambiar categoría
 */
const loadProductsData = async () => {
  if (!selectedWarehouse.value || !selectedCategory.value) return

  uiStore.setLoading(true)
  try {
    await productStore.loadProducts(
      selectedWarehouse.value.value,
      selectedCategory.value.value,
      null, // campaignId opcional
    )

    // Código de prueba para 1000 productos (opcional, remover en prod)
    if (import.meta.env.DEV && productStore.products.length > 0) {
      const baseProducts = [...productStore.products]
      productStore.products = Array.from({ length: 1000 }, (_, i) => ({
        ...baseProducts[i % baseProducts.length],
        id: `test-${i}`,
        descripcion: `${baseProducts[i % baseProducts.length].descripcion} (Copia ${i})`,
      }))
    }
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar lista de productos' })
  } finally {
    uiStore.setLoading(false)
  }
}

// Handlers para cambios explícitos
const onWarehouseChange = () => {
  // Opcional: limpiar filtros al cambiar de almacén
  productStore.clearFilters()
}

const onCategoryChange = () => {
  // Lógica adicional si es necesaria
}

/**
 * Reactividad automática (Watches)
 */
watch(selectedWarehouse, (newVal) => {
  if (newVal) {
    fetchCategoriesForWarehouse(newVal.value)
  } else {
    priceCategories.value = []
    selectedCategory.value = null
  }
})

watch(selectedCategory, (newVal) => {
  if (newVal) {
    loadProductsData()
  }
})

// Agregar al carrito
const handleAddToCart = (product) => {
  cartStore.addProduct(product, 1)
  $q.notify({
    type: 'positive',
    message: `${product.descripcion || product.nombre} agregado al carrito`,
    position: 'bottom',
    timeout: 1500,
    actions: [{ icon: 'close', color: 'white' }],
  })
}

const toggleCartSheet = () => {
  $q.notify({ type: 'info', message: 'Carrito (próximamente)', position: 'top' })
}

onMounted(() => {
  setupInitialData()
})
</script>

<style scoped>
.quick-consult-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}
</style>
