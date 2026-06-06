import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuickConsultCartStore = defineStore('quickConsultCart', () => {
  // Usamos Map internamente
  const itemsMap = ref(new Map()) // key: productId, value: { product, quantity }

  const itemList = computed(() => Array.from(itemsMap.value.values()))

  const totalItems = computed(() => itemList.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalAmount = computed(() =>
    itemList.value.reduce((sum, item) => sum + item.product.precio * item.quantity, 0),
  )

  function addProduct(product, quantity = 1) {
    if (!product || !product.id) return
    const existing = itemsMap.value.get(product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      itemsMap.value.set(product.id, { product, quantity })
    }
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    const item = itemsMap.value.get(productId)
    if (item) {
      item.quantity = quantity
    }
  }

  function removeProduct(productId) {
    itemsMap.value.delete(productId)
  }

  function clearCart() {
    itemsMap.value.clear()
  }

  return {
    itemsMap, // solo para depuración (no usar directamente en templates)
    itemList,
    totalItems,
    totalAmount,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart,
  }
})
