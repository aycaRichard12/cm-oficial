<template>
  <q-page>
    <div id="tituloreporteventas" class="row items-center justify-between q-mb-md q-ml-sm">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="assessment" size="md" class="q-mr-sm" />
          Reporte de Ventas
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">Administración de Reporte de Ventas</div>
      </div>
    </div>
    <q-form @submit.prevent="onSubmit">
      <div class="row justify-center q-col-gutter-x-md q-ma-sm">
        <div class="col-12 col-md-3" id="fechaini">
          <label for="fechaini">Fecha Inicial*</label>
          <q-input type="date" v-model="fechai" id="fechaini" dense outlined />
        </div>
        <div class="col-12 col-md-3" id="fechafin">
          <label for="fechafin">Fecha Final*</label>
          <q-input type="date" v-model="fechaf" id="fechafin" dense outlined />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <div class="">
          <q-btn
            id="btngenerarreporte"
            label="Generar reporte"
            color="primary"
            type="submit"
            class="q-mr-sm"
          />
        </div>
      </div>
    </q-form>
    <div class="row flex justify-between q-ma-md">
      <q-btn
        id="btnvistaprevia"
        icon="picture_as_pdf"
        label="Vista previa"
        color="red"
        outline
        @click="vistaPrevia"
      />
      <q-btn
        id="btnexportarexcel"
        icon="mdi-microsoft-excel"
        label="Exportar Excel"
        color="green"
        outline
        @click="exportXLSX"
      />
    </div>

    <TableReporteVentas
      id="tablareporteventas"
      ref="refHijo"
      :rows="rows"
      @ver-detalle="verDetalle"
      @crear-mensaje="crearMensaje"
      @ir-a-factura="ir_a_factura"
      @ir-a-impuestos="ir_a_impuestos"
      @abrir-modal-nota="abrirModal"
    />

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

    <RegistrarNotaCreditoDebito
      v-if="isVisibleNota"
      :venta="ventaSeleccionada"
      :key="formularioNota"
      @reiniciar="forzarReinicioCarrito"
    />
    {{ emailCliente }}
    <EnviarCorreoDialog
      v-model="dialogCorreo"
      :emailInicial="emailCliente"
      :opciones="opcionesEnvio"
      @ok="procesarEnvioCorreo"
      @cancel="() => {}"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { PDFComprovanteVenta } from 'src/utils/pdfReportGenerator'
import { PDFreporteVentasPeriodo } from 'src/utils/pdfReportGenerator'
import { PDFenviarFacturaCorreo } from 'src/utils/pdfReportGenerator'
import { exportTOXLSX_Reporte_Ventas } from 'src/utils/XCLReportImport'
//import { getUsuario } from 'src/composables/FuncionesGenerales'
import RegistrarNotaCreditoDebito from 'src/pages/NotasCreditoDebito/RegistrarNotaCreditoDebito.vue'
import { primerDiaDelMes, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import TableReporteVentas from './TableReporteVentas.vue'
import EnviarCorreoDialog from './EnviarCorreoDialog.vue'
import { getTipoFactura } from 'src/composables/FuncionesG'
const dialogCorreo = ref(false)

const emailCliente = ref('')
const opcionesEnvio = ref([])
let rowSeleccionado = null
//const usuario = getUsuario()
const resultadoFiltrado = ref([])

const isVisibleNota = ref(false)
const pdfData = ref(null)
const mostrarModal = ref(false)
// const tipo = {
//   0: 'Comprobante Venta',
//   1: 'Factura Compra-Venta',
//   2: 'Factura Alquileres',
//   3: 'Factura Comercial Exportación',
//   24: 'Nota de Crédito-Débido',
// }
const $q = useQuasar()
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const tipo = {
  0: 'Comprobante Venta',
  1: 'Factura Compra-Venta',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débido',
}
console.log(primerDiaDelMes())
// Fec
const fechai = ref(primerDiaDelMes().toISOString().slice(0, 10))
const fechaf = ref(today)

// Filtros
const almacen = ref(null)
const sucursal = ref('')
const canal = ref(null)
const tipopago = ref('')

const ventaSeleccionada = ref(null)
const formularioNota = ref(0)
const refHijo = ref(null)

const forzarReinicioCarrito = () => {
  ventaSeleccionada.value = null
  isVisibleNota.value = false // ⚠️ Esto reinicia el componente `carritoVenta`
}

const rows = ref([])
const detalleVenta = ref([])

const ir_a_factura = (row) => {
  console.log(row)
  window.open(row.shortlink, '_blank')
}
const ir_a_impuestos = (row) => {
  console.log(row)
  window.open(row.urlsin, '_blank')
}
// Acciones
const verDetalle = async (row) => {
  console.log(row)
  await getDetalleVenta(row.idventa)
  if (detalleVenta.value) {
    console.log(detalleVenta.value)
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }
}

const crearMensaje = async (row) => {
  try {
    // 1. Limpia el valor antes de la llamada a la API (opcional, pero buena práctica)
    emailCliente.value = ''

    // 2. Guardar la fila seleccionada
    rowSeleccionado = row

    // 3. Obtener correo del cliente
    const response = await api.get(`obtenerEmailCliente/${row.idcliente}`)
    // Aquí actualizas el valor que será pasado como prop al diálogo
    emailCliente.value = response.data.email ?? ''
    console.log('Correo del cliente:', emailCliente.value)

    // 4. Configurar opciones
    opcionesEnvio.value = [{ label: 'Comprobante', value: 'comprobante' }]
    const tipoFactura = getTipoFactura(true) // Esta línea no afecta la funcionalidad de envío
    console.log('Tipo de factura:', tipoFactura)
    if (Number(row.tipoventa) !== 0) {
      opcionesEnvio.value.push({ label: 'Factura', value: 'factura' })
    }
    console.log('Opciones de envío:', opcionesEnvio.value)

    // 5. Abrir el modal
    dialogCorreo.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener los datos del cliente.' + error,
    })
  }
}
const procesarEnvioCorreo = async ({ correo, opcion }) => {
  const row = rowSeleccionado

  await getDetalleVenta(row.idventa)

  if (!detalleVenta.value) {
    return $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }

  if (opcion === 'comprobante') {
    enviarComprobanteCorreo(row.idcliente, correo)
  }

  if (opcion === 'factura') {
    enviarFacturaCorreo(row.idcliente, correo, row.shortlink)
  }
}

async function enviarComprobanteCorreo(idcliente, correo) {
  console.log(detalleVenta.value)
  PDFenviarFacturaCorreo(idcliente, detalleVenta, $q, null, correo)
}

async function enviarFacturaCorreo(idcliente, shortlink, correo) {
  console.log(detalleVenta.value)

  PDFenviarFacturaCorreo(idcliente, detalleVenta, $q, shortlink, correo)
}
const getDetalleVenta = async (id) => {
  try {
    const response = await api.get(`detallesVenta/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    console.log('Detalle de venta obtenido:', response)
    detalleVenta.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

function imprimirReporte() {
  const doc = PDFComprovanteVenta(detalleVenta)

  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const vistaPrevia = () => {
  resultadoFiltrado.value = refHijo.value.obtenerDatos()
  const filterReporte = refHijo.value.getActiveFiltersReport()
  console.log('Filtros activos en el reporte:', filterReporte)
  const almacen = {
    label: filterReporte.almacen,
    value: 0,
  }
  const doc = PDFreporteVentasPeriodo(resultadoFiltrado, almacen)

  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const exportXLSX = () => {
  resultadoFiltrado.value = refHijo.value.obtenerDatos()
  console.log(
    'Datos a exportar:',
    resultadoFiltrado.value,
    almacen.value,
    fechai.value,
    fechaf.value,
  )
  exportTOXLSX_Reporte_Ventas(resultadoFiltrado, almacen, fechai, fechaf)
}
const onSubmit = async () => {
  console.log('Generar reporte con filtros:', {
    fechai: fechai.value,
    fechaf: fechaf.value,
    sucursal: sucursal.value,
    canal: canal.value,
    almacen: almacen.value,
    tipopago: tipopago.value,
  })
  try {
    const response = await api.get(`reporteventas/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
    const datos = response.data
    console.log(datos)
    rows.value = datos.map((obj, index) => ({
      cliente: obj.cliente,
      vendedor: obj.vendedor,
      tipoventa: tipo[Number(obj.tipoventa)],
      tv: Number(obj.tipoventa),
      tipopago: obj.tipopago,
      nfactura: obj.nfactura,
      canal: obj.canal,
      total: Number(obj.descuento) + Number(obj.ventatotal),
      descuento: Number(obj.descuento),
      ventatotal: Number(obj.ventatotal),
      idventa: Number(obj.idventa),
      fecha: cambiarFormatoFecha(obj.fecha),
      idalmacen: obj.idalmacen,
      idcliente: obj.idcliente,
      divisa: obj.divisa,
      sucursal: obj.sucursal,
      estado: obj.estado,
      shortlink: obj.shortlink,
      urlsin: obj.urlsin,
      idcanal: obj.idcanal,
      idsucursal: obj.idsucursal,
      almacen: obj.almacen,
      nro: index + 1,
    }))
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
//     nro: index + 1,
//     total: redondear(parseFloat(row.ventatotal) + parseFloat(row.descuento)),
//   }))
// })
// const filteredCompra = computed(() => {
//   return processedRows.value.filter((compra) => {
//     console.log(canal.value, tipopago.value)
//     const porAlmacen = !almacen.value || compra.idalmacen == almacen.value.value
//     const porCliente =
//       !clienteSeleccionadoId.value || compra.idcliente == clienteSeleccionadoId.value
//     const porSucursal =
//       !SucursalSelecionadoId.value || compra.idsucursal == SucursalSelecionadoId.value
//     const porCanal = !canal.value || compra.idcanal == canal.value?.value
//     const porTipoPago = !tipopago.value || compra.tipopago == tipopago.value?.value

//     return porAlmacen && porCliente && porSucursal && porCanal && porTipoPago
//   })
// })
function abrirModal(venta) {
  formularioNota.value++
  ventaSeleccionada.value = null // Esto reinicia el componente `carritoVenta`
  isVisibleNota.value = true
  ventaSeleccionada.value = venta
}

onMounted(() => {
  //cargarAlmacenes()
  //getClientes()
  //getCanalVenta()
})
</script>
