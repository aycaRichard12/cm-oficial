<template>
  <q-page class="q-pa-md" style="background-color: var(--cm-bg)">
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para métodos de pago y transacciones -->
          <q-icon name="payments" size="md" class="q-mr-sm" />
          {{ $t('ui.metodos-de-pago-25ac5f') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-formas-de-pago-para-facturacion-8a71a2') }}
        </div>
      </div>
    </div>
    <q-dialog v-model="showForm" persistent class="responsive-dialog">
      <q-card class="responsive-dialog">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ $t('ui.metodo-pago-122001') }}</div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup @click="toggleForm" />
        </q-card-section>
        <q-card-section>
          <q-form
            @submit.prevent="handleSubmit"
            ref="formRef"
            v-if="showForm"
            class="row q-col-gutter-x-md"
          >
            <div class="col-12 col-md-6">
              <label for="nombre">{{ $t('ui.nombre-del-metodo-de-pago-d6f490') }}</label>
              <q-input
                v-model="form.nombre"
                id="nombre"
                outlined
                dense
                color="warning"
                :rules="[(val) => !!val || $t('ui.el-nombre-es-requerido-f0a0af')]"
              />
            </div>
            <div class="col-12 col-md-6" v-if="tipoFactura">
              <label for="descripcion">{{ $t('ui.descripcion-sin-f34e43') }}</label>
              <q-select
                v-model="form.descripcionSIN"
                :options="filteredMetodosPagoSin"
                id="descripcion"
                dense
                outlined
                map-options
                use-input
                fill-input
                hide-selected
                option-value="codigo"
                option-label="descripcion"
                input-debounce="0"
                @filter="filterFn"
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">{{ $t('ui.no-hay-opciones-42f5ac') }}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <q-input
              v-if="false"
              v-model="form.codigoSIN"
              :label="$t('ui.codigo-sin-auto-relleno-68486b')"
              outlined
              dense
              disable
              class="q-mb-md"
            />

            <q-card-actions align="right">
              <q-btn
                v-if="showForm"
                type="submit"
                :label="$t('common.save')"
                color="positive"
                class="q-mt-md q-ml-sm"
              />
              <q-btn
                :label="$t('common.cancel')"
                flat
                round
                v-close-popup
                class="q-mt-md q-ml-sm"
                color="negative"
                @click="toggleForm"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div class="row">
      <q-btn
        color="primary"
        @click="toggleForm"
        class="btn-res q-ma-lg"
        id="agregarCanalDeVenta"
        :title="$t('configGeneral.leyenda.table.addTitle')"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">
          <q-icon name="add" /> {{ mostrarFormulario ? $t('ui.cancelar-registro-2dee20') : $t('common.new') }}
        </span>
      </q-btn>
    </div>

    <q-table
      class=""
      :title="$t('ui.metodos-de-pagos-fbb9d4')"
      :rows="filteredMetodosPago"
      :columns="columns"
      row-key="id"
      flat
      dense
      bordered
      :filter="searchTerm"
    >
      <template v-slot:top-right>
        <q-input
          v-model="searchTerm"
          :placeholder="$t('common.search')"
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: var(--cm-surface)"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <!-- <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-btn
                v-if="privileges[2] === 1"
                :icon="Number(props.row.estado) === 1 ? 'thumb_up' : 'thumb_down'"
                :color="Number(props.row.estado) === 1 ? 'primary' : 'negative'"
                @click="changeStatus(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
                dense
              />
            </q-td>
          </template> -->
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="$t('common.active')" outline />
          <q-badge color="red" v-else :label="$t('common.inactive')" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="privileges[2] === 1"
            icon="edit"
            color="primary"
            dense
            flat
            @click="editMetodoPago(props.row)"
          />
          <q-btn
            v-if="privileges[3] === 1"
            icon="delete"
            dense
            flat
            color="negative"
            @click="confirmDelete(props.row.id)"
          />
          <q-btn
            v-if="privileges[2] === 1"
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="changeStatus(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import {
  validarUsuario,
  normalizeText,
  getTipoFactura,
  getToken,
} from 'src/composables/FuncionesG.js'
import { URL_APICM } from 'src/composables/services'
import { api } from 'src/boot/axios'
import { TipoFactura } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const tipoFactura = TipoFactura()
let columns = []
// Reactive state
const formRef = ref(null)
const form = reactive({
  id: null,
  nombre: '',
  descripcionSIN: null, // Will hold the selected object { codigo, descripcion }
  codigoSIN: '',
  verMPF: 'registrarMetodoPagoFactura',
})

const metodosPago = ref([])
const leyendaSINOptions = ref([])
const showForm = ref(false)
const formTitle = ref('Nuevo registro')
const searchTerm = ref('')
const privileges = ref([0, 0, 0, 0]) // Default privileges, will be updated
const filteredMetodosPagoSin = ref([])
// Función de filtrado
function filterFn(val, update) {
  console.log(val)
  if (val === '') {
    update(() => {
      filteredMetodosPagoSin.value = leyendaSINOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredMetodosPagoSin.value = leyendaSINOptions.value.filter((v) =>
      v.descripcion.toLowerCase().includes(needle),
    )
  })
}
// Computed properties
const filteredMetodosPago = computed(() => {
  const normalizedSearchTerm = normalizeText(searchTerm.value).toLowerCase()
  if (!normalizedSearchTerm) {
    return metodosPago.value
  }
  return metodosPago.value.filter(
    (metodo) =>
      normalizeText(metodo.nombre).toLowerCase().includes(normalizedSearchTerm) ||
      normalizeText(metodo.metodopagosin.descripcion).toLowerCase().includes(normalizedSearchTerm),
  )
})
if (tipoFactura) {
  columns = [
    {
      name: 'index',
      label: i18nT('cotizacion.table.number'),
      align: 'right',
      field: (row) => metodosPago.value.indexOf(row) + 1,
    },
    { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), align: 'left', field: 'nombre' },
    {
      name: 'descripcionSIN',
      label: i18nT('ui.descripcion-sin-f34e43'),
      align: 'left',
      field: (row) => row.metodopagosin.descripcion,
    },
    { name: 'estado', label: i18nT('cotizacion.table.status'), align: 'center', field: 'estado' },
    { name: 'actions', label: i18nT('common.actions'), align: 'center', field: 'actions' },
  ]
} else {
  columns = [
    {
      name: 'index',
      label: i18nT('cotizacion.table.number'),
      align: 'right',
      field: (row) => metodosPago.value.indexOf(row) + 1,
    },
    { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), align: 'left', field: 'nombre' },

    { name: 'estado', label: i18nT('cotizacion.table.status'), align: 'center', field: 'estado' },
    { name: 'actions', label: i18nT('common.actions'), align: 'center', field: 'actions' },
  ]
}

// Watchers
watch(
  () => form.descripcionSIN,
  (newValue) => {
    if (newValue) {
      form.codigoSIN = newValue // The v-model on q-select emits the 'codigo' directly when using emit-value
    } else {
      form.codigoSIN = ''
    }
  },
)

// Functions
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
  } else {
    formTitle.value = 'Nuevo registro'
  }
}

const resetForm = () => {
  form.id = null
  form.nombre = ''
  form.descripcionSIN = null
  form.codigoSIN = ''
  form.verMPF = 'registrarMetodoPagoFactura'
  formTitle.value = 'Nuevo registro'
  formRef.value.resetValidation() // Reset form validation
}

const getLeyendaSINOptions = async () => {
  try {
    if (tipoFactura) {
      const contenidousuario = validarUsuario()
      const token = contenidousuario[0]?.factura?.access_token
      const tipo = contenidousuario[0]?.factura?.tipo
      const endpoint = `listaMetodopagoSIN/metodopago/${token}/${tipo}`
      console.log(endpoint)
      const response = await api.get(endpoint)
      const resultado = response.data
      console.log(resultado)
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        $q.notify({
          type: 'negative',
          message: i18nT('ui.error-al-cargar-opciones-sin-cef09c'),
        })
      } else {
        leyendaSINOptions.value = resultado.data
      }
    } else {
      leyendaSINOptions.value = []
    }
  } catch (error) {
    console.error('Error fetching SIN options:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-cargar-opciones-sin-5e6376'),
    })
  }
}

const fetchMetodosPago = async () => {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `listaMetodopagoFactura/${idempresa}/${token}/${tipo}`
    console.log(endpoint)
    const response = await api.get(endpoint)
    console.log(response.data)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: i18nT('ui.error-al-cargar-metodos-de-pago-b08957'),
      })
    } else {
      metodosPago.value = resultado
    }
  } catch (error) {
    console.error('Error fetching metodos de pago:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-cargar-metodos-de-pago-a76ef5'),
    })
  }
}

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa

  const formData = new FormData()
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  if (form.id) {
    formData.append('id', form.id)
  }
  formData.append('nombre', form.nombre)
  formData.append('ver', form.verMPF)
  formData.append('codigosin', form.descripcionSIN ? form.descripcionSIN.codigo : '')
  formData.append('idempresa', idempresa)

  try {
    const response = await api.post('', formData) // peticionPOST expects FormData
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje || i18nT('ui.operacion-exitosa-319748'),
      })
      fetchMetodosPago()
      resetForm()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || i18nT('ui.error-en-la-operacion-02096f'),
      })
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-guardar-c75295'),
    })
  }
}

const editMetodoPago = async (metodo) => {
  try {
    console.log(metodo)
    console.log(getToken(true))
    console.log(getTipoFactura())
    if (getToken(true) && getTipoFactura(true)) {
      const token = getToken()
      const tipo = getTipoFactura()
      const endpoint = `${URL_APICM}api/verificarExistenciaMetodopagoFactura/${metodo.id}/${token}/${tipo}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        if (!showForm.value) {
          showForm.value = true
        }
        formTitle.value = 'Editar registro'
        form.id = resultado.datos.id
        form.nombre = resultado.datos.nombre
        // Find the full object from options to set the q-select v-model
        form.descripcionSIN =
          leyendaSINOptions.value.find((opt) => opt.codigo === resultado.datos.metodopagosin.codigo)
            ?.codigo || null // Set the code directly for emit-value
        form.codigoSIN = resultado.datos.metodopagosin.codigo
        form.verMPF = 'editarMetodoPagoFactura'
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje || i18nT('ui.no-se-pudo-cargar-el-registro-para-editar-812308'),
        })
      }
    } else {
      if (!showForm.value) {
        showForm.value = true
      }
      formTitle.value = 'Editar registro'
      form.id = metodo.id
      form.nombre = metodo.nombre

      form.verMPF = 'editarMetodoPagoFactura'
    }
  } catch (error) {
    console.error('Error editing metodo pago:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-cargar-datos-para-edicion-6bc3e2'),
    })
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: i18nT('configGeneral.tipoAlmacen.messages.deleteTitle'),
    message: i18nT('ui.esta-seguro-de-que-desea-eliminar-este-registro-no-p-9dbfc6'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteMetodoPago(id)
  })
}

const deleteMetodoPago = async (id) => {
  try {
    const endpoint = `${URL_APICM}api/eliminarMetodopagoFactura/${id}`
    const resultado = await peticionGET(endpoint)
    if (resultado.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje || i18nT('ui.registro-eliminado-exitosamente-5e3672'),
      })
      fetchMetodosPago()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || i18nT('ui.error-al-eliminar-el-registro-e650cc'),
      })
    }
  } catch (error) {
    console.error('Error deleting metodo pago:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-eliminar-921f9d'),
    })
  }
}

const changeStatus = async (id, newStatus) => {
  try {
    const endpoint = `${URL_APICM}api/actualizarEstadoMetodopagoFactura/${id}/${newStatus}`
    const resultado = await peticionGET(endpoint)
    if (resultado.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje || i18nT('ui.estado-actualizado-exitosamente-5c6c96'),
      })
      fetchMetodosPago()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || i18nT('ui.error-al-actualizar-el-estado-1f08eb'),
      })
    }
  } catch (error) {
    console.error('Error changing status:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-cambiar-el-estado-a4f30c'),
    })
  }
}

// Lifecycle hook
onMounted(async () => {
  // Simulate receiving privileges from a parent component or store
  // For now, hardcode it as in your original file's `crearFormularioMPF`
  // In a real Vue app, you'd pass this as a prop or get from a store.
  const dummyPermissions = '1111' // Example, replace with actual logic
  privileges.value = [...dummyPermissions.toString()].map((digito) => parseInt(digito))

  await getLeyendaSINOptions()
  await fetchMetodosPago()
})
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: var(--cm-brand)
    color: #ffff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
