<template>
  <q-page padding>
    <q-card flat bordered class="q-pa-md">
      <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
        <q-toolbar-title>{{ $t('ui.gestion-de-permisos-de-stock-85e760') }}</q-toolbar-title>
        <q-btn
          icon="add"
          :label="$t('ui.nueva-solicitud-5dc51c')"
          color="white"
          flat
          @click="abrirDialogoSolicitud"
        />
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
        <q-tab name="solicitudes" icon="assignment" :label="$t('ui.solicitudes-853f77')" />
        <q-tab name="activos" icon="check_circle" :label="$t('ui.p-activos-36a533')" />
        <q-tab name="historial" icon="history" :label="$t('ui.historial-302027')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="solicitudes">
          <q-table
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
                >
                  <q-tooltip>{{ $t('ui.aprobar-o-rechazar-08a601') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="activos">
          <q-table
            :title="$t('ui.permisos-disponibles-11df9d')"
            :rows="listaActivosData"
            :columns="colsPermisos"
            :loading="loading"
          >
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  :label="$t('ui.consumir-486628')"
                  color="deep-orange"
                  size="sm"
                  @click="procesarConsumo(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="historial">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-table
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
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('ui.gestionar-solicitud-5cfefd') }}{{ selectedItem?.id }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('ui.desea-aprobar-o-rechazar-esta-solicitud-de-stock-0e031f') }}
          <q-input
            v-model="observacionGestion"
            :label="$t('ui.observaciones-opcional-e4d83c')"
            outlined
            dense
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('ui.cerrar-4b0816')" flat v-close-popup />
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

// Composables y State
const {
  loading,
  responsables,
  almacenesResponsable,
  loadUsuarios,
  loadAAlmacenes,
  crearSolicitudPermiso,
  aprobarRechazarSolicitud,
  consumirPermiso,
  listarPermisosActivos,
  listarPermisosUsados,
  listarPermisosVencidos,
  listarSolicitudes,
} = useSolicitudes()

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
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha_creacion', align: 'left' },
  {
    name: 'usuario',
    label: i18nT('ui.solicitante-0cd165'),
    field: (row) => row.usuario?.nombre || 'N/A',
    align: 'left',
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'acciones', label: i18nT('common.actions'), align: 'right' },
]

const colsPermisos = [
  { name: 'id', label: i18nT('ui.cod-permiso-7d36dc'), field: 'idpermiso', align: 'left' },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left' },
  { name: 'acciones', label: i18nT('common.actions'), align: 'right' },
]

// Ciclo de Vida
onMounted(async () => {
  await refreshAll()
  loadUsuarios()
  loadAAlmacenes()
})

// Métodos de Carga
async function refreshAll() {
  listaSolicitudesData.value = await listarSolicitudes()
  listaActivosData.value = await listarPermisosActivos()
  listaUsadosData.value = await listarPermisosUsados()
  listaVencidosData.value = await listarPermisosVencidos()
}

// Lógica Formulario Solicitud
const abrirDialogoSolicitud = () => {
  formSolicitud.motivo = ''
  dialogoSolicitud.value = true
}

const onSubmitSolicitud = async () => {
  const res = await crearSolicitudPermiso({ ...formSolicitud })
  if (res) {
    dialogoSolicitud.value = false
    refreshAll()
  }
}

// Lógica Gestión (Aprobar/Rechazar)
const gestionarSolicitud = (row) => {
  selectedItem.value = row
  observacionGestion.value = ''
  dialogoGestion.value = true
}

const handleGestion = async (accion) => {
  const payload = {
    id: selectedItem.value.id,
    ver: accion,
    observacion: observacionGestion.value,
  }
  const res = await aprobarRechazarSolicitud(payload)
  if (res) {
    dialogoGestion.value = false
    refreshAll()
  }
}

// Consumo de Permiso
const procesarConsumo = async (permiso) => {
  const res = await consumirPermiso({
    idpermiso: permiso.idpermiso,
    ver: 'consumir',
  })
  if (res) refreshAll()
}

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
