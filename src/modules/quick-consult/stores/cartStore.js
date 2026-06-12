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
    for (const [id, entry] of itemsMap.value.entries()) {
      const p = entry.product
      console.log('Mapping product for sale:', p)
      saleItems.push({
        idproductoalmacen: Number(id),
        cantidad: entry.quantity,
        id: p.id,
        almacen: p.almacen,
        codigo: p.codigo,
        codigobarra: p.codigobarra,
        producto: p.producto,
        descripcion: p.descripcion,
        detalle: p.detalle,
        unidad: p.unidad,
        caracteristica: p.caracteristica,
        stockminimo: p.stockminimo,
        stock: p.stock,
        fecha: p.fecha,
        idalmacen: p.idalmacen,
        estado: p.estado,
        medida: p.medida,
        categoria: p.categoria,
        idproducto: p.idproducto,
        estadoproducto: p.estadoproducto,
        stockmaximo: p.stockmaximo,
        imagen: p.imagen,
        idstock: p.idstock,
        idcategoriaprecio: p.idporcentaje,
        tipo: p.tipo,
        precio: p.precio,
        codigosin: p.codigosin,
        actividadsin: p.actividadsin,
        unidadsin: p.unidadsin,
        codigonandina: p.codigonandina,
        precioOriginal: p.precioOriginal,
        tienePrecioCampana: p.tienePrecioCampana,
        subtotal: Number(p.precio) * entry.quantity,
        despachado: Number(p.stock) > 0 ? 1 : 2, // 1 = con stock, 2 = sin stock
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
