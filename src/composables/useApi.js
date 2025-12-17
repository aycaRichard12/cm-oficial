// src/composables/useApi.js
import { getCurrentInstance } from 'vue'

export function useApi() {
  const { proxy } = getCurrentInstance()
  return proxy.$api
}
