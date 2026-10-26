import { describe, it, expect } from 'vitest'
import { chartTheme } from '../../src/composables/useChartTheme.js'

describe('chartTheme', () => {
  it('returns a dark palette and light text for dark mode', () => {
    const theme = chartTheme(true)

    expect(theme.tooltipTheme).toBe('dark')
    expect(theme.foreColor).toBe('#e5e7eb')
    expect(theme.palette.length).toBeGreaterThanOrEqual(4)
  })

  it('returns a light palette and dark text for light mode', () => {
    const theme = chartTheme(false)

    expect(theme.tooltipTheme).toBe('light')
    expect(theme.foreColor).toBe('#1f2937')
    expect(theme.palette.length).toBeGreaterThanOrEqual(4)
  })

  it('is stable for unknown input', () => {
    expect(chartTheme(undefined).tooltipTheme).toBe('light')
  })
})

import { applyChartTheme } from '../../src/composables/useChartTheme.js'

describe('applyChartTheme', () => {
  it('overrides text, grid and tooltip colours for dark mode', () => {
    const options = applyChartTheme(
      { chart: { type: 'bar' }, xaxis: { labels: {} }, colors: ['#111'] },
      true,
    )

    expect(options.chart.foreColor).toBe('#e5e7eb')
    expect(options.xaxis.labels.style.colors).toBe('#e5e7eb')
    expect(options.tooltip.theme).toBe('dark')
    expect(options.colors).toEqual(['#111'])
  })

  it('keeps an explicit series palette', () => {
    const options = applyChartTheme({ colors: ['#ff0000'] }, false)
    expect(options.colors).toEqual(['#ff0000'])
  })
})
