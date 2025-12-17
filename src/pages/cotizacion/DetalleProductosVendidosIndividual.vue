<template>
  <q-page class="q-pa-md">
    <q-form @submit="generarReporte">
      <div class="row justify-center q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="fechaini">Fecha Inicial *</label>
          <q-input
            v-model="fechai"
            id="fechaini"
            type="date"
            outlined
            dense
            class="col-md-4"
            @change="validarFechas"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="fechafin">Fecha Final*</label>
          <q-input
            v-model="fechaf"
            id="fechafin"
            type="date"
            outlined
            dense
            class="col-md-4"
            @change="validarFechas"
          />
        </div>
      </div>
      <div class="row justify-center q-ma-md">
        <q-btn
          label="Generar Reporte"
          type="submit"
          color="primary"
          class="q-mr-sm"
          :disable="!fechai || !fechaf"
        />
        <q-btn
          label="Exportar a Excel"
          color="positive"
          @click="exportarTablaAExcel"
          :disable="!datosFiltrados || datosFiltrados.length === 0"
        />
      </div>
    </q-form>

    <q-form>
      <div class="row justify-center q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Filtrar por almacén</label>
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            label=""
            emit-value
            map-options
            option-value="idalmacen"
            option-label="almacen"
            outlined
            dense
            clearable
            :disable="!datosOriginales || datosOriginales.length === 0"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="razonsocial">Filtrar por razón social</label>
          <q-input
            v-model="clienteSearchTerm"
            id="razonsocial"
            outlined
            dense
            autocomplete="off"
            @focus="showClienteDropdown = true"
            @blur="hideClienteDropdownDelayed"
            clearable
          >
            <template v-slot:append>
              <q-icon name="arrow_drop_down" />
            </template>
          </q-input>
          <q-card
            v-if="showClienteDropdown && filteredClientes.length > 0"
            class="q-mt-xs absolute-cliente-dropdown"
          >
            <q-list bordered separator>
              <q-item
                v-for="clienteOption in filteredClientes"
                :key="clienteOption.id"
                clickable
                v-ripple
                @click="seleccionarCliente(clienteOption)"
              >
                <q-item-section>
                  {{ clienteOption.codigo }} - {{ clienteOption.nombre }} -
                  {{ clienteOption.nombrecomercial }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <label for="sucursal">Filtrar por sucursal</label>
          <q-input
            v-model="sucursalSearchTerm"
            id="sucursal"
            outlined
            dense
            autocomplete="off"
            @focus="showSucursalDropdown = true"
            @blur="hideSucursalDropdownDelayed"
            :disable="!clienteSeleccionadoId"
            clearable
          >
            <template v-slot:append>
              <q-icon name="arrow_drop_down" />
            </template>
          </q-input>
          <q-card
            v-if="showSucursalDropdown && filteredSucursales.length > 0"
            class="q-mt-xs absolute-sucursal-dropdown"
          >
            <q-list bordered separator>
              <q-item
                v-for="sucursalOption in filteredSucursales"
                :key="sucursalOption.id"
                clickable
                v-ripple
                @click="seleccionarSucursal(sucursalOption)"
              >
                <q-item-section>
                  {{ sucursalOption.nombre }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </q-form>

    <q-table
      :rows="datosFiltrados"
      :columns="columns"
      row-key="index"
      class="q-mt-lg"
      flat
      bordered
      title="Reporte de Productos Vendidos"
      no-data-label="No hay datos para mostrar. Genere un reporte."
    >
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="8" class="text-right text-bold">Sumatorias</q-td>
          <q-td class="text-right text-bold">{{ funGeneral.decimas(cantidadTotal) }}</q-td>
          <q-td class="text-right text-bold">{{ funGeneral.decimas(importeTotal) }}</q-td>
          <q-td class="text-right text-bold">{{ funGeneral.decimas(descuentoTotal) }}</q-td>
          <q-td class="text-right text-bold">{{ funGeneral.decimas(ventaTotal) }}</q-td>
          <q-td colspan="13"></q-td>
        </q-tr>
      </template>
    </q-table>

    <q-loading :showing="loading" />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'
import * as funGeneral from 'src/composables/FuncionesG'
import { URL_APICM } from 'src/composables/services'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
import * as XLSX from 'xlsx'
// Importar XLSX si no está globalmente disponible
// import * as XLSX from 'xlsx';

// Quasar
const $q = useQuasar()

// Reactive state
const fechai = ref(primerDiaDelMes().toISOString().slice(0, 10))
const fechaf = ref(funGeneral.obtenerFechaActualDato())
const datosOriginales = ref([])
const datosFiltrados = ref([])
const almacenesOptions = ref([])
const almacenSeleccionado = ref(null) // Usar null para indicar que no hay selección o "Todos"
const clientesOptions = ref([])
const clienteSearchTerm = ref('')
const clienteSeleccionadoId = ref(null)
const sucursalesClienteOptions = ref([])
const sucursalSearchTerm = ref('')
const sucursalSeleccionadaId = ref(null)
const showClienteDropdown = ref(false)
const showSucursalDropdown = ref(false)
const loading = ref(false)

const formularioExcel = reactive([])

const tipoVentaMap = {
  0: 'Comprobante Venta',
  1: 'Factura Compra-Venta',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débido',
}

// User info
const usuarioInfo = computed(() => {
  const user = funGeneral.validarUsuario()
  return user && user.length > 0 ? user[0] : {}
})

// Table columns for q-table
const columns = [
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right',
    field: (row) => funGeneral.cambiarFormatoFecha(row.fecha),
  },
  { name: 'nrofactura', label: 'Nro. Doc.', align: 'right', field: 'nrofactura' },
  {
    name: 'tipoventa',
    label: 'Tipo de Venta',
    align: 'left',
    field: (row) => tipoVentaMap[row.tipoventa] || row.tipoventa,
  },
  { name: 'codigo', label: 'Código Producto', align: 'left', field: 'codigo' },
  { name: 'codigobarra', label: 'Código Barras', align: 'right', field: 'codigobarra' },
  { name: 'descripcion', label: 'Descripción de Producto', align: 'left', field: 'descripcion' },
  {
    name: 'preciounitario',
    label: 'Precio Unitario',
    align: 'right',
    field: (row) => funGeneral.decimas(row.preciounitario),
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'right',
    field: (row) => funGeneral.decimas(row.cantidad),
  },
  {
    name: 'importe',
    label: 'Importe',
    align: 'right',
    field: (row) => funGeneral.decimas(row.importe),
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: (row) => funGeneral.decimas(row.descuento),
  },
  {
    name: 'totalventa',
    label: 'Venta Total',
    align: 'right',
    field: (row) => funGeneral.decimas(row.totalventa),
  },
  { name: 'tipopago', label: 'Tipo Pago', align: 'left', field: 'tipopago' },
  { name: 'idusuario', label: 'Nombre de Usuario', align: 'left', field: 'idusuario' },
  { name: 'sucursalc', label: 'Sucursal del Cliente', align: 'left', field: 'sucursalc' },
  { name: 'almacen', label: 'Almacén Empresa', align: 'left', field: 'almacen' },
  { name: 'cliente', label: 'Razón Social Empresa', align: 'left', field: 'cliente' },
  { name: 'tipodocumento', label: 'Tipo Documento', align: 'left', field: 'tipodocumento' },
  { name: 'nrodoc', label: 'Nro. Doc. Tributario', align: 'right', field: 'nrodoc' },
  { name: 'nombrecomercial', label: 'Nombre Comercial', align: 'left', field: 'nombrecomercial' },
  { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad' },
  { name: 'categoria', label: 'Categoría', align: 'left', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub Categoría', align: 'left', field: 'subcategoria' },
  { name: 'canal', label: 'Canal', align: 'left', field: 'canal' },
  { name: 'tipoprecio', label: 'Tipo de Precio', align: 'left', field: 'tipoprecio' },
]

// Computed properties for totals
const cantidadTotal = computed(() => {
  return datosFiltrados.value.reduce(
    (sum, dato) => sum + funGeneral.redondear(parseFloat(dato.cantidad)),
    0,
  )
})

const importeTotal = computed(() => {
  return datosFiltrados.value.reduce(
    (sum, dato) => sum + funGeneral.redondear(parseFloat(dato.importe)),
    0,
  )
})

const descuentoTotal = computed(() => {
  return datosFiltrados.value.reduce(
    (sum, dato) => sum + funGeneral.redondear(parseFloat(dato.descuento)),
    0,
  )
})

const ventaTotal = computed(() => {
  return datosFiltrados.value.reduce(
    (sum, dato) => sum + funGeneral.redondear(parseFloat(dato.totalventa)),
    0,
  )
})

const filteredClientes = computed(() => {
  if (!clienteSearchTerm.value) {
    return clientesOptions.value
  }
  const searchTermNormalized = funGeneral.normalizeText(clienteSearchTerm.value).toLowerCase()
  return clientesOptions.value.filter((cliente) =>
    funGeneral
      .normalizeText(
        `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`,
      )
      .toLowerCase()
      .includes(searchTermNormalized),
  )
})

const filteredSucursales = computed(() => {
  if (!sucursalSearchTerm.value) {
    return sucursalesClienteOptions.value
  }
  const searchTermNormalized = funGeneral.normalizeText(sucursalSearchTerm.value).toLowerCase()
  return sucursalesClienteOptions.value.filter((sucursal) =>
    funGeneral.normalizeText(sucursal.nombre).toLowerCase().includes(searchTermNormalized),
  )
})

// Watchers
watch([almacenSeleccionado, clienteSeleccionadoId, sucursalSeleccionadaId], () => {
  filtrarYOrdenarDatos()
})

watch(clienteSearchTerm, (newVal) => {
  if (newVal === '') {
    clienteSeleccionadoId.value = null
    sucursalSearchTerm.value = ''
    sucursalSeleccionadaId.value = null
    sucursalesClienteOptions.value = []
    filtrarYOrdenarDatos()
  }
})

watch(sucursalSearchTerm, (newVal) => {
  if (newVal === '') {
    sucursalSeleccionadaId.value = null
    filtrarYOrdenarDatos()
  }
})

// Methods
const validarFechas = () => {
  const fechaInicio = new Date(fechai.value)
  const fechaFin = new Date(fechaf.value)

  if (fechaInicio.getTime() > fechaFin.getTime()) {
    $q.notify({
      type: 'info',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
      position: 'top',
    })
    // Opcional: ajustar la fecha de fin o inicio si hay error
    // fechaf.value = fechai.value;
  }
}

const generarReporte = async () => {
  loading.value = true
  if (!fechai.value || !fechaf.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, seleccione las fechas de inicio y fin.',
      position: 'top',
    })
    loading.value = false
    return
  }

  const idusuario = usuarioInfo.value?.idusuario
  if (!idusuario) {
    $q.notify({
      type: 'negative',
      message: 'Información de usuario no disponible.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `${URL_APICM}api/reporteventasporproductos/${idusuario}/${fechai.value}/${fechaf.value}`
    const data = await peticionGET(endpoint)

    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({
        type: 'negative',
        message: `Error al generar el reporte: ${data.error}`,
        position: 'top',
      })
      datosOriginales.value = []
      datosFiltrados.value = []
    } else {
      datosOriginales.value = data.filter((u) => u.estado == 1) // Only active items

      const numerados = datosOriginales.value.map((row, index) => ({
        ...row,
        nro: index + 1,
      }))
      datosFiltrados.value = [...numerados] // Initialize with all data
      $q.notify({
        type: 'positive',
        message: 'Reporte generado con éxito.',
        position: 'top',
      })
      // Load related data for filters after report generation
      await listaAlmacenes()
      await listaClientes()
    }
  } catch (error) {
    console.error('Error al generar el reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al generar el reporte. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const listaAlmacenes = async () => {
  loading.value = true
  try {
    const idempresa = usuarioInfo.value?.empresa?.idempresa
    const idusuario = usuarioInfo.value?.idusuario

    if (!idempresa || !idusuario) {
      $q.notify({
        type: 'negative',
        message: 'Información de empresa o usuario no disponible para listar almacenes.',
        position: 'top',
      })
      loading.value = false
      return
    }

    const endpoint = `${URL_APICM}api/listaResponsableAlmacenReportes/${idempresa}`
    const resultado = await peticionGET(endpoint)

    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar almacenes: ${resultado.error}`,
        position: 'top',
      })
      almacenesOptions.value = []
    } else {
      // Filter for current user's warehouses
      const userAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
      almacenesOptions.value = [
        { idalmacen: null, almacen: 'Todos los almacenes' },
        ...userAlmacenes,
      ]
      almacenSeleccionado.value = null // Default to "Todos los almacenes"
    }
  } catch (error) {
    console.error('Error en listaAlmacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const listaClientes = async () => {
  loading.value = true
  const idempresa = usuarioInfo.value?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Información de empresa no disponible para listar clientes.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    const endpoint = `${URL_APICM}api/listaCliente/${idempresa}`
    const resultado = await peticionGET(endpoint)

    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar clientes: ${resultado.error}`,
        position: 'top',
      })
      clientesOptions.value = []
    } else {
      clientesOptions.value = resultado
    }
  } catch (error) {
    console.error('Error en listaClientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los clientes. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const seleccionarCliente = async (cliente) => {
  clienteSearchTerm.value = `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`
  clienteSeleccionadoId.value = cliente.id
  showClienteDropdown.value = false
  await selectSucursal(cliente.id) // Load sucursales for the selected client
  filtrarYOrdenarDatos()
}

const selectSucursal = async (idcliente) => {
  loading.value = true
  try {
    const endpoint = `${URL_APICM}api/listaSucursal/${idcliente}`
    const data = await peticionGET(endpoint)

    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({
        type: 'negative',
        message: `Error al cargar sucursales: ${data.error}`,
        position: 'top',
      })
      sucursalesClienteOptions.value = []
      sucursalSearchTerm.value = ''
      sucursalSeleccionadaId.value = null
    } else {
      sucursalesClienteOptions.value = data
      sucursalSearchTerm.value = '' // Clear search term for sucursales
      sucursalSeleccionadaId.value = null // Reset selected sucursal
      if (data.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No existen sucursales registradas para el cliente seleccionado.',
          position: 'top',
        })
      }
    }
  } catch (error) {
    console.error('Error en selectSucursal:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las sucursales. Inténtelo de nuevo.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const seleccionarSucursal = (sucursal) => {
  sucursalSearchTerm.value = sucursal.nombre
  sucursalSeleccionadaId.value = sucursal.id
  showSucursalDropdown.value = false
  filtrarYOrdenarDatos()
}

const hideClienteDropdownDelayed = () => {
  // Delay hiding to allow click event on option to fire
  setTimeout(() => {
    if (document.activeElement && !document.activeElement.closest('.absolute-cliente-dropdown')) {
      showClienteDropdown.value = false
    }
  }, 200)
}

const hideSucursalDropdownDelayed = () => {
  // Delay hiding to allow click event on option to fire
  setTimeout(() => {
    if (document.activeElement && !document.activeElement.closest('.absolute-sucursal-dropdown')) {
      showSucursalDropdown.value = false
    }
  }, 200)
}

const filtrarYOrdenarDatos = () => {
  let tempDatos = [...datosOriginales.value]

  if (almacenSeleccionado.value !== null) {
    tempDatos = tempDatos.filter((u) => u.idalmacen == almacenSeleccionado.value)
  }
  if (clienteSeleccionadoId.value !== null) {
    tempDatos = tempDatos.filter((u) => u.idclienteve == clienteSeleccionadoId.value)
  }
  if (sucursalSeleccionadaId.value !== null) {
    tempDatos = tempDatos.filter((u) => u.idsucursalve == sucursalSeleccionadaId.value)
  }
  datosFiltrados.value = tempDatos
}

const exportarTablaAExcel = () => {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No hay datos para exportar a Excel.',
      position: 'top',
    })
    return
  }

  // Prepare data for Excel
  formularioExcel.splice(0) // Clear previous data
  datosFiltrados.value.forEach((key) => {
    formularioExcel.push({
      Fecha: funGeneral.cambiarFormatoFecha(key.fecha),
      'Nro. Doc.': key.nrofactura,
      'Tipo de Venta': tipoVentaMap[key.tipoventa],
      'Código Producto': key.codigo,
      'Código Barras': key.codigobarra,
      'Descripción de Producto': key.descripcion,
      'Precio Unitario': funGeneral.redondear(parseFloat(key.preciounitario)),
      Cantidad: funGeneral.redondear(parseFloat(key.cantidad)),
      Importe: funGeneral.redondear(parseFloat(key.importe)),
      Descuento: funGeneral.redondear(parseFloat(key.descuento)),
      'Venta Total': funGeneral.redondear(parseFloat(key.totalventa)),
      'Tipo Pago': key.tipopago,
      'Nombre Usuario': key.idusuario,
      'Sucursal del Cliente': key.sucursalc,
      'Almacén Empresa': key.almacen,
      'Razón Social Empresa': key.cliente,
      'Tipo Documento': key.tipodocumento,
      'Nro. Doc. Tributario': key.nrodoc,
      'Nombre Comercial': key.nombrecomercial,
      Unidad: key.unidad,
      Categoria: key.categoria,
      'Sub Categoria': key.subcategoria,
      Canal: key.canal,
      'Tipo de Precio': key.tipoprecio,
    })
  })

  let myFile = `REPORTE DE PRODUCTOS VENDIDOS ${funGeneral.obtenerFechaActualDato()}.xlsx`
  let myWorkSheet = XLSX.utils.json_to_sheet(formularioExcel)
  let myWorkBook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(myWorkBook, myWorkSheet, 'myWorkSheet')
  XLSX.writeFile(myWorkBook, myFile)

  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a Excel con éxito.',
    position: 'top',
  })
}

onMounted(() => {
  // Ensure XLSX is available. If not, you might need to import it explicitly
  // or ensure it's loaded as a global script in your index.html.
  if (typeof XLSX === 'undefined') {
    console.warn('XLSX library not found. Please ensure it is loaded.')
  }
})
</script>

<style scoped>
.absolute-cliente-dropdown,
.absolute-sucursal-dropdown {
  position: absolute;
  z-index: 1000; /* Ensure it's above other elements */
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white; /* Or your Quasar card background color */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
</style>
