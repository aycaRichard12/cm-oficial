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

    <q-dialog v-model="showImport" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Importar Proveedores</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p>Seleccione el archivo .xlsx o .csv con el formato requerido.</p>

          <q-file
            v-model="excelFile"
            label="Elegir archivo Excel"
            outlined
            accept=".xlsx, .xls, .csv"
            :loading="isUploading"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div v-if="statusMessage" class="q-mt-sm text-negative text-caption">
            {{ statusMessage }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup @click="resetForm" />
          <q-btn
            color="primary"
            label="Procesar Importación"
            :loading="isUploading"
            @click="procesarExcel"
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
      @importFromExcel="showImport = true"
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
import * as XLSX from 'xlsx'
const idempresa = idempresa_md5()
const showForm = ref(false)
const provedores = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const showImport = ref(false)
const excelFile = ref(null)
const isUploading = ref(false)
const statusMessage = ref('')
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

const resetFormImport = () => {
  excelFile.value = null
  statusMessage.value = ''
  isUploading.value = false
}

const procesarExcel = async () => {
  if (!excelFile.value) {
    statusMessage.value = 'Debe seleccionar un archivo primero.'
    return
  }

  isUploading.value = true
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      // Conversión a CSV (tu lógica original)
      const csv = XLSX.utils.sheet_to_csv(sheet)
      const blob = new Blob([csv], { type: 'text/csv' })

      const formData = new FormData()
      formData.append('ver', 'importar_excel_proveedor')
      formData.append('file', blob, 'clientes.csv')
      formData.append('idempresa', idempresa)

      const response = await api.post('', formData)

      console.log(response.data)
      // Finalizar proceso
      showImport.value = false
      resetFormImport()
      loadRows()
    } catch (error) {
      console.error('Error:', error)
      statusMessage.value = 'Error al procesar el archivo o respuesta inválida.'
    } finally {
      isUploading.value = false
    }
  }

  reader.readAsArrayBuffer(excelFile.value)
}
onMounted(() => {
  loadRows()
})
</script>
