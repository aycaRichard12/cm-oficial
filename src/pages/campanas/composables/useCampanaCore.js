import { ref, computed } from 'vue'

export function useCampanaCore() {
  const userStr = localStorage.getItem('mistersofts-cm')
  const contenidousuario = userStr ? JSON.parse(userStr) : []
  const idempresa = contenidousuario[0]?.empresa?.idempresa || null
  const idusuario = contenidousuario[0]?.idusuario || null

  const almacenes = ref([])
  const almacenesOptions = computed(() => {
    return almacenes.value.map((a) => ({ idalmacen: a.idalmacen, almacen: a.almacen }))
  })

  const obtenerFechaActual = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    let mm = today.getMonth() + 1
    let dd = today.getDate()
    return `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`
  }

  return {
    idempresa,
    idusuario,
    almacenes,
    almacenesOptions,
    obtenerFechaActual,
  }
}
