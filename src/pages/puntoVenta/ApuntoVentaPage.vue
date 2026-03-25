<template>
  <q-page padding >
    <!-- Vista 1: Tabla de Usuarios -->
  <div v-if="showFirstView">

  <q-card flat bordered class="q-pa-md">

    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
     

      <!-- (Opcional) botón -->
      <!--
      <q-btn
        color="primary"
        icon="person_add"
        label="Nuevo"
        unelevated
      />
      -->
    </div>

  
    <!-- Tabla -->
    <div class="q-mt-sm">
      <UserTable
        :users="users"
        :columns="userColumns"
        @asignar="showAssignForm"
      />
    </div>

  </q-card>

</div>

    <!-- Vista 2: Gestión de Asignaciones para el usuario seleccionado -->
    <div v-else>
      <!-- Cabecera de Usuario Seleccionado -->
      <q-card flat class="bg-white q-mb-md shadow-1 rounded-borders overflow-hidden">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <q-btn flat round color="grey-7" icon="arrow_back" @click="showFirstView = true" class="q-mr-md" />
            <q-avatar size="56px" font-size="28px" color="primary" text-color="white" icon="person" class="q-mr-md shadow-2" />
            <div class="col">
              <div class="text-h5 text-weight-bold text-dark">{{ selectedUser.name }}</div>
              <div class="text-subtitle2 text-grey-7">{{ selectedUser.cargo || 'Responsable de Ventas' }}</div>
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                icon="add_circle"
                label="Nueva Asignación"
                unelevated
                @click="showModal = true"
                class="q-px-md"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Asignaciones Actuales -->
      <q-card flat class="shadow-2 rounded-borders">
        <q-card-section class="q-pa-none">
          <div class="q-pa-md text-h6 text-grey-8 row items-center">
            <q-icon name="list" color="primary" class="q-mr-sm" />
            Puntos de Venta Asignados
          </div>
          <AsignacionTable
            :assignments="assignments"
            :columns="assignmentColumns"
            :warehouses="warehouses"
            @delete="deleteAssignment"
            @loadAssignments="cargarAsignaciones"
          />
        </q-card-section>
      </q-card>

      <!-- Diálogo de Formulario (Simplificado) -->
      <q-dialog v-model="showModal" persistent backdrop-filter="blur(4px)">
        <q-card style="width: 700px; max-width: 95vw;" class="rounded-borders shadow-10">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Registrar Punto de Venta</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-none">
            <AsignacionForm
              ref="formRef"
              :user="selectedUser"
              :warehouses="warehouses"
              :pointsOfSale="pointsOfSale"
              :submitting="submitting"
              @submit="submitAssignment"
              @volver="showModal = false"
              @load="loadPointsOfSale"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserTable from 'components/puntoVenta/asignacion/UserTable.vue'
import AsignacionForm from 'components/puntoVenta/asignacion/AsignacionForm.vue'
import AsignacionTable from 'components/puntoVenta/asignacion/AsignacionTable.vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

// Estados de control UI
const showModal = ref(false)
const showFirstView = ref(true)
const submitting = ref(false)
const formRef = ref(null)

// Datos de sesión
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()

// Referencias de selección
const selectedUser = ref({})
const idresponsable = ref('')
const idalmacenF = ref('')

// Datos dinámicos
const users = ref([])
const warehouses = ref([])
const assignments = ref([])
const pointsOfSale = ref([])

// Cargar catálogo de usuarios
async function loadUsuarios() {
  try {
    const response = await api.get(`listaResponsable/${idempresa}`)
    users.value = response.data.map((key) => ({
      id: key.idusuario,
      idresponsable: key.id,
      usuario: key.usuario[0].usuario,
      nombre: key.usuario[0].nombre,
      apellido: key.usuario[0].apellido,
      cargo: key.usuario[0].cargo,
    }))
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los usuarios' })
  }
}

// Cargar catálogo de almacenes permitidos para el usuario activo
async function getAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrado = response.data.filter((u) => u.idusuario == idusuario)
    warehouses.value = filtrado.map((item) => ({
      name: item.almacen,
      id: item.idalmacen,
    }))
    
    if (warehouses.value.length > 0) {
      cargarAsignaciones(warehouses.value[0].id)
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando almacenes' })
  }
}

// Acción al seleccionar un usuario para gestionar
function showAssignForm(user) {
  idresponsable.value = user.idresponsable
  selectedUser.value = {
    id: user.idusuario,
    name: `${user.usuario} | ${user.nombre} ${user.apellido}`,
    idresponsable: user.idresponsable,
    cargo: user.cargo
  }
  showFirstView.value = false
  getAlmacenes()
}

// Cargar puntos de venta libres de un almacén específico
async function loadPointsOfSale(warehouseId) {
  idalmacenF.value = warehouseId
  try {
    const response = await api.get(`listaPuntoVenta/${warehouseId}`)
    const todosLosPuntos = response.data.map((item) => ({ name: item.nombre, id: item.id }))
    
    // Filtro local: solo mostrar los que no han sido asignados ya en este view
    const idsAsignados = assignments.value.map((a) => a.idpuntoventa || a.id)
    pointsOfSale.value = todosLosPuntos.filter((p) => !idsAsignados.includes(p.id))
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los puntos de venta' })
  }
}

// Procesar el registro en el servidor
async function submitAssignment({ warehouse, pointOfSale }) {
  submitting.value = true
  
  const formData = new FormData()
  formData.append('idresponsable', idresponsable.value)
  formData.append('ver', 'registrarResponsablePuntoVenta')
  formData.append('idalmacen', warehouse)
  formData.append('idpuntoventa', pointOfSale)

  try {
    const response = await api.post(``, formData)
    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: 'Asignación registrada con éxito' })
      
      // Actualizar datos y cerrar
      await cargarAsignaciones(warehouse)
      showModal.value = false
      if (formRef.value) formRef.value.resetForm()
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || 'Fallo en el registro' })
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Ocurrió un error en el servidor: ' + err })
  } finally {
    submitting.value = false
  }
}

async function cargarAsignaciones(warehouseId) {
  try {
    const response = await api.get(`listaResponsablePuntoVenta/${idempresa}`)
    assignments.value = response.data.filter(
      (u) => u.idalmacen == warehouseId && u.idresponsable == idresponsable.value
    )
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando historial de asignaciones' })
  }
}

function deleteAssignment(id) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que deseas retirar este punto de venta?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarResponsablePuntoVenta/${id}`)
      if (response.data.estado === 'exito') {
        $q.notify({ type: 'positive', message: 'Asignación eliminada correctamente' })
        cargarAsignaciones(idalmacenF.value)
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Fallo al eliminar asignación' })
    }
  })
}

onMounted(loadUsuarios)
</script>

