<template>
  <q-page padding>
    <div class="titulo">Reporte de Índice de Rotación por Cliente</div>

    <q-form @submit.prevent="generarReporte">
      <div class="row q-col-gutter-md">
        <!-- Fecha Inicial -->
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="fechaInicio"
            label="Fecha Inicial*"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <!-- Fecha Final -->
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="fechaFin"
            label="Fecha Final*"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <!-- Cliente -->
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-select
            v-model="clienteSeleccionado"
            label="Razón Social*"
            :options="clientesOptions"
            option-label="label"
            option-value="value"
            use-input
            outlined
            dense
            @filter="filtrarClientes"
            :rules="[(val) => !!val || 'Campo requerido']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Sucursal -->
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-select
            v-model="sucursalSeleccionada"
            label="Sucursal*"
            :options="sucursalesOptions"
            option-label="label"
            option-value="value"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
            :disable="!clienteSeleccionado"
          />
        </div>
      </div>

      <div class="row q-mt-md justify-center">
        <div class="col-auto">
          <q-btn type="submit" color="primary" label="Generar Reporte" class="q-mr-sm" />
          <q-btn
            color="primary"
            label="Vista Previa"
            @click="mostrarVistaPrevia"
            :disable="!datosFiltrados || datosFiltrados.length === 0"
          />
        </div>
      </div>
    </q-form>

    <!-- Tabla de resultados -->

    <div class="table-responsive">
      <q-table
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="id"
        flat
        bordered
        :loading="cargando"
        :pagination="paginacion"
      >
        <template v-slot:body-cell-rotacion="props">
          <q-td :props="props">
            {{ props.row.r }}
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Modal de vista previa PDF -->

    <q-card-section>
      <q-dialog v-model="mostrarModal" full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Vista previa de PDF</div>
            <q-space />
            <q-btn flat round icon="close" @click="mostrarModal = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
            <iframe
              v-if="pdfData"
              :src="pdfData"
              style="width: 100%; height: 100%; border: none"
            ></iframe>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card-section>
  </q-page>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { date } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { PDF_REPORTE_DE_ROTACION_POR_CLIENTE } from 'src/utils/pdfReportGenerator'
const $q = useQuasar()
const { formatDate } = date

// PDF
//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)

// Datos del usuario y empresa
const usuario = ref({})
const empresa = ref({})

// Estado del componente
const cargando = ref(false)
const fechaInicio = ref('')
const fechaFin = ref('')
const fechaActual = ref(new Date())
const clienteSeleccionado = ref(null)
const sucursalSeleccionada = ref(null)
const datosOriginales = ref([])
const datosFiltrados = ref([])
const clientesOptions = ref([])
const clientesOriginal = ref([])
const sucursalesOptions = ref([])

// Columnas de la tabla
const columnas = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => datosFiltrados.value.indexOf(row) + 1,
    align: 'left',
  },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'cantidadVentas', label: 'Cant. Ventas', field: 'cantidadventas', align: 'right' },
  { name: 'inventarioExterno', label: 'Inv. Externo', field: 'cantidadIE', align: 'right' },
  {
    name: 'rotacion',
    label: 'Rotación',
    field: (row) => calcularRotacion(row),
    align: 'right',
  },
]

const paginacion = {
  rowsPerPage: 10,
}

const redondear = (valor, decimales = 2) => {
  return Number(valor.toFixed(decimales))
}

// Cálculo de rotación
const calcularRotacion = (item) => {
  if (!fechaInicio.value || !fechaFin.value) return 0

  const date1 = new Date(fechaInicio.value)
  const date2 = new Date(fechaFin.value)

  date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset())
  date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset())

  const differences = date2.getTime() - date1.getTime()
  const days = differences / (1000 * 3600 * 24) + 1

  return redondear((item.cantidadventas - item.cantidadIE) / days)
}

// Cargar datos iniciales
const cargarDatosIniciales = async () => {
  try {
    // Obtener datos del usuario (simulado)
    const response = validarUsuario()
    console.log(response[0]?.empresa)
    usuario.value = response[0]
    empresa.value = response[0]?.empresa

    // Cargar lista de clientes
    await cargarClientes()

    // Establecer fecha actual como fecha final por defecto
    fechaActual.value = new Date()
    fechaFin.value = formatDate(fechaActual.value, 'YYYY-MM-DD')

    // Establecer fecha inicial como 30 días antes
    const fechaInicial = new Date(fechaActual.value)
    fechaInicial.setDate(fechaInicial.getDate() - 30)
    fechaInicio.value = formatDate(fechaInicial, 'YYYY-MM-DD')
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos iniciales',
    })
  }
}

// Cargar lista de clientes
const cargarClientes = async () => {
  try {
    const response = await api.get(`listaCliente/${empresa.value.idempresa}`)
    clientesOriginal.value = response.data.map((cliente) => ({
      label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`,
      value: cliente.id,
      data: cliente,
    }))
    clientesOptions.value = [...clientesOriginal.value]
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de clientes',
    })
  }
}

// Filtrar clientes en el select
const filtrarClientes = (val, update) => {
  if (val === '') {
    update(() => {
      clientesOptions.value = clientesOriginal.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    clientesOptions.value = clientesOriginal.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

// Cargar sucursales cuando se selecciona un cliente
const cargarSucursales = async (idCliente) => {
  try {
    const response = await api.get(`listaSucursal/${idCliente}`)
    sucursalesOptions.value = response.data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
    }))
    sucursalSeleccionada.value =
      sucursalesOptions.value.length === 1 ? sucursalesOptions.value[0] : null
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las sucursales del cliente',
    })
  }
}

// Generar reporte
const generarReporte = async () => {
  if (!validarFormulario()) return

  cargando.value = true

  try {
    const point = `reporteindicerotacioncliente/${fechaInicio.value}/${fechaFin.value}/${clienteSeleccionado.value.value}/${sucursalSeleccionada.value.value}`
    console.log(point)
    const response = await api.get(`${point}`)

    datosOriginales.value = response.data
    console.log(response.data)
    datosFiltrados.value = response.data.map((item, index) => ({
      ...item,
      index: index + 1,
      r: calcularRotacion(item),
    }))

    $q.notify({
      type: 'positive',
      message: 'Reporte generado correctamente',
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  } finally {
    cargando.value = false
  }
}

// Validar formulario antes de generar reporte
const validarFormulario = () => {
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar ambas fechas',
    })
    return false
  }

  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    $q.notify({
      type: 'warning',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
    })
    return false
  }

  if (!clienteSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un cliente',
    })
    return false
  }

  if (!sucursalSeleccionada.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar una sucursal',
    })
    return false
  }

  return true
}

// Mostrar vista previa del PDF
const mostrarVistaPrevia = () => {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para mostrar en el reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_CLIENTE(datosFiltrados.value, {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    cliente: clienteSeleccionado.value.label,
    sucursal: sucursalSeleccionada.value.label,
    empresa: empresa.value,
    usuario: usuario.value,
  })
  console.log(doc)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Descargar PDF

// Watchers
watch(clienteSeleccionado, (newVal) => {
  if (newVal) {
    sucursalSeleccionada.value = null
    cargarSucursales(newVal.value)
  }
})

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatosIniciales()
})
</script>
