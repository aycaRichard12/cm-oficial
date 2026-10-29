<template>
  <q-page padding>
    <q-form @submit="cargarDatosIniciales" @reset="onReset">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="fechaini">{{ $t('ui.fecha-inicial-e467b4') }}</label>
          <q-input
            v-model="fechaini"
            id="fechaini"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="fechafin">{{ $t('ui.fecha-final-fcea71') }}</label>
          <q-input
            v-model="fechafin"
            id="fechafin"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="puntoventa">{{ $t('ui.punto-de-venta-f50489') }}</label>
          <q-select
            v-model="model_puntoVenta"
            :options="puntosVenta"
            id="puntoventa"
            dense
            outlined
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>
        <div class="col-12 col-md-3 flex justify-center q-mt-lg">
          <q-btn color="primary" text-color="white" :label="$t('ui.generar-1f31a1')" type="submit" />
        </div>
      </div>
    </q-form>

    <q-form @submit.prevent="validarYEnviar" class="q-gutter-md">
      <q-markup-table flat bordered>
        <thead>
          <tr class="bg-primary">
            <th v-for="(item, idx) in camposHorizontales" :key="idx" class="text-right bg-primary">
              {{ item }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in datos" :key="row.campo">
            <th class="text-right bg-primary text-white text-h5">{{ capitalizar(row.campo) }}</th>
            <td class="text-right">{{ formatCurrency(row.sistema) }}</td>
            <td class="text-left">
              <q-input
                v-model.number="row.totalContado"
                type="number"
                min="0"
                step="0.01"
                dense
                outlined
                @update:model-value="calcularDiferenciaConceptoI(row)"
              />
            </td>
            <td
              class="text-right"
              :class="{
                'text-red-8': row.diferencia !== 0,
                'text-green-8': row.diferencia === 0,
              }"
            >
              {{ formatCurrency(row.diferencia) }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-card-section>
        <div class="text-subtitle1 q-mb-md">{{ $t('ui.cierre-por-concepto-ventas-b09743') }}</div>

        <q-markup-table flat bordered dense class="q-mb-md">
          <thead>
            <tr>
              <th class="text-left">{{ $t('ui.metodo-de-pago-112f5f') }}</th>
              <th class="text-right">{{ $t('ui.segun-sistema-6bc043') }}</th>
              <th class="text-right">{{ $t('ui.segun-arqueo-d4bc85') }}</th>
              <th class="text-right">{{ $t('ui.diferencia-4fcda6') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metodo in totalesPorMetodo" :key="metodo.metodo">
              <td class="text-left">{{ metodo.label }}</td>
              <td class="text-right">{{ formatCurrency(metodo.totalSistema) }}</td>
              <td class="text-left">
                <q-input
                  v-model.number="metodo.totalContado"
                  type="number"
                  min="0"
                  step="0.01"
                  dense
                  outlined
                  @update:model-value="calcularDiferenciaConcepto(metodo)"
                />
              </td>
              <td
                class="text-right"
                :class="{
                  'text-red-8': metodo.diferencia !== 0,
                  'text-green-8': metodo.diferencia === 0,
                }"
              >
                {{ formatCurrency(metodo.diferencia) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
        <div class="text-subtitle1 q-mb-md">{{ $t('ui.cierre-por-concepto-cotizacion-16f9d3') }}</div>

        <q-markup-table flat bordered dense class="q-mb-md" title="">
          <thead>
            <tr>
              <th class="text-left">{{ $t('ui.metodo-de-pago-112f5f') }}</th>
              <th class="text-right">{{ $t('ui.segun-sistema-6bc043') }}</th>
              <th class="text-right">{{ $t('ui.segun-arqueo-d4bc85') }}</th>
              <th class="text-right">{{ $t('ui.diferencia-4fcda6') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metodo in totalesPorMetodoCotizacion" :key="metodo.metodo">
              <td class="text-left">{{ metodo.label }}</td>
              <td class="text-right">{{ formatCurrency(metodo.totalSistema) }}</td>
              <td class="text-left">
                <q-input
                  v-model.number="metodo.totalContado"
                  type="number"
                  min="0"
                  step="0.01"
                  dense
                  outlined
                  @update:model-value="calcularDiferenciaConceptoCotizacion(metodo)"
                />
              </td>
              <td
                class="text-right"
                :class="{
                  'text-red-8': metodo.diferencia !== 0,
                  'text-green-8': metodo.diferencia === 0,
                }"
              >
                {{ formatCurrency(metodo.diferencia) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 q-mb-md">{{ $t('ui.arqueo-de-caja-efectivo-30cac9') }}</div>

        <q-markup-table flat bordered dense class="q-mb-md">
          <thead>
            <tr>
              <th class="text-left">{{ $t('ui.denominacion-081d65') }}</th>
              <th class="text-left">{{ $t('ui.cantidad-b5b6f8') }}</th>
              <th class="text-left">{{ $t('ventas.subtotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="denominacion in denominaciones" :key="denominacion.valor">
              <td class="text-left">{{ denominacion.label }}</td>
              <td class="text-left">
                <q-input
                  v-model.number="denominacion.cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  dense
                  outlined
                  @update:model-value="calcularTotalesArqueo"
                  steep="0.01"
                />
              </td>
              <td class="text-left">
                {{ formatCurrency(denominacion.cantidad * denominacion.valor) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="q-gutter-sm q-mt-md">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t('ui.total-contado-5f41e1') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h6 text-green-8">{{
                formatCurrency(totalContado)
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
      <div class="q-gutter-sm q-mt-md">
        <q-input
          v-if="diferenciaArqueo !== 0"
          v-model="observacion"
          :label="$t('ui.observaciones-obligatorio-70aec4')"
          type="textarea"
          outlined
          :rules="[(val) => !!val || $t('ui.este-campo-es-obligatorio-si-hay-diferencia-8f3a9f')]"
        />
      </div>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn :label="$t('common.cancel')" color="negative" flat @click="resetForm" />

        <q-btn
          :label="$t('ui.cerrar-caja-eeb268')"
          color="primary"
          icon="save"
          type="submit"
          :disable="isLoading"
        >
        </q-btn>
      </q-card-actions>
    </q-form>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, reactive, onMounted, toRaw } from 'vue'
import { useQuasar } from 'quasar'
//import { useCajaStore } from 'stores/caja' // Asegúrate de que este store exista
import { api } from 'src/boot/axios'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { decimas, redondear, obtenerFechaActualDato } from 'src/composables/FuncionesG'
// import { validarUsuario } from 'src/composables/FuncionesG'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()
const $q = useQuasar()
//onst cajaStore = useCajaStore()
const puntosVenta = ref([])
const model_puntoVenta = ref('')
const isLoading = ref(false)
const cierreRealizado = ref(false)
const fechaini = ref(obtenerFechaActualDato())
const fechafin = ref(obtenerFechaActualDato())

const datos = ref([])
// Se corrige el encabezado para que coincida con las 5 columnas del cuerpo
const camposHorizontales = ['Concepto', 'Según Sistema', 'Según Arqueo', 'Diferencia']

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function calcularDiferenciaConceptoI(row) {
  row.diferencia = row.totalContado - row.sistema
}

const denominaciones = reactive([
  { valor: 200, cantidad: 0, label: i18nT('ui.billetes-de-200-9b4b9d') },
  { valor: 100, cantidad: 0, label: i18nT('ui.billetes-de-100-bff23c') },
  { valor: 50, cantidad: 0, label: i18nT('ui.billetes-de-50-aa2024') },
  { valor: 20, cantidad: 0, label: i18nT('ui.billetes-de-20-49cb46') },
  { valor: 10, cantidad: 0, label: i18nT('ui.billetes-de-10-d49800') },
  { valor: 5, cantidad: 0, label: i18nT('ui.monedas-de-5-91bd5c') },
  { valor: 2, cantidad: 0, label: i18nT('ui.monedas-de-2-34679b') },
  { valor: 1, cantidad: 0, label: i18nT('ui.monedas-de-1-cc98b5') },
  { valor: 0.5, cantidad: 0, label: i18nT('ui.monedas-de-0-5-538fb9') },
  { valor: 0.2, cantidad: 0, label: i18nT('ui.monedas-de-0-2-61b4d7') },
  { valor: 0.1, cantidad: 0, label: i18nT('ui.monedas-de-0-1-d9764e') },
])
const totalSistemaArqueo = ref(0)
const totalContado = ref(0)
const diferenciaArqueo = ref(0)

const totalesPorMetodo = reactive([])
const totalesPorMetodoCotizacion = reactive([])
const diferenciaConceptoTotal = ref(0)
const observacion = ref('')
// const metodosPagos = ref([])

//const isCajaAbierta = computed(() => cajaStore.isCajaAbierta)

const emit = defineEmits(['success'])

const formatCurrency = (value) => {
  if (!currencyStore.divisa) return `$ ${value?.toFixed(2) || '0.00'}`
  const { simbolo, locale, current } = currencyStore.divisa
  if (typeof value !== 'number') return `${simbolo} 0.00`
  return value.toLocaleString(`${locale}`, { style: 'currency', currency: `${current}` })
}

const calcularTotalesArqueo = () => {
  totalContado.value = denominaciones.reduce((sum, d) => sum + d.cantidad * d.valor, 0)
  diferenciaArqueo.value = totalContado.value - totalSistemaArqueo.value
}

const calcularDiferenciaConcepto = (metodo) => {
  metodo.diferencia = (metodo.totalContado || 0) - (metodo.totalSistema || 0)
  diferenciaConceptoTotal.value = totalesPorMetodo.reduce((sum, m) => sum + (m.diferencia || 0), 0)
}
const calcularDiferenciaConceptoCotizacion = (metodo) => {
  metodo.diferencia = (metodo.totalContado || 0) - (metodo.totalSistema || 0)
  diferenciaConceptoTotal.value = totalesPorMetodoCotizacion.reduce(
    (sum, m) => sum + (m.diferencia || 0),
    0,
  )
}

const crear_formato_cierre = () => {
  const cierre = {
    fecha: '2025-08-01 - 2025-08-14',
    idempresa: '50',
    pv: model_puntoVenta.value,
    cotizaciones: { segunSistema: 0, segunArqueo: 0, diferencia: 0 },
    ingresos: { segunSistema: 0, segunArqueo: 0, diferencia: 0 },
    anuladas: { segunSistema: 0, segunArqueo: 0, diferencia: 0 },
    egresos: { segunSistema: 0, segunArqueo: 0, diferencia: 0 },
    arqueo_x_pv: [],
    arqueo_x_cotizacion: [],
  }
  console.log('Formato de cierre creado:', cierre)
}
// const cargarMetodoPagoFactura = async () => {
//   try {
//     const respuesta = await validarUsuario()
//     const token = respuesta[0]?.factura?.access_token
//     const tipo = respuesta[0]?.factura?.tipo
//     const idempresa = respuesta[0]?.empresa?.idempresa
//     const response = await api.get(`listaMetodopagoFactura/${idempresa}/${token}/${tipo}`)
//     const filtrado = response.data.filter((u) => u.estado == 1)
//     console.log(response.data)
//     metodosPagos.value = filtrado.map((item) => ({
//       label: item.nombre,
//       value: item.id,
//     }))
//   } catch (error) {
//     console.error('Error cargando canales:', error)
//   }
// }
onMounted(async () => {
  await currencyStore.cargarDivisaActiva()

  if (!currencyStore.divisa) {
    console.error('No se pudo cargar la divisa')
    return
  }
  await cargarPuntosDeVenta()
  await crear_formato_cierre()
})
const cargarPuntosDeVenta = async () => {
  try {
    const response = await api.get(`puntosVentaUsuario/${idusuario}`)
    console.log('Puntos de Venta Response:', response.data)
    puntosVenta.value = response.data.map((pv) => ({
      label: pv.nombre,
      value: pv.idpunto_venta,
    }))
    if (puntosVenta.value.length > 0) {
      model_puntoVenta.value = puntosVenta.value[0]
    }
  } catch (error) {
    console.error('Error al cargar puntos de venta:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-los-puntos-de-venta-5af7df') })
  }
}

const cargarDatosIniciales = async () => {
  const puntoventa = model_puntoVenta.value
  if (!puntoventa) {
    $q.notify({ type: 'negative', message: i18nT('ui.debe-seleccionar-un-punto-de-venta-2ccb87') })
    return
  }

  isLoading.value = true
  try {
    const point = `arqueoPuntoVenta/${fechaini.value}/${fechafin.value}/${puntoventa.value}/${idempresa}`
    console.log('Fetching data from:', point)
    const response = await api.get(point)
    console.log('Response:', response.data)

    const data = response.data || {}
    totalSistemaArqueo.value = data.totalSistemaArqueo || 0
    const cotizacion = data.arqueo_x_cotizacion || []
    const ventas = data.arqueo_x_pv || []

    datos.value = [
      {
        campo: 'ingresos',
        sistema: parseFloat(data.ingresos || 0),
        totalContado: decimas(redondear(parseFloat(data.ingresos || 0))),
        diferencia: 0,
      },
      {
        campo: 'egresos',
        sistema: parseFloat(data.egresos || 0),
        totalContado: decimas(redondear(parseFloat(data.egresos || 0))),
        diferencia: 0,
      },
      {
        campo: 'anulados',
        sistema: parseFloat(data.anuladas || 0),
        totalContado: decimas(redondear(parseFloat(data.anuladas || 0))),
        diferencia: 0,
      },
      {
        campo: 'cotizaciones',
        sistema: parseFloat(data.cotizaciones || 0),
        totalContado: decimas(redondear(parseFloat(data.cotizaciones || 0))),
        diferencia: 0,
      },
    ]

    totalesPorMetodo.splice(0, totalesPorMetodo.length)
    ventas.forEach((m) => {
      totalesPorMetodo.push({
        metodo: m.id,
        label: m.metodo,
        totalSistema: m.monto,
        totalContado: decimas(redondear(parseFloat(m.monto))),
        diferencia: 0,
      })
    })

    totalesPorMetodoCotizacion.splice(0, totalesPorMetodoCotizacion.length)
    cotizacion.forEach((m) => {
      totalesPorMetodoCotizacion.push({
        metodo: m.id,
        label: m.metodo,
        totalSistema: m.monto,
        totalContado: decimas(redondear(parseFloat(m.monto))),
        diferencia: 0,
      })
    })

    calcularTotalesArqueo()
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-los-datos-del-arqueo-4a5e43') })
  } finally {
    isLoading.value = false
  }
}

const validarYEnviar = async () => {
  const puntoventa = model_puntoVenta.value
  if (!puntoventa) {
    $q.notify({ type: 'negative', message: i18nT('ui.debe-seleccionar-un-punto-de-venta-2ccb87') })
    return
  }

  if (diferenciaArqueo.value !== 0 && !observacion.value) {
    $q.notify({
      type: 'negative',
      message: i18nT('ui.debe-ingresar-una-observacion-si-hay-diferencia-en-e-9c5218'),
    })
    return
  }

  isLoading.value = true
  try {
    const cierre = {
      ver: 'registrarCierre',
      idusuario: idusuario,
      idempresa: idempresa,
      fechaInicio: fechaini.value,
      fechaFin: fechafin.value,
      puntoVenta: puntoventa.value,
      caja: toRaw(datos.value),
      totalesPorMetodo: toRaw(totalesPorMetodo),
      totalesPorMetodoCotizacion: toRaw(totalesPorMetodoCotizacion),
      denominaciones: toRaw(denominaciones),
      observacion: observacion.value,
    }
    console.log('Cierre de Caja:', cierre)

    const response = await api.post('', cierre)
    console.log('Response from cierreCaja:', response.data)

    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: i18nT('ui.cierre-de-caja-registrado-exitosamente-6dfc59') })
      emit('success')
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || i18nT('ui.error-al-registrar-el-cierre-de-caja-0f964c'),
      })
    }
  } catch (error) {
    console.error('Error al registrar cierre:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-de-conexion-al-registrar-el-cierre-a94b25') })
  } finally {
    isLoading.value = false
  }
}

// const imprimirReporte = () => {
//   $q.notify({ type: 'info', message: Generando reporte de cierre simulado... })
// }

const resetForm = () => {
  denominaciones.forEach((d) => (d.cantidad = 0))
  totalContado.value = 0
  diferenciaArqueo.value = 0
  observacion.value = ''
  cierreRealizado.value = false
  cargarDatosIniciales()
}
</script>

<style scoped>
.text-red-8 {
  color: #c10015;
}
.text-green-8 {
  color: #21ba45;
}
@media (max-width: 600px) {
  .q-pa-md {
    padding: 8px;
  }
  .text-h6 {
    font-size: 1.2rem;
  }
}
</style>
