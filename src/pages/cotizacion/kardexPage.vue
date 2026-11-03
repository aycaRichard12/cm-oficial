<template>
  <q-page padding>
    <div v-if="kardex">
      <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
        <div class="col-12 col-md-auto">
          <div class="text-h5 text-primary text-weight-bold flex items-center">
            <q-icon name="inventory" size="md" class="q-mr-sm" />
            {{ $t('ui.kardex-de-productos-66f4a5') }}
          </div>
          <div class="text-subtitle2 text-grey-7 q-mt-xs">
            {{ $t('ui.administracion-de-kardex-de-productos-509fa2') }}
          </div>
        </div>
      </div>
      <q-card-section>
        <q-form @submit="generarReporte">
          <div class="row q-col-gutter-x-lg flex justify-center">
            <div class="col-md-4 col-12" id="fechainikardex">
              <label for="fechaINi">{{ $t('ui.fecha-inicial-4e1b5c') }}</label>
              <q-input
                v-model="fechaiR"
                type="date"
                id="fechaINi"
                dense
                outlined
                :hint="$t('ui.fecha-de-inicio-para-el-reporte-4b092a')"
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              />
            </div>
            <div class="col-md-4 col-12" id="fechafinkardex">
              <label for="fechafin">{{ $t('ui.fecha-final-c5ac08') }}</label>
              <q-input
                dense
                outlined
                v-model="fechafR"
                type="date"
                id="fechafin"
                :hint="$t('ui.fecha-de-fin-para-el-reporte-c83e34')"
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              />
            </div>
            <div class="col-md-4 col-sm-6 col-xs-12" id="almacenkardex">
              <label for="almacen">{{ $t('ui.almacen-877395') }}</label>
              <q-select
                dense
                outlined
                v-model="almacenR"
                :options="almacenesOptions"
                id="almacen"
                option-label="almacen"
                option-value="idalmacen"
                emit-value
                map-options
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                @update:model-value="listaProductosDisponibles"
              />
            </div>
          </div>

          <div class="row q-col-gutter-x-md flex justify-start">
            <div class="col-md-4 col-sm-6 col-xs-12" id="productokardex">
              <label for="producto">{{ $t('ui.producto-814df9') }}</label>
              <q-select
                dense
                outlined
                v-model="idproductoR"
                use-input
                input-debounce="0"
                id="producto"
                :options="productosFiltrados"
                option-label="descripcion"
                option-value="id"
                emit-value
                map-options
                clearable
                @filter="filterProductos"
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ $t('ui.sin-resultados-926bea') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-mt-md justify-center">
            <q-btn
              id="btngenerarreportekardex"
              type="submit"
              :label="$t('ui.generar-reporte-eeafce')"
              color="primary"
              class="q-mr-sm"
            />
            <q-btn
              id="btnvistapreviakardex"
              v-if="datosFiltrados.length > 0"
              :label="$t('ui.vista-previa-del-reporte-60d956')"
              color="secondary"
              @click="cargarPDF"
            />
            <q-btn
              id="btnexcelkardex"
              v-if="datosFiltrados.length > 0"
              label="Descargar Excel"
              icon="table_view"
              color="green"
              class="q-ml-sm"
              @click="descargarExcel"
            />
            <!-- <q-btn
              v-if="datosFiltrados.length > 0"
              label="Saldos Registrados"
              color="secondary"
              @click="kardex = false"
            /> -->
          </div>
        </q-form>
      </q-card-section>

      <q-table
        id="tablakardex"
        :title="tituloConDivisa"
        :rows="datosFiltrados"
        :columns="columns"
        row-key="c"
        flat
        bordered
        class="kardex-table-bordered"
        :no-data-label="$t('ui.aun-no-se-ha-generado-ningun-reporte-df72d3')"
      >
        <!-- [kdx-pdf-format-header] Encabezado agrupado que replica el PDF del Kardex -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th rowspan="2" class="text-center text-weight-bold" style="vertical-align: middle">
              {{ $t('ui.kardex-fecha-4a1b2c') }}
            </q-th>
            <q-th rowspan="2" class="text-left text-weight-bold" style="vertical-align: middle">
              {{ $t('ui.kardex-descripcion-5b2c3d') }}
            </q-th>
            <q-th rowspan="2" class="text-center text-weight-bold" style="vertical-align: middle">
              {{ $t('ui.kardex-nro-dcto-6c3d4e') }}
            </q-th>
            <q-th colspan="3" class="text-center text-weight-bold">
              {{ $t('ui.kardex-control-fisico-7d4e5f') }}
            </q-th>
            <q-th rowspan="2" class="text-center text-weight-bold" style="vertical-align: middle">
              {{ $t('ui.kardex-costo-unitario-8e5f6a') }}
              <span v-if="divisaActiva">({{ divisaActiva }})</span>
            </q-th>
            <q-th colspan="3" class="text-center text-weight-bold">
              {{ $t('ui.kardex-control-valorado-9f6a7b') }}
              <span v-if="divisaActiva">({{ divisaActiva }})</span>
            </q-th>
          </q-tr>
          <q-tr :props="props">
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-entrada-a17b8c') }}</q-th>
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-salida-b28c9d') }}</q-th>
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-saldo-c39dae') }}</q-th>
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-ingreso-d4aebf') }}</q-th>
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-egreso-e5bfc0') }}</q-th>
            <q-th class="text-right text-weight-bold">{{ $t('ui.kardex-saldo-c39dae') }}</q-th>
          </q-tr>
        </template>

        <template v-slot:top-row>
          <q-tr>
            <q-td colspan="10" class="text-center q-py-xs">
              <q-btn
                flat
                dense
                color="primary"
                :label="$t('ui.mostrar-ocultar-saldos-iniciales-3b5e41')"
                @click="mostrarSaldos = !mostrarSaldos"
              />
            </q-td>
          </q-tr>

          <!-- [kdx-saldos-fix] Feedback cuando se activa el toggle pero no hay datos -->
          <q-tr v-if="mostrarSaldos && saldosIniciales.length === 0" class="bg-grey-2">
            <q-td colspan="10" class="text-center text-grey-7">
              {{ $t('ui.no-se-encontraron-saldos-iniciales-141eb6') }}
            </q-td>
          </q-tr>

          <!-- Filas de saldos iniciales, solo visibles si mostrarSaldos es true -->
          <q-tr
            v-for="(item, index) in saldosIniciales"
            :key="index"
            v-show="mostrarSaldos"
            class="bg-amber-1"
          >
            <q-td>{{ item.Fecha ? cambiarFormatoFecha(item.Fecha) : '' }}</q-td>
            <q-td style="align-items: center">{{ item.Concepto }}</q-td>
            <q-td class="text-center">{{
              item.Documento ?? item['Nº Dcto.'] ?? item.idstock ?? ''
            }}</q-td>
            <q-td class="text-right">{{ item.Entrada }}</q-td>
            <q-td class="text-right">{{ item.Salida }}</q-td>
            <q-td class="text-right">{{ item.Existencia }}</q-td>
            <q-td class="text-right">{{ parseFloat(item['C.Unit']).toFixed(2) }}</q-td>
            <q-td class="text-right">{{ parseFloat(item.Debe).toFixed(2) }}</q-td>
            <q-td class="text-right">{{ parseFloat(item.Haber).toFixed(2) }}</q-td>
            <q-td class="text-right">{{ parseFloat(item.Saldo).toFixed(2) }}</q-td>
          </q-tr>
        </template>
      </q-table>
      <q-dialog v-model="mostrarPDF" full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
            <q-space />
            <q-btn flat round icon="close" @click="mostrarPDF = false" />
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
      <kardexSaldoFinal :saldo-final="saldoFinal" />
      <!-- <div class="row flex justify-end">
        <q-btn
          color="green"
          text-color="white"
          label="Confirmar saldo final"
          @click="registrarSaldoFinal"
        />
      </div> -->
    </div>
    <div v-else>
      <saldosPage :producto="idproductoR" @close="kardex = true" />
    </div>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesG'
import { PDFKardex } from 'src/utils/pdfs/Kardex/reporte.js'
import {
  obtenerFechaActualDato,
  obtenerFechaPrimerDiaMesActual,
  cambiarFormatoFecha,
} from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import kardexSaldoFinal from './kardexSaldoFinal.vue'
import saldosPage from './saldosPage.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const currencyStore = useCurrencyStore()
const divisaActiva = computed(() => {
  const v = currencyStore.simbolo
  return v && typeof v === 'object' && 'value' in v ? (v.value ?? '') : (v ?? '')
})
console.log(divisaActiva)
const usuario = validarUsuario()[0]
const $q = useQuasar()
const kardex = ref(true)
// Variables del formulario
const fechaiR = ref(obtenerFechaPrimerDiaMesActual())
const fechafR = ref(obtenerFechaActualDato())
const almacenR = ref(null)
const idproductoR = ref(null)
const metodoValoracion = ref('PEPS') // Valor por defecto
const saldoFinal = ref({})
const mostrarSaldos = ref(false) // controla si se muestran los saldos iniciales
const title = ref('')

const tituloConDivisa = computed(() => {
  const t = title.value
  const d = divisaActiva.value
  if (!t) return ''
  return d ? `${t} (${d})` : t
})

// Opciones para el selector de métodos

// Datos y estados
const almacenes = ref([])
const productosDisponibles = ref([])
const datosFiltrados = ref([])
const datosOriginales = ref([])
const movimientosOriginales = ref([]) // Almacena los movimientos sin procesar
const reporteGenerado = ref(false)
const mostrarPDF = ref(false)
const pdfData = ref(null)
const productosFiltrados = ref([])
const saldosIniciales = ref([])
// Función para alternar expandido

// Columnas de la tabla
// [kdx-pdf-format-columns] Columnas alineadas al formato del PDF del Kardex
const columns = computed(() => [
  {
    name: 'Fecha',
    label: i18nT('ui.kardex-fecha-4a1b2c'),
    field: 'Fecha',
    align: 'center',
    sortable: true,
    format: (val) => (val ? cambiarFormatoFecha(val) : ''),
  },
  {
    name: 'Concepto',
    label: i18nT('ui.kardex-descripcion-5b2c3d'),
    field: (row) => row.Concepto || row.Detalle || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Documento',
    label: i18nT('ui.kardex-nro-dcto-6c3d4e'),
    field: (row) =>
      row.Documento ??
      row['Nº Dcto.'] ??
      row.nroDcto ??
      row.numerodocumento ??
      row.nrodocumento ??
      row.documento ??
      row.idstock ??
      '',
    align: 'center',
    sortable: true,
  },
  {
    name: 'Entrada',
    label: i18nT('ui.kardex-entrada-a17b8c'),
    field: 'Entrada',
    align: 'right',
    sortable: true,
  },
  {
    name: 'Salida',
    label: i18nT('ui.kardex-salida-b28c9d'),
    field: 'Salida',
    align: 'right',
    sortable: true,
  },
  {
    name: 'Existencia',
    label: i18nT('ui.kardex-saldo-c39dae'),
    field: 'Existencia',
    align: 'right',
    sortable: true,
  },
  {
    name: 'CUnit',
    label: i18nT('ui.kardex-costo-unitario-8e5f6a'),
    field: 'C.Unit',
    align: 'right',
    sortable: true,
    format: (val) => parseFloat(val || 0).toFixed(2),
  },
  {
    name: 'Debe',
    label: i18nT('ui.kardex-ingreso-d4aebf'),
    field: 'Debe',
    align: 'right',
    sortable: true,
    format: (val) => parseFloat(val || 0).toFixed(2),
  },
  {
    name: 'Haber',
    label: i18nT('ui.kardex-egreso-e5bfc0'),
    field: 'Haber',
    align: 'right',
    sortable: true,
    format: (val) => parseFloat(val || 0).toFixed(2),
  },
  {
    name: 'Saldo',
    label: i18nT('ui.kardex-saldo-c39dae'),
    field: 'Saldo',
    align: 'right',
    sortable: true,
    format: (val) => parseFloat(val || 0).toFixed(2),
  },
])

// Computed
const almacenesOptions = computed(() => {
  return [...almacenes.value]
})

const almacenLabel = computed(() => {
  const selected = almacenes.value.find((a) => a.idalmacen === almacenR.value)
  return selected ? selected.almacen : 'N/A'
})

const productoLabel = computed(() => {
  const selected = productosDisponibles.value.find((p) => p.id === idproductoR.value)
  return selected ? `${selected.codigo} - ${selected.descripcion}` : 'N/A'
})

// Métodos
// [kdx-perf-002] Cache por producto del texto normalizado (WeakMap -> GC automatico)
const _productSearchCache = new WeakMap()
function _getProductSearchText(p) {
  let s = _productSearchCache.get(p)
  if (s === undefined) {
    s = ((p.descripcion || '') + ' ' + (p.codigo || '')).toLowerCase()
    _productSearchCache.set(p, s)
  }
  return s
}

const filterProductos = (val, update) => {
  if (!val) {
    update(() => {
      productosFiltrados.value = productosDisponibles.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    productosFiltrados.value = productosDisponibles.value.filter((v) =>
      _getProductSearchText(v).includes(needle),
    )
  })
}

const validarFechas = () => {
  const fechaInicio = new Date(fechaiR.value)
  const fechaFin = new Date(fechafR.value)

  if (fechaInicio > fechaFin) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.la-fecha-de-inicio-no-puede-ser-mayor-que-la-fecha-d-32b79c'),
      position: 'top',
    })
    return false
  }
  return true
}

async function listaAlmacenes() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `listaResponsableAlmacenReportes/${idempresa}`

    const response = await api.get(endpoint)
    const data = response.data
    if (data && data.length > 0) {
      almacenes.value = data.filter((u) => u.idusuario === usuario.idusuario)
    } else {
      $q.notify({ type: 'negative', message: i18nT('ui.no-se-encontraron-almacenes-5ef22d') })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-almacenes-420531') })
  }
}

async function listaProductosDisponibles() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `listarProductoAlmacenKardex/${idempresa}`
    const response = await api.get(endpoint)
    const data = response.data
    if (data && data.length > 0) {
      if (almacenR.value === 0) {
        productosDisponibles.value = data
      } else {
        productosDisponibles.value = data.filter(
          (u) => Number(u.idalmacen) === Number(almacenR.value),
        )
      }
      productosFiltrados.value = productosDisponibles.value
    } else {
      productosDisponibles.value = []
      productosFiltrados.value = []
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-productos-095e2f') })
  }
}

async function generarReporte() {
  if (!fechaiR.value || !fechafR.value || !almacenR.value || !idproductoR.value) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.por-favor-ingrese-todos-los-datos-necesarios-324da9'),
      position: 'top',
    })
    return
  }

  if (!validarFechas()) {
    return
  }

  try {
    const endpoint = `kardex/${fechaiR.value}/${fechafR.value}/${almacenR.value}/${idproductoR.value}/${idempresa}`
    console.log(endpoint)
    const response = await api.get(endpoint)
    const data = response.data
    // Guardar los datos originales para recalcular con diferentes métodos
    movimientosOriginales.value = data
    datosOriginales.value = data
    console.log('datos que se estan mostrando', response.data)
    metodoValoracion.value = Object.keys(response.data)[0]
    title.value = 'Reporte Kardex ' + metodoValoracion.value
    procesarMovimientos()
    // Procesar según el método seleccionado
    reporteGenerado.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-generar-el-reporte-dadd3e') })
  }
}

function procesarMovimientos() {
  if (!movimientosOriginales.value || movimientosOriginales.value.length === 0) return

  switch (metodoValoracion.value) {
    case 'PEPS':
      datosFiltrados.value = calcularPEPS(movimientosOriginales.value)
      break
    case 'UEPS':
      datosFiltrados.value = calcularUEPS(movimientosOriginales.value)
      break
    case 'PROMEDIO':
      datosFiltrados.value = calcularPromedio(movimientosOriginales.value)
      break
    default:
      datosFiltrados.value = calcularPEPS(movimientosOriginales.value)
  }
}
// async function registrarSaldoFinal() {
//   const movimientos = movimientosOriginales.value
//   const saldo_peps = movimientos.PEPS.saldo_final
//   const saldo_ueps = movimientos.UEPS.saldo_final
//   const saldo_promedio = movimientos.PROMEDIO.saldo_final
//   console.log(saldo_peps, saldo_ueps, saldo_promedio)
//   const peps = {
//     ver: 'registrarSaldo',
//     id: idproductoR.value,
//     fecha: fechafR.value,
//     metodo: 'PEPS',
//     cantidad: saldo_peps['Existencia_Final'],
//     precio: saldo_peps['Precio_Unitario_Promedio_Ponderado_Final'],
//   }
//   const ueps = {
//     ver: 'registrarSaldo',
//     id: idproductoR.value,
//     fecha: fechafR.value,
//     metodo: 'UEPS',
//     cantidad: saldo_ueps['Existencia_Final'],
//     precio: saldo_ueps['Precio_Unitario_Promedio_Ponderado_Final'],
//   }
//   const promedio = {
//     ver: 'registrarSaldo',
//     id: idproductoR.value,
//     fecha: fechafR.value,
//     metodo: 'PROMEDIO',
//     cantidad: saldo_promedio['Existencia_Final'],
//     precio: saldo_promedio['Precio_Unitario_Promedio_Ponderado_Final'],
//   }
//   console.log(peps, ueps, promedio)
//   try {
//     const [resPEPS, resUEPS, resPROM] = await Promise.all([
//       api.post('', peps),
//       api.post('', ueps),
//       api.post('', promedio),
//     ])
//     console.log('PEPS:', resPEPS.data)
//     console.log('UEPS:', resUEPS.data)
//     console.log('PROMEDIO:', resPROM.data)
//   } catch (error) {
//     console.error('Error al registrar saldos:', error)
//   }
// }

// Métodos de valoración de inventarios
function calcularPEPS(movimientos) {
  saldoFinal.value = movimientos.PEPS.saldo_final
  const salida = filtrarLotesPendientes(movimientos.PEPS.kardex, fechaiR.value)
  saldosIniciales.value = salida.compras || []

  return salida.movimientosDespues || salida || []
}

function filtrarLotesPendientes(movimientos, fechaInicial) {
  // [kdx-perf-001] Comparacion lexicografica YMD (sin crear Date), particion en 1 pasada,
  // lookup O(1) por idstock y sin mutar los movimientos originales.
  const fechaStr = String(fechaInicial || '').slice(0, 10)

  const antes = []
  const despues = []
  for (let i = 0; i < movimientos.length; i++) {
    const m = movimientos[i]
    const f = String((m && m.Fecha) || '').slice(0, 10)
    if (f < fechaStr) antes.push(m)
    else despues.push(m)
  }

  const ultimo = antes.length > 0 ? antes[antes.length - 1] : null

  if (metodoValoracion.value === 'PROMEDIO') {
    const compras = ultimo
      ? [
          {
            idstock: ultimo.idstock,
            Fecha: ultimo.Fecha,
            Concepto: 'SALDO INICIAL',
            Entrada: 0,
            Salida: 0,
            Existencia: ultimo.Existencia,
            'C.Unit': ultimo['C.Unit'],
            Debe: 0,
            Haber: 0,
            Saldo: ultimo.Saldo,
            Costo_Promedio_Actual: ultimo['C.Unit'],
          },
        ]
      : []
    return { compras, movimientosDespues: despues }
  }

  if (!ultimo) {
    return { compras: [], movimientosDespues: despues }
  }

  if (!Array.isArray(ultimo.Lotes_Pendientes) || ultimo.Lotes_Pendientes.length === 0) {
    // [kdx-saldos-fix] Fallback: si el ultimo movimiento previo trae existencia
    // positiva pero sin lotes detallados, sintetizamos un saldo inicial para que
    // el toggle "Mostrar / Ocultar Saldos Iniciales" tenga algo visible.
    const existencia = Number(ultimo.Existencia) || 0
    if (existencia > 0) {
      const precio = Number(ultimo['C.Unit']) || 0
      return {
        compras: [
          {
            idstock: ultimo.idstock,
            Fecha: ultimo.Fecha,
            Concepto: 'SALDO INICIAL',
            Entrada: 0,
            Salida: 0,
            Existencia: existencia,
            'C.Unit': precio,
            Debe: existencia * precio,
            Haber: 0,
            Saldo: existencia * precio,
            ini: true,
          },
        ],
        movimientosDespues: despues,
      }
    }
    return { compras: [], movimientosDespues: despues }
  }

  const porIdstock = new Map()
  for (let i = 0; i < antes.length; i++) {
    const mov = antes[i]
    const id = Number(mov.idstock)
    if (!porIdstock.has(id)) porIdstock.set(id, mov)
  }

  const compras = []
  ultimo.Lotes_Pendientes.forEach((p, index) => {
    const base = porIdstock.get(Number(p.idstock)) || ultimo
    const cantidad = Number(p.cantidad) || 0
    const precio = Number(p.precio_unitario) || 0
    compras.push({
      idstock: base.idstock,
      Fecha: base.Fecha,
      Concepto: 'SALDO ' + (index + 1),
      Entrada: cantidad,
      Salida: 0,
      Existencia: cantidad,
      'C.Unit': precio,
      Debe: cantidad * precio,
      Haber: 0,
      Saldo: cantidad * precio,
      ini: true,
      Lotes_Pendientes: [{ idstock: p.idstock, cantidad, precio_unitario: precio }],
    })
  })
  console.log('compras', compras)

  return { compras, movimientosDespues: despues }
}
function calcularUEPS(movimientos) {
  console.log(movimientos)

  saldoFinal.value = movimientos.UEPS.saldo_final
  const salida = filtrarLotesPendientes(movimientos.UEPS.kardex, fechaiR.value)
  saldosIniciales.value = salida.compras || []

  return salida.movimientosDespues || salida || []
}
function calcularPromedio(movimientos) {
  console.log(movimientos)

  saldoFinal.value = movimientos.PROMEDIO.saldo_final
  const salida = filtrarLotesPendientes(movimientos.PROMEDIO.kardex, fechaiR.value)
  saldosIniciales.value = salida.compras || []

  return salida.movimientosDespues || salida || []
}

async function cargarPDF() {
  if (datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.no-se-ha-generado-ningun-reporte-para-previsualizar-94e65c'),
      position: 'top',
    })
    return
  }

  const productoSeleccionado = productosDisponibles.value.find(
    (p) => Number(p.id) === Number(idproductoR.value),
  )
  console.log('producto seleccionado', productoSeleccionado)
  console.log('datos filtrados', datosFiltrados.value)
  console.log('datos originales ', datosOriginales.value)

  if (!movimientosOriginales.value || movimientosOriginales.value.length === 0) return
  const datos = datosOriginales.value
  let informacionProducto = []
  switch (metodoValoracion.value) {
    case 'PEPS':
      informacionProducto = datos.PEPS.info_producto
      break
    case 'UEPS':
      informacionProducto = datos.UEPS.info_producto
      break
    case 'PROMEDIO':
      informacionProducto = datos.PROMEDIO.info_producto
      break
    default:
      informacionProducto = datos.PEPS.info_producto
  }
  console.log('informacionProducto', informacionProducto)
  try {
    const doc = await PDFKardex(
      datosFiltrados.value,
      almacenLabel.value,
      productoLabel.value,
      fechaiR.value,
      fechafR.value,
      metodoValoracion.value,
      {
        saldosIniciales: saldosIniciales.value,
        informacionProducto: informacionProducto,
        divisa: divisaActiva.value,
      },
    )
    pdfData.value = doc.output('dataurlstring')
    mostrarPDF.value = true
  } catch (error) {
    console.error('Error al generar el PDF del Kardex:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.hubo-un-error-al-procesar-los-datos-para-continuar-e65596'),
      position: 'top',
    })
  }
}

function descargarExcel() {
  if (datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.no-se-ha-generado-ningun-reporte-para-previsualizar-94e65c'),
      position: 'top',
    })
    return
  }

  const divisa = divisaActiva.value || ''
  const metodo = metodoValoracion.value || ''
  const fechaIni = cambiarFormatoFecha(fechaiR.value)
  const fechaFin = cambiarFormatoFecha(fechafR.value)
  const almacen = almacenLabel.value
  const producto = productoLabel.value

  const divisaSuffix = divisa ? ' (' + divisa + ')' : ''
  const headers = [
    i18nT('ui.kardex-fecha-4a1b2c'),
    i18nT('ui.kardex-descripcion-5b2c3d'),
    i18nT('ui.kardex-nro-dcto-6c3d4e'),
    i18nT('ui.kardex-entrada-a17b8c'),
    i18nT('ui.kardex-salida-b28c9d'),
    i18nT('ui.kardex-saldo-existencia-f6d0a1') + divisaSuffix,
    i18nT('ui.kardex-costo-unitario-8e5f6a') + divisaSuffix,
    i18nT('ui.kardex-ingreso-d4aebf') + divisaSuffix,
    i18nT('ui.kardex-egreso-e5bfc0') + divisaSuffix,
    i18nT('ui.kardex-saldo-c39dae') + divisaSuffix,
  ]

  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const fmtNum = (v) => {
    const n = parseFloat(v ?? 0)
    return isNaN(n) ? '0.00' : n.toFixed(2)
  }

  const docField = (row) =>
    row.Documento ??
    row['Nº Dcto.'] ??
    row.nroDcto ??
    row.numerodocumento ??
    row.nrodocumento ??
    row.documento ??
    row.idstock ??
    ''

  const totalCols = headers.length
  const headerRow = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" /><style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 4px 6px; font-family: Arial; font-size: 11px; }
    th { background: #1976d2; color: #fff; font-weight: bold; text-align: center; }
    .title { font-size: 14px; font-weight: bold; text-align: center; }
    .meta { font-size: 11px; }
    .num { text-align: right; }
    .center { text-align: center; }
    .subhead { background: #bbdefb; font-weight: bold; text-align: center; }
  </style></head><body><table>`

  html += `<tr><td colspan="${totalCols}" class="title">${escapeHtml(`Reporte Kardex ${metodo}${divisa ? ' (' + divisa + ')' : ''}`)}</td></tr>`
  html += `<tr><td colspan="${totalCols}" class="meta">Almacén: <b>${escapeHtml(almacen)}</b> &nbsp;&nbsp; Producto: <b>${escapeHtml(producto)}</b></td></tr>`
  html += `<tr><td colspan="${totalCols}" class="meta">Rango: <b>${escapeHtml(fechaIni)}</b> a <b>${escapeHtml(fechaFin)}</b> &nbsp;&nbsp; Método: <b>${escapeHtml(metodo)}</b></td></tr>`
  html += `<tr><td colspan="${totalCols}"></td></tr>`

  if (mostrarSaldos.value && saldosIniciales.value.length > 0) {
    html += `<tr><td colspan="${totalCols}" class="subhead">SALDOS INICIALES</td></tr>`
    html += headerRow
    saldosIniciales.value.forEach((item) => {
      html += `<tr>
        <td class="center">${escapeHtml(item.Fecha ? cambiarFormatoFecha(item.Fecha) : '')}</td>
        <td>${escapeHtml(item.Concepto || '')}</td>
        <td class="center">${escapeHtml(docField(item))}</td>
        <td class="num">${escapeHtml(item.Entrada ?? '')}</td>
        <td class="num">${escapeHtml(item.Salida ?? '')}</td>
        <td class="num">${escapeHtml(item.Existencia ?? '')}</td>
        <td class="num">${fmtNum(item['C.Unit'])}</td>
        <td class="num">${fmtNum(item.Debe)}</td>
        <td class="num">${fmtNum(item.Haber)}</td>
        <td class="num">${fmtNum(item.Saldo)}</td>
      </tr>`
    })
    html += `<tr><td colspan="${totalCols}"></td></tr>`
  }

  html += `<tr><td colspan="${totalCols}" class="subhead">MOVIMIENTOS</td></tr>`
  html += headerRow
  datosFiltrados.value.forEach((row) => {
    html += `<tr>
      <td class="center">${escapeHtml(row.Fecha ? cambiarFormatoFecha(row.Fecha) : '')}</td>
      <td>${escapeHtml(row.Concepto || row.Detalle || '')}</td>
      <td class="center">${escapeHtml(docField(row))}</td>
      <td class="num">${escapeHtml(row.Entrada ?? '')}</td>
      <td class="num">${escapeHtml(row.Salida ?? '')}</td>
      <td class="num">${escapeHtml(row.Existencia ?? '')}</td>
      <td class="num">${fmtNum(row['C.Unit'])}</td>
      <td class="num">${fmtNum(row.Debe)}</td>
      <td class="num">${fmtNum(row.Haber)}</td>
      <td class="num">${fmtNum(row.Saldo)}</td>
    </tr>`
  })

  html += `</table></body></html>`

  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Kardex_${metodo}_${fechaiR.value}_${fechafR.value}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Excel descargado correctamente',
    position: 'top',
  })
}

onMounted(async () => {
  await listaAlmacenes()
  if (almacenes.value.length > 0) {
    almacenR.value = almacenes.value[0].idalmacen
  }
  listaProductosDisponibles()
})
</script>

<style scoped>
.kardex-table-bordered :deep(table) {
  border-collapse: collapse !important;
}

.kardex-table-bordered :deep(thead th),
.kardex-table-bordered :deep(tbody td) {
  border: 1px solid #9e9e9e !important;
}

.kardex-table-bordered :deep(thead th) {
  border-color: #000 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.invoice {
  position: relative;
  background-color: var(--cm-surface);
  min-height: 680px;
  padding: 15px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #c9c9c9;
}

.invoice .company-details {
  text-align: left;
}

.invoice .company-details img {
  border-radius: 50%;
}

.invoice .contacts {
  margin-bottom: 20px;
}
</style>
