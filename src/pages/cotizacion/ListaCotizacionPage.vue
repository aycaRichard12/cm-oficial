<template>
  <q-page class="q-pa-md" v-if="!showEditModal">
    <q-btn color="primary" icon="check" label="PDF" @click="cargarPDF" />
    <TableCotizacionPrincipal
      id="tablareportecotizacion"
      ref="refHijo"
      :rows="datosFiltrados"
      @generarComprobantePDF="generarComprobantePDF"
      @facturarVenta="facturarVenta"
      @editarCotizacion="abrirModalEdicion"
    />

    <q-loading :showing="loading" />
    <modal-r v-model="mostrar" title="Facturar" @close="mostrar = false">
      <FacturarCotizacion
        :cotizacion="cotizacionSeleccionada"
        @venta-registrada="closeModalFactura"
      />
    </modal-r>

    <q-dialog v-model="showPdfModal" full-width full-height>
      <q-card class="q-pa-none" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 50px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
  <q-page class="q-pa-md" v-else>
    <EditarCotizacion
      v-if="showEditModal"
      :id-cotizacion="idCotizacionAEditar"
      @saved="alGuardarEdicion"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'
import { URL_APICM } from 'src/composables/services'
import { validarUsuario, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { useCurrencyStore, useCurrencyLeyenda } from 'src/stores/currencyStore'
import ModalR from 'src/components/ModalR.vue'
import FacturarCotizacion from './FacturarCotizacion.vue'
import { api } from 'src/boot/axios'
import { DPFReporteCotizacion } from 'src/utils/pdfReportGenerator'
import { getTipoFactura } from 'src/composables/FuncionesG'
import { generarPdfCotizacion } from 'src/utils/pdfs/DetallleCotizacion/reporte'
import TableCotizacionPrincipal from 'src/components/cotizacion/TableCotizacionPrincipal.vue'
import EditarCotizacion from './EditarCotizacion.vue'

const showEditModal = ref(false)
const idCotizacionAEditar = ref(null)

const abrirModalEdicion = (id) => {
  idCotizacionAEditar.value = id
  showEditModal.value = true
}

const tipoFactura = getTipoFactura()
console.log(tipoFactura)
const pdfData = ref(null)

const mostrar = ref(false)
const facturarVenta = async (id) => {
  const idempresa = usuarioInfo.value?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Información de empresa no disponible para generar comprobante.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `detallesCotizacion/${id}/${idempresa}`
    const response = await api.get(endpoint)
    const data = response.data
    console.log(data)
    cotizacionSeleccionada.value = data
    loading.value = true
    mostrar.value = true
    console.log(mostrar.value)
  } catch (error) {
    console.error('Error al generar comprobante PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al generar el comprobante. Inténtelo de nuevo.',
      position: 'top',
    })
  }

  crearFormularioFacturaCompraVenta()
}
const cotizacionSeleccionada = ref({})
const divisaActiva = useCurrencyStore()
const leyendaActiva = useCurrencyLeyenda()
leyendaActiva.cargarLeyendaActivo()
// Quasar
const $q = useQuasar()

const datosOriginales = ref([])
const datosFiltrados = ref([])
const almacenesOptions = ref([])
const almacenSeleccionado = ref(0) // 0 para "Todos los almacenes"
const clientesOptions = ref([])
const clienteSearchTerm = ref('')
const clienteSeleccionadoId = ref('')
const showClienteDropdown = ref(false)
const showPdfModal = ref(false)
const comprobanteData = reactive({})
const loading = ref(false)
const refHijo = ref(null)
const resultadoFiltrado = ref([])
const usuarioInfo = computed(() => {
  const user = validarUsuario()
  return user && user.length > 0 ? user[0] : {}
})

// Table columns for q-table

// Computed properties for totals in the main table

async function crearFormularioFacturaCompraVenta() {
  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]?.usuario
    const correoPredeterminado = 'factura@yofinanciero.com'

    //cargar Divisa y leyenda

    const datos = JSON.parse(localStorage.getItem('carrito'))
    console.log(divisaActiva.divisa.codigosin)
    const formulario = {
      numeroFactura: '',
      nombreRazonSocial: '',
      codigoPuntoVenta: 0,
      fechaEmision: '',
      cafc: '',
      codigoExcepcion: '',
      descuentoAdicional: datos.descuento,
      montoGiftCard: 0,
      codigoTipoDocumentoIdentidad: 0,
      numeroDocumento: 0,
      complemento: '',
      codigoCliente: '',
      periodoFacturado: '',
      //codigoLeyenda: leyendaActiva.codigosin,

      codigoMetodoPago: 0,
      numeroTarjeta: '',
      montoTotal: datos.ventatotal,
      codigoMoneda: divisaActiva.divisa.codigosin,
      montoTotalMoneda: datos.ventatotal,
      usuario: usuario,
      emailCliente: correoPredeterminado,
      telefonoCliente: 0,
      extras: {
        facturaTicket: '',
      },
      montoTotalSujetoIva: datos.ventatotal,
      tipoCambio: 1,
      detalles: datos.listaProductosFactura,
    }
    datos.listaFactura = formulario

    localStorage.setItem('carrito', JSON.stringify(datos))
  } catch (error) {
    console.error('Error al obtener datos:', error)
  }
}
// Computed properties for PDF table (Reporte)

// const filteredClientes = computed(() => {
//   if (!clienteSearchTerm.value) {
//     return clientesOptions.value
//   }
//   const searchTermNormalized = normalizeText(clienteSearchTerm.value).toLowerCase()
//   return clientesOptions.value.filter((cliente) => {
//     const point = `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`
//     return normalizeText(point).toLowerCase().includes(searchTermNormalized)
//   })
// })

// Watchers
watch([almacenSeleccionado, clienteSeleccionadoId], () => {
  filtrarYOrdenarDatos()
})

watch(clienteSearchTerm, (newVal) => {
  if (newVal === '') {
    clienteSeleccionadoId.value = ''
    filtrarYOrdenarDatos()
  }
})

// Methods

const closeModalFactura = () => {
  mostrar.value = false
  generarReporte()
}

const generarReporte = async () => {
  loading.value = true

  const idusuario = usuarioInfo.value?.idusuario
  if (!idusuario) {
    $q.notify({
      type: 'negative',
      message: 'Información de usuario no disponible.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `reportecotizacion/${idusuario}`
    console.log('recuerda esto', endpoint)
    const response = await api.get(endpoint)
    const data = response.data
    console.log(response.data)
    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({
        type: 'negative',
        message: `Error al generar el reporte: ${data.error}`,
        position: 'top',
      })
      datosOriginales.value = []
      datosFiltrados.value = []
    } else {
      datosOriginales.value = data
      datosFiltrados.value = data.map((p, index) => ({
        idcotizacion: p.idcotizacion,
        fecha: cambiarFormatoFecha(p.fecha),
        cliente: p.cliente,
        nombreComercial: p.nombreComercial,
        monto: Number(p.cotizaciontotal),
        descuento: Number(p.descuento),
        idalmacen: p.idalmacen,
        idcliente: p.idcliente,
        divisa: p.divisa,
        sucursal: p.sucursal,
        estado: p.estado,
        condicion: p.condicion,
        estadoResumido: p.estadoResumido,
        total_sumatorias: Number(parseFloat(p.cotizaciontotal) + parseFloat(p.descuento)),
        almacen: p.almacen,
        estado_cobro: Number(p.estado_cobro),
        estadoCobroResumido: p.estadoCobroResumido,
        numFactura: p.numeroFactura,
        nro: index + 1,
      })) // Initialize with all data
      $q.notify({
        type: 'positive',
        message: 'Reporte generado con éxito.',
        position: 'top',
      })
      // Load related data for filters after report generation
      await listaAlmacenes()
      await listaCLientes()
    }
  } catch (error) {
    console.error('Error al generar el reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al generar el reporte. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const listaAlmacenes = async () => {
  loading.value = true
  try {
    const idempresa = usuarioInfo.value?.empresa?.idempresa
    const idusuario = usuarioInfo.value?.idusuario

    if (!idempresa || !idusuario) {
      $q.notify({
        type: 'negative',
        message: 'Información de empresa o usuario no disponible para listar almacenes.',
        position: 'top',
      })
      loading.value = false
      return
    }

    const endpoint = `listaResponsableAlmacenReportes/${idempresa}`
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar almacenes: ${resultado.error}`,
        position: 'top',
      })
      almacenesOptions.value = []
    } else {
      almacenesOptions.value = [
        { idalmacen: 0, almacen: 'Todos los almacenes' },
        ...resultado.filter((u) => u.idusuario == idusuario),
      ]
      if (almacenesOptions.value.length > 0) {
        almacenSeleccionado.value = 0 // Set default to "Todos los almacenes"
      }
    }
  } catch (error) {
    console.error('Error en listaAlmacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const listaCLientes = async () => {
  loading.value = true
  const idempresa = usuarioInfo.value?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Información de empresa no disponible para listar clientes.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `${URL_APICM}api/listaCliente/${idempresa}`
    const resultado = await peticionGET(endpoint)

    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar clientes: ${resultado.error}`,
        position: 'top',
      })
      clientesOptions.value = []
    } else {
      clientesOptions.value = resultado
    }
  } catch (error) {
    console.error('Error en listaClientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los clientes. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// const seleccionarCliente = (cliente) => {
//   clienteSearchTerm.value = `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`
//   clienteSeleccionadoId.value = cliente.id
//   showClienteDropdown.value = false
// }

// Click outside handler for client dropdown
const handleOutsideClick = (event) => {
  const target = event.target
  const clientInput = document.getElementById('clienteRC') // Still need a ref to the input for this
  const clientDropdown = document.getElementById('listaclientesRC') // Still need a ref to the dropdown for this

  if (
    clientInput &&
    !clientInput.contains(target) &&
    clientDropdown &&
    !clientDropdown.contains(target)
  ) {
    showClienteDropdown.value = false
  }
}

const filtrarYOrdenarDatos = () => {
  let tempDatos = [...datosOriginales.value]

  if (almacenSeleccionado.value !== 0) {
    tempDatos = tempDatos.filter((u) => u.idalmacen == almacenSeleccionado.value)
  }
  if (clienteSeleccionadoId.value !== '') {
    tempDatos = tempDatos.filter((u) => u.idcliente == clienteSeleccionadoId.value)
  }
  datosFiltrados.value = tempDatos
}

const cargarPDF = () => {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se generó ningún reporte para la vista previa.',
      position: 'top',
    })
    return
  }

  resultadoFiltrado.value = refHijo.value.obtenerDatos()
  const filterReporte = refHijo.value.getActiveFiltersReport()
  const almacen = {
    almacen: filterReporte.almacen || 'Todos los almacenes',
  }

  const doc = DPFReporteCotizacion(resultadoFiltrado, almacen)
  pdfData.value = doc.output('dataurlstring')

  showPdfModal.value = true
}

const generarComprobantePDF = async (id) => {
  loading.value = true
  const idempresa = usuarioInfo.value?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Información de empresa no disponible para generar comprobante.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `detallesCotizacion/${id}/${idempresa}`
    console.log(endpoint)
    const response = await api.get(endpoint)
    console.log(response)
    const data = response.data

    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar detalles del comprobante: ${data.error}`,
        position: 'top',
      })
      // Clear previous comprobante data
      Object.keys(comprobanteData).forEach((key) => delete comprobanteData[key])
    } else {
      Object.assign(comprobanteData, data[0]) // Assign properties to reactive object
      const doc = await generarPdfCotizacion(data)
      pdfData.value = doc.output('dataurlstring')
      showPdfModal.value = true
    }
  } catch (error) {
    console.error('Error al generar comprobante PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al generar el comprobante. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)
  await generarReporte()
})
</script>

<style scoped>
/* Estilos para el PDF */
.invoice-container {
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #333;
}

.invoice-overflow {
  overflow: auto;
}

header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.company-details {
  text-align: left;
}

.company-details .name {
  font-weight: bold;
}

.contacts {
  margin-bottom: 20px;
}

.invoice-to,
.invoice-details {
  padding-left: 10px;
}

.invoice-to .to,
.invoice-details .date,
.invoice-details .user {
  font-weight: bold;
}

.pdf-modal-card {
  width: 100%;
  max-width: 1200px; /* Adjust as needed */
  height: 90vh; /* Adjust as needed */
}

/* Specific styles for the PDF content within the modal */
#reporteH {
  padding: 20px;
  background: #fff;
  border: 1px solid #ccc;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
