<template>
  <q-page class="q-pa-md">
    <q-card class="shadow-2 rounded-borders">
      <q-table
        title="Credenciales de Servicios"
        :rows="rows"
        :columns="columns"
        row-key="id_empresa_soft"
        :loading="loading"
        flat
      >
        <!-- Top toolbar with Nuevo button -->
        <template v-slot:top-right>
          <q-btn
            id="btnNuevaCredencial"
            color="primary"
            icon="add"
            label="Nuevo"
            @click="openNewDialog"
            unelevated
          />
        </template>
        <!-- Slot para Credenciales -->
        <template v-slot:body-cell-credenciales="props">
          <q-td :props="props" id="verCredencialesJson">
            <q-btn
              color="primary"
              flat
              dense
              icon="vpn_key"
              label="Ver Credenciales"
              no-caps
              class="bg-indigo-1 rounded-borders q-px-sm"
            >
              <q-menu
                anchor="top right"
                self="top left"
                class="shadow-4 overflow-hidden"
                style="border-radius: 8px; min-width: 320px;"
              >
                <q-list class="bg-white q-py-xs" dense separator>
                  <q-item v-for="(val, key) in props.row.credenciales" :key="key" class="q-py-sm">
                    <q-item-section>
                      <q-item-label caption class="text-uppercase text-weight-bold text-grey-7">
                        {{ key }}
                      </q-item-label>
                      <q-item-label lines="1" class="text-body2" style="font-family: monospace; font-size: 13px;">
                        <span v-if="props.row.visibility && props.row.visibility[key]" class="text-dark">{{ val }}</span>
                        <span v-else class="text-grey-5">••••••••••••••••••••</span>
                      </q-item-label>
                    </q-item-section>
                    
                    <q-item-section side class="row no-wrap items-center">
                      <div class="q-gutter-x-xs">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          :icon="props.row.visibility && props.row.visibility[key] ? 'visibility_off' : 'visibility'"
                          :color="props.row.visibility && props.row.visibility[key] ? 'grey' : 'primary'"
                          @click.stop="toggleVisibility(props.row, key)"
                        >
                          <q-tooltip>{{ props.row.visibility && props.row.visibility[key] ? 'Ocultar' : 'Mostrar' }}</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="content_copy"
                          color="secondary"
                          @click.stop="copiarTexto(val)"
                        >
                          <q-tooltip>Copiar {{ key }}</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                  
                  <q-item class="q-pt-sm">
                    <q-item-section>
                      <q-btn
                        outline
                        color="indigo"
                        size="sm"
                        icon="data_object"
                        label="Copiar JSON completo"
                        class="full-width rounded-borders"
                        @click.stop="copiarTexto(JSON.stringify(props.row.credenciales, null, 2))"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <!-- Slot para Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" align="center" id="estadoCredencial">
            <q-badge
              clickable
              @click="handleToggleStatus(props.row)"
              :color="props.value == 1 ? 'green' : 'red'"
              :label="props.value == 1 ? 'Activo' : 'Inactivo'"
              class="cursor-pointer"
            >
              <q-tooltip>Clic para cambiar estado</q-tooltip>
            </q-badge>
          </q-td>
        </template>

        <!-- Slot para Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" id="accionesCredencial">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>Editar credenciales</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar credenciales</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog for creating/editing credentials -->
    <CredencialesServicioDialog
      v-model="showDialog"
      :editing="isEditing"
      :selected-data="selectedCredential"
      @refresh="refreshData"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { copyToClipboard, useQuasar } from 'quasar'
import CredencialesServicioDialog from 'src/components/general/credencialesServicio/CredencialesServicioDialog.vue'
import { useCredencialesServicioForm } from 'src/composables/useCredencialesServicioForm'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const idEmpresa = idempresa_md5()

// Services list for mapping IDs to names
const services = ref([])

// Dialog state
const showDialog = ref(false)
const isEditing = ref(false)
const selectedCredential = ref(null)

// Get toggleStatus from composable
const { toggleStatus, deleteCredential } = useCredencialesServicioForm()

const columns = [
  {
    name: 'numero',
    align: 'left',
    label: '#',
    field: 'numero',
    sortable: true,
    style: 'width: 50px',
  },
  {
    name: 'servicio',
    align: 'left',
    label: 'Servicio',
    field: 'id_soft_externo',
    sortable: true,
    classes: 'text-weight-bold text-primary',
    format: (val) => getServiceName(val),
  },
  {
    name: 'software_nombre',
    align: 'left',
    label: 'Software',
    field: 'software_nombre',
    sortable: true,
    classes: 'text-weight-bold',
  },
  {
    name: 'slug',
    align: 'left',
    label: 'Slug',
    field: 'slug',
    sortable: true,
    classes: 'text-caption text-grey-7',
  },
  {
    name: 'credenciales',
    align: 'left',
    label: 'Credenciales',
    field: 'credenciales',
    style: 'width: 400px',
  },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  {
    name: 'fecha_instalacion',
    align: 'left',
    label: 'Fecha Instalación',
    field: 'fecha_instalacion',
    sortable: true,
    format: (val) => (val ? cambiarFormatoFecha(val.split(' ')[0]) : ''),
  },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]

// Función para copiar texto al portapapeles
const copiarTexto = async (texto) => {
  try {
    await copyToClipboard(texto)
    $q.notify({
      type: 'positive',
      message: 'Copiado al portapapeles',
      icon: 'check',
      timeout: 1000,
    })
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al copiar',
      icon: 'error',
    })
  }
}

// Función para alternar visibilidad de un campo específico
const toggleVisibility = (row, key) => {
  if (!row.visibility) row.visibility = {}
  row.visibility[key] = !row.visibility[key]
}

// Load services list
async function loadServices() {
  try {
    const response = await api.get('services/listar')
    services.value = response.data
    console.log('Servicios cargados:', services.value)
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }
}

// Get service name by ID
const getServiceName = (serviceId) => {
  if (!serviceId) return 'Sin asignar'
  const service = services.value.find(s => s.id == serviceId)
  return service ? service.nombre : `ID: ${serviceId}`
}

async function getCredencialesServicios() {
  loading.value = true
  try {
    const response = await api.get(`services/listarSosftwaresCredencialesPorEmpresa/${idEmpresa}`)
    console.log('Credenciales cargadas:', response.data)

    // Transformar los datos para incluir la numeración y el estado de visibilidad
    rows.value = response.data.map((item, index) => ({
      numero: index + 1,
      ...item,
      // Inicializar visibilidad para cada clave de las credenciales como false (oculto)
      visibility: item.credenciales
        ? Object.keys(item.credenciales).reduce((acc, key) => {
            acc[key] = false
            return acc
          }, {})
        : {},
    }))
  } catch (error) {
    console.error('Error al cargar credenciales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las credenciales',
      icon: 'report_problem',
    })
  } finally {
    loading.value = false
  }
}

// Handle status toggle
const handleToggleStatus = async (row) => {
  const result = await toggleStatus(row.id_empresa_soft, row.estado)
  if (result.success) {
    // Update local state
    row.estado = result.newStatus
  }
}

// Confirm delete with dialog
const confirmDelete = (credential) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro que desea eliminar las credenciales del servicio "${getServiceName(credential.id_soft_externo)}"?`,
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true,
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      flat: true,
    },
    persistent: true,
  }).onOk(async () => {
    const result = await deleteCredential(credential.id_empresa_soft)
    if (result.success) {
      refreshData()
    }
  })
}

// Open dialog for new credential
const openNewDialog = () => {
  isEditing.value = false
  selectedCredential.value = null
  showDialog.value = true
}

// Open dialog for editing credential
const openEditDialog = (credential) => {
  isEditing.value = true
  selectedCredential.value = credential
  showDialog.value = true
}

// Refresh data after form submission
const refreshData = () => {
  getCredencialesServicios()
}

onMounted(async () => {
  await loadServices()
  getCredencialesServicios()
})
</script>
