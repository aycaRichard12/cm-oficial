<template>
  <q-page padding>
    <q-card flat bordered class="q-pa-md">
      <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
        <q-toolbar-title>Gestión de Permisos de Stock</q-toolbar-title>
        <q-btn
          icon="add"
          label="Nueva Solicitud"
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
        <q-tab name="solicitudes" icon="assignment" label="Solicitudes" />
        <q-tab name="activos" icon="check_circle" label="P. Activos" />
        <q-tab name="historial" icon="history" label="Historial" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="solicitudes">
          <q-table
            title="Solicitudes de Permiso"
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
                  <q-tooltip>Aprobar o Rechazar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="activos">
          <q-table
            title="Permisos Disponibles"
            :rows="listaActivosData"
            :columns="colsPermisos"
            :loading="loading"
          >
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  label="Consumir"
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
                title="Usados"
                :rows="listaUsadosData"
                :columns="colsPermisos"
                :loading="loading"
                flat
                bordered
              />
            </div>
            <div class="col-12 col-md-6">
              <q-table
                title="Vencidos"
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
          <div class="text-h6">Nueva Solicitud de Permiso</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit="onSubmitSolicitud">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="formSolicitud.idalmacen"
              :options="almacenesResponsable"
              label="Almacen"
              map-options
              emit-value
              outlined
              required
            />
            <q-select
              v-model="formSolicitud.idusuario_asignado"
              :options="responsables"
              label="Responsable"
              map-options
              emit-value
              outlined
              required
            />
            <q-input
              v-model="formSolicitud.motivo"
              label="Motivo / Justificación"
              type="textarea"
              outlined
              required
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Cancelar" flat v-close-popup />
            <q-btn label="Enviar Solicitud" color="primary" type="submit" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoGestion" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Gestionar Solicitud #{{ selectedItem?.id }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          ¿Desea aprobar o rechazar esta solicitud de stock?
          <q-input
            v-model="observacionGestion"
            label="Observaciones (Opcional)"
            outlined
            dense
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat v-close-popup />
          <q-btn
            label="Rechazar"
            color="negative"
            @click="handleGestion('rechazar')"
            :loading="loading"
          />
          <q-btn
            label="Aprobar"
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
  { name: 'fecha', label: 'Fecha', field: 'fecha_creacion', align: 'left' },
  {
    name: 'usuario',
    label: 'Solicitante',
    field: (row) => row.usuario?.nombre || 'N/A',
    align: 'left',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' },
]

const colsPermisos = [
  { name: 'id', label: 'Cód. Permiso', field: 'idpermiso', align: 'left' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'right' },
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
