<template>
  <q-table
    flat
    bordered
    title="Ventas de Hoy "
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="pagination"
    no-data-label="No hay ninguna venta"
  >
    <template v-slot:body-cell-tipoventa="props">
      <q-td :props="props">
        {{ tipo[Number(props.row.tipoventa)] }}
      </q-td>
    </template>
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          color="primary"
          icon="picture_as_pdf"
          size="sm"
          dense
          @click="verComprobante(props.row)"
          title="VER COMPROBANTE"
        />
        <q-btn
          v-if="props.row.tipoventa == 1"
          icon="receipt_long"
          dense
          color="blue"
          @click="ir_a_factura(props.row)"
        />
        <q-btn
          v-if="props.row.tipoventa == 1"
          icon="policy"
          color="warning"
          @click="ir_a_impuestos(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr>
        <q-td colspan="3" class="text-right text-bold">Total:</q-td>
        <q-td class="text-right text-bold"
          >{{ decimas(cantidadTotal) }} {{ divisaActiva.simbolo }}</q-td
        >
      </q-tr>
    </template>
  </q-table>
  <q-dialog v-model="mostrarModal" full-width full-height>
    <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Vista previa de PDF</div>
        <q-space />
        <q-btn flat round icon="close" @click="mostrarModal = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
        <iframe
          v-if="pdfData"
          :src="pdfData"
          style="width: 100%; height: 100%; border: none"
        ></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { PDFComprovanteVenta } from 'src/utils/pdfReportGenerator'
import { redondear } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
// import { showDialog } from 'src/utils/dialogs'
const divisaActiva = useCurrencyStore()
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idusuario = contenidousuario[0]?.idusuario
const idempresa = contenidousuario[0]?.empresa?.idempresa
const pdfData = ref(null)
const mostrarModal = ref(false)

const tipo = {
  0: 's/Factura',
  1: 'c/Factura',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débido',
}
const columns = [
  { name: 'nfactura', label: 'N° Fact', field: 'nfactura', align: 'center' },
  {
    name: 'cliente',
    label: 'Razon social',
    align: 'left',
    field: (row) => row.cliente.split('-')[0],
  },
  { name: 'tipoventa', label: 'Tipo-Venta', field: 'tipoventa' },
  {
    name: 'ventatotal',
    label: 'Monto',
    field: (row) => decimas(row.ventatotal) + ' ' + divisaActiva.simbolo,
    align: 'right',
  },
  { name: 'acciones', label: '', field: 'acciones', sortable: false },
]

const rows = ref([])
const detalleVenta = ref([])
async function loadRows() {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')

  const fechaInicio = `${yyyy}-${mm}-${dd}`
  const fechaFin = `${yyyy}-${mm}-${dd}`
  console.log(fechaInicio, fechaFin)
  try {
    const response = await api.get(`reporteventas/${idusuario}/${fechaInicio}/${fechaFin}`) // Cambia a tu ruta real
    rows.value = response.data.sort((a, b) => b.idventa - a.idventa)
    console.log(rows.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
// const processedRows = computed(() => {
//   return rows.value.map((row, index) => ({
//     ...row,
//     numero: index + 1,
//   }))
// })
const cantidadTotal = computed(() => {
  return rows.value.reduce((sum, dato) => sum + redondear(parseFloat(dato.ventatotal)), 0)
})
const pagination = {
  rowsPerPage: 10,
}
const getDetalleVenta = async (id) => {
  try {
    const response = await api.get(`detallesVenta/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleVenta.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const verComprobante = async (id) => {
  await getDetalleVenta(id.idventa)
  if (detalleVenta.value) {
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }
}
const ir_a_factura = (row) => {
  console.log(row)
  // const urlPDF = 'https://example.com/factura.pdf'
  window.open(row.shortlink, '_blank')
}
const ir_a_impuestos = (row) => {
  console.log(row)
  window.open(row.urlsin, '_blank')
}
async function imprimirReporte() {
  console.log(detalleVenta.value)

  const doc = await PDFComprovanteVenta(detalleVenta)
  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
onMounted(() => {
  loadRows()
})
</script>
