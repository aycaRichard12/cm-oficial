<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="shopping_cart" size="md" class="q-mr-sm" />
          {{ $t('ui.reporte-productos-comprados-57ab99') }}
        </div>
        <div class="text-subtitle2 cm-text-muted q-mt-xs">
          {{ $t('ui.administracion-de-reporte-productos-comprados-076143') }}
        </div>
      </div>
    </div>
    <q-form>
      <div
        class="row q-col-gutter-md"
        style="display: flex; justify-content: center"
        id="filtroFechas"
      >
        <div class="col-12 col-md-4">
          <label for="fechaIni">{{ $t('ui.fecha-inicial-2b461a') }}</label>
          <q-input v-model="startDate" type="date" class="col-md-4" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="fechafin">{{ $t('ui.fecha-final-33d0e8') }}</label>
          <q-input v-model="endDate" type="date" dense outlined="" class="col-md-4" />
        </div>
      </div>
      <div class="q-mt-md" style="display: flex; justify-content: center">
        <q-btn
          color="primary"
          :label="$t('ui.generar-reporte-eeafce')"
          @click="generarReporte"
          class="q-mr-sm"
          id="generarReporte"
        />
        <q-btn
          color="secondary"
          :label="$t('ui.exportar-a-excel-1569c7')"
          @click="exportarExcel"
          id="exportarExcel"
        />
      </div>
    </q-form>

    <BaseFilterableTable
      id="reporteProductosComprados"
      ref="tableRef"
      :title="$t('ui.reporte-de-productos-comprados-43e04a')"
      :rows="datosFiltrados"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      :sumColumns="sumColumns"
      nombreColumnaTotales="descripcion"
      row-key="codigo"
      flat
      bordered
      class="q-mt-lg"
    />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import * as XLSX from 'xlsx'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'

const idusuario = idusuario_md5()
const startDate = ref(null)
const endDate = ref(null)
const datosFiltrados = ref([])
const tableRef = ref(null)

const columnas = [
  {
    //convertir directamente a objeto y no enviar field
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha_formateada',
    align: 'left',
    dataType: 'date',
  },
  {
    name: 'nfactura',
    label: i18nT('ui.nro-doc-54aa60'),
    field: 'nfactura',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'tipocompra',
    label: i18nT('ui.tipo-de-compra-61ef0a'),
    field: 'tipocompra_label',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'codigo',
    label: i18nT('ui.codigo-producto-24251e'),
    field: 'codigo',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'codigobarra',
    label: i18nT('ui.codigo-barras-5b224c'),
    field: 'codigobarra',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    field: 'descripcion',
    align: 'left',

    dataType: 'text',
  },

  {
    name: 'precio',
    label: i18nT('ui.precio-unitario-fd8ab0'),
    field: 'precio',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    field: 'cantidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'importe',
    label: i18nT('ui.importe-4476a5'),
    field: 'importe',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },

  {
    name: 'usuario',
    label: i18nT('auth.user'),
    field: 'usuario',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    field: 'almacen',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'proveedor',
    label: i18nT('compras.supplier'),
    field: 'proveedor',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'unidad',
    label: i18nT('configProducto.unidadProducto.table.nombre'),
    field: 'unidad',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'categoria',
    label: i18nT('configProducto.categoriaProducto.types.categoria'),
    field: 'categoria',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'subcategoria',
    label: i18nT('configProducto.categoriaProducto.types.subcategoria'),
    field: 'subcategoria',
    align: 'left',

    dataType: 'text',
  },
]

const arrayHeaders = [
  'fecha',
  'nrofactura',
  'tipocompra',
  'codigo',
  'codigobarra',
  'descripcion',
  'costounitario',
  'precio',
  'cantidad',
  'importe',
  'costototal',
  'compratotal',
  'utilidad',
  'usuario',
  'almacen',
  'proveedor',
  'unidad',
  'categoria',
  'categoria',
  'subcategoria',
]

const sumColumns = [
  'costounitario',
  'precio',
  'cantidad',
  'importe',
  'costototal',
  'compratotal',
  'utilidad',
]

async function generarReporte() {
  try {
    const point = `reportecomprasporproductos/${idusuario}/${startDate.value}/${endDate.value}`
    console.log('Punto de API:', point)
    const response = await api.get(point)
    console.log(response)
    datosFiltrados.value = response.data.map((row) => ({
      ...row,
      fecha_formateada: date.formatDate(row.fecha, 'DD/MM/YYYY'),
      tipocompra_label: row.tipocompra == 2 ? 'Contado' : 'Crédito',
    }))
  } catch (error) {
    console.error('Error al obtener reporte:', error)
  }
}

function exportarExcel() {
  // ── 1. Obtener datos y columnas visibles ─────────────────
  const dataToExport = tableRef.value
    ? tableRef.value.obtenerDatosFiltrados()
    : datosFiltrados.value

  const visibleColumns = tableRef.value?.obtenerColumnasVisibles
    ? tableRef.value.obtenerColumnasVisibles()
    : []

  // ── 2. Definir todas las columnas posibles ────────────────
  const allPossibleColumns = [
    { header: i18nT('cotizacion.table.date'), dataKey: 'fecha_formateada', width: 15, name: 'fecha_formateada' },
    { header: i18nT('ui.nro-documento-f86654'), dataKey: 'nrofactura', width: 15, name: 'nrofactura' },
    { header: i18nT('ui.tipo-de-compra-0b2291'), dataKey: 'tipocompra_label', width: 15, name: 'tipocompra' },
    { header: i18nT('ui.codigo-producto-c80af1'), dataKey: 'codigo', width: 15, name: 'codigo' },
    { header: i18nT('ui.codigo-barras-49abb3'), dataKey: 'codigobarra', width: 15, name: 'codigobarra' },
    { header: i18nT('configuracion.servicios.table.descripcion'), dataKey: 'descripcion', width: 25, name: 'descripcion' },
    { header: i18nT('ui.costo-unitario-0a3ad6'), dataKey: 'costounitario', width: 12, name: 'costounitario' },
    { header: i18nT('ui.precio-unitario-d3780c'), dataKey: 'precio', width: 12, name: 'precio' },
    { header: i18nT('ui.cantidad-b5b6f8'), dataKey: 'cantidad', width: 10, name: 'cantidad' },
    { header: i18nT('ui.importe-4476a5'), dataKey: 'importe', width: 12, name: 'importe' },
    { header: i18nT('ui.costo-total-3a5878'), dataKey: 'costototal', width: 12, name: 'costototal' },
    { header: i18nT('ui.compra-total-88e82d'), dataKey: 'compratotal', width: 12, name: 'compratotal' },
    { header: i18nT('ui.utilidad-64a80d'), dataKey: 'utilidad', width: 10, name: 'utilidad' },
    { header: i18nT('ui.nombre-usuario-a114f2'), dataKey: 'usuario', width: 15, name: 'usuario' },
    { header: i18nT('ui.almacen-empresa-6e98a8'), dataKey: 'almacen', width: 15, name: 'almacen' },
    { header: i18nT('compras.supplier'), dataKey: 'proveedor', width: 20, name: 'proveedor' },
    { header: i18nT('configProducto.unidadProducto.table.nombre'), dataKey: 'unidad', width: 10, name: 'unidad' },
    { header: i18nT('configProducto.categoriaProducto.types.categoria'), dataKey: 'categoria', width: 12, name: 'categoria' },
    { header: i18nT('configProducto.categoriaProducto.types.subcategoria'), dataKey: 'subcategoria', width: 12, name: 'subcategoria' },
  ]

  // ── 3. Filtrar columnas según las visibles ───────────────
  let exportColumns = allPossibleColumns
  if (visibleColumns.length > 0) {
    const visibleNames = visibleColumns.map((col) => col.name)
    exportColumns = allPossibleColumns.filter((col) => visibleNames.includes(col.name))
  }

  // ── 4. Construir array de datos solo con las columnas seleccionadas ──
  const dataForSheet = dataToExport.map((item) => {
    const row = {}
    exportColumns.forEach((col) => {
      row[col.header] = item[col.dataKey] ?? ''
    })
    return row
  })

  // ── 5. Generar hoja de cálculo y descargar ──────────────
  const headers = exportColumns.map((col) => col.header)
  const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: headers })
  worksheet['!cols'] = exportColumns.map((col) => ({ wch: col.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, i18nT('ui.reporte-431e46'))
  XLSX.writeFile(
    workbook,
    `Reporte_Productos_Comprados_${new Date().toISOString().split('T')[0]}.xlsx`,
  )
}
onMounted(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')

  // Set default to first day of current month and today
  startDate.value = `${year}-${month}-01`
  endDate.value = `${year}-${month}-${day}`
})
</script>

<style scoped>
.q-table thead tr {
  background-color: #f1f1f1;
  font-weight: bold;
}
</style>
