<template>
  <q-page padding>
    <div class="titulo">Reporte Productos Comprados</div>
    <q-form>
      <div class="row q-col-gutter-md" style="display: flex; justify-content: center">
        <div class="col-12 col-md-4">
          <label for="fechaIni">Fecha Inicial*</label>
          <q-input v-model="startDate" type="date" class="col-md-4" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="fechafin">Fecha Final*</label>
          <q-input v-model="endDate" type="date" dense outlined="" class="col-md-4" />
        </div>
      </div>
      <div class="q-mt-md" style="display: flex; justify-content: center">
        <q-btn color="primary" label="Generar reporte" @click="generarReporte" class="q-mr-sm" />
        <q-btn color="secondary" label="Exportar a Excel" @click="exportarExcel" />
      </div>
    </q-form>

    <BaseFilterableTable
      ref="tableRef"
      title="Reporte de Productos Comprados"
      :rows="datosFiltrados"
      :columns="columnas"
      :arrayHeaders="arrayHeaders"
      row-key="codigo"
      flat
      bordered
      class="q-mt-lg"
    />
  </q-page>
</template>

<script setup>
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
    label: 'Fecha',
    field: 'fecha_formateada',
    align: 'left',
    dataType: 'date',
  },
  {
    name: 'nrofactura',
    label: 'Nro. Doc.',
    field: 'nrofactura',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'tipocompra',
    label: 'Tipo de Compra',
    field: 'tipocompra_label',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'codigo',
    label: 'Código Producto',
    field: 'codigo',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'codigobarra',
    label: 'Código Barras',
    field: 'codigobarra',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'costounitario',
    label: 'Costo Unitario',
    field: 'costounitario',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'precio',
    label: 'Precio Unitario',
    field: 'precio',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'importe',
    label: 'Importe',
    field: 'importe',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'costototal',
    label: 'Costo Total',
    field: 'costototal',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'compratotal',
    label: 'Compra Total',
    field: 'compratotal',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'utilidad',
    label: 'Utilidad',
    field: 'utilidad',
    align: 'right',

    format: (val) => Number(val).toFixed(2),
    dataType: 'number',
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'almacen',
    label: 'Almacén',
    field: 'almacen',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'unidad',
    label: 'Unidad',
    field: 'unidad',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'categoria',
    label: 'Categoría',
    field: 'categoria',
    align: 'left',

    dataType: 'text',
  },
  {
    name: 'subcategoria',
    label: 'Sub Categoría',
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
  'subcategoria',
]

async function generarReporte() {
  try {
    const point = `reportecomprasporproductos/${idusuario}/${startDate.value}/${endDate.value}`
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
  const dataToExport = tableRef.value ? tableRef.value.obtenerDatosFiltrados() : datosFiltrados.value
  const worksheet = XLSX.utils.json_to_sheet(
    dataToExport.map((item) => ({
      Fecha: item.fecha_formateada,
      'Nro. documento': item.nrofactura,
      'Tipo de compra': item.tipocompra_label,
      'Código producto': item.codigo,
      'Código barras': item.codigobarra,
      Descripción: item.descripcion,
      'Costo unitario': item.costounitario,
      'Precio unitario': item.precio,
      Cantidad: item.cantidad,
      Importe: item.importe,
      'Costo total': item.costototal,
      'Compra total': item.compratotal,
      Utilidad: item.utilidad,
      'Nombre usuario': item.usuario,
      'Almacén empresa': item.almacen,
      Proveedor: item.proveedor,
      Unidad: item.unidad,
      Categoría: item.categoria,
      'Sub Categoría': item.subcategoria,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
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
