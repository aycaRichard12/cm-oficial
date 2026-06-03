import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { stockService } from 'src/components/dasboardVendedor/services/stockService'

export const useStockStore = defineStore('stock', () => {
  // Estado
  const almacenes = ref([])
  const categoriasPrecio = ref([])
  const productos = ref([]) // Datos originales del reporte
  const almacenSeleccionado = ref(null)
  const categoriaPrecioSeleccionada = ref(null)
  const fechaFin = ref(new Date().toISOString().split('T')[0])
  const loading = ref(false)
  const lastSync = ref(null)

  // Getters derivados (KPIs básicos)
  const totalProductos = computed(() => productos.value.length)

  const productosDisponibles = computed(() => productos.value.filter((p) => p.stock > 15).length)

  const productosStockBajo = computed(
    () => productos.value.filter((p) => p.stock >= 5 && p.stock <= 15).length,
  )

  const productosStockCritico = computed(
    () => productos.value.filter((p) => p.stock > 0 && p.stock < 5).length,
  )

  const productosAgotados = computed(() => productos.value.filter((p) => p.stock === 0).length)

  const valorTotalInventario = computed(() =>
    productos.value.reduce((sum, p) => sum + p.precioSugerido * p.stock, 0),
  )

  // Acciones
  async function cargarAlmacenes() {
    try {
      const { data } = await stockService.getAlmacenes()
      almacenes.value = data
        .filter((a) => a.estado == 1)
        .map((a) => ({ label: a.nombre, value: a.id, ...a }))

      if (almacenes.value.length) {
        almacenSeleccionado.value = almacenes.value[0].value
        await cargarCategoriasPrecio()
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error)
    }
  }

  async function cargarCategoriasPrecio() {
    try {
      const { data } = await stockService.getCategoriasPrecio()
      const idAlmacen = almacenSeleccionado.value
      categoriasPrecio.value = data
        .filter((c) => c.estado == 1 && Number(c.idalmacen) === Number(idAlmacen))
        .map((c) => ({ label: c.nombre, value: c.id }))

      if (categoriasPrecio.value.length) {
        categoriaPrecioSeleccionada.value = categoriasPrecio.value[0].value
      } else {
        categoriaPrecioSeleccionada.value = null
      }
      await cargarReporte()
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  async function cargarReporte() {
    if (!almacenSeleccionado.value) return
    loading.value = true
    try {
      const { data } = await stockService.getReporteStock(almacenSeleccionado.value, fechaFin.value)
      if (!Array.isArray(data)) {
        productos.value = []
        return
      }
      // Filtrar por categoría de precio y enriquecer datos
      let filtered = data
      if (categoriaPrecioSeleccionada.value) {
        filtered = data.filter(
          (item) => Number(item.idCategoriaPrecio) === Number(categoriaPrecioSeleccionada.value),
        )
      }
      productos.value = filtered.map((item, idx) => ({
        indice: idx + 1,
        id: item.id,
        codigo: item.codigo,
        codigobarra: item.codigobarra,
        producto: item.producto,
        descripcion: item.descripcion,
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        stock: Number(item.stock) || 0,
        stockminimo: Number(item.stockminimo) || 0,
        precioSugerido: Number(item.precioSugerido) || 0,
        costounitario: Number(item.costounitario) || 0,
        valorInventario: (Number(item.precioSugerido) || 0) * (Number(item.stock) || 0),
        ultimaActualizacion: item.fecha,
        idCategoriaPrecio: item.idCategoriaPrecio,
        CategoriaPrecio: item.CategoriaPrecio,
        imagen: item.imagen && item.imagen !== 'undefined' ? item.imagen : '',
        // Estado calculado
        estado: obtenerEstadoTexto(Number(item.stock)),
      }))
      lastSync.value = new Date()
    } catch (error) {
      console.error('Error cargando reporte:', error)
    } finally {
      loading.value = false
    }
  }

  function obtenerEstadoTexto(stock) {
    if (stock === 0) return 'Agotado'
    if (stock < 5) return 'Crítico'
    if (stock <= 15) return 'Bajo'
    return 'Disponible'
  }

  // Actualización automática (externa)
  async function refrescarDatos() {
    await cargarReporte()
  }

  return {
    almacenes,
    categoriasPrecio,
    productos,
    almacenSeleccionado,
    categoriaPrecioSeleccionada,
    fechaFin,
    loading,
    lastSync,
    totalProductos,
    productosDisponibles,
    productosStockBajo,
    productosStockCritico,
    productosAgotados,
    valorTotalInventario,
    cargarAlmacenes,
    cargarCategoriasPrecio,
    cargarReporte,
    refrescarDatos,
  }
})
