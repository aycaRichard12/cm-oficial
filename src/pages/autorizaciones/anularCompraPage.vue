<template>
  <q-page padding>
    <div class="titulo">Solicitudes de Anulación de Compras</div>

    <!-- Barra de filtros -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <!-- Chips de estado con contadores -->
      <q-chip
        v-for="item in resumen"
        :key="item.valor"
        :color="filtroEstado === item.valor ? item.color : 'grey-3'"
        :text-color="filtroEstado === item.valor ? 'white' : 'grey-8'"
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
        <q-tooltip>Recargar</q-tooltip>
      </q-btn>
    </div>

    <!-- Tabla con filtros avanzados -->
    <BaseFilterableTable
      title="Solicitudes de Anulación"
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
              <q-tooltip>Aprobar anulación</q-tooltip>
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
              <q-tooltip>Rechazar anulación</q-tooltip>
            </q-btn>
          </template>
          <span v-else class="text-grey-4 text-caption">Procesada</span>
        </q-td>
      </template>
    </BaseFilterableTable>
  </q-page>
</template>

<script setup>
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
const busqueda = ref('')

const estadoConfig = {
  pendiente: { color: 'orange', icon: 'schedule', label: 'Pendiente' },
  aprobada: { color: 'positive', icon: 'check_circle', label: 'Aprobada' },
  rechazada: { color: 'negative', icon: 'cancel', label: 'Rechazada' },
}

const columnas = computed(() => [
  {
    name: 'id_solicitud',
    label: '#',
    field: 'id_solicitud',
    sortable: true,
    align: 'center',
    dataType: 'number',
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: 'Factura',
    field: 'nfactura',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'nombre_provedor',
    label: 'Proveedor',
    field: 'nombre_provedor',
    sortable: true,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'solicitante',
    label: 'Solicitante',
    field: 'solicitante',
    sortable: false,
    align: 'center',
  },
  {
    name: 'motivo_usuario',
    label: 'Motivo',
    field: 'motivo_usuario',
    sortable: false,
    align: 'center',
    dataType: 'text',
  },
  {
    name: 'fecha_solicitud',
    label: 'Fecha Sol.',
    field: 'fecha_solicitud',
    sortable: true,
    align: 'center',
    dataType: 'date',
    format: (v) => cambiarFormatoFecha(v),
  },
  {
    name: 'fecha_compra',
    label: 'Fecha Compra',
    field: 'fecha_compra',
    sortable: true,
    align: 'center',
    dataType: 'date',
    format: (v) => cambiarFormatoFecha(v),
  },
  {
    name: 'fecha_resolucion',
    label: 'Fecha Resolución',
    field: 'fecha_resolucion',
    sortable: true,
    align: 'center',
    dataType: 'date',
  },
  {
    name: 'total',
    label: `Total (${simbolo || 'Bs.'})`,
    field: 'total',
    sortable: true,
    align: 'center',
    dataType: 'number',
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', sortable: false, align: 'center' },
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
    label: 'Total',
    cantidad: solicitudes.value.length,
    color: 'primary',
    icon: 'list',
    valor: 'todas',
  },
  {
    label: 'Pendientes',
    cantidad: solicitudes.value.filter((s) => s.estado === 'pendiente').length,
    color: 'orange',
    icon: 'schedule',
    valor: 'pendiente',
  },
  {
    label: 'Aprobadas',
    cantidad: solicitudes.value.filter((s) => s.estado === 'aprobada').length,
    color: 'positive',
    icon: 'check_circle',
    valor: 'aprobada',
  },
  {
    label: 'Rechazadas',
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
      title: 'Motivo de rechazo',
      message: `Ingresa el motivo para rechazar la solicitud #${solicitud.id_solicitud}:`,
      prompt: {
        model: '',
        isValid: (val) => val.trim().length > 0,
        type: 'text',
        label: 'Motivo *',
      },
      cancel: true,
      persistent: true,
    }).onOk(async (motivo) => {
      await enviarDecision(solicitud, estado, motivo)
    })
  } else {
    $q.dialog({
      title: 'Confirmar aprobación',
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
      message: response.data.mensaje || (ok ? 'Procesado correctamente' : 'Error al procesar'),
    })
    if (ok) {
      await cargarSolicitudes()
      // Notificar al solicitante
      notificarSolicitante(solicitud, estado, motivo_rechazo)
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error de conexión' })
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
