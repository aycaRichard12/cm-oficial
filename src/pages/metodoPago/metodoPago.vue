<template>
  <q-page class="q-pa-md" style="background-color: #eeebe2">
    <q-dialog v-model="showForm" persistent class="responsive-dialog">
      <q-card class="responsive-dialog">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Metodo Pago</div>
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
              <label for="nombre">Nombre del Método de Pago</label>
              <q-input
                v-model="form.nombre"
                id="nombre"
                outlined
                dense
                color="warning"
                :rules="[(val) => !!val || 'El nombre es requerido']"
              />
            </div>
            <div class="col-12 col-md-6" v-if="tipoFactura">
              <label for="descripcion">Descripción SIN</label>
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
                :rules="[(val) => !!val || 'Campo requerido']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No hay opciones</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <q-input
              v-if="false"
              v-model="form.codigoSIN"
              label="Código SIN (auto-relleno)"
              outlined
              dense
              disable
              class="q-mb-md"
            />

            <q-card-actions align="right">
              <q-btn
                v-if="showForm"
                type="submit"
                label="Guardar"
                color="positive"
                class="q-mt-md q-ml-sm"
              />
              <q-btn
                label="Cancelar"
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

    <q-btn
      :label="showForm ? 'Cancelar Registro' : 'Nuevo Registro'"
      color="primary"
      class="q-ma-lg"
      @click="toggleForm"
    />
    <q-card-section>
      <q-table
        class=""
        title="Metodos de Pagos"
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
            placeholder="Buscar..."
            dense
            outlined
            debounce="300"
            class="q-mb-md"
            style="background-color: white"
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
            <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
            <q-badge color="red" v-else label="Inactivo" outline />
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
    </q-card-section>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import { validarUsuario, normalizeText } from 'src/composables/FuncionesG.js'
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
      label: 'N°',
      align: 'right',
      field: (row) => metodosPago.value.indexOf(row) + 1,
    },
    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre' },
    {
      name: 'descripcionSIN',
      label: 'Descripción SIN',
      align: 'left',
      field: (row) => row.metodopagosin.descripcion,
    },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
    { name: 'actions', label: 'Acciones', align: 'center', field: 'actions' },
  ]
} else {
  columns = [
    {
      name: 'index',
      label: 'N°',
      align: 'right',
      field: (row) => metodosPago.value.indexOf(row) + 1,
    },
    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre' },

    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
    { name: 'actions', label: 'Acciones', align: 'center', field: 'actions' },
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
          message: 'Error al cargar opciones SIN.',
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
      message: 'Error de conexión al cargar opciones SIN.',
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
        message: 'Error al cargar métodos de pago.',
      })
    } else {
      metodosPago.value = resultado
    }
  } catch (error) {
    console.error('Error fetching metodos de pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al cargar métodos de pago.',
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
        message: data.mensaje || 'Operación exitosa.',
      })
      fetchMetodosPago()
      resetForm()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error en la operación.',
      })
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al guardar.',
    })
  }
}

const editMetodoPago = async (metodo) => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
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
        message: resultado.mensaje || 'No se pudo cargar el registro para editar.',
      })
    }
  } catch (error) {
    console.error('Error editing metodo pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al cargar datos para edición.',
    })
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este registro? No podrá recuperarlo.',
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
        message: resultado.mensaje || 'Registro eliminado exitosamente.',
      })
      fetchMetodosPago()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al eliminar el registro.',
      })
    }
  } catch (error) {
    console.error('Error deleting metodo pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al eliminar.',
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
        message: resultado.mensaje || 'Estado actualizado exitosamente.',
      })
      fetchMetodosPago()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al actualizar el estado.',
      })
    }
  } catch (error) {
    console.error('Error changing status:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al cambiar el estado.',
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
    background-color: #004d40
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
