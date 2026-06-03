import { computed } from 'vue'
import { useStockStore } from 'src/components/dasboardVendedor/store/stockStore'

export function useStock() {
  const store = useStockStore()

  // Alertas agrupadas
  const alertasCriticas = computed(() =>
    store.productos
      .filter((p) => p.stock > 0 && p.stock < 5)
      .map((p) => ({ codigo: p.codigo, nombre: p.producto, stock: p.stock })),
  )

  const alertasBajas = computed(() =>
    store.productos
      .filter((p) => p.stock >= 5 && p.stock <= 15)
      .map((p) => ({ codigo: p.codigo, nombre: p.producto, stock: p.stock })),
  )

  const productosAgotadosLista = computed(() =>
    store.productos
      .filter((p) => p.stock === 0)
      .map((p) => ({ codigo: p.codigo, nombre: p.producto, stock: 0 })),
  )

  // Data para gráfico donut
  const distribucionDonut = computed(() => ({
    series: [
      store.productosDisponibles,
      store.productosStockBajo,
      store.productosStockCritico,
      store.productosAgotados,
    ],
    labels: ['Disponible (>15)', 'Bajo (5-15)', 'Crítico (<5)', 'Agotado (0)'],
  }))

  // Top 10 menor stock
  const topMenorStock = computed(() =>
    [...store.productos]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10)
      .map((p) => ({ nombre: p.producto, stock: p.stock })),
  )

  // Top 10 mayor stock
  const topMayorStock = computed(() =>
    [...store.productos]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map((p) => ({ nombre: p.producto, stock: p.stock })),
  )

  // Productos por categoría
  const stockPorCategoria = computed(() => {
    const mapa = new Map()
    store.productos.forEach((p) => {
      const cat = p.categoria || 'Sin categoría'
      mapa.set(cat, (mapa.get(cat) || 0) + 1)
    })
    return Array.from(mapa.entries()).map(([categoria, cantidad]) => ({ categoria, cantidad }))
  })

  return {
    alertasCriticas,
    alertasBajas,
    productosAgotadosLista,
    distribucionDonut,
    topMenorStock,
    topMayorStock,
    stockPorCategoria,
  }
}
