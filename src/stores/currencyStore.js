import { defineStore } from 'pinia'
import { useDivisa } from 'src/composables/useDivisa'
import { useLeyenda } from 'src/composables/useLeyenda'
export const useCurrencyStore = defineStore('currency', () => {
  const { divisa, loading, error, cargarDivisaActiva, simbolo } = useDivisa()

  return {
    divisa,
    loading,
    error,
    cargarDivisaActiva,
    simbolo,
  }
})
export const useCurrencyLeyenda = defineStore('leyenda', () => {
  const { leyenda, loading, error, cargarLeyendaActivo } = useLeyenda()

  return {
    leyenda,
    loading,
    error,
    cargarLeyendaActivo,
  }
})
