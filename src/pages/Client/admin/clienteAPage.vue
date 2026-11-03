<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="group" size="md" class="q-mr-sm" />
          {{ $t('ui.gestion-de-clientes-ac85a5') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.directorio-y-administracion-de-cartera-de-clientes-5bf129') }}
        </div>
      </div>
    </div>

    <q-dialog v-model="showForm" persistent :full-width="$q.screen.lt.md">
      <q-card
        :style="$q.screen.lt.md ? 'width: 100%; max-width: 100%' : 'width: 860px; max-width: 90vw'"
      >
        <q-card-section class="bg-primary text-h6 text-white row items-center justify-between">
          <div>
            <q-icon name="person" class="q-mr-sm" />
            {{ isEditing ? $t('ui.editar-cliente-073989') : $t('ui.nuevo-cliente-0f0b5a') }}
          </div>
          <q-btn icon="close" @click="toggleForm" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <registro-cliente
            :isEditing="isEditing"
            :modalValue="clienteSeleccionado"
            :tipoClienteOptions="opcionesTipoCliente"
            :canalVentaOptions="opcionesCanalVenta"
            :tipoDocumetosOptions="tipoDocumetosOptions"
            :almacen-options="almacenes"
            @submit="guardarCliente"
            @cancel="toggleForm"
          ></registro-cliente
        ></q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showImport" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ui.importar-clientes-9143e4') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p>{{ $t('ui.seleccione-el-archivo-xlsx-o-csv-con-el-formato-requ-0ae9d9') }}</p>

          <q-file
            v-model="excelFile"
            :label="$t('ui.elegir-archivo-excel-917dd0')"
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
          <q-btn flat :label="$t('common.cancel')" v-close-popup @click="resetForm" />
          <q-btn
            color="primary"
            :label="$t('ui.procesar-importacion-0c6085')"
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
      :almacen-options="almacenes"
      @add="toggleForm"
      @importFromExcel="showImport = true"
      @edit="editUnit"
      @delete="eliminarCliente"
      @addToList="abrirModal"
    ></table-cliente>
    <div>
      <q-dialog v-model="mostrarModalSucursal">
        <sucursal-form
          v-model="sucursalSeleccionada"
          :rows="listaSucursales"
          :loading="loadingSucursal"
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
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import RegistroCliente from 'components/clientes/admin/FormCliente.vue'
import TableCliente from 'src/components/clientes/admin/TableCliente.vue'
import SucursalForm from 'src/components/clientes/admin/ModalSucursal.vue'

import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const showForm = ref(false)
const clientes = ref([])
const canalesVenta = ref([])
const tiposClientes = ref([])
const opcionesTipoCliente = ref([])
const isEditing = ref(false)
const opcionesCanalVenta = ref([])
const almacenes = ref([])
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
        message: response.data.mensaje || i18nT('ui.cliente-guardado-correctamente-d0df06'),
      })
      loadRows()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || i18nT('ui.hubo-un-problema-al-guardar-el-cliente-a235d2'),
      })
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.no-se-pudo-guardar-el-cliente-8c0922'),
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
      label: i18nT('ui.todos-tipo-cliente-677c54'),
      value: '0',
    })

    tiposClientes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
      label: i18nT('ui.todos-canal-venta-2c1652'),
      value: '0',
    })

    canalesVenta.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}
async function eliminarCliente(client) {
  console.log(client)
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
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
        message: i18nT('configGeneral.divisas.messages.loadError'),
      })
    }
  })
}

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((item) => item.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-almacenes-4154c2') })
  }
}
//============================================modal
const mostrarModalSucursal = ref(false)
const listaSucursales = ref([])
const sucursalSeleccionada = ref({})
const loadingSucursal = ref(false)

const getSucursal = async (client) => {
  try {
    const response = await api.get(`listaSucursal/${client}`) // Cambia a tu ruta real
    console.log(response.data)
    listaSucursales.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
  loadingSucursal.value = true
  try {
    let response
    if (sucursal.id) {
      response = await api.post(``, formData)
    } else {
      response = await api.post('', formData)
    }

    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || i18nT('ui.sucursal-guardada-correctamente-781ad8'),
      })
      getSucursal(sucursal.idcliente)
      // Reset form for next entry
      sucursalSeleccionada.value = {
        ver: 'registrarSucursal',
        nombre: '',
        telefono: '',
        direccion: '',
        idcliente: sucursal.idcliente,
      }
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || i18nT('ui.hubo-un-problema-al-guardar-la-sucursal-31c05a'),
      })
    }
  } catch (error) {
    console.error('Error al guardar sucursal:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.no-se-pudo-guardar-la-sucursal-d2e223'),
    })
  } finally {
    loadingSucursal.value = false
  }
}

const editSucursal = (sucursal) => {
  console.log(sucursal)
  sucursalSeleccionada.value = {
    ver: 'editarSucursal',
    id: sucursal.id,
    nombre: sucursal.nombre,
    telefono: sucursal.telefono,
    direccion: sucursal.direccion,
    idcliente: sucursal.idcliente,
  }
  console.log(sucursalSeleccionada.value)
}
const eliminarSucursal = (sucursal) => {
  console.log(sucursal)
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `${i18nT('ui.eliminar-sucursal-921632')}`,
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
        message: i18nT('configGeneral.divisas.messages.loadError'),
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
  cargarAlmacenes()
})
</script>
