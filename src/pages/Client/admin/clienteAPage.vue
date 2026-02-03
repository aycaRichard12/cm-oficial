<template>
  <q-page padding="">
    <div class="titulo">Registrar Cliente</div>
    <q-dialog v-model="showForm">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Registrar Cliente</div>
          <q-btn color="" icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <registro-cliente
            :isEditing="isEditing"
            :modalValue="clienteSeleccionado"
            :tipoClienteOptions="opcionesTipoCliente"
            :canalVentaOptions="opcionesCanalVenta"
            :tipoDocumetosOptions="tipoDocumetosOptions"
            @submit="guardarCliente"
            @cancel="toggleForm"
          ></registro-cliente
        ></q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showImport" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Importar Clientes</div>
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
    <table-cliente
      :isEditing="isEditing"
      :rows="clientes"
      :tipo-cliente-filter-options="tiposClientes"
      :canal-venta-filter-options="canalesVenta"
      :tipo-documento-filter-options="tiposDocumento"
      @add="toggleForm"
      @importFromExcel="showImport = true"
      @edit="editUnit"
      @delete="eliminarCliente"
      @addToList="abrirModal"
    ></table-cliente>
    <div>
      <q-dialog v-model="mostrarModalSucursal" persistent>
        <sucursal-form
          v-model="sucursalSeleccionada"
          :rows="listaSucursales"
          @submit="guardarSucursal"
          @cancel="cerrarModal"
          @edit="editSucursal"
          @delete="eliminarSucursal"
        />
      </q-dialog>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import RegistroCliente from 'components/clientes/admin/FormCliente.vue'
import TableCliente from 'src/components/clientes/admin/TableCliente.vue'
import SucursalForm from 'src/components/clientes/admin/ModalSucursal.vue'

import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const idempresa = idempresa_md5()
const showForm = ref(false)
const clientes = ref([])
const canalesVenta = ref([])
const tiposClientes = ref([])
const opcionesTipoCliente = ref([])
const isEditing = ref(false)
const opcionesCanalVenta = ref([])

const showImport = ref(false)
const excelFile = ref(null)
const isUploading = ref(false)
const statusMessage = ref('')

const tiposDocumento = ref(['Todos (Tipo Doc.)', 'CI', 'CEX', 'PAS', 'OD', 'NIT'])
const tipoDocumetosOptions = ref([
  { label: 'CI', value: '1' },
  { label: 'CEX', value: '2' },
  { label: 'PAS', value: '3' },
  { label: 'OD', value: '4' },
  { label: 'NIT', value: '5' },
])
const clienteSeleccionado = ref({
  ver: 'registrarCliente',
  idempresa: idempresa,
  nombre: '',
  nombrecomercial: '',
  tipocliente: '',

  // ...otros campos
})

//===============================Formulario
async function guardarCliente(data) {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    let response
    if (isEditing.value) {
      // PUT con FormData (algunos servidores requieren POST + método oculto para PUT)
      // Aquí se asume que tu backend acepta PUT con FormData directamente.
      response = await api.post(``, formData)
    } else {
      // POST = nuevo cliente
      response = await api.post('', formData)
    }
    console.log(response)

    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Cliente guardado correctamente',
      })
      loadRows()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el cliente',
      })
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el cliente',
    })
  }
}

function resetForm() {
  isEditing.value = false
  clienteSeleccionado.value = {
    ver: 'registrarCliente',
    idempresa: idempresa,
  }
}
//=================================Tabla

const editUnit = (item) => {
  clienteSeleccionado.value = {
    ver: 'editarCliente',
    idempresa: idempresa,
    nombre: item.nombre,
    nombrecomercial: item.nombrecomercial,
    canalventa: item.idcanal,
    tipocliente: item.idtipo,
    tipodocumento: item.tipodocumento,
    nrodocumento: item.nit,
    detalle: item.detalle,
    direccion: item.direccion,
    telefono: item.telefono,
    movil: item.mobil,
    email: item.email,
    web: item.web,
    pais: item.pais,
    ciudad: item.ciudad,
    zona: item.zona,
    contacto: item.contacto,
    id: item.id,
  }

  isEditing.value = true
  showForm.value = true
}
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
const cargarTipoCliente = async () => {
  try {
    const response = await api.get(`listaTipoCliente/${idempresa}`)

    // Mapeo de la respuesta
    let formateado = response.data.map((item) => ({
      label: item.tipo,
      value: item.id,
    }))
    opcionesTipoCliente.value = response.data.map((item) => ({
      label: item.tipo,
      value: item.id,
    }))
    // Agregar opción "Todos (Canal Venta)" al inicio
    formateado.unshift({
      label: 'Todos (Tipo Cliente)',
      value: '0',
    })

    tiposClientes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const cargarCanalesVenta = async () => {
  try {
    const response = await api.get(`listaCanalVenta/${idempresa}`)

    // Mapeo de la respuesta
    let formateado = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
    opcionesCanalVenta.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
    // Agregar opción "Todos (Canal Venta)" al inicio
    formateado.unshift({
      label: 'Todos (Canal Venta)',
      value: '0',
    })

    canalesVenta.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

async function loadRows() {
  try {
    const response = await api.get(`listaCliente/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    clientes.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function eliminarCliente(client) {
  console.log(client)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Cliente "${client.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarCliente/${client.id}`) // Cambia a tu ruta real
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
//============================================modal
const mostrarModalSucursal = ref(false)
const listaSucursales = ref([])
const sucursalSeleccionada = ref({})

const getSucursal = async (client) => {
  try {
    const response = await api.get(`listaSucursal/${client}`) // Cambia a tu ruta real
    console.log(response.data)
    listaSucursales.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const abrirModal = (client) => {
  console.log(client)

  mostrarModalSucursal.value = true
  getSucursal(client.id)
  sucursalSeleccionada.value = {
    ver: 'registrarSucursal',
    nombre: '',
    telefono: '',
    direccion: '',
    idcliente: client.id,
  }
}

const cerrarModal = () => {
  mostrarModalSucursal.value = false
}

const guardarSucursal = async (sucursal) => {
  const formData = objectToFormData(sucursal)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  let response

  try {
    if (sucursal.id) {
      console.log(sucursal.id)
      response = await api.post(``, formData)
    } else {
      console.log(sucursal)
      response = await api.post('', formData)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Cliente guardado correctamente',
      })
      loadRows()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el cliente',
      })
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el cliente',
    })
  }

  mostrarModalSucursal.value = false
}

const editSucursal = (sucursal) => {
  console.log(sucursal)
  sucursalSeleccionada.value = {
    ver: 'editarSucursal',
    id: sucursal.id,
    nombre: sucursal.nombre,
    telefono: sucursal.telefono,
    direccion: sucursal.direccion,
  }
  console.log(sucursalSeleccionada.value)
}
const eliminarSucursal = (sucursal) => {
  console.log(sucursal)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Sucursal ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarSucursal/${sucursal.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        getSucursal(sucursal.idcliente)
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

function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
      formData.append('ver', 'importar_excel_cliente')
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
  cargarCanalesVenta()
  cargarTipoCliente()
})
</script>
