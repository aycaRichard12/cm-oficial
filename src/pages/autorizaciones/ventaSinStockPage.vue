<template>
  <q-page padding>
    <q-card flat bordered class="q-pa-md">
      <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
        <q-toolbar-title>{{ $t('ui.gestion-de-permisos-de-stock-85e760') }}</q-toolbar-title>
        <!-- <q-btn
          icon="add"
          label="Nueva Solicitud"
          color="white"
          flat
          @click="abrirDialogoSolicitud"
        /> -->
      </q-toolbar>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="solicitudes" icon="assignment" :label="$t('ui.solicitudes-853f77')" id="solicitudes" />
        <q-tab name="activos" icon="check_circle" :label="$t('ui.p-activos-36a533')" id="activos" />
        <q-tab name="historial" icon="history" :label="$t('ui.historial-302027')" id="historial" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="solicitudes">
          <q-table
            id="solicitudes"
            :title="$t('ui.solicitudes-de-permiso-9f297b')"
            :rows="listaSolicitudesData"
            :columns="colsSolicitudes"
            row-key="id"
            :loading="loading"
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="getColorEstado(props.value)" text-color="white" dense>
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn
                  v-if="props.row.estado === 'PENDIENTE'"
                  icon="settings"
                  size="sm"
                  color="secondary"
                  round
                  @click="gestionarSolicitud(props.row)"
                  id="gestionar"
                >
                  <q-tooltip>{{ $t('ui.aprobar-o-rechazar-08a601') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="activos" id="tablaActivos">
          <q-table
            :title="$t('ui.permisos-disponibles-11df9d')"
            :rows="listaActivosData"
            :columns="colsPermisos"
            :loading="loading"
          >
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="historial">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-table
                id="historial"
                :title="$t('ui.usados-06cf39')"
                :rows="listaUsadosData"
                :columns="colsPermisos"
                :loading="loading"
                flat
                bordered
              />
            </div>
            <div class="col-12 col-md-6">
              <q-table
                id="vencidos"
                :title="$t('ui.vencidos-49690e')"
                :rows="listaVencidosData"
                :columns="colsPermisos"
                :loading="loading"
                flat
                bordered
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="dialogoSolicitud" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('ui.nueva-solicitud-de-permiso-0ade0d') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit="onSubmitSolicitud">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="formSolicitud.idalmacen"
              :options="almacenesResponsable"
              :label="$t('ui.almacen-673013')"
              map-options
              emit-value
              outlined
              required
            />
            <q-select
              v-model="formSolicitud.idusuario_asignado"
              :options="responsables"
              :label="$t('ui.responsable-44b588')"
              map-options
              emit-value
              outlined
              required
            />
            <q-input
              v-model="formSolicitud.motivo"
              :label="$t('ui.motivo-justificacion-b817c2')"
              type="textarea"
              outlined
              required
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn :label="$t('common.cancel')" flat v-close-popup />
            <q-btn :label="$t('ui.enviar-solicitud-7c09ba')" color="primary" type="submit" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoGestion" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">{{ $t('ui.gestionar-solicitud-5cfefd') }}{{ selectedItem?.id }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm q-pt-md">
          <p class="text-subtitle2">{{ $t('ui.defina-la-vigencia-del-permiso-539605') }}</p>
          <div>
            <label for="fI">{{ $t('ui.fecha-y-hora-de-inicio-d64f2e') }}</label>
            <q-input v-model="fechaInicio" id="fI" outlined dense readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="fechaInicio"
                      outlined
                      dense
                      fill-mask
                      mask="YYYY-MM-DD HH:mm:ss"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('ui.cerrar-4b0816')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="fechaInicio" mask="YYYY-MM-DD HH:mm:ss" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('ui.cerrar-4b0816')" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div>
            <label for="fF" class="q-mt-md">{{ $t('ui.fecha-y-hora-de-fin-542a27') }}</label>
            <q-input v-model="fechaFin" id="fF" outlined dense readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFin" mask="YYYY-MM-DD HH:mm:ss">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('ui.cerrar-4b0816')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="fechaFin" mask="YYYY-MM-DD HH:mm:ss" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('ui.cerrar-4b0816')" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <q-input
            v-model="observacionGestion"
            :label="$t('ui.observaciones-del-administrador-96249c')"
            outlined
            type="textarea"
            rows="2"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn :label="$t('common.cancel')" flat v-close-popup />
          <q-btn
            :label="$t('ui.rechazar-2b004c')"
            color="negative"
            @click="handleGestion('rechazar')"
            :loading="loading"
          />
          <q-btn
            :label="$t('ui.aprobar-c2505a')"
            color="positive"
            @click="handleGestion('aprobar')"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, reactive } from 'vue'
import { useSolicitudes } from 'src/composables/ventasSinStock/useSolicitudes'
import { date } from 'quasar' // Helper de Quasar para formatear fechas
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones'
const idusuario = idusuario_md5()
const fechaInicio = ref('')
const fechaFin = ref('')
// Composables y State
const { enviarNotificacion } = useNotificaciones()

const {
  loading,
  responsables,
  almacenesResponsable,
  loadUsuarios,
  loadAAlmacenes,
  crearSolicitudPermiso,
  aprobarRechazarSolicitud,
  listarPermisosActivos,
  listarPermisosUsados,
  listarPermisosVencidos,
  listarSolicitudes,
} = useSolicitudes()
const SolicitudSeleccionada = ref(null)
const tab = ref('solicitudes')
const dialogoSolicitud = ref(false)
const dialogoGestion = ref(false)
const selectedItem = ref(null)
const observacionGestion = ref('')

// Data Lists
const listaSolicitudesData = ref([])
const listaActivosData = ref([])
const listaUsadosData = ref([])
const listaVencidosData = ref([])

const formSolicitud = reactive({
  idalmacen: null,
  idusuario_asignado: null,
  motivo: '',
})

// Columnas Tablas
const colsSolicitudes = [
  { name: 'index', label: i18nT('cotizacion.table.number'), field: 'index', align: 'left' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha_solicitud', align: 'left' },
  {
    name: 'usuario',
    label: i18nT('ui.solicitante-0cd165'),
    field: (row) => row.usuario?.usuario || 'N/A',
    align: 'left',
  },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    field: 'almacen',
    align: 'left',
  },
  {
    name: 'motivo',
    label: i18nT('ui.motivo-cbeec5'),
    field: 'motivo',
    align: 'left',
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'acciones', label: i18nT('common.actions'), align: 'right' },
]

const colsPermisos = [
  { name: 'index', label: i18nT('cotizacion.table.number'), field: 'index', align: 'left' },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left' },
  {
    name: 'usuario',
    label: i18nT('ui.solicitante-0cd165'),
    field: (row) => row.usuario?.usuario || 'N/A',
    align: 'left',
  },
  {
    name: 'fecha_inicio',
    label: i18nT('ui.inicio-4f70d8'),
    field: 'fecha_inicio',
    align: 'left',
  },
  {
    name: 'fecha_fin',
    label: i18nT('ui.fin-425106'),
    field: 'fecha_fin',
    align: 'left',
  },
  {
    name: 'motivo',
    label: i18nT('ui.motivo-cbeec5'),
    field: 'motivo',
    align: 'left',
  },
]

// Ciclo de Vida
onMounted(async () => {
  await refreshAll()
  loadUsuarios()
  loadAAlmacenes()
})

// Métodos de Carga
async function refreshAll() {
  try {
    // Usamos Promise.all para que carguen en paralelo y no bloqueen la UI
    const [solicitudes, activos, usados, vencidos] = await Promise.all([
      listarSolicitudes(),
      listarPermisosActivos(),
      listarPermisosUsados(),
      listarPermisosVencidos(),
    ])
    console.log('Datos cargados:', { solicitudes, activos, usados, vencidos })
    listaSolicitudesData.value = solicitudes || []
    listaActivosData.value = activos || []
    listaUsadosData.value = usados || []
    listaVencidosData.value = vencidos || []
  } catch (error) {
    console.error('Error cargando pestañas:', error)
  }
}

// Lógica Formulario Solicitud
// const abrirDialogoSolicitud = () => {
//   formSolicitud.motivo = ''
//   dialogoSolicitud.value = true
// }

const onSubmitSolicitud = async () => {
  const res = await crearSolicitudPermiso({ ...formSolicitud })
  if (res) {
    dialogoSolicitud.value = false
    refreshAll()
  }
}

// Lógica Gestión (Aprobar/Rechazar)
const gestionarSolicitud = (row) => {
  console.log('Gestionando solicitud:', row)
  selectedItem.value = row.id_solicitud
  SolicitudSeleccionada.value = row
  console.log('Solicitud seleccionada para gestión:', SolicitudSeleccionada.value)
  observacionGestion.value = ''

  const now = new Date()
  const format = 'YYYY-MM-DD HH:mm:ss'

  fechaInicio.value = date.formatDate(now, format)
  fechaFin.value = date.formatDate(date.addToDate(now, { days: 1 }), format)

  dialogoGestion.value = true
}

const handleGestion = async (tipoAccion) => {
  // El backend espera "APROBADO" o "RECHAZADO" en el campo 'accion'
  const estadoAccion = tipoAccion === 'aprobar' ? 'APROBADO' : 'RECHAZADO'

  // Construcción del payload según el requerimiento del backend
  const payload = {
    ver: 'aprobarRechazarSolicitud', // Requerido por useSolicitudes.js para identificar el proceso
    id_solicitud: selectedItem.value, // ID de la solicitud de la tabla
    id_admin_md5: idusuario, // idempresa ya está disponible en el scope del composable
    accion: estadoAccion, //
    observacion_admin: observacionGestion.value, //
    fecha_inicio: fechaInicio.value, //
    fecha_fin: fechaFin.value, //
  }
  if (estadoAccion === 'APROBADO') {
    // Capturar automáticamente la ruta actual para redirigir al usuario después de la aprobación
    const solicitud = SolicitudSeleccionada.value
    console.log('Solicitud para notificación:', solicitud.id_solicitud, solicitud.motivo)
    await enviarNotificacion({
      id_usuario: solicitud.id_usuario_md5,
      asunto: 'Permiso de Venta Sin Stock Aprobado',
      mensaje:
        'Su solicitud para activar la función de venta sin stock ha sido aprobada. Podrá agregar productos al carrito incluso si no hay stock disponible durante el período definido. Recuerde que esta acción puede afectar la gestión de inventarios y debe ser utilizada con precaución.',
      datos_adicionales: {
        url_de_envio: 'registrarventaoculto',
      },
    })
  }

  const res = await aprobarRechazarSolicitud(payload)
  if (res) {
    dialogoGestion.value = false
    await refreshAll()
  }
}

// Consumo de Permiso
// const procesarConsumo = async (permiso) => {
//   const res = await consumirPermiso({
//     idpermiso: permiso.idpermiso,
//     ver: 'consumir',
//   })
//   if (res) refreshAll()
// }

// Helper UI
const getColorEstado = (estado) => {
  const map = {
    PENDIENTE: 'orange',
    APROBADO: 'positive',
    RECHAZADO: 'negative',
    CONSUMIDO: 'blue',
  }
  return map[estado] || 'grey'
}
</script>
