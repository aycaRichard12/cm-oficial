// src/composables/useFetchList.js
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

export function useFetchList(
  endpoint,
  mapFunction = (item) => item, // 🔹 No asumimos que tiene 'nombre' e 'id'
) {
  const items = ref([])

  async function fetchItems() {
    try {
      const { data } = await api.get(endpoint)
      console.log('Respuesta de la API:', data)

      // Verifica si 'data' o 'data.data' es un array
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []

      // Aplica la función de mapeo si hay datos
      items.value = list.map(mapFunction)
    } catch (error) {
      console.error(`Error al obtener datos de ${endpoint}:`, error)
      items.value = []
    }
  }

  onMounted(fetchItems)

  return { items, fetchItems }
}
