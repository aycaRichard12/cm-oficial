// src/modules/quick-consult/stores/uiStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQuickConsultUiStore = defineStore('quickConsultUi', () => {
  const isLoadingProducts = ref(false)
  const isCartSheetOpen = ref(false)
  const isFilterDrawerOpen = ref(false)
  const isScannerOpen = ref(false)

  function setLoading(loading) {
    isLoadingProducts.value = loading
  }

  function setCartSheetOpen(open) {
    isCartSheetOpen.value = open
  }

  function setFilterDrawerOpen(open) {
    isFilterDrawerOpen.value = open
  }

  function setScannerOpen(open) {
    isScannerOpen.value = open
  }

  return {
    isLoadingProducts,
    isCartSheetOpen,
    isFilterDrawerOpen,
    isScannerOpen,
    setLoading,
    setCartSheetOpen,
    setFilterDrawerOpen,
    setScannerOpen,
  }
})
