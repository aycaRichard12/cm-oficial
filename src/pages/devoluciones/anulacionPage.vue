<template>
  <q-page class="q-pa-md">
    <!-- Contenedor principal con tabs -->
    <q-tabs v-model="tab" align="left" class="text-primary">
      <q-tab name="validas" label="Válidas" />
      <q-tab name="anuladas" label="Anuladas" />
      <q-tab name="devueltas" label="Devueltas" />
      <q-tab v-if="showDevolucionDetail" name="detalleDevolucion" label="Detalle Devolución" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- Panel de ventas válidas -->
      <VentasValidasTab
        name="validas"
        :rows="ventasValidas"
        :loading="cargando"
        :almacenes-options="almacenesOptions"
        :tipos-venta-options="tiposVentaOptions"
        @accion="handleAccion"
        @pdf="generarComprobantePDF"
        @ver-factura="verFactura"
        @ver-siat="verFacturaSIAT"
      />

      <!-- Panel de ventas anuladas -->
      <VentasAnuladasTab
        name="anuladas"
        :rows="ventasAnuladas"
        :loading="cargando"
        :almacenes-options="almacenesOptions"
        :tipos-venta-options="tiposVentaOptions"
        @accion="handleAccion"
        @pdf="generarComprobantePDF"
        @ver-factura="verFactura"
        @ver-siat="verFacturaSIAT"
      />

      <!-- Panel de ventas devueltas -->
      <VentasDevueltasTab
        name="devueltas"
        :rows="ventasDevueltas"
        :loading="cargando"
        :almacenes-options="almacenesOptions"
        :tipos-venta-options="tiposVentaOptions"
        @accion="handleAccion"
        @pdf="generarComprobantePDF"
        @ver-factura="verFactura"
        @ver-siat="verFacturaSIAT"
      />

      <!-- Panel de detalle de devolución -->
      <DetalleDevolucionTab
        name="detalleDevolucion"
        :id-devolucion="idDevolucionActual"
        @volver="cerrarDetalleDevolucion"
        @finalizado="onDevolucionFinalizada"
      />
    </q-tab-panels>

    <!-- Modales -->
    <MotivoAnulacionDialog
      v-model="modalMotivoAnulacion"
      v-model:motivo="motivoAnulacionSeleccionado"
      :opciones="opcionesMotivoAnulacion"
      @cancelar="modalMotivoAnulacion = false"
      @confirmar="onConfirmarAnulacion"
    />

    <MotivoDevolucionDialog
      v-model="modalMotivoDevolucion"
      v-model:motivo="motivoDevolucion"
      @cancelar="modalMotivoDevolucion = false"
      @confirmar="onConfirmarDevolucion"
    />

    <PdfViewerDialog v-model="modalComprobantePDF" :src="pdfData" />

    <!-- Modal para ver estado de factura -->
    <q-dialog v-model="modalEstadoFactura">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Estado de Factura</div>
        </q-card-section>

        <q-card-section>
          {{ estadoFactura }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <RegistrarNotaCreditoDebito
      v-if="isVisibleNota"
      :venta="ventaSeleccionada"
      :key="formularioNota"
      @reiniciar="forzarReinicioCarrito"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { getToken, getTipoFactura } from 'src/composables/FuncionesG'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { PDFdetalleVentaInicio, generarPdfCotizacion } from 'src/utils/pdfReportGenerator'

// Composables
import { useVentas } from 'src/composables/useVentas'
import { useAccionesVenta } from 'src/composables/useAccionesVenta'

// Components
import VentasValidasTab from 'src/components/anulaciones/VentasValidasTab.vue'
import VentasAnuladasTab from 'src/components/anulaciones/VentasAnuladasTab.vue'
import VentasDevueltasTab from 'src/components/anulaciones/VentasDevueltasTab.vue'
import DetalleDevolucionTab from 'src/components/anulaciones/DetalleDevolucionTab.vue'
import MotivoAnulacionDialog from 'src/components/anulaciones/MotivoAnulacionDialog.vue'
import MotivoDevolucionDialog from 'src/components/anulaciones/MotivoDevolucionDialog.vue'
import PdfViewerDialog from 'src/components/anulaciones/PdfViewerDialog.vue'
import RegistrarNotaCreditoDebito from 'src/pages/NotasCreditoDebito/RegistrarNotaCreditoDebito.vue'

const $q = useQuasar()

// --- State and Composables ---
const {
  ventasValidas,
  ventasAnuladas,
  ventasDevueltas,
  cargando,
  cargarTodosLosDatos,
  listarDatosDEV,
} = useVentas()

const {
  modalMotivoAnulacion,
  modalMotivoDevolucion,
  modalEstadoFactura,
  motivoAnulacionSeleccionado,
  motivoDevolucion,
  estadoFactura,
  opcionesMotivoAnulacion,
  iniciarAnulacionVenta,
  iniciarAnulacionCotizacion,
  confirmarAnulacion,
  verificarYProcesarDevolucion,
  confirmarDevolucion,
  verificarEstadoFactura,
  verificarEstadoCotizacion,
} = useAccionesVenta()

// UI State
const tab = ref('validas')
const showDevolucionDetail = ref(false)
const idDevolucionActual = ref(null)

const almacenesOptions = ref([])
const tiposVentaOptions = ref([])

// PDF State
const modalComprobantePDF = ref(false)
const pdfData = ref(null)

// NOTA CREDITO DEBITO stuff
const isVisibleNota = ref(false)
const ventaSeleccionada = ref(null)
const formularioNota = ref(0)
const forzarReinicioCarrito = () => {
  ventaSeleccionada.value = null
  isVisibleNota.value = false
}
function abrirModalNota(venta) {
  formularioNota.value++
  ventaSeleccionada.value = null
  isVisibleNota.value = true
  ventaSeleccionada.value = venta
}

// --- Methods ---

const cargarConfiguracion = async () => {
  const idempresa = idempresa_md5()
  const idusuario = idusuario_md5()
  const token = getToken()
  const tipoFactura = getTipoFactura()

  try {
    // Cargar almacenes
    const almacenesResponse = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOptions.value = [
      { value: 0, label: 'Seleccione un Almacén' },
      ...almacenesResponse.data
        .filter((u) => u.idusuario == idusuario)
        .map((key) => ({ value: key.idalmacen, label: key.almacen })),
    ]

    // Cargar tipos de venta
    if (token) {
      const enpoint = `listaLeyendaSIN/tiposector/${token}/${tipoFactura}`
      const tiposResponse = await api.get(enpoint)
      const codigosPermitidos = [0, 1, 2, 3]

      const filtrarYEliminarDuplicados = (datos, codigosPermitidos) => {
        const codigosVistos = new Set()
        return datos.filter((item) => {
          if (
            codigosPermitidos.includes(item.codigoDocumentSector) &&
            !codigosVistos.has(item.codigoDocumentSector)
          ) {
            codigosVistos.add(item.codigoDocumentSector)
            return true
          }
          return false
        })
      }

      const datosFiltrados = filtrarYEliminarDuplicados(
        [...tiposResponse.data.data],
        codigosPermitidos,
      )

      tiposVentaOptions.value = [
        { value: 0, label: 'comprobante de venta' },
        { value: -1, label: 'cotizacion de venta' },
        ...datosFiltrados.map((key) => ({
          value: key.codigoDocumentSector,
          label: key.documentoSector.toLowerCase(),
        })),
      ]
    } else {
      tiposVentaOptions.value = [
        { value: 0, label: 'comprobante de venta' },
        { value: -1, label: 'cotizacion de venta' },
      ]
    }
  } catch (error) {
    console.error('Error al cargar configuracion:', error)
  }
}

// --- Action Handling ---

const handleAccion = (row) => {
  const value = row.accionSeleccionada
  const dataValue = row.id // id in table
  const TipoVenta = Number(row.tipoventa)
  const idventa = Number(row.idventa) // sometimes present
  const tipo = row.tipo

  if (value == 1) {
    // Anulacion
    if (TipoVenta == -1) {
      iniciarAnulacionCotizacion(dataValue)
    } else {
      iniciarAnulacionVenta(dataValue)
    }
  } else if (value == 2) {
    // Devolucion
    if (TipoVenta == 0) {
      verificarYProcesarDevolucion(dataValue, 'VE', abrirDetalleExistente)
    } else if (TipoVenta == 1) {
      // Nota credito/debito
      const rowVenta = {
        idventa: row.id,
        ...row,
      }
      abrirModalNota(rowVenta)
    } else if (TipoVenta == -1) {
      verificarYProcesarDevolucion(dataValue, 'COT', abrirDetalleExistente)
    }
  } else if (value == 3) {
    // Ver Estado
    if (TipoVenta == -1) {
      if (tipo == 'cotizacion') {
        verificarEstadoCotizacion(dataValue)
      } else {
        verificarEstadoCotizacion(idventa)
      }
    } else {
      verificarEstadoFactura(row.cuf)
    }
  }
}

const onConfirmarAnulacion = async () => {
  const success = await confirmarAnulacion()
  if (success) {
    await cargarTodosLosDatos()
  }
}

const abrirDetalleExistente = (idDevolucion) => {
  $q.notify({
    type: 'info',
    message: 'Su registro de devolución se inició. Debe concluir con los pasos siguientes...',
  })
  showDevolucionDetail.value = true
  idDevolucionActual.value = idDevolucion
  tab.value = 'detalleDevolucion'
}

const onConfirmarDevolucion = async () => {
  await confirmarDevolucion((idDevolucion) => {
    showDevolucionDetail.value = true
    idDevolucionActual.value = idDevolucion
    tab.value = 'detalleDevolucion'
  })
}

// --- Detalle Devolucion Navigation ---

const cerrarDetalleDevolucion = () => {
  showDevolucionDetail.value = false
  tab.value = 'devueltas'
  idDevolucionActual.value = null
}

const onDevolucionFinalizada = async () => {
  cerrarDetalleDevolucion()
  await listarDatosDEV()
}

// --- PDF Logic ---

const generarComprobantePDF = async (row) => {
  // Keep this logic here as it depends on pdf util imports
  let id =
    Number(row.tipoventa) === -1 ? (row.tipo === 'cotizacion' ? row.id : row.idventa) : row.id

  try {
    const idempresa = idempresa_md5()
    $q.loading.show({ message: 'Generando comprobante...' })

    const endpoint =
      Number(row.tipoventa) === -1
        ? `detallesCotizacion/${id}/${idempresa}`
        : `detallesVenta/${id}/${idempresa}`

    const response = await api.get(endpoint)
    const data = response.data

    if (!Array.isArray(data) || data[0] === 'error') {
      throw new Error(data.error || 'Respuesta inválida del servidor.')
    }

    let doc
    if (Number(row.tipoventa) === -1) {
      doc = generarPdfCotizacion(data)
    } else {
      doc = await PDFdetalleVentaInicio(ref(data))
    }

    pdfData.value = doc.output('dataurlstring')
    modalComprobantePDF.value = true
  } catch (error) {
    console.error('Error al generar comprobante:', error)
    $q.notify({
      type: 'negative',
      message: `Error al generar comprobante: ${error.message}`,
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

const verFactura = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const verFacturaSIAT = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  await cargarConfiguracion()
  await cargarTodosLosDatos()
})
</script>

<style scoped>
/* Estilos específicos para el componente */
/* Note: Most styles were for invoice printing which is maybe not needed if it's in a modal or generated via PDF, but preserving just in case used elsewhere or if structure changes */
.invoice {
  position: relative;
  background-color: #fff;
  min-height: 680px;
  padding: 15px;
}
/* ... Preserving other styles not strictly necessary but harmless ... */
</style>
