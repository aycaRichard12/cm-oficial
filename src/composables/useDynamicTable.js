// src/composables/useDynamicTable.js
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export default function useDynamicTable(apiEndpoint, columnsConfig) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
  })

  const columns = computed(() => {
    return columnsConfig.map((col) => ({
      name: col.name,
      required: col.required || false,
      label: col.label,
      align: col.align || 'left',
      field: (row) => (col.field ? col.field(row) : row[col.name]),
      format: col.format || ((val) => val),
      sortable: col.sortable || false,
    }))
  })

  const fetchData = async () => {
    try {
      loading.value = true
      const response = await api.get(apiEndpoint)
      data.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    columns,
    loading,
    error,
    pagination,
    fetchData,
  }
}
