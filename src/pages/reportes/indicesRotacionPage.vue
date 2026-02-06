<template>
  <q-page class="q-pa-md">
    <div class="titulo">Índices de Rotación</div>

    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="almacen" label="Por Almacén" icon="store" />
        <q-tab name="global" label="Global" icon="public" />
        <q-tab name="cliente" label="Por Cliente" icon="person_search" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Tab: Por Almacén -->
        <q-tab-panel name="almacen">
          <q-form @submit.prevent="generarReporteAlmacen">
            <div class="row q-col-gutter-md">
              <div class="col-md-4">
                <q-input
                  v-model="almacen.fechaInicio"
                  label="Fecha Inicial*"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo obligatorio']"
                />
              </div>
              <div class="col-md-4">
                <q-input
                  v-model="almacen.fechaFin"
                  label="Fecha Final*"
                  type="date"
                  outlined
                  dense
                  :rules="[
                    (val) => !!val || 'Campo obligatorio',
                    (val) =>
                      validarFechas(almacen.fechaInicio, val) ||
                      'Fecha final debe ser mayor o igual a la inicial',
                  ]"
                />
              </div>
              <div class="col-md-4">
                <q-select
                  v-model="almacen.seleccionado"
                  :options="almacen.options"
                  label="Almacén*"
                  outlined
                  dense
                  option-value="idalmacen"
                  option-label="almacen"
                  emit-value
                  map-options
                  :rules="[(val) => val >= 0 || 'Campo obligatorio']"
                />
              </div>
            </div>

            <div class="row justify-center q-mt-md">
              <q-btn label="Generar Reporte" type="submit" color="primary" class="q-mr-sm" />
              <q-btn
                label="Vista Previa"
                color="secondary"
                @click="mostrarVistaPreviaAlmacen"
                :disable="!almacen.datos || almacen.datos.length === 0"
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              :rows="almacen.datos"
              :columns="columnasAlmacen"
              row-key="codigo"
              flat
              bordered
              :loading="almacen.cargando"
              :pagination="pagination"
            >
              <template v-slot:body-cell-rotacion="props">
                <q-td :props="props">
                  {{ props.row.r }}
                </q-td>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- Tab: Global -->
        <q-tab-panel name="global">
          <q-form @submit.prevent="generarReporteGlobal">
            <div class="row justify-center q-col-gutter-md">
              <div class="col-md-4">
                <q-input
                  v-model="global.fechaInicio"
                  label="Fecha Inicial*"
                  type="date"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4">
                <q-input
                  v-model="global.fechaFin"
                  label="Fecha Final*"
                  type="date"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row justify-center q-mt-md">
              <q-btn label="Generar Reporte" type="submit" color="primary" class="q-mr-sm" />
              <q-btn
                label="Vista Previa"
                color="secondary"
                @click="mostrarVistaPreviaGlobal"
                :disable="!global.datos || global.datos.length === 0"
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              :rows="global.datos"
              :columns="columnasGlobal"
              row-key="codigo"
              flat
              bordered
              :loading="global.cargando"
              :pagination="pagination"
            >
              <template v-slot:body-cell-rotacion="props">
                <q-td :props="props">
                  {{ props.row.r }}
                </q-td>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- Tab: Por Cliente -->
        <q-tab-panel name="cliente">
          <q-form @submit.prevent="generarReporteCliente">
            <div class="row q-col-gutter-md">
              <div class="col-md-3">
                <q-input
                  v-model="cliente.fechaInicio"
                  label="Fecha Inicial*"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-md-3">
                <q-input
                  v-model="cliente.fechaFin"
                  label="Fecha Final*"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-md-3">
                <q-select
                  v-model="cliente.seleccionado"
                  label="Razón Social*"
                  :options="cliente.options"
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
              <div class="col-md-3">
                <q-select
                  v-model="cliente.sucursalSeleccionada"
                  label="Sucursal*"
                  :options="cliente.sucursalesOptions"
                  option-label="label"
                  option-value="value"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Campo requerido']"
                  :disable="!cliente.seleccionado"
                />
              </div>
            </div>

            <div class="row q-mt-md justify-center">
              <q-btn type="submit" color="primary" label="Generar Reporte" class="q-mr-sm" />
              <q-btn
                color="secondary"
                label="Vista Previa"
                @click="mostrarVistaPreviaCliente"
                :disable="!cliente.datos || cliente.datos.length === 0"
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              :rows="cliente.datos"
              :columns="columnasCliente"
              row-key="id"
              flat
              bordered
              :loading="cliente.cargando"
              :pagination="pagination"
            >
              <template v-slot:body-cell-rotacion="props">
                <q-td :props="props">
                  {{ props.row.r }}
                </q-td>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Modal de vista previa PDF -->
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
import {
  PDF_REPORTE_DE_ROTACION_POR_ALMACEN,
  PDF_REPORTE_DE_ROTACION_POR_GLOBAL,
  PDF_REPORTE_DE_ROTACION_POR_CLIENTE,
} from 'src/utils/pdfReportGenerator'

const $q = useQuasar()
const { formatDate } = date
const idempresa = idempresa_md5()

// Tab activo
const tab = ref('almacen')

// PDF
const pdfData = ref(null)
const mostrarModal = ref(false)

// Usuario y empresa
const usuario = ref({})
const empresa = ref({})

// Datos para tab "Por Almacén"
const almacen = ref({
  fechaInicio: '',
  fechaFin: '',
  seleccionado: null,
  options: [],
  datos: [],
  cargando: false,
})

// Datos para tab "Global"
const global = ref({
  fechaInicio: '',
  fechaFin: '',
  datos: [],
  cargando: false,
})

// Datos para tab "Por Cliente"
const cliente = ref({
  fechaInicio: '',
  fechaFin: '',
  seleccionado: null,
  sucursalSeleccionada: null,
  options: [],
  optionsOriginal: [],
  sucursalesOptions: [],
  datos: [],
  cargando: false,
})

// Columnas de tablas
const columnasAlmacen = [
  { name: 'numero', label: 'N°', field: (row) => row.index, align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: 'Cant. ventas', field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: 'Inv. externo', field: 'cantidadIE', align: 'right' },
  { name: 'rotacion', label: 'Rotación', field: 'rotacion', align: 'right' },
]

const columnasGlobal = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: 'Cant. ventas', field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: 'Inv.externo', field: 'cantidadIE', align: 'right' },
  { name: 'rotacion', label: 'Rotación', field: 'rotacion', align: 'right' },
]

const columnasCliente = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => cliente.value.datos.indexOf(row) + 1,
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
    field: (row) => calcularRotacion(row, cliente.value.fechaInicio, cliente.value.fechaFin),
    align: 'right',
  },
]

const pagination = {
  rowsPerPage: 10,
}

// Computed
const nombreAlmacenSeleccionado = computed(() => {
  const alm = almacen.value.options.find((a) => a.idalmacen === almacen.value.seleccionado)
  return alm ? alm.almacen : ''
})

// Métodos generales
const validarFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return true
  return new Date(fechaInicio) <= new Date(fechaFin)
}

const calcularRotacion = (item, fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0

  const date1 = new Date(fechaInicio)
  const date2 = new Date(fechaFin)

  date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset())
  date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset())

  const differences = date2.getTime() - date1.getTime()
  const days = differences / (1000 * 3600 * 24) + 1

  return ((item.cantidadventas - item.cantidadIE) / days).toFixed(2)
}

// Métodos para tab "Por Almacén"
const cargarAlmacenes = async () => {
  try {
    const contenidousuario = validarUsuario()
    if (!contenidousuario || !contenidousuario[0]) {
      throw new Error('Usuario no válido')
    }

    const idempresaLocal = contenidousuario[0]?.empresa?.idempresa
    const idusuario = contenidousuario[0]?.idusuario

    if (!idempresaLocal) {
      throw new Error('Empresa no válida')
    }

    const endpoint = `listaResponsableAlmacenReportes/${idempresaLocal}`
    const response = await api.get(endpoint)
    const resultado = response.data

    if (resultado[0] === 'error') {
      throw new Error(resultado.error)
    }

    const userAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
    almacen.value.options = [{ idalmacen: 0, almacen: 'Todos los almacenes' }, ...userAlmacenes]
    almacen.value.seleccionado = 0
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes',
      caption: error.message,
    })
  }
}

const generarReporteAlmacen = async () => {
  try {
    if (
      !almacen.value.fechaInicio ||
      !almacen.value.fechaFin ||
      almacen.value.seleccionado === null
    ) {
      $q.notify({
        type: 'warning',
        message: 'Ingrese todos los datos necesarios',
      })
      return
    }

    almacen.value.cargando = true

    const point = `reporteindicerotacionalmacen/${almacen.value.seleccionado}/${almacen.value.fechaInicio}/${almacen.value.fechaFin}`
    const resp = await api.get(point)

    almacen.value.datos = resp.data.map((item, index) => ({
      ...item,
      index: index + 1,
      r: calcularRotacion(item, almacen.value.fechaInicio, almacen.value.fechaFin),
    }))
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
      caption: error.message,
    })
  } finally {
    almacen.value.cargando = false
  }
}

const mostrarVistaPreviaAlmacen = () => {
  if (!almacen.value.datos || almacen.value.datos.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se generó ningún reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_ALMACEN(almacen.value.datos, {
    fechaInicio: almacen.value.fechaInicio,
    fechaFin: almacen.value.fechaFin,
    almacen: nombreAlmacenSeleccionado.value,
    empresa: empresa.value,
    usuario: usuario.value,
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Métodos para tab "Global"
const generarReporteGlobal = async () => {
  try {
    if (!global.value.fechaInicio || !global.value.fechaFin) {
      $q.notify({
        type: 'warning',
        message: 'Ingrese todas las fechas válidas',
      })
      return
    }

    global.value.cargando = true

    const point = `reporteindicerotacionglobal/${idempresa}/${global.value.fechaInicio}/${global.value.fechaFin}`
    const response = await api.get(point)

    global.value.datos = response.data.map((item, index) => ({
      ...item,
      numero: index + 1,
      r: calcularRotacion(item, global.value.fechaInicio, global.value.fechaFin),
    }))

    $q.notify({
      type: 'positive',
      message: 'Reporte generado con éxito',
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  } finally {
    global.value.cargando = false
  }
}

const mostrarVistaPreviaGlobal = () => {
  if (!global.value.datos || global.value.datos.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se generó ningún reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_GLOBAL(global.value.datos, {
    fechaInicio: global.value.fechaInicio,
    fechaFin: global.value.fechaFin,
    almacen: 'GLOBAL',
    usuario: usuario.value,
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Métodos para tab "Por Cliente"
const cargarClientes = async () => {
  try {
    const response = await api.get(`listaCliente/${empresa.value.idempresa}`)
    cliente.value.optionsOriginal = response.data.map((cli) => ({
      label: `${cli.codigo} - ${cli.nombre} - ${cli.nombrecomercial}`,
      value: cli.id,
      data: cli,
    }))
    cliente.value.options = [...cliente.value.optionsOriginal]
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de clientes',
    })
  }
}

const filtrarClientes = (val, update) => {
  if (val === '') {
    update(() => {
      cliente.value.options = cliente.value.optionsOriginal
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    cliente.value.options = cliente.value.optionsOriginal.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const cargarSucursales = async (idCliente) => {
  try {
    const response = await api.get(`listaSucursal/${idCliente}`)
    cliente.value.sucursalesOptions = response.data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
    }))
    cliente.value.sucursalSeleccionada =
      cliente.value.sucursalesOptions.length === 1 ? cliente.value.sucursalesOptions[0] : null
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las sucursales del cliente',
    })
  }
}

const generarReporteCliente = async () => {
  if (
    !cliente.value.fechaInicio ||
    !cliente.value.fechaFin ||
    !cliente.value.seleccionado ||
    !cliente.value.sucursalSeleccionada
  ) {
    $q.notify({
      type: 'warning',
      message: 'Complete todos los campos requeridos',
    })
    return
  }

  cliente.value.cargando = true

  try {
    const point = `reporteindicerotacioncliente/${cliente.value.fechaInicio}/${cliente.value.fechaFin}/${cliente.value.seleccionado.value}/${cliente.value.sucursalSeleccionada.value}`
    const response = await api.get(point)

    cliente.value.datos = response.data.map((item, index) => ({
      ...item,
      index: index + 1,
      r: calcularRotacion(item, cliente.value.fechaInicio, cliente.value.fechaFin),
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
    cliente.value.cargando = false
  }
}

const mostrarVistaPreviaCliente = () => {
  if (!cliente.value.datos || cliente.value.datos.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para mostrar en el reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_CLIENTE(cliente.value.datos, {
    fechaInicio: cliente.value.fechaInicio,
    fechaFin: cliente.value.fechaFin,
    cliente: cliente.value.seleccionado.label,
    sucursal: cliente.value.sucursalSeleccionada.label,
    empresa: empresa.value,
    usuario: usuario.value,
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Watchers
watch(
  () => cliente.value.seleccionado,
  (newVal) => {
    if (newVal) {
      cliente.value.sucursalSeleccionada = null
      cargarSucursales(newVal.value)
    }
  },
)

// Inicialización
onMounted(() => {
  const hoy = new Date().toISOString().split('T')[0]
  const primerDia = primerDiaDelMes().toISOString().slice(0, 10)

  // Inicializar fechas para todos los tabs
  almacen.value.fechaInicio = primerDia
  almacen.value.fechaFin = hoy

  global.value.fechaInicio = primerDia
  global.value.fechaFin = hoy

  const fechaInicial = new Date()
  fechaInicial.setDate(fechaInicial.getDate() - 30)
  cliente.value.fechaInicio = formatDate(fechaInicial, 'YYYY-MM-DD')
  cliente.value.fechaFin = hoy

  // Cargar datos del usuario
  const usuarioData = validarUsuario()
  if (usuarioData && usuarioData[0]) {
    usuario.value = usuarioData[0]
    empresa.value = usuarioData[0]?.empresa || {}
  }

  // Cargar datos iniciales
  cargarAlmacenes()
  cargarClientes()
})
</script>
