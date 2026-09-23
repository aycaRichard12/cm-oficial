//\src\modules\configurarsucursalSin\composables\useSucursales.js
import { ref, computed } from 'vue'
import { getSmallSucursales, getBigSucursales } from '../services/sucursalService'

export function useSucursales(token) {
  console.log(token)
  const smallSucursales = ref([])
  const bigSucursales = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Relaciona cada sucursal empresa con su sucursal Sin (si existe)
  const mergedSucursales = computed(() =>
    smallSucursales.value.map((small) => {
      const big = bigSucursales.value.find((b) => b.codigoSucursal === small.codigosucursal)
      return {
        ...small,
        sucursalGrande: big || null,
        asignada: !!big,
      }
    }),
  )

  const totalSmall = computed(() => smallSucursales.value.length)
  const totalBig = computed(() => bigSucursales.value.length)
  const totalAssigned = computed(() => mergedSucursales.value.filter((s) => s.asignada).length)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const [small, big] = await Promise.all([getSmallSucursales(), getBigSucursales(token)])
      console.log(small)
      console.log(big)
      smallSucursales.value = small
      bigSucursales.value = big
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    smallSucursales,
    bigSucursales,
    mergedSucursales,
    loading,
    error,
    totalSmall,
    totalBig,
    totalAssigned,
    refetch: fetchData,
  }
}
