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
                    <q-item-section class="text-grey"> {{ $t('ui.sin-resultados-926bea') }} </q-item-section>
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
        :title="title"
        :rows="datosFiltrados"
        :columns="columns"
        row-key="c"
        flat
        bordered
        :no-data-label="$t('ui.aun-no-se-ha-generado-ningun-reporte-df72d3')"
      >
        <template v-slot:top-row>
          <q-tr style="height: 5px">
            <q-td colspan="10" class="text-center">
              <q-btn
                flat
                dense
                style="height: 4px"
                color="primary"
                :label="$t('ui.mostrar-ocultar-saldos-iniciales-3b5e41')"
                @click="mostrarSaldos = !mostrarSaldos"
              />
            </q-td>
          </q-tr>

          <!-- Filas de saldos iniciales, solo visibles si mostrarSaldos es true -->
          <q-tr
            v-for="(item, index) in saldosIniciales"
            :key="index"
            v-show="mostrarSaldos"
            class="bg-amber-1"
          >
            <q-td>{{ item.Fecha }}</q-td>
            <q-td style="align-items: center">{{ item.Concepto }}</q-td>
            <q-td class="text-right">{{ item.Entrada }}</q-td>
            <q-td class="text-right">{{ item.Salida }}</q-td>
            <q-td class="text-right">{{ item.Existencia }}</q-td>
            <q-td class="text-right">{{
              divisaActiva + ' ' + parseFloat(item['C.Unit']).toFixed(2)
            }}</q-td>
            <q-td class="text-right">{{
              divisaActiva + ' ' + parseFloat(item.Debe).toFixed(2)
            }}</q-td>
            <q-td class="text-right">{{
              divisaActiva + ' ' + parseFloat(item.Haber).toFixed(2)
            }}</q-td>
            <q-td class="text-right">{{
              divisaActiva + ' ' + parseFloat(item.Saldo).toFixed(2)
            }}</q-td>
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
import { PDFKardex } from 'src/utils/pdfReportGenerator'
import { obtenerFechaActualDato, obtenerFechaPrimerDiaMesActual } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import kardexSaldoFinal from './kardexSaldoFinal.vue'
import saldosPage from './saldosPage.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const divisaActiva = useCurrencyStore().simbolo
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
const columns = [
  { name: 'Fecha', label: i18nT('cotizacion.table.date'), field: 'Fecha', align: 'left', sortable: true },
  { name: 'Concepto', label: i18nT('ui.concepto-fc5069'), field: 'Concepto', align: 'left', sortable: true },
  { name: 'Entrada', label: i18nT('ui.entrada-73f831'), field: 'Entrada', align: 'right', sortable: true },
  { name: 'Salida', label: i18nT('ui.salida-13058e'), field: 'Salida', align: 'right', sortable: true },
  { name: 'Existencia', label: i18nT('ui.existencia-8b7404'), field: 'Existencia', align: 'right', sortable: true },
  {
    name: 'CUnit',
    label: i18nT('ui.costo-unitario-4ec928'),
    field: 'C.Unit',
    align: 'right',
    format: (val) => divisaActiva + ' ' + parseFloat(val).toFixed(2),
    sortable: true,
  },
  {
    name: 'Debe',
    label: i18nT('ui.debe-422ad3'),
    field: 'Debe',
    align: 'right',
    format: (val) => divisaActiva + ' ' + parseFloat(val).toFixed(2),
    sortable: true,
  },
  {
    name: 'Haber',
    label: i18nT('ui.haber-ce7d43'),
    field: 'Haber',
    align: 'right',
    format: (val) => divisaActiva + ' ' + parseFloat(val).toFixed(2),
    sortable: true,
  },
  {
    name: 'Saldo',
    label: i18nT('ui.saldo-8b0fcd'),
    field: 'Saldo',
    align: 'right',
    format: (val) => divisaActiva + ' ' + parseFloat(val).toFixed(2),
    sortable: true,
  },
]

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
const filterProductos = (val, update) => {
  if (val === '') {
    update(() => {
      productosFiltrados.value = productosDisponibles.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    productosFiltrados.value = productosDisponibles.value.filter(
      (v) =>
        v.descripcion.toLowerCase().indexOf(needle) > -1 ||
        v.codigo.toLowerCase().indexOf(needle) > -1,
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
  console.log(metodoValoracion.value)
  if (metodoValoracion.value == 'PROMEDIO') {
    const fechaFiltro = new Date(fechaInicial)
    console.log(metodoValoracion.value)

    // Movimientos posteriores o iguales a la fecha inicial
    const movDes = movimientos.filter((mov) => new Date(mov.Fecha) >= fechaFiltro)

    // Movimientos anteriores a la fecha inicial
    const movimientosAntes = movimientos.filter((mov) => new Date(mov.Fecha) < fechaFiltro)

    // Último movimiento antes de la fecha inicial
    const ultimo_movimiento =
      movimientosAntes.length > 0 ? movimientosAntes[movimientosAntes.length - 1] : null
    console.log(ultimo_movimiento)

    // Recorremos los lotes pendientes y generamos filas iniciales
    let compra = []
    if (ultimo_movimiento) {
      compra = [
        {
          idstock: ultimo_movimiento.idstock,
          Fecha: ultimo_movimiento.Fecha,
          Concepto: 'SALDO INICIAL',
          Entrada: 0,
          Salida: 0,
          Existencia: ultimo_movimiento.Existencia,
          'C.Unit': ultimo_movimiento['C.Unit'],
          Debe: 0,
          Haber: 0,
          Saldo: ultimo_movimiento.Saldo,
          Costo_Promedio_Actual: ultimo_movimiento['C.Unit'],
        },
      ]
    }

    console.log(compra)
    // Añadimos las filas de compras al inicio de movimientosDespues
    return { compras: compra || [], movimientosDespues: movDes || [] }
  } else {
    const fechaFiltro = new Date(fechaInicial)

    // Movimientos posteriores o iguales a la fecha inicial
    const movDes = movimientos.filter((mov) => new Date(mov.Fecha) >= fechaFiltro)

    // Movimientos anteriores a la fecha inicial
    const movimientosAntes = movimientos.filter((mov) => new Date(mov.Fecha) < fechaFiltro)

    // Último movimiento antes de la fecha inicial
    const ultimo_movimiento =
      movimientosAntes.length > 0 ? movimientosAntes[movimientosAntes.length - 1] : null

    if (!ultimo_movimiento || !ultimo_movimiento.Lotes_Pendientes) {
      // Si no hay lotes pendientes, devolvemos solo los movimientos posteriores
      return movDes
    }

    const com = []

    // Recorremos los lotes pendientes y generamos filas iniciales
    ultimo_movimiento.Lotes_Pendientes.forEach((p, index) => {
      const movimiento = movimientosAntes.find((obj) => Number(obj.idstock) === Number(p.idstock))
      if (movimiento) {
        movimiento.Concepto = 'SALDO ' + (index + 1)
        movimiento.Entrada = p.cantidad
        movimiento.Existencia = p.cantidad
        movimiento.Debe = parseFloat(p.cantidad) * parseFloat(p.precio_unitario)
        movimiento.Saldo = ultimo_movimiento.Saldo
        movimiento.ini = true
        com.push({ ...movimiento })
      }
    })
    console.log(com)
    console.log(movDes)
    // Añadimos las filas de compras al inicio de movimientosDespues
    return { compras: com || [], movimientosDespues: movDes || [] }
  }
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

function cargarPDF() {
  if (datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.no-se-ha-generado-ningun-reporte-para-previsualizar-94e65c'),
      position: 'top',
    })
    return
  }

  const doc = PDFKardex(
    datosFiltrados.value,
    almacenLabel.value,
    productoLabel.value,
    fechaiR.value,
    fechafR.value,
    metodoValoracion.value,
  )
  pdfData.value = doc.output('dataurlstring')
  mostrarPDF.value = true
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
