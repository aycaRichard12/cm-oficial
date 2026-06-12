import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuickConsultCartStore = defineStore('quickConsultCart', () => {
  // Usamos Map internamente para búsquedas rápidas O(1)
  const itemsMap = ref(new Map()) // key: productId, value: { product, quantity }

  // Lista de items para renderizar en la UI
  const itemList = computed(() => Array.from(itemsMap.value.values()))

  // Total de unidades (suma de cantidades)
  const totalItems = computed(() => itemList.value.reduce((sum, item) => sum + item.quantity, 0))

  // Subtotal/Total acumulado
  const totalAmount = computed(() =>
    itemList.value.reduce((sum, item) => sum + item.product.precio * item.quantity, 0),
  )

  /**
   * Agrega un producto al carrito o incrementa su cantidad
   */
  function addProduct(product, quantity = 1) {
    if (!product || !product.id) return

    const existing = itemsMap.value.get(product.id)
    console.log(existing)
    if (existing) {
      // Re-establecemos el valor para asegurar reactividad profunda
      itemsMap.value.set(product.id, {
        ...existing,
        quantity: existing.quantity + quantity,
      })
    } else {
      itemsMap.value.set(product.id, {
        product: { ...product },
        quantity,
      })
    }
  }

  /**
   * Actualiza la cantidad de un producto específico
   */
  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }

    const item = itemsMap.value.get(productId)
    if (item) {
      itemsMap.value.set(productId, {
        ...item,
        quantity,
      })
    }
  }

  /**
   * Elimina un producto del carrito
   */
  function removeProduct(productId) {
    itemsMap.value.delete(productId)
    // Forzamos un trigger de reactividad si es necesario (en algunas versiones de Vue)
    itemsMap.value = new Map(itemsMap.value)
  }

  /**
   * Vacía el carrito por completo
   */
  function clearCart() {
    itemsMap.value.clear()
    itemsMap.value = new Map()
  }

  function getItemsForSale() {
    console.log(itemsMap.value)
    const saleItems = []
    for (const [id, item] of itemsMap.value.entries()) {
      console.log(item)
      saleItems.push({
        idproductoalmacen: Number(id),
        cantidad: item.quantity,
        id: item.id,
        almacen: item.almacen,
        codigo: item.codigo,
        codigobarra: item.codigobarra,
        producto: item.producto,
        descripcion: item.descripcion,
        detalle: item.detalle,
        unidad: item.unidad,
        caracteristica: item.caracteristica,
        stockminimo: item.stockminimo,
        stock: item.stock,
        fecha: item.fecha,
        idalmacen: item.idalmacen,
        estado: item.estado,
        medida: item.medida,
        categoria: item.categoria,
        idproducto: item.idproducto,
        estadoproducto: item.estadoproducto,
        stockmaximo: item.stockmaximo,
        imagen: item.imagen,
        idstock: item.idstock,
        idcategoriaprecio: item.idporcentaje,
        tipo: item.tipo,
        precio: item.precio,
        codigosin: item.codigosin,
        actividadsin: item.actividadsin,
        unidadsin: item.unidadsin,
        codigonandina: item.codigonandina,
        precioOriginal: item.precioOriginal,
        tienePrecioCampana: item.tienePrecioCampana,
        despachado: item.stock > 0 ? 1 : 2, // 1 = con stock, 2 = sin stock
      })
    }
    return saleItems
  }

  return {
    itemsMap,
    itemList,
    totalItems,
    totalAmount,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart,
    getItemsForSale,
  }
})
