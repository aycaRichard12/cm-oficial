<!-- src/modules/quick-consult/pages/QuickConsultPage.vue -->
<template>
  <q-page class="quick-consult-page">
    <!-- Header moderno con sombra y jerarquía -->
    <div class="header-modern">
      <div class="header-content">
        <div class="header-logo-section">
          <q-icon name="inventory_2" size="28px" class="header-icon" />
          <div class="header-text">
            <div class="header-title">Consulta Rápida de Productos</div>
            <div class="header-subtitle">Gestión de inventario y ventas</div>
          </div>
        </div>
        <div class="row q-gutter-x-sm">
          <q-btn flat round dense icon="qr_code_scanner" class="cart-button" @click="openScanner">
            <q-tooltip>Escanear código</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="shopping_cart" class="cart-button" @click="toggleCartSheet">
            <q-badge
              v-if="cartStore.totalItems > 0"
              color="positive"
              floating
              rounded
              :label="cartStore.totalItems"
              class="cart-badge"
            />
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Contenido principal con fondo corporativo -->
    <div class="page-content bg-fondo">
      <!-- Tarjeta de selectores -->
      <div class="selector-wrapper">
        <q-card class="selector-card" flat>
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
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
                  class="custom-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="storefront" color="primary" />
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
                  class="custom-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="payments" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-wrapper">
        <SearchBar
          v-model="productStore.searchTerm"
          :results-count="productStore.filteredProducts.length"
          :has-active-filters="productStore.hasActiveFilters"
          @open-filter="openFilterDrawer"
          @clear="handleClearSearch"
        />
      </div>

      <!-- Loading mejorado -->
      <q-inner-loading
        :showing="uiStore.isLoadingProducts || isLoadingWarehouses || isLoadingCategories"
        label="Cargando productos..."
        label-class="loading-label"
        class="custom-loading"
      />

      <!-- Transición suave para estados -->
      <transition name="fade" mode="out-in">
        <div
          v-if="!uiStore.isLoadingProducts && productStore.filteredProducts.length === 0"
          class="empty-state"
        >
          <div class="empty-icon-wrapper">
            <q-icon name="search_off" size="80px" color="grey-4" />
          </div>
          <div class="empty-title">No se encontraron productos</div>
          <div class="empty-description">
            No hay productos que coincidan con los criterios de búsqueda o filtros
          </div>
          <q-btn
            flat
            color="primary"
            label="Limpiar filtros"
            @click="productStore.clearFilters()"
            class="empty-button"
            no-caps
          />
        </div>

        <ProductList
          v-else-if="!uiStore.isLoadingProducts"
          :products="productStore.filteredProducts"
          @add="handleAddToCart"
          class="product-list-container"
        />
      </transition>
    </div>

    <!-- Paneles flotantes -->
    <FilterDrawer />
    <FloatingCartSummary />
    <CartBottomSheet :warehouse="selectedWarehouse" :category="selectedCategory" />
    <BarcodeScanner @scan="handleBarcodeScan" />
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
import FloatingCartSummary from '../components/cart/FloatingCartSummary.vue'
import CartBottomSheet from '../components/cart/CartBottomSheet.vue'
import BarcodeScanner from '../components/barcode/BarcodeScanner.vue'
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
      // productStore.products = Array.from({ length: 1000 }, (_, i) => ({
      //   ...baseProducts[i % baseProducts.length],
      //   id: `test-${i}`,
      //   descripcion: `${baseProducts[i % baseProducts.length].descripcion} (Copia ${i})`,
      // }))
      productStore.products = baseProducts
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
  uiStore.setCartSheetOpen(true)
}

const openScanner = () => {
  if (!selectedWarehouse.value || !selectedCategory.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona almacén y categoría primero',
    })
    return
  }
  uiStore.setScannerOpen(true)
}

const handleBarcodeScan = (barcode) => {
  const product = productStore.findProductByBarcode(barcode)

  if (product) {
    if (Number(product.stock) > 0) {
      cartStore.addProduct(product, 1)
      uiStore.setScannerOpen(false)
      $q.notify({
        type: 'positive',
        message: `Producto encontrado: ${product.descripcion}`,
        caption: `Código: ${barcode}`,
        position: 'top',
        timeout: 2000,
      })
    } else {
      $q.notify({
        type: 'warning',
        message: 'Producto sin stock',
        caption: product.descripcion,
        position: 'top',
      })
    }
  } else {
    $q.notify({
      type: 'negative',
      message: 'Producto no encontrado',
      caption: `Código: ${barcode}`,
      position: 'top',
      timeout: 2000,
    })
  }
}

onMounted(() => {
  setupInitialData()
})
</script>

<style scoped>
/* Variables y estilos base */
.quick-consult-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #eeebe2;
  position: relative;
}

/* Header moderno */
.header-modern {
  background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header-logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.header-subtitle {
  font-size: 0.8rem;
  opacity: 0.85;
  font-weight: 400;
  margin-top: 2px;
}

.cart-button {
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
}

.cart-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.cart-badge {
  font-weight: 600;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
}

/* Contenido principal */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  max-width: 100vw;
  margin: 0 auto;
  width: 100%;
}

/* Selector wrapper y tarjeta */
.selector-wrapper {
  margin-bottom: 24px;
}

.selector-card {
  border-radius: 16px;
  background: white;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.selector-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.custom-select :deep(.q-field__control) {
  border-radius: 10px;
  transition: all 0.2s ease;
}

.custom-select :deep(.q-field__control:hover) {
  border-color: #26a69a;
}

.custom-select :deep(.q-field__native) {
  font-weight: 500;
}

/* Search wrapper */
.search-wrapper {
  margin-bottom: 24px;
  border-radius: 12px;
}

/* Loading personalizado */
.custom-loading :deep(.q-loading) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-label {
  color: #004d40;
  font-weight: 600;
  margin-top: 12px;
}

/* Estado vacío moderno */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 400px;
}

.empty-icon-wrapper {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.empty-icon-wrapper:hover {
  transform: scale(1.05);
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #004d40;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 32px;
  max-width: 400px;
  line-height: 1.5;
}

.empty-button {
  padding: 8px 24px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.empty-button:hover {
  transform: translateY(-2px);
  background: rgba(0, 77, 64, 0.08);
}

/* Product list container */
.product-list-container {
  animation: fadeInUp 0.4s ease-out;
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }

  .header-content {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 1.2rem;
  }

  .header-subtitle {
    font-size: 0.7rem;
  }

  .header-icon {
    font-size: 24px;
  }

  .selector-card {
    border-radius: 12px;
  }

  .empty-state {
    padding: 32px 16px;
    min-height: 300px;
  }

  .empty-icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .empty-title {
    font-size: 1.2rem;
  }

  .empty-description {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header-logo-section {
    gap: 10px;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-subtitle {
    display: none;
  }

  .row.q-col-gutter-md {
    margin: -8px;
  }

  .row.q-col-gutter-md > div {
    padding: 8px;
  }
}

/* Scrollbar personalizado */
.page-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.page-content::-webkit-scrollbar-track {
  background: #f0f0e8;
  border-radius: 10px;
}

.page-content::-webkit-scrollbar-thumb {
  background: #004d40;
  border-radius: 10px;
}

.page-content::-webkit-scrollbar-thumb:hover {
  background: #26a69a;
}
</style>
