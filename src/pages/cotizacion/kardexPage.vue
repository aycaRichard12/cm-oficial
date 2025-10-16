<template>
  <q-page padding>
    <div v-if="kardex">
      <div class="titulo">Kardex de Productos</div>
      <q-card-section>
        <q-form @submit="generarReporte">
          <div class="row q-col-gutter-x-lg flex justify-center">
            <div class="col-md-4 col-12">
              <label for="fechaINi">Fecha Inicial *</label>
              <q-input
                v-model="fechaiR"
                type="date"
                id="fechaINi"
                dense
                outlined
                hint="Fecha de inicio para el reporte"
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-md-4 col-12">
              <label for="fechafin">Fecha Final *</label>
              <q-input
                dense
                outlined
                v-model="fechafR"
                type="date"
                id="fechafin"
                hint="Fecha de fin para el reporte"
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-md-4 col-sm-6 col-xs-12">
              <label for="almacen">Almacén *</label>
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
                :rules="[(val) => !!val || 'Campo requerido']"
                @update:model-value="listaProductosDisponibles"
              />
            </div>
          </div>

          <div class="row q-col-gutter-x-md flex justify-start">
            <div class="col-md-4 col-sm-6 col-xs-12">
              <label for="producto">Producto *</label>
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
                @filter="filterProductos"
                :rules="[(val) => !!val || 'Campo requerido']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> Sin resultados </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-md-4 col-sm-6 col-xs-12">
              <label for="metodo">Método de valoración *</label>
              <q-select
                dense
                outlined
                v-model="metodoValoracion"
                :options="metodosValoracion"
                id="metodo"
                emit-value
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
                @update:model-value="recalcularKardex"
              />
            </div>
          </div>
          <div class="row q-mt-md justify-center">
            <q-btn type="submit" label="Generar reporte" color="primary" class="q-mr-sm" />
            <q-btn
              v-if="datosFiltrados.length > 0"
              label="Vista previa del Reporte"
              color="secondary"
              @click="cargarPDF"
            />
            <q-btn
              v-if="datosFiltrados.length > 0"
              label="Saldos Registrados"
              color="secondary"
              @click="kardex = false"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-table
        title="Reporte Kardex"
        :rows="datosFiltrados"
        :columns="columns"
        row-key="c"
        flat
        bordered
        no-data-label="Aún no se ha generado ningún Reporte"
      />
      <q-dialog v-model="mostrarPDF" persistent full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Vista previa de PDF</div>
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
      <div class="row flex justify-end">
        <q-btn
          color="green"
          text-color="white"
          label="Confirmar saldo final"
          @click="registrarSaldoFinal"
        />
      </div>
    </div>
    <div v-else>
      <saldosPage :producto="idproductoR" @close="kardex = true" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesG'
import { PDFKardex } from 'src/utils/pdfReportGenerator'
import { obtenerFechaActualDato, obtenerFechaPrimerDiaMesActual } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import kardexSaldoFinal from './kardexSaldoFinal.vue'
import saldosPage from './saldosPage.vue'
const divisaActiva = useCurrencyStore()
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

// Opciones para el selector de métodos
const metodosValoracion = [
  { label: 'PEPS (Primeras Entradas, Primeras Salidas)', value: 'PEPS' },
  { label: 'UEPS (Últimas Entradas, Primeras Salidas)', value: 'UEPS' },
  { label: 'Promedio Ponderado', value: 'PROMEDIO' },
]

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

// Columnas de la tabla
const columns = [
  { name: 'Fecha', label: 'Fecha', field: 'Fecha', align: 'left', sortable: true },
  { name: 'Concepto', label: 'Concepto', field: 'Concepto', align: 'left', sortable: true },
  { name: 'Entrada', label: 'Entrada', field: 'Entrada', align: 'right', sortable: true },
  { name: 'Salida', label: 'Salida', field: 'Salida', align: 'right', sortable: true },
  { name: 'Existencia', label: 'Existencia', field: 'Existencia', align: 'right', sortable: true },
  {
    name: 'CUnit',
    label: 'C. Unitario',
    field: 'C.Unit',
    align: 'right',
    format: (val) => val,
    sortable: true,
  },
  {
    name: 'Debe',
    label: 'Debe',
    field: 'Debe',
    align: 'right',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
  {
    name: 'Haber',
    label: 'Haber',
    field: 'Haber',
    align: 'right',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
  {
    name: 'Saldo',
    label: 'Saldo',
    field: 'Saldo',
    align: 'right',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
]
const formatCurrency = (value) => {
  if (typeof value !== 'number') return value
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)
}
// Computed
const almacenesOptions = computed(() => {
  return [{ almacen: 'Todos los almacenes', idalmacen: 0 }, ...almacenes.value]
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
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
      position: 'top',
    })
    return false
  }
  return true
}

async function listaAlmacenes() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `listaResponsableAlmacen/${idempresa}`

    const response = await api.get(endpoint)
    const data = response.data
    console.log(data)
    if (data && data.length > 0) {
      almacenes.value = data.filter((u) => u.idusuario === usuario.idusuario)
    } else {
      $q.notify({ type: 'negative', message: 'No se encontraron almacenes.' })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar almacenes.' })
  }
}

async function listaProductosDisponibles() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `listaProductoAlmacen/${idempresa}`
    const response = await api.get(endpoint)
    const data = response.data
    console.log(data)
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
    $q.notify({ type: 'negative', message: 'Error al cargar productos.' })
  }
}

async function generarReporte() {
  if (!fechaiR.value || !fechafR.value || !almacenR.value || !idproductoR.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, ingrese todos los datos necesarios.',
      position: 'top',
    })
    return
  }

  if (!validarFechas()) {
    return
  }

  try {
    const endpoint = `kardex/${fechaiR.value}/${fechafR.value}/${almacenR.value}/${idproductoR.value}`
    console.log(endpoint)
    const response = await api.get(endpoint)
    const data = response.data
    console.log(data)
    // Guardar los datos originales para recalcular con diferentes métodos
    movimientosOriginales.value = data
    datosOriginales.value = data
    procesarMovimientos()
    // Procesar según el método seleccionado

    reporteGenerado.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el reporte.' })
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
async function registrarSaldoFinal() {
  const movimientos = movimientosOriginales.value
  const saldo_peps = movimientos.PEPS.saldo_final
  const saldo_ueps = movimientos.UEPS.saldo_final
  const saldo_promedio = movimientos.PROMEDIO.saldo_final
  console.log(saldo_peps, saldo_ueps, saldo_promedio)
  const peps = {
    ver: 'registrarSaldo',
    id: idproductoR.value,
    fecha: fechafR.value,
    metodo: 'PEPS',
    cantidad: saldo_peps['Existencia_Final'],
    precio: saldo_peps['Precio_Unitario_Promedio_Ponderado_Final'],
  }
  const ueps = {
    ver: 'registrarSaldo',
    id: idproductoR.value,
    fecha: fechafR.value,
    metodo: 'UEPS',
    cantidad: saldo_ueps['Existencia_Final'],
    precio: saldo_ueps['Precio_Unitario_Promedio_Ponderado_Final'],
  }
  const promedio = {
    ver: 'registrarSaldo',
    id: idproductoR.value,
    fecha: fechafR.value,
    metodo: 'PROMEDIO',
    cantidad: saldo_promedio['Existencia_Final'],
    precio: saldo_promedio['Precio_Unitario_Promedio_Ponderado_Final'],
  }
  console.log(peps, ueps, promedio)
  try {
    const [resPEPS, resUEPS, resPROM] = await Promise.all([
      api.post('', peps),
      api.post('', ueps),
      api.post('', promedio),
    ])
    console.log('PEPS:', resPEPS.data)
    console.log('UEPS:', resUEPS.data)
    console.log('PROMEDIO:', resPROM.data)
  } catch (error) {
    console.error('Error al registrar saldos:', error)
  }
}
function recalcularKardex() {
  if (reporteGenerado.value) {
    procesarMovimientos()
  }
}

// Métodos de valoración de inventarios
function calcularPEPS(movimientos) {
  console.log(movimientos.PEPS.kardex)

  let kardex = []
  kardex = movimientos.PEPS.kardex
  saldoFinal.value = movimientos.PEPS.saldo_final
  console.log(saldoFinal.value)

  return kardex
}

function calcularUEPS(movimientos) {
  console.log(movimientos)

  let kardex = []
  kardex = movimientos.UEPS.kardex
  saldoFinal.value = movimientos.UEPS.saldo_final
  console.log(saldoFinal.value)

  return kardex
}

function calcularPromedio(movimientos) {
  console.log(movimientos)

  let kardex = []
  kardex = movimientos.PROMEDIO.kardex
  saldoFinal.value = movimientos.PROMEDIO.saldo_final
  console.log(saldoFinal.value)

  return kardex
}

function cargarPDF() {
  if (datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No se ha generado ningún reporte para previsualizar.',
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

onMounted(() => {
  listaAlmacenes()
  listaProductosDisponibles()
})
</script>

<style scoped>
.invoice {
  position: relative;
  background-color: #fff;
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
