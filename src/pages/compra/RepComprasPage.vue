<template>
  <q-page padding>
    <div class="titulo">Reporte Compras</div>
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
      title="Reporte de Compras"
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
    name: 'num',
    label: 'N°',
    field: 'num',
    align: 'center',
  },
  {
    name: 'codigo',
    label: 'Codigo',
    field: 'codigo',
    align: 'left',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => date.formatDate(row.fecha, 'DD/MM/YYYY'),
    align: 'left',
  },
  { name: 'nombrelote', label: 'Nombre Lote', field: 'nombrelote', align: 'left' },
  {
    name: 'nfactura',
    label: 'Factura',
    field: 'nfactura',
    align: 'right',
  },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'left' },
  {
    name: 'autorizacion',
    label: 'Autorización',
    field: (row) => (row.autorizacion == 1 ? 'Autorizado' : 'No Autorizado'),
    align: 'left',
  },
]

async function generarReporte() {
  try {
    const point = `reportecompras/${idusuario}/${startDate.value}/${endDate.value}`
    const response = await api.get(point)

    const compras = response.data.map((item, index) => ({
      ...item,
      num: index + 1,
    }))
    console.log(compras)
    datosFiltrados.value = compras
  } catch (error) {
    console.error('Error al obtener reporte:', error)
  }
}

function exportarExcel() {
  const worksheet = XLSX.utils.json_to_sheet(
    datosFiltrados.value.map((item) => ({
      idcompra: item.idcompra,
      codigo: item.codigo,
      fecha: item.fecha,
      nombrelote: item.nombrelote,
      nfactura: item.nfactura,
      proveedor: item.proveedor,
      almacen: item.almacen,
      idalmacen: item.idalmacen,
      autorizacion: item.autorizacion,
      total: item.total,
      num: item.num,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
  XLSX.writeFile(workbook, `Reporte_Compras_${new Date().toISOString().split('T')[0]}.xlsx`)
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
