<template>
  <q-page padding>
    <q-form @submit="cargarDatosIniciales" @reset="onReset">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="fechaini">Fecha Inicial</label>
          <q-input
            v-model="fechaini"
            id="fechaini"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="fechafin">Fecha Final</label>
          <q-input
            v-model="fechafin"
            id="fechafin"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="puntoventa">Punto de venta</label>
          <q-select
            v-model="model_puntoVenta"
            :options="puntosVenta"
            id="puntoventa"
            dense
            outlined
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-3 flex justify-center q-mt-lg">
          <q-btn color="primary" text-color="white" label="Generar" type="submit" />
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
        <div class="text-subtitle1 q-mb-md">Cierre por Concepto Ventas</div>

        <q-markup-table flat bordered dense class="q-mb-md">
          <thead>
            <tr>
              <th class="text-left">Método de Pago</th>
              <th class="text-right">Según Sistema</th>
              <th class="text-right">Según Arqueo</th>
              <th class="text-right">Diferencia</th>
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
        <div class="text-subtitle1 q-mb-md">Cierre por Concepto Cotización</div>

        <q-markup-table flat bordered dense class="q-mb-md" title="">
          <thead>
            <tr>
              <th class="text-left">Método de Pago</th>
              <th class="text-right">Según Sistema</th>
              <th class="text-right">Según Arqueo</th>
              <th class="text-right">Diferencia</th>
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
        <div class="text-subtitle1 q-mb-md">Arqueo de Caja Efectivo</div>

        <q-markup-table flat bordered dense class="q-mb-md">
          <thead>
            <tr>
              <th class="text-left">Denominación</th>
              <th class="text-left">Cantidad</th>
              <th class="text-left">Subtotal</th>
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
              <q-item-label class="text-weight-bold">Total Contado:</q-item-label>
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
          label="Observaciones (obligatorio)"
          type="textarea"
          outlined
          :rules="[(val) => !!val || 'Este campo es obligatorio si hay diferencia']"
        />
      </div>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="negative" flat @click="resetForm" />

        <q-btn
          :label="'Cerrar Caja'"
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
import { ref, reactive, onMounted, toRaw } from 'vue'
import { useQuasar } from 'quasar'
//import { useCajaStore } from 'stores/caja' // Asegúrate de que este store exista
import { api } from 'src/boot/axios'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { decimas, redondear, obtenerFechaActualDato } from 'src/composables/FuncionesG'
// import { validarUsuario } from 'src/composables/FuncionesG'
const currencyStore = useCurrencyStore()
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
  { valor: 200, cantidad: 0, label: 'Billetes de 200' },
  { valor: 100, cantidad: 0, label: 'Billetes de 100' },
  { valor: 50, cantidad: 0, label: 'Billetes de 50' },
  { valor: 20, cantidad: 0, label: 'Billetes de 20' },
  { valor: 10, cantidad: 0, label: 'Billetes de 10' },
  { valor: 5, cantidad: 0, label: 'Monedas de 5' },
  { valor: 2, cantidad: 0, label: 'Monedas de 2' },
  { valor: 1, cantidad: 0, label: 'Monedas de 1' },
  { valor: 0.5, cantidad: 0, label: 'Monedas de 0.5' },
  { valor: 0.2, cantidad: 0, label: 'Monedas de 0.2' },
  { valor: 0.1, cantidad: 0, label: 'Monedas de 0.1' },
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

const formatCurrency = (value) => {
  console.log('Formatting value:', currencyStore.divisa)
  const { simbolo, locale, current } = currencyStore.divisa // Asume que el store proporciona tanto el símbolo como el código de la moneda
  if (typeof value !== 'number') return `${simbolo} 0.00`
  // Utiliza `codigo` para el `currency` y el `simbolo` para el formato si es necesario,
  // pero `toLocaleString` con el código ya debería manejar el símbolo.
  return value.toLocaleString(`${locale}`, { style: 'currency', currency: `${current}` })
}

const calcularTotalesArqueo = () => {
  totalContado.value = denominaciones.reduce((sum, d) => sum + d.cantidad * d.valor, 0)
  diferenciaArqueo.value = totalContado.value - totalSistemaArqueo.value
}

const calcularDiferenciaConcepto = (metodo) => {
  metodo.diferencia = metodo.totalContado - metodo.totalSistema
  diferenciaConceptoTotal.value = totalesPorMetodo.reduce((sum, m) => sum + m.diferencia, 0)
}
const calcularDiferenciaConceptoCotizacion = (metodo) => {
  metodo.diferencia = metodo.totalContado - metodo.totalSistema
  diferenciaConceptoTotal.value = totalesPorMetodoCotizacion.reduce(
    (sum, m) => sum + m.diferencia,
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
onMounted(() => {
  cargarPuntosDeVenta()
  crear_formato_cierre()
})
const cargarPuntosDeVenta = async () => {
  // Simulación de la API GET /api/caja/puntos-venta
  const response = await api.get(`puntosVentaUsuario/${idusuario}`)
  console.log('Puntos de Venta Response:', response.data)
  setTimeout(() => {
    puntosVenta.value = response.data.map((pv) => ({
      label: pv.nombre,
      value: pv.idpunto_venta,
    }))
    model_puntoVenta.value = puntosVenta.value[0]
  }, 500)
}

const cargarDatosIniciales = () => {
  isLoading.value = true
  // Simulación de la API GET /api/caja/datos-cierre
  setTimeout(async () => {
    const dataFicticia = {
      totalSistemaArqueo: 0,
      totalesPorMetodo: [
        { metodo: 'efectivo', label: 'Efectivo', totalSistema: 0 },
        { metodo: 'qr', label: 'QR', totalSistema: 0 },
        { metodo: 'transferencia', label: 'Transferencia', totalSistema: 0 },
        { metodo: 'debito', label: 'Débito', totalSistema: 0 },
        { metodo: 'credito', label: 'Crédito', totalSistema: 0 },
        { metodo: 'venta-credito', label: 'Venta a Crédito', totalSistema: 0 },
      ],
      arqueo_x_cotizacion: [
        { metodo: 'cotizacion-1', label: 'Cotización 1', monto: 0 },
        { metodo: 'cotizacion-2', label: 'Cotización 2', monto: 0 },
      ],
      arqueo_x_pv: [
        { id: 'efectivo', metodo: 'Efectivo', monto: 0 },
        { id: 'tarjeta', metodo: 'Tarjeta', monto: 0 },
      ],
      ingresos: 0,
      egresos: 0,
      anuladas: 0,
      cotizaciones: 0,
    }
    const puntoventa = model_puntoVenta.value
    if (!puntoventa) {
      $q.notify({ type: 'negative', message: 'Debe seleccionar un punto de venta.' })
      isLoading.value = false
      return
    }

    const point = `arqueoPuntoVenta/${fechaini.value}/${fechafin.value}/${puntoventa.value}/${idempresa}`
    console.log('Fetching data from:', point)
    const response = await api.get(point)
    console.log('Response:', response.data)
    const data = response.data || dataFicticia
    totalSistemaArqueo.value = dataFicticia.totalSistemaArqueo
    const cotizacion = response.data.arqueo_x_cotizacion || []
    const ventas = response.data.arqueo_x_pv || []

    // ** Corrección importante aquí **
    // Se transforma la data del API en el formato que el template espera
    datos.value = [
      {
        campo: 'ingresos',
        sistema: data.ingresos,
        totalContado: decimas(redondear(parseFloat(data.ingresos))),
        diferencia: 0,
      },
      {
        campo: 'egresos',
        sistema: data.egresos,
        totalContado: decimas(redondear(parseFloat(data.egresos))),
        diferencia: 0,
      },
      {
        campo: 'anulados',
        sistema: data.anuladas,
        totalContado: decimas(redondear(parseFloat(data.anuladas))),
        diferencia: 0,
      },
      {
        campo: 'cotizaciones',
        sistema: data.cotizaciones,
        totalContado: decimas(redondear(parseFloat(data.cotizaciones))),
        diferencia: 0,
      },
    ]

    totalesPorMetodo.splice(
      0,
      ventas.length,
      ...ventas.map((m) => ({
        metodo: m.id,
        label: m.metodo,
        totalSistema: m.monto,
        totalContado: decimas(redondear(parseFloat(m.monto))),
        diferencia: 0,
      })),
    )
    totalesPorMetodoCotizacion.splice(
      0,
      cotizacion.length,
      ...cotizacion.map((m) => ({
        metodo: m.id,
        label: m.metodo,
        totalSistema: m.monto,
        totalContado: decimas(redondear(parseFloat(m.monto))),
        diferencia: 0,
      })),
    )

    isLoading.value = false
  }, 1000)
}

const validarYEnviar = async () => {
  const puntoventa = model_puntoVenta.value
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
  const data = response.data
  console.log('Response from cierreCaja:', data)
  if (diferenciaArqueo.value !== 0 && !observacion.value) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar una observación si hay diferencia en el arqueo.',
    })
    return
  }
}

// const imprimirReporte = () => {
//   $q.notify({ type: 'info', message: 'Generando reporte de cierre simulado...' })
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
