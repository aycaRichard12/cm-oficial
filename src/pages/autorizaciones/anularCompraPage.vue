<template>
  <q-page padding>
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="shopping_cart" size="md" class="q-mr-sm" />
          {{ $t('ui.solicitudes-de-anulacion-de-compras-2a222b') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-solicitudes-de-anulacion-de-compra-3a104c') }}
        </div>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <!-- Chips de estado con contadores -->
      <q-chip
        v-for="item in resumen"
        :key="item.valor"
        :color="filtroEstado === item.valor ? item.color : 'grey-3'"
        :text-color="chipTextColor(item)"
        :icon="item.icon"
        clickable
        @click="filtroEstado = item.valor"
      >
        {{ item.label }} <strong class="q-ml-xs">{{ item.cantidad }}</strong>
      </q-chip>

      <q-space />

      <!-- Buscador -->
      <!-- <q-input v-model="busqueda" dense label="Buscar..." clearable style="min-width: 240px">
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input> -->

      <!-- Recargar -->
      <q-btn icon="refresh" color="primary" flat round :loading="loading" @click="recargar">
        <q-tooltip>{{ $t('ui.recargar-9d2c9d') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Tabla con filtros avanzados -->
    <BaseFilterableTable
      :title="$t('ui.solicitudes-de-anulacion-d6c7b2')"
      :rows="solicitudesFiltradas"
      :columns="columnas"
      :array-headers="columnasFiltrables"
      :search="busqueda"
      row-key="id_solicitud"
    >
      <!-- Estado con badge -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="estadoConfig[props.value]?.color || 'grey'"
            :label="estadoConfig[props.value]?.label || props.value"
          >
            <q-icon :name="estadoConfig[props.value]?.icon || 'help'" size="xs" class="q-ml-xs" />
          </q-badge>
        </q-td>
      </template>

      <!-- Solicitante -->
      <template v-slot:body-cell-solicitante="props">
        <q-td :props="props" class="text-center">
          <div class="text-weight-medium">{{ props.row.solicitante?.usuario || '—' }}</div>
          <div class="text-caption text-grey-6">{{ props.row.solicitante?.cargo || '' }}</div>
        </q-td>
      </template>

      <!-- Motivo con tooltip -->
      <template v-slot:body-cell-motivo_usuario="props">
        <q-td :props="props" class="text-center" style="max-width: 180px">
          <div class="ellipsis">{{ props.value || '—' }}</div>
          <q-tooltip v-if="props.value">{{ props.value }}</q-tooltip>
        </q-td>
      </template>

      <!-- Motivo rechazo solo si aplica -->
      <template v-slot:body-cell-motivo_rechazo="props">
        <q-td :props="props" class="text-center">
          <span v-if="props.row.estado === 'rechazada' && props.value" class="text-negative">
            {{ props.value }}
          </span>
          <span v-else class="text-grey-4">—</span>
        </q-td>
      </template>

      <!-- Total con divisa -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-center text-weight-medium">
          {{ props.value }}
        </q-td>
      </template>

      <!-- Fecha resolución -->
      <template v-slot:body-cell-fecha_resolucion="props">
        <q-td :props="props" class="text-center">{{
          props.value ? cambiarFormatoFecha(props.value) : '—'
        }}</q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="text-center">
          <template v-if="props.row.estado === 'pendiente'">
            <q-btn
              icon="check_circle"
              color="positive"
              flat
              dense
              round
              :loading="procesando === props.row.id_solicitud + 'a'"
              @click="procesarSolicitud(props.row, 'aprobada')"
            >
              <q-tooltip>{{ $t('ui.aprobar-anulacion-84f839') }}</q-tooltip>
            </q-btn>
            <q-btn
              icon="cancel"
              color="negative"
              flat
              dense
              round
              :loading="procesando === props.row.id_solicitud + 'r'"
              @click="procesarSolicitud(props.row, 'rechazada')"
            >
              <q-tooltip>{{ $t('ui.rechazar-anulacion-cb6583') }}</q-tooltip>
            </q-btn>
          </template>
          <span v-else class="text-grey-4 text-caption">{{ $t('ui.procesada-345199') }}</span>
        </q-td>
      </template>
    </BaseFilterableTable>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAnulacionCompra } from 'src/composables/compra/useAnulacionCompra'
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones'
import { idusuario_md5, getUsuario } from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'

const $q = useQuasar()
const idusuario = idusuario_md5()
const adminNombre = getUsuario()

const { solicitudes, cargarSolicitudes } = useAnulacionCompra()
const { simbolo } = useCurrencyStore()
const { loadUsuarios, enviarNotificacion } = useNotificaciones()

const loading = ref(false)
const filtroEstado = ref('todas')
const chipTextColor = (item) => (filtroEstado.value === item.valor ? 'white' : 'grey-8') // theme-allow
const busqueda = ref('')

const estadoConfig = {
  pendiente: { color: 'orange', icon: 'schedule', label: i18nT('ui.pendiente-7d63af') },
  aprobada: { color: 'positive', icon: 'check_circle', label: i18nT('ui.aprobada-eec32e') },
  rechazada: { color: 'negative', icon: 'cancel', label: i18nT('ui.rechazada-1d237f') },
}

const columnas = computed(() => [
  {
    name: 'id_solicitud',
    label: i18nT('cotizacion.table.number'),
    field: 'id_solicitud',
    sortable: true,
    align: 'center',
    dataType: 'number',
  },
  {
    name: 'estado',
    label: i18nT('cotizacion.table.status'),
    field: 'estado',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: i18nT('ui.factura-2e3485'),
    field: 'nfactura',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'nombre_provedor',
    label: i18nT('compras.supplier'),
    field: 'nombre_provedor',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'solicitante',
    label: i18nT('ui.solicitante-0cd165'),
    field: 'solicitante',
    sortable: false,
    align: 'center',
  },
  {
    name: 'motivo_usuario',
    label: i18nT('ui.motivo-cbeec5'),
    field: 'motivo_usuario',
    sortable: false,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'fecha_solicitud',
    label: i18nT('ui.fecha-sol-fc610e'),
    field: 'fecha_solicitud',
    sortable: true,
    align: 'center',
    dataType: 'date',
    format: (v) => cambiarFormatoFecha(v),
  },
  {
    name: 'fecha_compra',
    label: i18nT('ui.fecha-compra-3dd6df'),
    field: 'fecha_compra',
    sortable: true,
    align: 'center',
    dataType: 'date',
    format: (v) => cambiarFormatoFecha(v),
  },
  {
    name: 'fecha_resolucion',
    label: i18nT('ui.fecha-resolucion-149a52'),
    field: 'fecha_resolucion',
    sortable: true,
    align: 'center',
    dataType: 'date',
  },
  {
    name: 'total',
    label: `Total (${simbolo || i18nT('ui.bs-78383b')})`,
    field: 'total',
    sortable: true,
    align: 'center',
    dataType: 'number',
  },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', sortable: false, align: 'center' },
])

// Columnas que tendrán filtros avanzados por cabecera
const columnasFiltrables = [
  'estado',
  'nfactura',
  'nombre_provedor',
  'fecha_solicitud',
  'fecha_compra',
  'fecha_resolucion',
  'total',
]

const solicitudesFiltradas = computed(() => {
  if (filtroEstado.value === 'todas') return solicitudes.value
  return solicitudes.value.filter((s) => s.estado === filtroEstado.value)
})

const resumen = computed(() => [
  {
    label: i18nT('ventas.total'),
    cantidad: solicitudes.value.length,
    color: 'primary',
    icon: 'list',
    valor: 'todas',
  },
  {
    label: i18nT('ui.pendientes-eaf186'),
    cantidad: solicitudes.value.filter((s) => s.estado === 'pendiente').length,
    color: 'orange',
    icon: 'schedule',
    valor: 'pendiente',
  },
  {
    label: i18nT('ui.aprobadas-50e27d'),
    cantidad: solicitudes.value.filter((s) => s.estado === 'aprobada').length,
    color: 'positive',
    icon: 'check_circle',
    valor: 'aprobada',
  },
  {
    label: i18nT('ui.rechazadas-f09124'),
    cantidad: solicitudes.value.filter((s) => s.estado === 'rechazada').length,
    color: 'negative',
    icon: 'cancel',
    valor: 'rechazada',
  },
])

// function cambiarFormatoFecha(val) {
//   if (!val) return '—'
//   return new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
// }

// function formatMonto(val) {
//   if (val == null) return '—'
//   const sym = simbolo || 'Bs.'
//   return `${sym} ${Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
// }

async function recargar() {
  loading.value = true
  try {
    await cargarSolicitudes()
  } finally {
    loading.value = false
  }
}

const procesando = ref(null)

async function procesarSolicitud(solicitud, estado) {
  if (estado === 'rechazada') {
    $q.dialog({
      title: i18nT('ui.motivo-de-rechazo-561a53'),
      message: `Ingresa el motivo para rechazar la solicitud #${solicitud.id_solicitud}:`,
      prompt: {
        model: '',
        isValid: (val) => val.trim().length > 0,
        type: 'text',
        label: i18nT('ui.motivo-49005a'),
      },
      cancel: true,
      persistent: true,
    }).onOk(async (motivo) => {
      await enviarDecision(solicitud, estado, motivo)
    })
  } else {
    $q.dialog({
      title: i18nT('ui.confirmar-aprobacion-3be592'),
      message: `¿Aprobar la anulación de la compra Factura N° ${solicitud.nfactura} — ${solicitud.nombre_provedor}?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await enviarDecision(solicitud, estado, 'Ninguna')
    })
  }
}

async function enviarDecision(solicitud, estado, motivo_rechazo) {
  const key = solicitud.id_solicitud + (estado === 'aprobada' ? 'a' : 'r')
  procesando.value = key
  try {
    const payload = {
      ver: 'procesarSolicitudAnulacion',
      id_solicitud: solicitud.id_solicitud,
      estado,
      id_usuario_admin: idusuario,
      motivo_rechazo,
    }
    const response = await api.post('', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    const ok = response.data.estado === 'exito' || response.data.estado === 'success'
    $q.notify({
      type: ok ? 'positive' : 'negative',
      message: response.data.mensaje || (ok ? i18nT('ui.procesado-correctamente-61c5f8') : i18nT('ui.error-al-procesar-f36d22')),
    })
    if (ok) {
      await cargarSolicitudes()
      // Notificar al solicitante
      notificarSolicitante(solicitud, estado, motivo_rechazo)
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: i18nT('configProducto.configuracionProductoUnico.messages.connectionError') })
  } finally {
    procesando.value = null
  }
}

function notificarSolicitante(solicitud, estado, motivo_rechazo) {
  // Buscar al solicitante en la lista de responsables por nombre de usuario
  const username = solicitud.solicitante.md5

  const esAprobada = estado === 'aprobada'
  const asunto = esAprobada
    ? `Solicitud de anulación APROBADA — Factura N° ${solicitud.nfactura}`
    : `Solicitud de anulación RECHAZADA — Factura N° ${solicitud.nfactura}`

  const mensaje = esAprobada
    ? `Tu solicitud de anulación para la compra del proveedor "${solicitud.nombre_provedor}" (Factura N° ${solicitud.nfactura}) ha sido APROBADA por ${adminNombre}.`
    : `Tu solicitud de anulación para la compra del proveedor "${solicitud.nombre_provedor}" (Factura N° ${solicitud.nfactura}) ha sido RECHAZADA por ${adminNombre}. Motivo: ${motivo_rechazo}.`
  console.log('Notificación al solicitante:', { id_usuario: username, asunto, mensaje })
  enviarNotificacion({
    id_usuario: username,
    asunto,
    mensaje,
    datos_adicionales: {
      url_de_envio: 'registrarcompra',
      nombre_usuario_notificacion: adminNombre,
    },
  }).catch((err) => console.error('Error al notificar al solicitante:', err))
}

onMounted(async () => {
  await Promise.all([recargar(), loadUsuarios()])
})
</script>
