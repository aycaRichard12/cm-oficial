import { computed, unref } from 'vue'

/**
 * Composable para análisis de clientes
 * Procesa datos de ventas y calcula métricas clave
 */
export function useClientAnalytics(rawClients, diasAnalisis = 60, fechaInicio = null, fechaFin = null) {
  /**
   * Parsear fechas_ventas (string separado por comas) a array de fechas
   */
  const parseFechasVentas = (fechasString) => {
    if (!fechasString || fechasString.trim() === '') return []
    
    return fechasString
      .split(',')
      .map(fecha => fecha.trim())
      .filter(fecha => fecha !== '')
      .map(fecha => {
        // Parsear fecha en formato YYYY-MM-DD correctamente
        const [year, month, day] = fecha.split('-').map(Number)
        const date = new Date(year, month - 1, day) // month es 0-indexed
        date.setHours(0, 0, 0, 0)
        return date
      })
      .filter(fecha => !isNaN(fecha.getTime())) // Filtrar fechas inválidas
      .sort((a, b) => b - a) // Ordenar descendente (más reciente primero)
  }

  /**
   * Calcular días entre dos fechas
   */
  const calcularDiasEntre = (fecha1, fecha2) => {
    const diff = Math.abs(fecha2 - fecha1)
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Parsear fecha en formato DD/MM/YYYY a objeto Date
   */
  const parseInputFecha = (fechaStr) => {
    if (!fechaStr || typeof fechaStr !== 'string') return null
    const parts = fechaStr.split('/')
    if (parts.length !== 3) return null
    const [day, month, year] = parts.map(Number)
    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? null : date
  }

  /**
   * Obtener fecha actual sin hora
   */
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  /**
   * Período global de análisis (usado por varios cálculos)
   */
  const periodoFiltro = computed(() => {
    const fFin = unref(fechaFin)
    const fInicio = unref(fechaInicio)
    const dAnalisis = unref(diasAnalisis)

    let fin = fFin ? parseInputFecha(fFin) : new Date(hoy)
    if (!fin) fin = new Date(hoy)
    fin.setHours(23, 59, 59, 999)
    let inicio = null

    if (fInicio) {
      inicio = parseInputFecha(fInicio)
      if (inicio) inicio.setHours(0, 0, 0, 0)
    } 
    
    if (!inicio) {
      inicio = new Date(fin)
      inicio.setDate(inicio.getDate() - (dAnalisis || 60))
      inicio.setHours(0, 0, 0, 0)
    }
    return { inicio, fin }
  })

  /**
   * Procesar datos de clientes con todas las métricas
   */
  const clientesProcesados = computed(() => {
    const clientes = rawClients.value || []
    
    return clientes.map(cliente => {
      const fechasArray = parseFechasVentas(cliente.fechas_ventas)
      const total_compras = fechasArray.length
      const ultima_compra = fechasArray.length > 0 ? fechasArray[0] : null
      const dias_sin_compra = ultima_compra ? calcularDiasEntre(ultima_compra, hoy) : Infinity
      
      // Calcular rango de fechas para frecuencia
      const fechaMasAntigua = fechasArray.length > 0 ? fechasArray[fechasArray.length - 1] : null
      const diasTotales = fechaMasAntigua ? calcularDiasEntre(fechaMasAntigua, hoy) : 0
      const frecuencia_compra = diasTotales > 0 ? (total_compras / diasTotales) : 0

      // Período de análisis: prioridad a fechas explícitas, luego a diasAnalisis
      const { inicio: inicioVal, fin: finVal } = periodoFiltro.value

      const compras_ultimos_X_dias = fechasArray.filter(fecha => {
        return fecha >= inicioVal && fecha <= finVal
      }).length

      // Calcular días del período para frecuencia
      const diasPeriodo = Math.max(1, calcularDiasEntre(inicioVal, finVal))
      const frecuencia_periodo = total_compras > 0 ? (compras_ultimos_X_dias / diasPeriodo) : 0

      // Clasificación del cliente
      let estado = 'discontinued'
      let estadoLabel = 'Discontinuado'
      let estadoColor = '#ef4444' // Red
      
      if (dias_sin_compra <= 30) {
        estado = 'active'
        estadoLabel = 'Activo'
        estadoColor = '#10b981' // Green
      } else if (dias_sin_compra <= 90) {
        estado = 'risk'
        estadoLabel = 'En Riesgo'
        estadoColor = '#f59e0b' // Amber
      }

      // Predicción de próxima compra (solo para clientes activos)
      let proxima_compra_fecha = null
      let dias_hasta_proxima_compra = null
      
      if (estado === 'active' && fechasArray.length >= 2) {
        // Calcular intervalos entre compras
        const intervalos = []
        for (let i = 0; i < fechasArray.length - 1; i++) {
          const intervalo = calcularDiasEntre(fechasArray[i + 1], fechasArray[i])
          intervalos.push(intervalo)
        }
        
        // Calcular promedio de intervalos (excluyendo outliers extremos)
        const intervaloPromedio = intervalos.reduce((sum, val) => sum + val, 0) / intervalos.length
        
        // Predecir próxima compra basada en última compra + intervalo promedio
        proxima_compra_fecha = new Date(ultima_compra)
        proxima_compra_fecha.setDate(proxima_compra_fecha.getDate() + Math.round(intervaloPromedio))
        
        dias_hasta_proxima_compra = calcularDiasEntre(hoy, proxima_compra_fecha)
      }

      const formatDateDDMMYYYY = (date) => {
        if (!date) return 'Nunca'
        const d = String(date.getDate()).padStart(2, '0')
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const y = date.getFullYear()
        return `${d}/${m}/${y}`
      }

      return {
        ...cliente,
        fechas_ventas_array: fechasArray,
        total_compras,
        ultima_compra,
        ultima_compra_formatted: formatDateDDMMYYYY(ultima_compra),
        dias_sin_compra: dias_sin_compra === Infinity ? 999999 : dias_sin_compra,
        frecuencia_compra: parseFloat(frecuencia_compra.toFixed(4)),
        compras_ultimos_X_dias,
        frecuencia_periodo: parseFloat(frecuencia_periodo.toFixed(4)),
        estado,
        estadoLabel,
        estadoColor,
        proxima_compra_prediccion: proxima_compra_fecha ? formatDateDDMMYYYY(proxima_compra_fecha) : null,
        proxima_compra_fecha,
        dias_hasta_proxima_compra
      }
    })
  })

  /**
   * Top clientes por volumen de compras (últimos X días)
   */
  const topClientesPorVolumen = computed(() => {
    return [...clientesProcesados.value]
      .filter(c => c.compras_ultimos_X_dias > 0)
      .sort((a, b) => b.compras_ultimos_X_dias - a.compras_ultimos_X_dias)
      .slice(0, 10)
  })

  /**
   * Top clientes por frecuencia de compra (en el período seleccionado)
   */
  const topClientesPorFrecuencia = computed(() => {
    return [...clientesProcesados.value]
      .filter(c => c.frecuencia_periodo > 0)
      .sort((a, b) => b.frecuencia_periodo - a.frecuencia_periodo)
      .slice(0, 10)
  })

  /**
   * Mejores clientes históricos
   */
  const mejoresClientesHistoricos = computed(() => {
    return [...clientesProcesados.value]
      .sort((a, b) => b.total_compras - a.total_compras)
      .slice(0, 10)
  })

  /**
   * Distribución por estado
   */
  const distribucionPorEstado = computed(() => {
    const activos = clientesProcesados.value.filter(c => c.estado === 'active')
    const enRiesgo = clientesProcesados.value.filter(c => c.estado === 'risk')
    const discontinuados = clientesProcesados.value.filter(c => c.estado === 'discontinued')

    return {
      active: {
        count: activos.length,
        clientes: activos.slice(0, 5),
        label: 'Activos',
        color: '#10b981'
      },
      risk: {
        count: enRiesgo.length,
        clientes: enRiesgo.slice(0, 5),
        label: 'En Riesgo',
        color: '#f59e0b'
      },
      discontinued: {
        count: discontinuados.length,
        clientes: discontinuados.slice(0, 5),
        label: 'Discontinuados',
        color: '#ef4444'
      }
    }
  })

  /**
   * Clientes inactivos (configurable por días)
   */
  const clientesInactivos = (dias = 30) => {
    return computed(() => {
      return [...clientesProcesados.value]
        .filter(c => c.dias_sin_compra >= dias)
        .sort((a, b) => b.dias_sin_compra - a.dias_sin_compra)
    })
  }

  /**
   * Ventas agrupadas por fecha (para gráfico de línea)
   */
  const ventasPorFecha = computed(() => {
    const ventasPorDia = {}
    const { inicio: inicioGrafico, fin: finGrafico } = periodoFiltro.value

    clientesProcesados.value.forEach(cliente => {
      cliente.fechas_ventas_array.forEach(fecha => {
        if (fecha >= inicioGrafico && fecha <= finGrafico) {
          const fechaKey = fecha.toISOString().split('T')[0]
          ventasPorDia[fechaKey] = (ventasPorDia[fechaKey] || 0) + 1
        }
      })
    })

    // Convertir a array y ordenar
    return Object.entries(ventasPorDia)
      .map(([fecha, cantidad]) => ({
        fecha: new Date(fecha),
        fechaFormatted: fecha,
        cantidad
      }))
      .sort((a, b) => a.fecha - b.fecha)
  })

  /**
   * Ventas agrupadas por mes (para gráfico de línea)
   */
  const ventasPorMes = computed(() => {
    const ventasPorMes = {}
    const { inicio: inicioGrafico, fin: finGrafico } = periodoFiltro.value

    clientesProcesados.value.forEach(cliente => {
      cliente.fechas_ventas_array.forEach(fecha => {
        // Para mensual podemos mostrar un periodo más largo o el mismo. 
        // Usaremos el mismo periodo por consistencia.
        if (fecha >= inicioGrafico && fecha <= finGrafico) {
          const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
          ventasPorMes[mesKey] = (ventasPorMes[mesKey] || 0) + 1
        }
      })
    })

    // Convertir a array y ordenar
    return Object.entries(ventasPorMes)
      .map(([mes, cantidad]) => ({
        mes,
        cantidad
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
  })

  /**
   * KPIs principales
   */
  const kpis = computed(() => {
    const dist = distribucionPorEstado.value
    const totalVentasAño = ventasPorFecha.value.reduce((sum, v) => sum + v.cantidad, 0)

    return {
      clientesActivos: dist.active.count,
      clientesEnRiesgo: dist.risk.count,
      clientesInactivos: dist.discontinued.count,
      totalVentasAño
    }
  })

  return {
    clientesProcesados,
    topClientesPorVolumen,
    topClientesPorFrecuencia,
    mejoresClientesHistoricos,
    distribucionPorEstado,
    clientesInactivos,
    ventasPorFecha,
    ventasPorMes,
    kpis
  }
}
