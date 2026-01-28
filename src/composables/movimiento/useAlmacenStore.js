import { ref, readonly } from 'vue'

// Estado global reactivo para el almacén seleccionado
const selectedAlmacen = ref(null)

export function useAlmacenStore() {
  // Obtener el almacén seleccionado (solo lectura para prevenir mutaciones directas)
  const getSelectedAlmacen = () => readonly(selectedAlmacen)

  // Establecer el almacén seleccionado
  const setSelectedAlmacen = (value) => {
    selectedAlmacen.value = value
  }

  // Limpiar el almacén seleccionado
  const clearSelectedAlmacen = () => {
    selectedAlmacen.value = null
  }

  return {
    selectedAlmacen: readonly(selectedAlmacen),
    getSelectedAlmacen,
    setSelectedAlmacen,
    clearSelectedAlmacen,
  }
}
