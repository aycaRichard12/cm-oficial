<template>
  <q-page class="q-pa-md">
    <q-form @submit="generarReporte">
      <div class="row flex justify-center q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="fechaini">Fecha Inicial * {{ tipoFactura }}</label>

          <q-input
            v-model="fechai"
            id="fechaini"
            type="date"
            outlined
            dense
            @change="validarFechas"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="fechafin">Fecha Final *</label>
          <q-input
            v-model="fechaf"
            id="fechafin"
            type="date"
            outlined
            dense
            class="col-md-4"
            @change="validarFechas"
          />
        </div>
      </div>
      <div class="row justify-center q-mt-md">
        <q-btn
          label="Generar Reporte"
          type="submit"
          color="primary"
          class="q-mr-sm"
          :disable="!fechai || !fechaf"
        />
        <q-btn
          label="Vista Previa PDF"
          color="info"
          outline
          @click="cargarPDF"
          :disable="!datosFiltrados || datosFiltrados.length === 0"
        />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />

    <q-form>
      <div class="row justify-center q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Almacén*</label>
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            id="almacen"
            emit-value
            map-options
            option-value="idalmacen"
            option-label="almacen"
            outlined
            dense
            :disable="!datosOriginales || datosOriginales.length === 0"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="cliente">Razón Social *</label>
          <q-select
            use-input=""
            v-model="clienteSearchTerm"
            id="cliente"
            outlined
            dense
            autocomplete="on"
            clearable
            @focus="showClienteDropdown = true"
            hide-selected
            fill-input
          >
            <template v-slot:append>
              <q-icon name="arrow_drop_down" />
            </template>
          </q-select>

          <q-card
            v-if="showClienteDropdown && filteredClientes.length > 0"
            class="q-mt-xs"
            style="position: absolute; z-index: 10; width: 100%"
          >
            <q-list bordered separator>
              <q-item
                v-for="clienteOption in filteredClientes"
                :key="clienteOption.id"
                clickable
                v-ripple
                @click="seleccionarCliente(clienteOption)"
              >
                <q-item-section>
                  {{ clienteOption.codigo }} - {{ clienteOption.nombre }} -
                  {{ clienteOption.nombrecomercial }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </q-form>

    <q-table
      :rows="datosFiltrados"
      :columns="columns"
      row-key="idcotizacion"
      class="q-mt-lg"
      flat
      bordered
      title="Reporte de Cotizaciones"
      no-data-label="No hay datos para mostrar. Genere un reporte."
    >
      <template v-slot:body-cell-estado="props">
        <!-- <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline /> -->
        <q-td class="flex justify-center">
          <q-badge
            color="deep-purple"
            v-if="Number(props.row.estado) === 1"
            label="PREF"
            outline=""
          >
          </q-badge>
          <q-badge
            color="blue"
            v-if="Number(props.row.estado) === 0"
            label="NOR"
            outline=""
          ></q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            icon="picture_as_pdf"
            color="red"
            dense
            round
            flat
            @click="generarComprobantePDF(props.row.idcotizacion)"
            title="VER COMPROBANTE"
          />
          <q-btn
            v-if="Number(tipoFactura) === 2"
            icon="payment"
            color="blue"
            dense
            round
            flat
            @click="facturarVenta(props.row.idcotizacion)"
            title="FACTURAR"
          />
        </q-td>
      </template>

      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="5" class="text-right text-bold">Total Sumatorias</q-td>
          <q-td class="text-right text-bold">{{ decimas(totalMonto) }}</q-td>
          <q-td class="text-right text-bold">{{ decimas(totalDescuento) }}</q-td>
          <q-td class="text-right text-bold">{{ decimas(totalSumatorias) }}</q-td>
          <q-td></q-td>
        </q-tr>
      </template>
    </q-table>

    <q-loading :showing="loading" />
    <modal-r v-model="mostrar" title="Facturar" @close="mostrar = false">
      <FacturarCotizacion :cotizacion="cotizacionSeleccionada" />
    </modal-r>
    <q-dialog v-model="showPdfModal" persistent full-width full-height>
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
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'
import { URL_APICM } from 'src/composables/services'
import {
  decimas,
  validarUsuario,
  cambiarFormatoFecha,
  redondear,
  normalizeText,
  obtenerFechaActualDato,
} from 'src/composables/FuncionesG'
import { useCurrencyStore, useCurrencyLeyenda } from 'src/stores/currencyStore'
import ModalR from 'src/components/ModalR.vue'
import FacturarCotizacion from './FacturarCotizacion.vue'
import { api } from 'src/boot/axios'
import { DPFReporteCotizacion } from 'src/utils/pdfReportGenerator'
import { TipoFactura } from 'src/composables/FuncionesGenerales'
import { generarPdfCotizacion } from 'src/utils/pdfReportGenerator'
const tipoFactura = TipoFactura()
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

// Reactive data
const fechai = ref(obtenerFechaActualDato())
const fechaf = ref(obtenerFechaActualDato())
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

const usuarioInfo = computed(() => {
  const user = validarUsuario()
  return user && user.length > 0 ? user[0] : {}
})

// Table columns for q-table
const columns = [
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right',
    field: (row) => cambiarFormatoFecha(row.fecha),
  },
  { name: 'cliente', label: 'Cliente', align: 'left', field: 'cliente' },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal' },
  { name: 'estado', label: 'Tipo', align: 'center', field: 'estado' },
  {
    name: 'monto',
    label: 'Monto',
    align: 'right',
    field: (row) => decimas(row.cotizaciontotal),
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: (row) => decimas(row.descuento),
  },

  {
    name: 'total_sumatorias',
    label: 'Total',
    align: 'right',
    field: (row) => decimas(parseFloat(row.cotizaciontotal) + parseFloat(row.descuento)),
  },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' },
]

// Computed properties for totals in the main table
const totalSumatorias = computed(() => {
  return datosFiltrados.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cotizaciontotal) + parseFloat(dato.descuento)),
    0,
  )
})

const totalDescuento = computed(() => {
  return datosFiltrados.value.reduce((sum, dato) => sum + redondear(parseFloat(dato.descuento)), 0)
})

const totalMonto = computed(() => {
  return redondear(totalSumatorias.value - totalDescuento.value)
})

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

const filteredClientes = computed(() => {
  if (!clienteSearchTerm.value) {
    return clientesOptions.value
  }
  const searchTermNormalized = normalizeText(clienteSearchTerm.value).toLowerCase()
  return clientesOptions.value.filter((cliente) => {
    const point = `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`
    return normalizeText(point).toLowerCase().includes(searchTermNormalized)
  })
})

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
const validarFechas = () => {
  const fechaInicio = new Date(fechai.value)
  const fechaFin = new Date(fechaf.value)

  if (fechaInicio.getTime() > fechaFin.getTime()) {
    $q.notify({
      type: 'info',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
      position: 'top',
    })
    // Opcional: ajustar la fecha de fin o inicio si hay error
    // fechaf.value = fechai.value;
  }
}

const generarReporte = async () => {
  loading.value = true
  if (!fechai.value || !fechaf.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, seleccione las fechas de inicio y fin.',
      position: 'top',
    })
    loading.value = false
    return
  }

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
    const endpoint = `reportecotizacion/${idusuario}/${fechai.value}/${fechaf.value}`
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
        ...p,
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

    const endpoint = `listaResponsableAlmacen/${idempresa}`
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

const seleccionarCliente = (cliente) => {
  clienteSearchTerm.value = `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`
  clienteSeleccionadoId.value = cliente.id
  showClienteDropdown.value = false
}

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
  console.log(datosFiltrados.value)
  const doc = DPFReporteCotizacion(datosFiltrados)
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
    const endpoint = `${URL_APICM}api/detallesCotizacion/${id}/${idempresa}`
    const data = await peticionGET(endpoint)
    console.log(data)
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
      const doc = generarPdfCotizacion(data)
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

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
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
