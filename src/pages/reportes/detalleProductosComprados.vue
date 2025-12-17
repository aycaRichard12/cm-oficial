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

    <q-table
      title="Reporte de Productos Comprados"
      :rows="datosFiltrados"
      :columns="columnas"
      row-key="codigo"
      class="q-mt-lg"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import * as XLSX from 'xlsx'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
const idusuario = idusuario_md5()
const startDate = ref(null)
const endDate = ref(null)
const datosFiltrados = ref([])

const columnas = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => date.formatDate(row.fecha, 'DD/MM/YYYY'),
    align: 'left',
    sortable: true,
  },
  { name: 'nrofactura', label: 'Nro. Doc.', field: 'nrofactura', align: 'left', sortable: true },
  {
    name: 'tipocompra',
    label: 'Tipo de Compra',
    field: (row) => (row.tipocompra == 2 ? 'Contado' : 'Crédito'),
    align: 'left',
    sortable: true,
  },
  { name: 'codigo', label: 'Código Producto', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'codigobarra',
    label: 'Código Barras',
    field: 'codigobarra',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  {
    name: 'costounitario',
    label: 'Costo Unitario',
    field: 'costounitario',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'precio',
    label: 'Precio Unitario',
    field: 'precio',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'importe',
    label: 'Importe',
    field: 'importe',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costototal',
    label: 'Costo Total',
    field: 'costototal',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'compratotal',
    label: 'Compra Total',
    field: 'compratotal',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: 'Utilidad',
    field: 'utilidad',
    align: 'right',
    sortable: true,
    format: (val) => Number(val).toFixed(2),
  },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left', sortable: true },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left', sortable: true },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'left', sortable: true },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  {
    name: 'subcategoria',
    label: 'Sub Categoría',
    field: 'subcategoria',
    align: 'left',
    sortable: true,
  },
]

async function generarReporte() {
  try {
    const point = `reportecomprasporproductos/${idusuario}/${startDate.value}/${endDate.value}`
    const response = await api.get(point)
    console.log(response)
    datosFiltrados.value = response.data
  } catch (error) {
    console.error('Error al obtener reporte:', error)
  }
}

function exportarExcel() {
  const worksheet = XLSX.utils.json_to_sheet(
    datosFiltrados.value.map((item) => ({
      Fecha: date.formatDate(item.fecha, 'DD/MM/YYYY'),
      'Nro. documento': item.nrofactura,
      'Tipo de compra': item.tipocompra == 2 ? 'Contado' : 'Crédito',
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
