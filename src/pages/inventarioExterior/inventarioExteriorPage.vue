<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-medium text-primary">Inventario Externo</div>
    </div>
    <div id="contenedor-formulario" class="col-md-12 text-start">
      <q-dialog v-model="formCollapse">
        <q-card class="responsive-dialog">
          <q-card-section class="bg-primary text-white text-h6 flex justify-between">
            <div class="text-h6">{{ tituloFormulario }}</div>
            <q-btn color="white" icon="close" @click="formCollapse = false" flat round dense />
          </q-card-section>
          <q-card-section>
            <q-form @submit="handleMainFormSubmit">
              <div class="row q-col-gutter-md">
                <div class="col-md-12" style="display: none">
                  <q-input type="hidden" name="ver" id="verINV" v-model="formData.ver" required />
                </div>

                <div class="col-md-12" style="display: none">
                  <q-input
                    type="hidden"
                    name="idusuario"
                    id="idusuarioINV"
                    v-model="formData.idusuario"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <label for="almacen">Almacén</label>
                  <q-select
                    v-model="formData.almacen"
                    :options="almacenOptions"
                    id="almacen"
                    dense
                    outlined
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Debe seleccionar un almacen']"
                  />
                </div>

                <ClienteSucursal
                  class="col-12 col-md-8"
                  v-model:client="formData.cliente"
                  v-model:branch="formData.sucursal"
                />

                <div class="col-12 col-md-2">
                  <label for="fechaINV">Fecha*</label>
                  <q-input
                    dense
                    outlined
                    type="date"
                    name="fecha"
                    id="fechaINV"
                    v-model="formData.fecha"
                    label="Fecha*"
                    required
                  />
                </div>

                <div class="col-12 col-md-4">
                  <label for="observacionINV">Observación</label>
                  <q-input
                    type="text"
                    name="observacion"
                    id="observacionINV"
                    v-model="formData.observacion"
                    dense
                    required
                    outlined
                  />
                </div>
                <div class="col-12 col-md-3">
                  <label for="ubicacion">Latitud</label>
                  <q-input
                    name="ubicacion"
                    id="ubicacion"
                    v-model="formData.latitud"
                    dense
                    outlined
                    readonly
                  />
                </div>
                <div class="col-12 col-md-3">
                  <label for="ubicacion2">Longitud</label>
                  <q-input
                    name="ubicacion2"
                    id="ubicacion2"
                    v-model="formData.longitud"
                    dense
                    outlined
                    readonly
                  />
                </div>
                <div class="col-md-12 flex justify-end">
                  <q-btn label="Registrar" type="submit" color="primary" />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <div class="row flex justify-between">
      <div>
        <q-btn color="primary" @click="toggleFormCollapse" class="btn-res q-mt-lg">
          <q-icon name="save" class="icono" />
          <span class="texto">{{ formCollapse ? 'Cancelar Registro' : 'Nuevo Registro' }}</span>
        </q-btn>
      </div>

      <div class="col-12 col-md-4">
        <label for="almacen">Seleccione un Almacén</label>
        <q-select
          v-model="filtroAlmacen"
          :options="almacenOptions"
          id="almacen"
          emit-value
          outlined
          map-options
          clearable
          name="filtroALmacen"
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <label for="buscar">Buscar...</label>
        <q-input dense debounce="300" v-model="searchQuery" placeholder="Buscar..."></q-input>
      </div>
    </div>

    <q-table
      title="Inventario Externo"
      :rows="filteredInventario"
      :columns="columns"
      row-key="id"
      bordered
      flat
      class="q-mt-sm"
      table-class="table-striped"
      table-header-class="thead-dark"
      :filter="searchQuery"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-Autorización="props">
        <q-td :props="props" class="text-center">
          <q-btn
            :color="Number(props.row.Autorización) === 1 ? 'positive' : 'negative'"
            @click="toggleAutorizacion(props.row)"
            :icon="Number(props.row.Autorización) === 1 ? 'thumb_up_alt' : 'thumb_down_alt'"
            size="sm"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-Detalle="props">
        <q-td :props="props" class="text-center">
          <q-btn color="primary" label="Productos" @click="showDetail(props.row)" size="sm" />
        </q-td>
      </template>

      <template v-slot:body-cell-Opciones="props">
        <q-td
          :props="props"
          class="text-nowrap text-center"
          v-if="
            (editar && props.row.Autorización !== 1) || (eliminar && props.row.Autorización !== 1)
          "
        >
          <q-btn
            color="primary"
            icon="edit"
            @click="editItem(props.row)"
            class="q-mr-sm"
            size="sm"
            v-if="editar && props.row.Autorización !== 1"
          />

          <q-btn
            color="negative"
            icon="delete"
            @click="deleteItem(props.row)"
            size="sm"
            v-if="eliminar && props.row.Autorización !== 1"
          />
        </q-td>
        <q-td :props="props" class="text-nowrap text-center" v-else>
          <q-btn color="info" icon="edit" class="q-mr-sm" size="sm" disable v-if="editar" />
          <q-btn color="info" icon="delete" size="sm" disable v-if="eliminar === 1" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showDetalle">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Detalle de Inventario Externo</div>
          <q-btn icon="close" @click="hideDetail" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form @submit="handleDetailFormSubmit">
            <div class="row q-col-gutter-x-md">
              <div class="col-md-12" style="display: none">
                <q-input
                  type="hidden"
                  name="ver"
                  id="verDINV"
                  v-model="detalleFormData.ver"
                  required
                />
              </div>
              <div class="col-md-12" style="display: none">
                <q-input
                  type="hidden"
                  name="idinventarioexterno"
                  id="idinvexternoDINV"
                  v-model="detalleFormData.idinventarioexterno"
                  required
                />
              </div>
              <div class="col-md-12" style="display: none">
                <q-input
                  type="hidden"
                  name="idproductoalmacen"
                  id="idproductoalmacenDINV"
                  v-model="detalleFormData.idproductoalmacen"
                  required
                />
              </div>
              <div class="col-md-12" style="display: none">
                <q-input type="hidden" name="id" id="idDINV" v-model="detalleFormData.id" />
              </div>

              <div class="col-12 col-md-6">
                <label for="producto">Producto*</label>
                <q-select
                  v-model="detalleFormData.productos"
                  id="producto"
                  outlined
                  dense
                  use-input
                  map-options
                  option-label="label"
                  option-value="value"
                  :options="filteredProductosOptions"
                  @filter="filterProductos"
                  @update:model-value="selectProductOption"
                  :loading="loadingProductos"
                  debounce="300"
                  clearable
                  hint="Escriba para buscar productos"
                  :error="errorProducto"
                  error-message="Debe seleccionar un producto"
                  prepend-inner-icon="shopping_cart"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay resultados para su búsqueda
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-3">
                <label for="cantidad">Cantidad</label>
                <q-input
                  type="number"
                  id="cantidad"
                  dense
                  outlined
                  v-model="detalleFormData.cantidad"
                  required
                  :disable="detalleFormData.estado === 1"
                />
              </div>

              <div class="col-12 col-md-3">
                <label for="fecha">Fecha</label>
                <q-input
                  dense
                  outlined
                  type="date"
                  name="fecha"
                  v-model="detalleFormData.fecha"
                  id="fecha"
                  required
                  :disable="detalleFormData.estado === 1"
                />
              </div>
            </div>
            <div class="row justify-end" v-if="detalleFormData.estado !== 1">
              <q-btn
                label="Cancelar"
                type="reset"
                color="negative"
                @click="resetearDetalleFormulario"
              />
              <q-btn label="Añadir" type="submit" color="primary" />
            </div>
          </q-form>

          <div class="q-table__container q-mt-md" style="max-height: 500px; overflow-y: auto">
            <q-table
              :rows="detalleInventario"
              :columns="detalleColumns"
              row-key="N°"
              bordered
              flat
              class="q-mt-sm"
              table-class="table-striped"
              table-header-class="thead-dark"
            >
              <template v-slot:body-cell-Opciones="props">
                <q-td
                  :props="props"
                  class="text-nowrap text-center"
                  v-if="detalleFormData.estado !== 1"
                >
                  <q-btn
                    v-if="editar"
                    color="primary"
                    icon="edit"
                    @click="actualizarDetalleINV(props.row.id)"
                    class="q-mr-sm"
                    size="sm"
                  />
                  <q-btn
                    v-if="eliminar"
                    color="negative"
                    icon="delete"
                    @click="elminarDetalleMovimiento(props.row.id)"
                    size="sm"
                  />
                </q-td>
                <q-td :props="props" class="text-nowrap text-center" v-else>
                  <q-btn color="info" icon="edit" class="q-mr-sm" size="sm" disable />
                  <q-btn color="info" icon="delete" size="sm" disable />
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div class="row" v-show="showDetalle">
      <div></div>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  obtenerFechaActualDato,
  validarUsuario,
  normalizeText,
  obtenerUbicacion,
  msgNegative,
} from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import ClienteSucursal from 'src/components/ClienteSucursal.vue'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useMenuStore } from 'src/stores/permitidos'

const menuStore = useMenuStore()
const route = useRoute()
const idusuario = idusuario_md5()
const [lectura, escritura, editar, eliminar] = menuStore.permisoPagina(
  route.path.replace(/^\//, '') + `-${idusuario}`,
)

console.log(lectura, escritura, editar, eliminar)

const $q = useQuasar()

// Reactive State

const formCollapse = ref(false)
const showDetalle = ref(false)
const tituloFormulario = ref('Nuevo registro')

const almacenOptions = ref([])
const clientesOptions = ref([])
const filteredClientesOptions = ref([]) // For Q-Select filter
const sucursalOptions = ref([])
const filteredSucursalOptions = ref([]) // For Q-Select filter
const productosOptions = ref([])
const filteredProductosOptions = ref([]) // For Q-Select filter

const filtroAlmacen = ref('')
const searchQuery = ref('')

// Data para el formulario principal
const formData = ref({
  ver: '',
  id: '',
  idusuario: idusuario, // Hardcoded as per original JS
  idcliente: '',
  idsucursal: '', // Changed from 'sucursal' to 'idsucursal' for clarity with hidden input
  almacen: '',
  clientes: '', // Display label for q-select
  sucursali: '', // Display label for q-select
  fecha: '',
  imagen: null,
  observacion: '',
})

// Data para la tabla principal
const inventarioData = ref([])

// Columnas para la tabla principal
const columns = [
  { name: 'indice', label: 'N°', field: 'indice', align: 'right', sortable: true },
  { name: 'Fecha', label: 'Fecha', field: 'Fecha', align: 'right', sortable: true },
  { name: 'Almacén', label: 'Almacén', field: 'Almacén', align: 'left', sortable: true },
  { name: 'Cliente', label: 'Cliente', field: 'Cliente', align: 'left', sortable: true },
  { name: 'Sucursal', label: 'Sucursal', field: 'Sucursal', align: 'left', sortable: true },
  {
    name: 'Observación',
    label: 'Observación',
    field: 'Observación',
    align: 'left',
    sortable: true,
  },
  { name: 'Imagen', label: 'Imagen', field: 'Imagen', align: 'center' },
  { name: 'Autorización', label: 'Autorización', field: 'Autorización', align: 'center' },
  { name: 'Detalle', label: 'Detalle', field: 'Detalle', align: 'center' },
  { name: 'Opciones', label: 'Opciones', field: 'Opciones', align: 'center' },
]

// Data para el formulario de detalle
const detalleFormData = ref({
  ver: 'registrarDetalleInvexterno',
  id: '', // For editing existing detail entries
  idinventarioexterno: '',
  idproductoalmacen: '',
  productos: '', // Display label for q-select
  cantidad: '',
  fecha: '',
  estado: 0, // To control disable states based on main inventory authorization
})

// Datos de la tabla de detalle
const detalleInventario = ref([])

// Columnas para la tabla de detalle
const detalleColumns = [
  { name: 'indice', label: 'N°', field: 'indice', align: 'right', sortable: true },
  { name: 'Código', label: 'Código', field: 'Código', align: 'left', sortable: true },
  {
    name: 'Descripción',
    label: 'Descripción',
    field: 'Descripción',
    align: 'left',
    sortable: true,
  },
  { name: 'Cantidad', label: 'Cantidad', field: 'Cantidad', align: 'right', sortable: true },
  {
    name: 'Fecha Ingreso',
    label: 'Fecha Ingreso',
    field: 'Fecha Ingreso',
    align: 'left',
    sortable: true,
  },
  { name: 'Opciones', label: 'Opciones', field: 'Opciones', align: 'center' },
]

// Computed property for main table filtering/searching
const filteredInventario = computed(() => {
  let tempInventario = inventarioData.value

  if (filtroAlmacen.value) {
    tempInventario = tempInventario.filter((item) => String(item.almacenId) === filtroAlmacen.value)
  }

  if (searchQuery.value) {
    const lowerCaseQuery = normalizeText(searchQuery.value).toLowerCase()
    tempInventario = tempInventario.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(lowerCaseQuery)),
    )
  }
  return tempInventario
})

// --- Functions from inventarioExterno copy.js adapted to Vue 3 ---

// Initial setup on component mount
onMounted(async () => {
  // Set current date for forms
  const today = obtenerFechaActualDato() // Assuming obtenerFechaActual provides 'YYYY-MM-DD'
  formData.value.fecha = today
  detalleFormData.value.fecha = today

  localStorage.removeItem('detalleInventario')

  // Fetch initial data

  await listaAlmacenes()
  await listaCliente()
  await listarDatos()
})

// Watchers
watch(filtroAlmacen, () => {
  listarDatos() // Re-fetch/filter data when filter changes
})

watch(formCollapse, (newVal) => {
  if (!newVal) {
    // If form is closing
    resetearFormulario()
  }
})

watch(
  () => formData.value.idcliente,
  async (newIdCliente) => {
    if (newIdCliente) {
      await selectSucursal(newIdCliente)
    } else {
      sucursalOptions.value = []
      formData.value.sucursali = ''
      formData.value.idsucursal = ''
    }
  },
)

// --- Form Submission Handlers ---
async function displayLocation() {
  try {
    const location = await obtenerUbicacion()
    console.log('Ubicación obtenida:', location)
    console.log('Latitud:', location.lat)
    console.log('Longitud:', location.lng)
    return [location.lat, location.lng]
    // You can now use these coordinates, e.g., to display on a map
  } catch (error) {
    console.error('Error al obtener la ubicación:', error)
    $q.notify({
      message: error,
      color: 'red',
      icon: 'close',
      position: 'top',
    })
    return false
    // Handle the error in your UI, e.g., show a message to the user
  }
}

async function handleMainFormSubmit() {
  if (!escritura) {
    msgNegative($q)
    return
  }
  $q.loading.show()
  try {
    const formDatos = new FormData()
    formDatos.append('idusuario', formData.value.idusuario)
    formDatos.append('ver', formData.value.ver)
    formDatos.append('idcliente', formData.value.cliente.value)
    formDatos.append('observacion', formData.value.observacion)
    formDatos.append('almacen', formData.value.almacen)
    formDatos.append('fecha', formData.value.fecha)
    formDatos.append('sucursal', formData.value.sucursal.value)
    formDatos.append('latitud', formData.value.latitud)
    formDatos.append('longitud', formData.value.longitud)
    for (let [k, v] of formDatos.entries()) {
      console.log(`${k}:${v}`)
    }
    console.log(formData.value.id)
    if (formData.value.id != null) {
      formDatos.append('id', formData.value.id)
    }
    const response = await api.post('', formDatos) // Assuming endpoint
    console.log(response)
    const data = response.data

    if (data.estado === 'exito') {
      $q.notify({
        message: 'Registro exitoso!',
        color: 'positive',
        icon: 'check_circle',
      })
      filtroAlmacen.value = String(data.almacen) // Update filter
      await listarDatos()
      resetearFormulario()
      formCollapse.value = false // Close form after successful submission
      tituloFormulario.value = 'Nuevo registro' // Reset title
    } else {
      $q.notify({
        message: data.mensaje || 'Error al registrar.',
        color: 'negative',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Error submitting main form:', error)
    $q.notify({
      message: 'Error de conexión o del servidor.',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    $q.loading.hide()
  }
}

async function handleDetailFormSubmit() {
  $q.loading.show()
  try {
    const dataToSend = new FormData()
    for (const key in detalleFormData.value) {
      dataToSend.append(key, detalleFormData.value[key])
    }

    const response = await api.post('', dataToSend) // Assuming endpoint
    console.log(response)
    const data = response.data

    if (data.estado === 'exito') {
      $q.notify({
        message: 'Producto añadido al detalle!',
        color: 'positive',
        icon: 'check_circle',
      })
      await listaProductosDisponibles() // Refresh available products
      await listaDetalleMovimiento() // Refresh detail table
      resetearDetalleFormulario()
    } else {
      $q.notify({
        message: data.mensaje || 'Error al añadir producto.',
        color: 'negative',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Error submitting detail form:', error)
    $q.notify({
      message: 'Error de conexión o del servidor.',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    $q.loading.hide()
  }
}

// --- Data Loading Functions ---

async function listaAlmacenes() {
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa
  const idusuario = contenidousuario[0]?.idusuario

  if (!idempresa) {
    console.error('ID de empresa no disponible.')
    return
  }

  const endpoint = `listaResponsableAlmacen/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      almacenOptions.value = [{ label: 'Error al cargar almacenes', value: '' }]
    } else {
      let filteredAlmacenes = resultado
      if (idusuario) {
        filteredAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
      }
      almacenOptions.value = [
        { label: 'Seleccione un Almacén', value: '' },
        ...filteredAlmacenes.map((key) => ({ label: key.almacen, value: String(key.idalmacen) })),
      ]
    }
  } catch (error) {
    console.error('Error al obtener lista de almacenes:', error)
    almacenOptions.value = [{ label: 'Error de red', value: '' }]
  }
}

async function listaCliente() {
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa

  if (!idempresa) {
    console.error('ID de empresa no disponible para lista de clientes.')
    return
  }

  const endpoint = `listaCliente/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      clientesOptions.value = []
    } else {
      clientesOptions.value = resultado.map((option) => ({
        label: `${option.codigo} - ${option.nombre} - ${option.nit}`,
        value: option.id,
        originalData: option,
      }))
      filteredClientesOptions.value = clientesOptions.value // Initialize filtered options
    }
  } catch (error) {
    console.error('Error al obtener lista de clientes:', error)
    clientesOptions.value = []
  }
}

async function selectSucursal(idcliente) {
  console.log(idcliente)
  if (!idcliente) {
    sucursalOptions.value = []
    filteredSucursalOptions.value = []
    return
  }
  const endpoint = `listaSucursal/${idcliente}`
  try {
    const response = await api.get(endpoint)
    console.log(response)
    const data = response.data
    if (data && data.length > 0) {
      sucursalOptions.value = data.map((option) => ({
        label: option.nombre,
        value: option.id,
        clientId: idcliente,
      }))
      //Set default selected sucursal to the first one
      const sucursalSeleccionado = sucursalOptions.value.find(
        (c) => Number(c.clientId) === Number(idcliente),
      )
      formData.value.sucursal = sucursalSeleccionado
    } else {
      sucursalOptions.value = []

      $q.notify({
        message: 'No existen sucursales registradas para el cliente seleccionado.',
        color: 'info',
      })
    }
    filteredSucursalOptions.value = sucursalOptions.value // Initialize filtered options
  } catch (error) {
    console.error('Error al obtener sucursales:', error)
    sucursalOptions.value = []
  }
}

async function listarDatos() {
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa

  if (!idempresa) {
    console.error('ID de empresa no disponible para listar inventario.')
    return
  }

  const endpoint = `listainventarioexterno/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      inventarioData.value = []
    } else {
      let filteredResult = []
      console.log(filtroAlmacen.value)
      if (filtroAlmacen.value) {
        filteredResult = resultado.filter((item) => {
          return Number(item.idalmacen) === Number(filtroAlmacen.value)
        })
      }
      console.log(filteredResult)
      inventarioData.value = filteredResult.map((key, index) => ({
        indice: index + 1,
        Fecha: key.fecha,
        Almacén: key.almacen,
        Cliente: key.nombre,
        Sucursal: key.sucursal,
        Observación: key.observaciones,
        Imagen: key.foto,
        Autorización: key.estado, // 0 or 1
        id: key.id,
        almacenId: key.idalmacen,
        clienteId: key.idcliente,
        idsucursal: key.idsucursal, // Keep original ids for operations
      }))
    }
  } catch (error) {
    console.error('Error al obtener datos de inventario:', error)
    inventarioData.value = []
  }
}

async function listaProductosDisponibles() {
  const datosMov = JSON.parse(localStorage.getItem('detalleInventario'))
  if (!datosMov || !datosMov.almacen || !datosMov.idregistro) {
    console.error('Datos de movimiento no disponibles para listar productos.')
    productosOptions.value = []
    filteredProductosOptions.value = []
    return
  }

  const endpoint = `listaProductosInvExterno/${datosMov.almacen}/${datosMov.idregistro}`
  try {
    const response = await api.get(endpoint)
    console.log(response)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      productosOptions.value = []
    } else {
      productosOptions.value = resultado.map((option) => ({
        label: `${option.codigo} - ${option.descripcion}`,
        value: String(option.idproductoalmacen),
        idproductoalmacen: option.idproductoalmacen, // Store original id
      }))
      filteredProductosOptions.value = productosOptions.value // Initialize filtered options
    }
  } catch (error) {
    console.error('Error al obtener productos disponibles:', error)
    productosOptions.value = []
  }
}

async function listaDetalleMovimiento() {
  const datosMov = JSON.parse(localStorage.getItem('detalleInventario'))
  if (!datosMov || !datosMov.idregistro) {
    console.error('ID de registro de inventario no disponible para detalle.')
    detalleInventario.value = []
    return
  }

  const endpoint = `listadetalleInvExterno/${datosMov.idregistro}`
  try {
    const response = await api.get(endpoint)
    console.log(response)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      detalleInventario.value = []
    } else {
      detalleInventario.value = resultado.map((key, index) => ({
        indice: index + 1,
        Código: key.codigo,
        Descripción: key.descripcion,
        Cantidad: key.cantidad,
        'Fecha Ingreso': key.fechavencimiento,
        id: key.id, // ID of the detail entry for update/delete
        idproductoalmacen: key.idproductoalmacen,
        cantidad: key.cantidad,
        fecha: key.fecha, // Original date for editing
      }))
    }
  } catch (error) {
    console.error('Error al obtener detalle de movimiento:', error)
    detalleInventario.value = []
  }
}

// --- Q-Select Filter Functions ---

function filterProductos(val, update) {
  if (val === '') {
    update(() => {
      filteredProductosOptions.value = productosOptions.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredProductosOptions.value = productosOptions.value.filter(
      (v) => normalizeText(v.label).toLowerCase().indexOf(needle) > -1,
    )
  })
}

// --- Selection Handlers for Q-Select --- post

const selectProductOption = (selectedOption) => {
  if (selectedOption) {
    detalleFormData.value.productos = selectedOption.label
    detalleFormData.value.idproductoalmacen = selectedOption.value
  } else {
    detalleFormData.value.productos = ''
    detalleFormData.value.idproductoalmacen = ''
  }
}

// --- Table Action Functions (from JS original) ---

const toggleFormCollapse = async () => {
  const position = await displayLocation()
  console.log(position)
  if (position) {
    formCollapse.value = !formCollapse.value
    if (formCollapse.value) {
      // If opening, set to new record mode
      resetearFormulario(position[0], position[1])
    }
  }
}

const toggleAutorizacion = async (row) => {
  const newEstado = Number(row.Autorización) === 2 ? 1 : 2
  const endpoint = `cambiarEstadoinvexterno/${row.id}/${newEstado}`
  try {
    const response = await api.get(endpoint)
    console.log(response)
    const resultado = response.data
    if (resultado.estado === 'error') {
      console.error(resultado.mensaje)
      $q.notify({
        message: resultado.mensaje || 'Error al cambiar estado.',
        color: 'negative',
      })
    } else {
      $q.notify({
        message:
          resultado.mensaje ||
          `Autorización de ${row.Cliente} cambiada a ${newEstado === 1 ? 'Autorizado' : 'No Autorizado'}`,
        color: 'positive',
      })
      await listarDatos() // Refresh table
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    $q.notify({
      message: 'Error de conexión o del servidor al cambiar estado.',
      color: 'negative',
    })
  }
}

const showDetail = async (row) => {
  showDetalle.value = true
  detalleFormData.value.idinventarioexterno = String(row.id)
  detalleFormData.value.estado = row.Autorización // Set state for detail form/table controls

  const detalleINV = {
    idregistro: row.id,
    almacen: row.almacenId,
    estado: row.Autorización,
  }
  localStorage.setItem('detalleInventario', JSON.stringify(detalleINV))

  await listaProductosDisponibles()
  await listaDetalleMovimiento()
  resetearDetalleFormulario() // Reset detail form after showing it
}

const hideDetail = () => {
  showDetalle.value = false
  detalleInventario.value = []
  localStorage.removeItem('detalleInventario')
}

const editItem = async (row) => {
  const endpoint = `verificarExistenciainvexterno/${row.id}`
  console.log(row)
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    console.log(resultado)
    if (resultado.estado === 'exito') {
      formData.value.ver = 'editarInventarioExterno'
      formData.value.id = String(resultado.datos.id)
      formData.value.fecha = resultado.datos.fecha
      formData.value.almacen = String(resultado.datos.idalmacen)
      console.log(clientesOptions.value)
      const clienteSeleccionado = clientesOptions.value.find((c) => {
        return Number(c.value) == Number(resultado.datos.idcliente)
      })
      console.log(clienteSeleccionado)
      formData.value.cliente = clienteSeleccionado
      formData.value.observacion = resultado.datos.observacion

      // Populate sucursal after idcliente is set and sucursales are loaded
      await selectSucursal(resultado.datos.idcliente)

      tituloFormulario.value = 'Editar registro'
      formCollapse.value = true // Open the form for editing
    } else {
      $q.notify({
        message: resultado.mensaje || 'Error al cargar datos para edición.',
        color: 'negative',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos para edición:', error)
    $q.notify({
      message: 'Error de conexión o del servidor al editar.',
      color: 'negative',
    })
  }
}

const deleteItem = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que quieres eliminar el registro de ${row.Cliente} del ${row.Fecha}? No podrá recuperar este registro.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarinvexterno/${row.id}`)
      const data = response.data
      if (data.estado === 'exito') {
        $q.notify({
          message: data.mensaje || 'Registro eliminado correctamente.',
          color: 'positive',
        })
        await listarDatos() // Refresh table
      } else {
        $q.notify({
          message: data.mensaje || 'Error al eliminar registro.',
          color: 'negative',
        })
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({
        message: 'Error de conexión o del servidor al eliminar.',
        color: 'negative',
      })
    }
  })
}

const elminarDetalleMovimiento = (id) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que quieres eliminar este producto del detalle?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminardetalleinvexterno/${id}`)
      const resultado = response.data
      if (resultado.estado === 'error') {
        console.error(resultado.mensaje)
        $q.notify({
          message: resultado.mensaje || 'Error al eliminar detalle.',
          color: 'negative',
        })
      } else {
        $q.notify({
          message: resultado.mensaje || 'Producto de detalle eliminado correctamente.',
          color: 'positive',
        })
        await listaProductosDisponibles()
        await listaDetalleMovimiento()
      }
    } catch (error) {
      console.error('Error al eliminar detalle de movimiento:', error)
      $q.notify({
        message: 'Error de conexión o del servidor al eliminar detalle.',
        color: 'negative',
      })
    }
  })
}

const actualizarDetalleINV = async (id) => {
  try {
    const response = await api.get(`verificarExistenciaDetalleInv/${id}`)
    const resultado = response.data
    if (resultado.estado === 'exito') {
      detalleFormData.value.ver = 'editarDetalleInvexterno'
      detalleFormData.value.id = String(resultado.datos.id)
      detalleFormData.value.idproductoalmacen = String(resultado.datos.idproductoalmacen)
      detalleFormData.value.productos = `${resultado.datos.codigo} - ${resultado.datos.descripcion}`
      detalleFormData.value.cantidad = resultado.datos.cantidad
      detalleFormData.value.fecha = resultado.datos.fecha
    } else {
      $q.notify({
        message: resultado.mensaje || 'Error al cargar datos del detalle para edición.',
        color: 'negative',
      })
    }
  } catch (error) {
    console.error('Error al actualizar detalle INV:', error)
    $q.notify({
      message: 'Error de conexión o del servidor al actualizar detalle.',
      color: 'negative',
    })
  }
}

// --- Form Reset Functions ---

const resetearFormulario = (latitud, longitud) => {
  // Only change ver if privileges allow registering (assuming privileges[1] is for register)

  if (escritura) {
    formData.value.ver = 'registrarInventarioExterno'
  }
  formData.value.id = ''
  formData.value.idcliente = ''
  formData.value.idsucursal = ''
  formData.value.almacen = ''
  formData.value.clientes = ''
  formData.value.sucursali = ''
  formData.value.imagen = null
  formData.value.observacion = ''
  formData.value.fecha = obtenerFechaActualDato()
  formData.value.latitud = latitud
  formData.value.longitud = longitud
  tituloFormulario.value = 'Nuevo registro'
}

const resetearDetalleFormulario = () => {
  detalleFormData.value.ver = 'registrarDetalleInvexterno'
  detalleFormData.value.id = ''
  detalleFormData.value.idproductoalmacen = ''
  detalleFormData.value.productos = ''
  detalleFormData.value.cantidad = ''
  detalleFormData.value.fecha = obtenerFechaActualDato()
}
</script>

<style scoped>
/* Estilos específicos si son necesarios, aunque Quasar maneja la mayoría */
.q-table__container {
  overflow: auto;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.thead-dark th {
  background-color: #343a40;
  color: white;
}

/* For highlighting rows, as per original JS */
.resaltar-fila {
  background-color: #cce5ff !important; /* Light blue for highlighting */
  transition: background-color 0.5s ease-in-out;
}
</style>
