<template>
  <q-page class="q-pa-md">
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="label" size="md" class="q-mr-sm" />
          {{ $t('ui.indices-de-rotacion-fa7c9a') }}
        </div>
        <div class="text-subtitle2 cm-text-muted q-mt-xs">
          {{ $t('ui.administracion-de-indices-de-rotacion-c49083') }}
        </div>
      </div>
    </div>

    <q-card flat bordered>
      <q-tabs
        id="tabs"
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="almacen" :label="$t('ui.por-almacen-942000')" icon="store" id="tabAlmacen"/>
        <q-tab name="global" :label="$t('configuracion.clienteAlmacen.toggleLabelGlobal')" icon="public" id="tabGlobal"/>
        <q-tab name="cliente" :label="$t('ui.por-cliente-dda890')" icon="person_search" id="tabCliente"/>
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Tab: Por Almacén -->
        <q-tab-panel name="almacen">
          <q-form @submit.prevent="generarReporteAlmacen">
            <div class="row q-col-gutter-md">
              <div class="col-md-4" id='fechaInicio'>
                <q-input
                  v-model="almacen.fechaInicio"
                  :label="$t('ui.fecha-inicial-2b461a')"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
                />
              </div>
              <div class="col-md-4" id='fechaFinal'>
                <q-input
                  v-model="almacen.fechaFin"
                  :label="$t('ui.fecha-final-33d0e8')"
                  type="date"
                  outlined
                  dense
                  :rules="[
                    (val) => !!val || $t('configuracion.canalesDeVenta.form.required'),
                    (val) =>
                      validarFechas(almacen.fechaInicio, val) ||
                      $t('ui.fecha-final-debe-ser-mayor-o-igual-a-la-inicial-543555'),
                  ]"
                />
              </div>
              <div class="col-md-4" id='almacenIndice'>
                <q-select
                  v-model="almacen.seleccionado"
                  :options="almacen.options"
                  :label="$t('ui.almacen-3e3724')"
                  outlined
                  dense
                  option-value="idalmacen"
                  option-label="almacen"
                  emit-value
                  map-options
                  :rules="[(val) => val >= 0 || $t('configuracion.canalesDeVenta.form.required')]"
                />
              </div>
            </div>

            <div class="row justify-center q-mt-md">
              <q-btn :label="$t('reportes.generate')" type="submit" color="primary" class="q-mr-sm" id='btnGenerarReporteAlmacen'  />
              <q-btn
                :label="$t('ui.vista-previa-58a2c3')"
                color="secondary"
                @click="mostrarVistaPreviaAlmacen"
                :disable="!almacen.datos || almacen.datos.length === 0" id='btnVistaPreviaAlmacen'
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              id="tableAlmacen"
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
              <template v-slot:header-cell-rotacion="props">
                <q-th :props="props">
                  {{ props.col.label }}
                  <q-icon name="help" size="xs" class="q-ml-xs">
                    <q-tooltip anchor="top middle" self="bottom middle">
                      {{ explicacionRotacion }}
                    </q-tooltip>
                  </q-icon>
                </q-th>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- Tab: Global -->
        <q-tab-panel name="global">
          <q-form @submit.prevent="generarReporteGlobal">
            <div class="row justify-center q-col-gutter-md">
              <div class="col-md-4" id="fechaInicioGlobal">
                <q-input
                  v-model="global.fechaInicio"
                  :label="$t('ui.fecha-inicial-2b461a')"
                  type="date"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4" id="fechaFinalGlobal">
                <q-input
                  v-model="global.fechaFin"
                  :label="$t('ui.fecha-final-33d0e8')"
                  type="date"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row justify-center q-mt-md">
              <q-btn :label="$t('reportes.generate')" type="submit" color="primary" class="q-mr-sm" id="btnGenerarReporteGlobal" />
              <q-btn
                :label="$t('ui.vista-previa-58a2c3')"
                color="secondary"
                @click="mostrarVistaPreviaGlobal"
                :disable="!global.datos || global.datos.length === 0"
                id="btnVistaPreviaGlobal"
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              id="tableGlobal"
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
              <template v-slot:header-cell-rotacion="props">
                <q-th :props="props">
                  {{ props.col.label }}
                  <q-icon name="help" size="xs" class="q-ml-xs">
                    <q-tooltip anchor="top middle" self="bottom middle">
                      {{ explicacionRotacion }}
                    </q-tooltip>
                  </q-icon>
                </q-th>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- Tab: Por Cliente -->
        <q-tab-panel name="cliente">
          <q-form @submit.prevent="generarReporteCliente">
            <div class="row q-col-gutter-md">
              <div class="col-md-3" id="fechaInicioCliente">
                <q-input
                  v-model="cliente.fechaInicio"
                  :label="$t('ui.fecha-inicial-2b461a')"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                />
              </div>
              <div class="col-md-3" id="fechaFinalCliente">
                <q-input
                  v-model="cliente.fechaFin"
                  :label="$t('ui.fecha-final-33d0e8')"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                />
              </div>
              <div class="col-md-3" id="clienteIndice">
                <q-select
                  v-model="cliente.seleccionado"
                  :label="$t('ui.razon-social-e27b7d')"
                  :options="cliente.options"
                  option-label="label"
                  option-value="value"
                  use-input
                  outlined
                  dense
                  @filter="filtrarClientes"
                  :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> {{ $t('ui.no-hay-resultados-c83a44') }} </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-md-3" id="sucursalIndice">
                <q-select
                  v-model="cliente.sucursalSeleccionada"
                  :label="$t('ui.sucursal-80e67a')"
                  :options="cliente.sucursalesOptions"
                  option-label="label"
                  option-value="value"
                  outlined
                  dense
                  :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  :disable="!cliente.seleccionado"
                />
              </div>
            </div>

            <div class="row q-mt-md justify-center">
              <q-btn type="submit" color="primary" :label="$t('reportes.generate')" class="q-mr-sm" id="btnGenerarReporteCliente" />
              <q-btn
                color="secondary"
                :label="$t('ui.vista-previa-58a2c3')"
                @click="mostrarVistaPreviaCliente"
                :disable="!cliente.datos || cliente.datos.length === 0"
                id="btnVistaPreviaCliente"
              />
            </div>
          </q-form>

          <!-- Tabla de resultados -->
          <q-card class="q-mt-md">
            <q-table
              id="tableCliente"
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
              <template v-slot:header-cell-rotacion="props">
                <q-th :props="props">
                  {{ props.col.label }}
                  <q-icon name="help" size="xs" class="q-ml-xs">
                    <q-tooltip anchor="top middle" self="bottom middle">
                      {{ explicacionRotacion }}
                    </q-tooltip>
                  </q-icon>
                </q-th>
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
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
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
const explicacionRotacion =
  'Promedio de unidades netas vendidas por día en el periodo seleccionado.'
// Columnas de tablas
const columnasAlmacen = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: (row) => row.index, align: 'left' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left' },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: i18nT('ui.cant-ventas-651db0'), field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: i18nT('ui.inv-externo-55fb47'), field: 'cantidadIE', align: 'right' },
  {
    name: 'rotacion',
    label: i18nT('ui.rotacion-diaria-77963f'),
    field: 'rotacion',
    align: 'right',
    classes: 'text-bold',
    headerTooltip: explicacionRotacion,
  },
]

const columnasGlobal = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left' },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: i18nT('ui.cant-ventas-651db0'), field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: i18nT('ui.extension-inventory-4c0f1a'), field: 'cantidadIE', align: 'right' },
  {
    name: 'rotacion',
    label: i18nT('ui.rotacion-fb6a5f'),
    field: 'rotacion',
    align: 'right',
    classes: 'text-bold',
    headerTooltip: explicacionRotacion,
  },
]

const columnasCliente = [
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => cliente.value.datos.indexOf(row) + 1,
    align: 'left',
  },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left' },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left' },
  { name: 'cantidadVentas', label: i18nT('ui.cant-ventas-beb632'), field: 'cantidadventas', align: 'right' },
  { name: 'inventarioExterno', label: i18nT('ui.inv-externo-d898e1'), field: 'cantidadIE', align: 'right' },
  {
    name: 'rotacion',
    label: i18nT('ui.rotacion-fb6a5f'),
    field: (row) => calcularRotacion(row, cliente.value.fechaInicio, cliente.value.fechaFin),
    align: 'right',
    classes: 'text-bold',
    headerTooltip:
      'Promedio de unidades netas vendidas por día en el periodo seleccionado para el cliente y sucursal elegidos.',
  },
]

const pagination = {
  rowsPerPage: 5,
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
      message: i18nT('ui.error-al-cargar-los-almacenes-5919ff'),
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
        message: i18nT('ui.ingrese-todos-los-datos-necesarios-0aff9f'),
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
      message: i18nT('ui.error-al-generar-el-reporte-01d807'),
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
      message: i18nT('ui.no-se-genero-ningun-reporte-816b8f'),
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
        message: i18nT('ui.ingrese-todas-las-fechas-validas-7cd759'),
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
      message: i18nT('ui.reporte-generado-con-exito-73ac5d'),
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-generar-el-reporte-01d807'),
    })
  } finally {
    global.value.cargando = false
  }
}

const mostrarVistaPreviaGlobal = () => {
  if (!global.value.datos || global.value.datos.length === 0) {
    $q.notify({
      type: 'info',
      message: i18nT('ui.no-se-genero-ningun-reporte-816b8f'),
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
      message: i18nT('ui.error-al-cargar-la-lista-de-clientes-1daf00'),
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
      message: i18nT('ui.error-al-cargar-las-sucursales-del-cliente-967f0a'),
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
      message: i18nT('ui.complete-todos-los-campos-requeridos-b87258'),
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
      message: i18nT('ui.reporte-generado-correctamente-8b476f'),
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-generar-el-reporte-01d807'),
    })
  } finally {
    cliente.value.cargando = false
  }
}

const mostrarVistaPreviaCliente = () => {
  if (!cliente.value.datos || cliente.value.datos.length === 0) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.no-hay-datos-para-mostrar-en-el-reporte-7ba1e1'),
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
