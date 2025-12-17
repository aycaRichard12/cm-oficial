<template>
  <q-page padding="">
    <div class="titulo">Registrar Proveedor</div>

    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Registrar Proveedor</div>
          <q-btn color="" icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-actions class="q-pa-none">
          <form-proveedor
            :isEditing="isEditing"
            :modal-value="proveedorSeleccionado"
            @submit="guardarProveedor"
            @cancel="toggleForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <table-proveedor
      :isEditing="isEditing"
      :rows="provedores"
      @add="toggleForm"
      @edit="editUnit"
      @delete="confirmDelete"
      @imprimirReporte="onImprimirReporte"
      @importFromExcel="onImportFromExcel"
    />
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import TableProveedor from 'src/components/proveedor/TableProveedor.vue'
import FormProveedor from 'src/components/proveedor/FormProveedor.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const showForm = ref(false)
const provedores = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const proveedorSeleccionado = ref({
  ver: 'registrarProveedor',
  idempresa: idempresa,
})
//=======================================Formulario
const guardarProveedor = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  try {
    let response
    if (isEditing.value) {
      response = await api.post(``, formData)
    } else {
      response = await api.post(``, formData)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      loadRows()

      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Proveedor guardado correctamente',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el proveedor',
      })
    }
  } catch (error) {
    console.error('Error al guardar Proveedor: ', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el Proveedor',
    })
  }
  toggleForm()
}
//=======================================Tabla
async function loadRows() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)
    console.log(response.data)
    provedores.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const editUnit = (item) => {
  isEditing.value = true
  showForm.value = true

  proveedorSeleccionado.value = {
    ver: 'editarProveedor',
    id: item.id,
    nombre: item.nombre,
    codigo: item.codigo,
    nit: item.nit,
    detalle: item.detalle,
    direccion: item.direccion,
    telefono: item.telefono,
    movil: item.mobil,
    mobil: item.mobil,
    email: item.email,
    web: item.web,
    pais: item.pais,
    ciudad: item.ciudad,
    zona: item.zona,
    contacto: item.contacto,
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
const resetForm = () => {
  isEditing.value = false

  proveedorSeleccionado.value = {
    ver: 'registrarProveedor',
    idempresa: idempresa,
  }
}
const confirmDelete = (provedor) => {
  console.log(provedor)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Proveedor "${provedor.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarProveedor/${provedor.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
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
onMounted(() => {
  loadRows()
})
</script>
