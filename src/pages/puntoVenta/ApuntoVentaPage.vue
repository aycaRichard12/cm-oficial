<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <div class="titulo">Asignar Punto Venta</div>
    <q-card-section>
      <UserTable
        v-if="showFirstView"
        :users="users"
        :columns="userColumns"
        @asignar="showAssignForm"
      />
      <div v-else>
        <AsignacionForm
          :user="selectedUser"
          :warehouses="warehouses"
          :pointsOfSale="pointsOfSale"
          @submit="submitAssignment"
          @volver="showFirstView = true"
          @load="loadPointsOfSale"
        />
        <AsignacionTable
          :assignments="assignments"
          :columns="assignmentColumns"
          :warehouses="warehouses"
          @delete="deleteAssignment"
          @loadAssignments="cargarAsignaciones"
        />
      </div>
    </q-card-section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserTable from 'components/puntoVenta/asignacion/UserTable.vue'
import AsignacionForm from 'components/puntoVenta/asignacion/AsignacionForm.vue'
import AsignacionTable from 'components/puntoVenta/asignacion/AsignacionTable.vue'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { useQuasar } from 'quasar'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const showFirstView = ref(true)
const selectedUser = ref({})
const pointsOfSale = ref([])
const $q = useQuasar()
const idresponsable = ref('')
const idalmacen = ref('')
const idalmacenF = ref('')
// Datos simulados
const users = ref([])
async function loadUsuarios() {
  try {
    const response = await api.get(`listaResponsable/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)

    users.value = response.data.map((key) => ({
      id: key.idusuario,
      idresponsable: key.id,
      usuario: key.usuario[0].usuario,
      nombre: key.usuario[0].nombre,
      apellido: key.usuario[0].apellido,
      cargo: key.usuario[0].cargo,
      almacenes: key.almacenes,
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const warehouses = ref([])
const assignments = ref([
  /* ... */
])

const userColumns = [
  /* ... */
]
const assignmentColumns = [
  /* ... */
]
async function getAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`) // ejemplo
    console.log(response)
    const filtrado = response.data.filter((u) => u.idusuario == idusuario)
    console.log(filtrado)
    const formateado = filtrado.map((item) => ({
      name: item.almacen,
      id: item.idalmacen,
    }))
    console.log(formateado)
    warehouses.value = formateado
    if (warehouses.value.length > 0) {
      const primerAlmacenId = warehouses.value[0].id
      cargarAsignaciones(primerAlmacenId)
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function showAssignForm(user) {
  console.log(user)
  idresponsable.value = user.idresponsable
  selectedUser.value = {
    id: user.idusuario,
    name: `${user.usuario} ${user.nombre}`,
    idresponsable: user.idresponsable,
  }
  showFirstView.value = false
  getAlmacenes()
}

async function loadPointsOfSale(warehouseId) {
  console.log('Cargar puntos para:', warehouseId)
  idalmacenF.value = warehouseId
  try {
    const response = await api.get(`listaPuntoVenta/${warehouseId}`) // ejemplo

    const todosLosPuntos = response.data.map((item) => ({
      name: item.nombre,
      id: item.id,
    }))

    // Filtrar puntos ya asignados (según assignments)
    const idsAsignados = assignments.value.map((a) => a.idpuntoventa)
    const noAsignados = todosLosPuntos.filter((p) => !idsAsignados.includes(p.id))

    pointsOfSale.value = noAsignados
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

async function submitAssignment({ warehouse, pointOfSale }) {
  console.log('Asignando a', selectedUser.value, warehouse, pointOfSale)
  const formData = new FormData()
  formData.append('idresponsable', idresponsable.value)
  formData.append('ver', 'registrarResponsablePuntoVenta')
  formData.append('idalmacen', warehouse)
  formData.append('idpuntoventa', pointOfSale)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    const response = await api.post(``, formData)
    if (response.data.estado === 'exito') {
      console.log(idalmacenF.value)
      cargarAsignaciones(idalmacenF.value)
      loadPointsOfSale(warehouse)
      $q.notify({
        type: 'positive',
        message: 'Registrado correctamente',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'No se a podido Registrar',
      })
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar' + error,
    })
  }
}

function deleteAssignment(id) {
  console.log('Eliminar asignación con ID:', id)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Almacen Punto de Venta?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarResponsablePuntoVenta/${id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        cargarAsignaciones(idalmacen.value)
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}

async function cargarAsignaciones(warehouseId) {
  console.log('Cargar puntos para:', warehouseId)
  console.log(idresponsable.value)
  idalmacen.value = warehouseId
  try {
    const response = await api.get(`listaResponsablePuntoVenta/${idempresa}`) // ejemplo
    const filtrado = response.data.filter(
      (u) => u.idalmacen == warehouseId && u.idresponsable == idresponsable.value,
    )
    assignments.value = filtrado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
onMounted(() => {
  loadUsuarios()
})
</script>
