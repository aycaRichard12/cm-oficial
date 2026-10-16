<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Informe de Inventario</div>
          <q-btn outline dense color="primary" icon="refresh" label="Recargar almacenes"
                 :loading="loadingAlmacenes" @click="cargarAlmacenes" />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select v-model="almacenSeleccionado" :options="opcionesAlmacenes"
                      emit-value map-options label="Almacén" dense outlined
                      :loading="loadingAlmacenes" :disable="loadingAlmacenes || loading">
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">Sin almacenes disponibles</q-item-section></q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-input v-model="fechaInicio" label="Fecha inicio" dense outlined readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaInicio" mask="YYYY-MM-DD" :options="fechaNoMayorHoy" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-input v-model="fechaFin" label="Fecha fin" dense outlined readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFin" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2 flex items-center">
            <q-btn color="primary" icon="assessment" label="Generar" class="full-width"
                   :loading="loading" :disable="!puedeGenerar" @click="generarInforme">
              <q-tooltip v-if="!puedeGenerar">Seleccione almacén, fecha inicio y fecha fin</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div v-if="fechaInicio && fechaFin && fechaInicio > fechaFin"
             class="text-negative text-caption q-mt-sm">
          <q-icon name="error" /> La fecha inicio no puede ser mayor que la fecha fin.
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="advertenciasRaiz.length" dense rounded
              class="bg-orange-1 text-orange-9 q-mb-md">
      <template v-slot:avatar>
        <q-icon name="warning" color="orange-9" />
      </template>
      <div class="text-caption">
        <div v-for="(adv, i) in advertenciasRaiz" :key="`raiz-${i}`">{{ adv }}</div>
      </div>
    </q-banner>

    <q-card flat bordered>
      <q-table :rows="filasVisibles" :columns="columnas" row-key="idProductoAlmacen"
               :loading="loading" :pagination="{ rowsPerPage: 25 }"
               :rows-per-page-options="[10, 25, 50, 100, 0]"
               dense flat binary-state-sort
               :no-data-label="!almacenSeleccionado || !fechaInicio || !fechaFin
                 ? 'Seleccione un almacén y un rango de fechas'
                 : 'Sin productos para los filtros seleccionados'">
        <template v-slot:top>
          <div class="row items-center full-width">
            <div class="text-subtitle1 text-weight-bold">
              Detalle por producto
              <q-badge v-if="filas.length" color="primary" class="q-ml-sm">{{ filas.length }}</q-badge>
            </div>
            <q-space />
            <q-toggle v-model="soloInconsistentes" label="Solo inconsistentes" dense color="negative" />
          </div>
        </template>

        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-chip outline color="primary" dense>{{ props.row.codigo }}</q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-descripcion="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.descripcion }}</div>
            <div class="text-caption text-grey">
              ID: {{ props.row.idProductoAlmacen }}
              <q-badge v-if="props.row.advertencias && props.row.advertencias.length"
                       color="orange" class="q-ml-xs"
                       :label="props.row.advertencias.length + ' adv.'">
                <q-tooltip>
                  <div v-for="(adv, i) in props.row.advertencias" :key="i">{{ adv }}</div>
                </q-tooltip>
              </q-badge>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-saldoInicial="props">
          <q-td :props="props" class="text-right">
            <div>{{ fmtCantidad(props.row.saldoInicial?.cantidad) }}</div>
            <div class="text-caption text-grey">{{ fmtMoneda(props.row.saldoInicial?.valor) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-comprasPeriodo="props">
          <q-td :props="props" class="text-right">
            <div class="text-positive">+{{ fmtCantidad(props.row.comprasPeriodo?.cantidad) }}</div>
            <div class="text-caption text-grey">{{ fmtMoneda(props.row.comprasPeriodo?.valor) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-salidasPeriodo="props">
          <q-td :props="props" class="text-right">
            <div class="text-negative">-{{ fmtCantidad(props.row.salidasPeriodo?.cantidad) }}</div>
            <div class="text-caption text-grey">{{ fmtMoneda(props.row.salidasPeriodo?.valor) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-saldoFinal="props">
          <q-td :props="props" class="text-right">
            <div class="text-weight-bold">{{ fmtCantidad(props.row.saldoFinal?.cantidad) }}</div>
            <div class="text-caption text-grey">{{ fmtMoneda(props.row.saldoFinal?.valor) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-cuadre="props">
          <q-td :props="props" class="text-center">
            <q-icon :name="props.row.cuadre?.consistente ? 'check_circle' : 'error'"
                    :color="props.row.cuadre?.consistente ? 'positive' : 'negative'" size="22px">
              <q-tooltip>
                Dif. cantidad: {{ fmtCantidad(props.row.cuadre?.diferenciaCantidad) }}<br />
                Dif. valor: {{ fmtMoneda(props.row.cuadre?.diferenciaValor) }}
              </q-tooltip>
            </q-icon>
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props" class="text-center">
            <q-btn flat dense round icon="visibility" color="primary" @click="abrirDetalle(props.row)">
              <q-tooltip>Ver compras / salidas del periodo</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogDetalle">
      <q-card style="min-width: 720px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ detalleActual?.codigo }} — {{ detalleActual?.descripcion }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Compras del periodo</div>
          <q-markup-table v-if="detalleActual?.detalle?.compras?.length" dense flat bordered>
            <thead>
              <tr>
                <th class="text-left">Fecha</th>
                <th class="text-left">Documento</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in detalleActual.detalle.compras" :key="`c-${i}`">
                <td>{{ c.fecha || c.fechaMovimiento || '' }}</td>
                <td>{{ c.documento || c.numero || '' }}</td>
                <td class="text-right">{{ fmtCantidad(c.cantidad) }}</td>
                <td class="text-right">{{ fmtMoneda(c.valor) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
          <div v-else class="text-caption text-grey">Sin compras en el periodo.</div>

          <div class="text-subtitle2 q-mt-md q-mb-sm">Salidas del periodo</div>
          <q-markup-table v-if="detalleActual?.detalle?.salidas?.length" dense flat bordered>
            <thead>
              <tr>
                <th class="text-left">Fecha</th>
                <th class="text-left">Documento</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in detalleActual.detalle.salidas" :key="`s-${i}`">
                <td>{{ s.fecha || s.fechaMovimiento || '' }}</td>
                <td>{{ s.documento || s.numero || '' }}</td>
                <td class="text-right">{{ fmtCantidad(s.cantidad) }}</td>
                <td class="text-right">{{ fmtMoneda(s.valor) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
          <div v-else class="text-caption text-grey">Sin salidas en el periodo.</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

const loading = ref(false)
const loadingAlmacenes = ref(false)
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const fechaInicio = ref('')
const fechaFin = ref('')
const filas = ref([])
const advertenciasRaiz = ref([])
const soloInconsistentes = ref(false)

const dialogDetalle = ref(false)
const detalleActual = ref(null)

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Producto', field: 'descripcion', align: 'left', sortable: true },
  { name: 'saldoInicial', label: 'Saldo inicial',
    field: (row) => row.saldoInicial?.cantidad ?? 0, align: 'right', sortable: true },
  { name: 'comprasPeriodo', label: 'Compras',
    field: (row) => row.comprasPeriodo?.cantidad ?? 0, align: 'right', sortable: true },
  { name: 'salidasPeriodo', label: 'Salidas',
    field: (row) => row.salidasPeriodo?.cantidad ?? 0, align: 'right', sortable: true },
  { name: 'saldoFinal', label: 'Saldo final',
    field: (row) => row.saldoFinal?.cantidad ?? 0, align: 'right', sortable: true },
  { name: 'cuadre', label: 'Cuadre',
    field: (row) => row.cuadre?.consistente ?? true, align: 'center', sortable: true },
  { name: 'detalle', label: '', align: 'center' },
]

const puedeGenerar = computed(
  () =>
    !!almacenSeleccionado.value &&
    /^\d{4}-\d{2}-\d{2}$/.test(fechaInicio.value) &&
    /^\d{4}-\d{2}-\d{2}$/.test(fechaFin.value) &&
    fechaInicio.value <= fechaFin.value,
)

const filasVisibles = computed(() => {
  if (!soloInconsistentes.value) return filas.value
  return filas.value.filter((f) => !f.cuadre?.consistente)
})

const fmtCantidad = (n) => {
  const v = Number(n ?? 0)
  return Number.isFinite(v) ? v.toLocaleString('es-ES', { maximumFractionDigits: 4 }) : '0'
}
const fmtMoneda = (n) => {
  const v = Number(n ?? 0)
  return Number.isFinite(v)
    ? v.toLocaleString('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 })
    : '$0.00'
}

const fechaNoMayorHoy = (dateStr) => {
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
  return dateStr <= hoy
}

async function cargarAlmacenes() {
  loadingAlmacenes.value = true
  try {
    const response = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
    if (Array.isArray(response.data)) {
      const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
      opcionesAlmacenes.value = filtrados.map((item) => ({
        label: item.almacen,
        value: item.idalmacen,
      }))
      const existe = opcionesAlmacenes.value.some((o) => o.value === almacenSeleccionado.value)
      if (!existe && opcionesAlmacenes.value.length > 0) {
        almacenSeleccionado.value = opcionesAlmacenes.value[0].value
      }
    }
  } catch (error) {
    console.error('[informeInventario] cargarAlmacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudo cargar la lista de almacenes.' })
  } finally {
    loadingAlmacenes.value = false
  }
}

async function generarInforme() {
  if (!puedeGenerar.value) return
  loading.value = true
  advertenciasRaiz.value = []
  filas.value = []
  try {
    const url = `obtenerSaldosFinales/${fechaInicio.value}/${fechaFin.value}/${almacenSeleccionado.value}`
    const response = await api.get(url)
    const body = response.data

    if (body?.estado === 'exito' && Array.isArray(body.data)) {
      filas.value = body.data
      if (Array.isArray(body.advertencias) && body.advertencias.length) {
        advertenciasRaiz.value = body.advertencias
      }
    } else {
      filas.value = []
      $q.notify({
        type: 'warning',
        message: body?.mensaje || 'La respuesta del servidor no contiene datos válidos.',
      })
    }
  } catch (error) {
    console.error('[informeInventario] generarInforme:', error)
    const msg =
      error?.response?.data?.mensaje ||
      'No se pudo generar el informe de inventario. Intente de nuevo.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loading.value = false
  }
}

function abrirDetalle(row) {
  detalleActual.value = row
  dialogDetalle.value = true
}

onMounted(async () => {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  fechaInicio.value = `${yyyy}-01-01`
  fechaFin.value = hoy.toISOString().slice(0, 10)
  await cargarAlmacenes()
})
</script>
