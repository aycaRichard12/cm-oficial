const LIGHT_PALETTE = ['#00574b', '#f2b705', '#e67e22', '#b42318', '#2563eb']
const DARK_PALETTE = ['#4dd0c4', '#f2b705', '#e67e22', '#f87171', '#8ab4f8']

export function chartTheme(isDark) {
  if (isDark) {
    return {
      foreColor: '#e5e7eb',
      gridColor: '#3a3a3a',
      tooltipTheme: 'dark',
      legendLabelColor: '#e5e7eb',
      palette: DARK_PALETTE,
    }
  }

  return {
    foreColor: '#1f2937',
    gridColor: '#e0e0e0',
    tooltipTheme: 'light',
    legendLabelColor: '#1f2937',
    palette: LIGHT_PALETTE,
  }
}


export function applyChartTheme(options = {}, isDark) {
  const theme = chartTheme(isDark)
  const axis = (value = {}) => ({
    ...value,
    labels: {
      ...value.labels,
      style: {
        ...value.labels?.style,
        colors: theme.foreColor,
      },
    },
  })

  return {
    ...options,
    chart: {
      ...options.chart,
      foreColor: theme.foreColor,
      background: 'transparent',
    },
    colors: options.colors && options.colors.length ? options.colors : theme.palette,
    tooltip: {
      ...options.tooltip,
      theme: theme.tooltipTheme,
    },
    legend: {
      ...options.legend,
      labels: {
        ...options.legend?.labels,
        colors: theme.legendLabelColor,
      },
    },
    grid: {
      ...options.grid,
      borderColor: theme.gridColor,
    },
    xaxis: axis(options.xaxis),
    yaxis: axis(options.yaxis),
    dataLabels: {
      ...options.dataLabels,
      style: {
        ...options.dataLabels?.style,
        colors: options.dataLabels?.style?.colors ?? [theme.foreColor],
      },
    },
  }
}
