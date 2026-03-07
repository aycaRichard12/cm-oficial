<template>
  <q-page>
    <div>
      <!-- Botones principales -->
      <CompraActions @add="$emit('add')" @imprimirReporte="imprimirReporte" />

      <!-- Filtro de almacén -->
      <CompraFilters
        :almacenes="almacenes"
        v-model:filtroAlmacen="filtroAlmacen"
        v-model:busqueda="busqueda"
      />

      <!-- Tabla -->
      <BaseFilterableTable
        id="tabla"
        ref="tableRef"
        title="Compras"
        :rows="processedRows"
        :columns="columnas"
        :arrayHeaders="arrayHeaders"
        :sumColumns="sumColumns"
        nombreColumnaTotales="tipocompra"
        row-key="id"
        :filter="busqueda"
        flat
        dense
      >
        <template v-slot:top-right> </template>
        <template v-slot:body-cell-autorizacion="props">
          <q-td :props="props">
            <q-badge
              v-if="Number(props.row.autorizacion) === 1"
              color="positive"
              label="Autorizado"
              outline
            />
            <q-badge
              v-else-if="Number(props.row.autorizacion) === 0"
              color="grey"
              label="Anulada"
              outline
            />
            <q-badge v-else color="negative" label="No Autorizado" outline />
          </q-td>
        </template>
        <template v-slot:body-cell-tipocompra="props">
          <q-td :props="props">
            {{ Number(props.row.tipocompra) === 2 ? 'Contado' : 'A crédito' }}
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            <q-btn
              id="detalleCompra"
              title="Añadir Carrito "
              icon="shopping_cart"
              color="primary"
              dense
              flat
              @click="$emit('detalleCompra', props.row)"
            />
            <q-btn
              id="planPago"
              v-if="Number(props.row.tipocompra) === 1 && Number(props.row.estado) === 1"
              title="Generar Plan de Pagos"
              icon="payment"
              color="blue"
              flat=""
              @click="FormularioCredito(props.row)"
              label=""
            />
          </q-td>
        </template>

        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <div v-if="Number(props.row.autorizacion) === 2">
              <q-btn
                id="editar"
                icon="edit"
                color="primary"
                dense
                flat
                @click="$emit('edit', props.row)"
              />
              <q-btn
                id="eliminar"
                icon="delete"
                color="negative"
                dense
                flat
                @click="$emit('delete', props.row)"
              />
              <q-btn
                id="autorizar"
                v-if="permisosStore.tienePermiso('registrarcompra')"
                icon="toggle_off"
                dense
                flat
                color="grey"
                @click="$emit('toggle-status', props.row)"
              />
              <q-btn
                id="notificar"
                icon="notifications"
                color="warning"
                dense
                flat
                @click="abrirDialogNotificacion(props.row)"
              >
                <q-tooltip>Enviar Notificación</q-tooltip>
              </q-btn>
            </div>
            <!-- Botón Solicitar Anulación: solo para compras ya autorizadas -->
            <div v-if="Number(props.row.autorizacion) === 1">
              <template v-if="puedeAnularCompra(props.row.id)">
                <!-- Solicitar anulación (flujo con aprobación) -->
                <q-btn
                  id="solicitarAnulacion"
                  icon="block"
                  color="deep-orange"
                  v-if="!permisosStore.tienePermiso('anularcompradirecta')"
                  dense
                  flat
                  @click="$emit('solicitar-anulacion', props.row)"
                >
                  <q-tooltip>Solicitar Anulación</q-tooltip>
                </q-btn>
                <!-- Anulación directa (sin pasar por aprobación) -->
                <q-btn
                  id="anularDirecta"
                  icon="delete_forever"
                  color="negative"
                  dense
                  flat
                  v-if="permisosStore.tienePermiso('anularcompradirecta')"
                  @click="confirmarAnulacionDirecta(props.row)"
                >
                  <q-tooltip>Anular Directamente</q-tooltip>
                </q-btn>
              </template>
              <!-- Solicitud ya activa: mostrar su estado -->
              <q-chip
                v-else
                dense
                :color="estadoAnulacionColor(props.row.id)"
                text-color="white"
                :label="estadoAnulacionLabel(props.row.id)"
                size="sm"
              />
            </div>
          </q-td>
        </template>
      </BaseFilterableTable>
    </div>
    <CompraDialogs
      v-model:mostrarModal="mostrarModal"
      :pdfData="pdfData"
      v-model:credito="credito"
      :compra="compra"
      @cerrarCredito="closeModalCredito"
    />

    <!-- Dialog de Notificación -->
    <NotificacionDialog
      v-model="dialogNotificacionOpen"
      :title="tituloNotificacion"
      @notificacion-enviada="onNotificacionEnviada"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import { decimas, redondear } from 'src/composables/FuncionesG'
// import pagosCredito from './pagosCredito.vue' // Movido a CompraDialogs
import CompraActions from './CompraActions.vue'
import CompraFilters from './CompraFilters.vue'
import CompraDialogs from './CompraDialogs.vue'
import NotificacionDialog from 'src/components/pusher-notificaciones/NotificacionDialog.vue'
import { useQuasar } from 'quasar'
import { showDialog } from 'src/utils/dialogs'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_REPORTE_COMPRAS } from 'src/utils/pdfReportGenerator'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'
import { useAnulacionCompra } from 'src/composables/compra/useAnulacionCompra'

const permisosStore = useOperacionesPermitidas()
console.log('Permisos cargados en TableCompra.vue:', permisosStore.permisos)
const { anularCompraDirecta } = useAnulacionCompra()
const divisaActiva = useCurrencyStore()
const $q = useQuasar()
const tableRef = ref(null)
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
  almacenSeleccionado: {
    type: Object,
    default: null,
  },
  solicitudesAnulacion: {
    type: Array,
    default: () => [],
  },
})
console.log(props.almacenSeleccionado)
const pdfData = ref(null)
const busqueda = ref('')
const filtroAlmacen = ref(null)
const mostrarModal = ref(false)
const credito = ref(false)
const compra = ref({})

// Estado para el dialog de notificación
const dialogNotificacionOpen = ref(false)
const compraSeleccionada = ref(null)
const columnas = [
  {
    name: 'numero',
    label: 'N°',
    align: 'right',
    field: 'numero',
    dataType: 'number',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right', // Align right for dates usually looks better or same as numbers
    field: 'fecha',
    format: (val) => {
      // Assuming val is YYYY-MM-DD or similar sortable string
      // If val is already DD/MM/YYYY, this might not be needed, but good for safety
      if (!val) return ''
      // If it's standard ISO, format it. If it's already customized, leave it.
      // Simple check or just return val if it's already formatted by backend
      return val
    },
    dataType: 'date',
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'lote',
    label: 'Nombre lote',
    field: 'lote',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: 'N°Factura',
    align: 'right',
    field: 'nfactura',
    dataType: 'number',
  },
  {
    name: 'tipocompra',
    label: 'Tipo compra',
    field: 'tipocompra_label', // Use label for friendly filtering
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'total',
    label: 'Total compra' + ` \n(${divisaActiva.simbolo})`,
    align: 'right',
    field: 'total', // Use raw number for filtering
    format: (val) => {
      const valor = parseFloat(val)
      if (isNaN(valor)) return '0.00'
      return decimas(redondear(valor))
    },
    dataType: 'number',
  },
  {
    name: 'autorizacion',
    label: 'Autorización',
    field: 'autorizacion_label', // Use label for friendly filtering
    align: 'center',
    dataType: 'text',
  },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const arrayHeaders = [
  'numero',
  'fecha',
  'proveedor',
  'lote',
  'codigo',
  'nfactura',
  'tipocompra',
  'total',
  'tipocompra',
  'total',
  'autorizacion',
]

const sumColumns = ['total']

function puedeAnularCompra(id_compra) {
  const sol = props.solicitudesAnulacion.find((s) => String(s.id_ingreso) === String(id_compra))
  if (!sol) return true
  return sol.estado === 'rechazada'
}

function estadoAnulacionLabel(id_compra) {
  const sol = props.solicitudesAnulacion.find((s) => String(s.id_ingreso) === String(id_compra))
  if (!sol) return ''
  const labels = { pendiente: 'Anulación pendiente', aprobada: 'Anulada' }
  return labels[sol.estado] || sol.estado
}

function estadoAnulacionColor(id_compra) {
  const sol = props.solicitudesAnulacion.find((s) => String(s.id_ingreso) === String(id_compra))
  if (!sol) return 'grey'
  return sol.estado === 'aprobada' ? 'negative' : 'orange'
}

const emit = defineEmits([
  'add',
  'repDesglosado',
  'repCompras',
  'edit',
  'delete',
  'toggle-status',
  'detalleCompra',
  'solicitar-anulacion',
  'actualizarTablaPrincipal',
])

const filteredCompra = computed(() => {
  if (!filtroAlmacen.value) {
    return [] // ← muestra vacío si no hay filtro
  }
  return props.rows.filter((compra) => compra.idalmacen == filtroAlmacen.value.value)
})

const processedRows = computed(() => {
  console.log(filteredCompra.value)
  return filteredCompra.value.map((row, index) => ({
    ...row,
    numero: index + 1,
    tipocompra_label: Number(row.tipocompra) === 2 ? 'Contado' : 'A crédito',
    autorizacion_label:
      Number(row.autorizacion) === 1
        ? 'Autorizado'
        : Number(row.autorizacion) === 0
          ? 'Anulada'
          : 'No Autorizado',
  }))
})

const tituloNotificacion = computed(() => {
  if (!compraSeleccionada.value) return 'Enviar Notificación'
  return `Notificación - Compra ${compraSeleccionada.value.codigo} (${compraSeleccionada.value.proveedor})`
})

watch(
  () => props.almacenSeleccionado,
  (nuevoAlmacen) => {
    filtroAlmacen.value = nuevoAlmacen
  },
  { immediate: true },
)

async function FormularioCredito(c) {
  //const response = await
  if (Number(c.autorizacion) == 1) {
    console.log(c)
    compra.value = c
    credito.value = true
  } else {
    // Dialog con iconos correctos

    const result = await showDialog(
      $q,
      'W',
      'Advertencia: La compra está en espera de autorización. Debe validarse antes de proceder.',
    )
    console.log('Warning dialog result:', result)
  }
}
function closeModalCredito() {
  credito.value = false
  emit('actualizarTablaPrincipal')
}
async function imprimirReporte() {
  if (!filtroAlmacen.value) {
    await showDialog($q, 'W', 'Debe seleccionar un almacén para ver el reporte.')
    return
  }

  // Obtener datos filtrados de la tabla si existe la referencia
  const datosParaReporte = tableRef.value
    ? tableRef.value.obtenerDatosFiltrados()
    : filteredCompra.value

  // Envolver en { value: ... } para simular una ref, ya que PDF_REPORTE_COMPRAS accede a .value
  const datosRef = { value: datosParaReporte }

  const doc = PDF_REPORTE_COMPRAS(datosRef, filtroAlmacen)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}

const abrirDialogNotificacion = (compra) => {
  compraSeleccionada.value = compra
  dialogNotificacionOpen.value = true
}

async function confirmarAnulacionDirecta(row) {
  $q.dialog({
    title: 'Anular compra directamente',
    message: `¿Anular la compra Factura N° ${row.nfactura} — ${row.proveedor}? Esta acción no requiere aprobación.`,
    prompt: {
      model: '',
      label: 'Motivo (opcional)',
      type: 'text',
    },
    cancel: true,
    persistent: true,
    ok: { label: 'Anular', color: 'negative' },
  }).onOk(async (motivo) => {
    const ok = await anularCompraDirecta({ id: row.id, motivo })
    if (ok) emit('actualizarTablaPrincipal')
  })
}

const onNotificacionEnviada = (datos) => {
  console.log('Notificación enviada para compra:', compraSeleccionada.value)
  console.log('Datos de notificación:', datos)

  $q.notify({
    type: 'positive',
    message: `Notificación enviada para la compra ${compraSeleccionada.value.codigo}`,
    position: 'top',
    icon: 'check_circle',
    timeout: 2500,
  })

  // Resetear selección
  compraSeleccionada.value = null
}

onMounted(async () => {
  await permisosStore.cargarPermisos()
  await divisaActiva.cargarDivisaActiva()

  if (!divisaActiva.divisa) {
    console.error('No se pudo cargar la divisa')
    return
  }
})
</script>
