// src/modules/quick-consult/stores/productStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchProducts, fetchCampaignPrices } from '../services/api'

export const useQuickConsultProductStore = defineStore('quickConsultProduct', () => {
  // State
  const products = ref([])
  const searchTerm = ref('')
  const selectedCategory = ref(null)
  const priceRange = ref({ min: null, max: null })

  // Getters
  const filteredProducts = computed(() => {
    let result = products.value

    // 1. Filtro por búsqueda global (descripción, código, código_barras)
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.descripcion?.toLowerCase().includes(term) ||
          p.codigo?.toLowerCase().includes(term) ||
          p.codigo_barras?.toLowerCase().includes(term),
      )
    }

    // 2. Filtro por categoría
    if (selectedCategory.value) {
      result = result.filter((p) => p.categoria === selectedCategory.value)
    }

    // 3. Filtro por rango de precios
    if (priceRange.value.min !== null && priceRange.value.min !== '') {
      result = result.filter((p) => p.precio >= Number(priceRange.value.min))
    }
    if (priceRange.value.max !== null && priceRange.value.max !== '') {
      result = result.filter((p) => p.precio <= Number(priceRange.value.max))
    }

    return result
  })

  const hasActiveFilters = computed(() => {
    return (
      !!searchTerm.value ||
      !!selectedCategory.value ||
      (priceRange.value.min !== null && priceRange.value.min !== '') ||
      (priceRange.value.max !== null && priceRange.value.max !== '')
    )
  })

  // Actions
  async function loadProducts(almacenId, categoriaPrecioId, campaignId = null) {
    try {
      const { data: productosBase } = await fetchProducts(almacenId, categoriaPrecioId, campaignId)

      let preciosCampana = new Map()
      if (campaignId && categoriaPrecioId) {
        preciosCampana = await fetchCampaignPrices(campaignId, categoriaPrecioId)
      }

      // Aplicar precios de campaña
      const productosConPrecio = productosBase.map((p) => ({
        ...p,
        precio: preciosCampana.get(p.id) ?? p.precio,
        precioOriginal: p.precio,
        tienePrecioCampana: preciosCampana.has(p.id),
      }))

      products.value = productosConPrecio
      return productosConPrecio
    } catch (error) {
      console.error('Error loading products:', error)
      throw error
    }
  }

  function setSearchTerm(term) {
    searchTerm.value = term
  }

  function setCategory(category) {
    selectedCategory.value = category
  }

  function setPriceRange(min, max) {
    priceRange.value = { min: min !== '' ? min : null, max: max !== '' ? max : null }
  }

  function clearFilters() {
    searchTerm.value = ''
    selectedCategory.value = null
    priceRange.value = { min: null, max: null }
  }

  return {
    products,
    searchTerm,
    selectedCategory,
    priceRange,
    filteredProducts,
    hasActiveFilters,
    loadProducts,
    setSearchTerm,
    setCategory,
    setPriceRange,
    clearFilters,
  }
})
