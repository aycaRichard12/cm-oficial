import { computed } from 'vue'

/**
 * Composable para análisis de clientes
 * Procesa datos de ventas y calcula métricas clave
 */
export function useClientAnalytics(rawClients, diasAnalisis = 60) {
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
   * Obtener fecha actual sin hora
   */
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

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

      // Compras en los últimos X días
      const fechaLimite = new Date(hoy)
      fechaLimite.setDate(fechaLimite.getDate() - diasAnalisis.value)
      const compras_ultimos_X_dias = fechasArray.filter(fecha => fecha >= fechaLimite).length

      // Frecuencia específica para el período seleccionado (compras/día en últimos X días)
      const frecuencia_periodo = diasAnalisis.value > 0 ? (compras_ultimos_X_dias / diasAnalisis.value) : 0

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
      let proxima_compra_prediccion = null
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
        
        proxima_compra_prediccion = proxima_compra_fecha.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })
      }

      return {
        ...cliente,
        fechas_ventas_array: fechasArray,
        total_compras,
        ultima_compra,
        ultima_compra_formatted: ultima_compra 
          ? ultima_compra.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
          : 'Nunca',
        dias_sin_compra: dias_sin_compra === Infinity ? 999999 : dias_sin_compra,
        frecuencia_compra: parseFloat(frecuencia_compra.toFixed(4)),
        compras_ultimos_X_dias,
        frecuencia_periodo: parseFloat(frecuencia_periodo.toFixed(4)),
        estado,
        estadoLabel,
        estadoColor,
        proxima_compra_prediccion,
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
    const añoActual = new Date().getFullYear()

    clientesProcesados.value.forEach(cliente => {
      cliente.fechas_ventas_array.forEach(fecha => {
        if (fecha.getFullYear() === añoActual) {
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
    const añoActual = new Date().getFullYear()

    clientesProcesados.value.forEach(cliente => {
      cliente.fechas_ventas_array.forEach(fecha => {
        if (fecha.getFullYear() === añoActual) {
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
