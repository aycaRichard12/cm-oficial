// src/stores/kardex.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios' // opcional si quieres persistir al backend

const LOCAL_KEY_PREFIX = 'kardex_config_' // + companyId

export const useKardexStore = defineStore('kardex', () => {
  // mapa companyId -> tipo (string)
  const tiposPorEmpresa = ref({})

  function _localKey(companyId) {
    return `${LOCAL_KEY_PREFIX}${companyId}`
  }

  function loadForCompany(companyId) {
    if (!companyId) return null
    // primero intenta memoria
    if (tiposPorEmpresa.value[companyId]) return tiposPorEmpresa.value[companyId]

    // luego localStorage
    try {
      const raw = localStorage.getItem(_localKey(companyId))
      if (raw) {
        tiposPorEmpresa.value[companyId] = JSON.parse(raw)
        return tiposPorEmpresa.value[companyId]
      }
    } catch (e) {
      console.warn('Error leyendo kardex localStorage', e)
    }
    return null
  }

  function setForCompany(companyId, tipo, { persistToServer = false } = {}) {
    if (!companyId) return
    tiposPorEmpresa.value[companyId] = tipo
    try {
      localStorage.setItem(_localKey(companyId), JSON.stringify(tipo))
    } catch (e) {
      console.warn('Error guardando kardex en localStorage', e)
    }

    // opcional: persistir al backend
    if (persistToServer) {
      // ejemplo: PATCH /api/empresas/:id/config
      axios.patch(`/api/empresas/${companyId}/config`, { kardex_tipo: tipo }).catch((err) => {
        console.error('No se pudo persistir configuracion kardex:', err)
      })
    }
  }

  function getTipo(companyId) {
    const loaded = loadForCompany(companyId)
    if (loaded) return loaded
    // valor por defecto si no existe
    return 'PEPS'
  }

  return {
    tiposPorEmpresa,
    loadForCompany,
    getTipo,
    setForCompany,
  }
})
