<template>
  <q-page class="q-pa-md">
    <!-- Vista principal -->
    <div v-if="vistaActiva === 'principal'">
      <div class="row q-col-gutter-x-md q-mb-md">
        <div
          v-if="opcionesAlmacenes.length > 1"
          class="col-12 col-md-3"
          id="filtroalmacencuentasporcobrar"
        >
          <label for="almacen">Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="opcionesAlmacenes"
            id="almacen"
            dense
            outlined
            style="min-width: 200px"
            map-options
            class="q-mr-sm"
          />
        </div>

        <div v-else-if="opcionesAlmacenes.length === 1" class="col-12 col-md-3">
          <label>Almacén</label>
          <q-input :model-value="opcionesAlmacenes[0].label" dense outlined readonly class="q-mr-sm" />
        </div>

        <div class="col-12 col-md-3" id="filtroestadocuentasporcobrar">
          <label for="estado">Tipo</label>
          <q-select
            v-model="filtroEstado"
            :options="opcionesTipo"
            id="estado"
            dense
            outlined
            map-options
            clearable
          />
        </div>
      </div>

      <tablaCuentasxCobrar
        ref="refHijo"
        :rows="datosFiltrados"
        @cargar-formulario="cargarFormulario"
        @mostrar-detalles="mostrarDetalles"
      />
    </div>

    <!-- ─── Diálogo Registrar Cobro ─────────────────────────────────────────── -->
    <q-dialog v-model="mostrarForm" persistent>
      <q-card style="width: 680px; max-width: 96vw">

        <!-- Cabecera -->
        <q-card-section class="bg-primary text-white row items-center q-py-sm">
          <q-icon name="payments" size="sm" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Registrar Cobro</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cerrarFormulario" />
        </q-card-section>

        <!-- Bloque de información (solo lectura, sin casillas) -->
        <q-card-section class="q-pb-xs">
          <div class="row q-col-gutter-md q-mb-sm">
            <!-- Cliente -->
            <div class="col-12 col-sm-7">
              <div class="info-block">
                <div class="info-block__label">Cliente</div>
                <div class="info-block__value">{{ formulario.cliente }}</div>
              </div>
            </div>
            <!-- Sucursal -->
            <div class="col-12 col-sm-5">
              <div class="info-block">
                <div class="info-block__label">Sucursal</div>
                <div class="info-block__value">{{ formulario.sucursal }}</div>
              </div>
            </div>
          </div>

          <!-- Resumen de montos -->
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm-3">
              <div class="stat-chip">
                <div class="stat-chip__label">Total Venta</div>
                <div class="stat-chip__value text-primary">{{ formulario.deudaTotal }} <span class="stat-chip__currency">{{ divisa }}</span></div>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="stat-chip">
                <div class="stat-chip__label">Saldo</div>
                <div class="stat-chip__value text-deep-orange">{{ formulario.saldoPendiente }} <span class="stat-chip__currency">{{ divisa }}</span></div>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="stat-chip">
                <div class="stat-chip__label">Cuotas Pendientes</div>
                <div class="stat-chip__value text-negative">{{ formulario.cuotasPendientes }}</div>
              </div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="stat-chip">
                <div class="stat-chip__label">Cuota Individual</div>
                <div class="stat-chip__value text-positive">{{ formulario.valorCuota }} <span class="stat-chip__currency">{{ divisa }}</span></div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Campos editables -->
        <q-card-section class="q-pt-md">
          <q-form ref="formRef" @submit="() => registrarCobro(cargarDatos)" greedy>
            <div class="row q-col-gutter-md">

              <!-- Fecha (popup dd/mm/yyyy) -->
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="fechaMostrar"
                  id="fecharegistrocobro"
                  label="Fecha de cobro"
                  dense
                  outlined
                  readonly
                  lazy-rules
                  :rules="[() => !!formulario.fecha || 'Seleccione una fecha']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formulario.fecha" mask="YYYY-MM-DD" today-btn>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- N° Cobros -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="formulario.numeroCobros"
                  id="nrocobrosregistrocobro"
                  label="N° Cobros"
                  type="number"
                  min="1"
                  :max="formulario.cuotasPendientes"
                  step="1"
                  dense
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => (val !== null && val !== '' && val !== undefined) || 'Campo requerido',
                    (val) => Number(val) > 0 || 'Debe ser mayor a 0',
                    (val) => Number.isInteger(Number(val)) || 'Debe ser un número entero',
                    (val) => Number(val) <= formulario.cuotasPendientes || `Máximo ${formulario.cuotasPendientes} cuota(s) pendiente(s)`,
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  :hint="formulario.cuotasPendientes > 1 ? `Pendientes: ${formulario.cuotasPendientes}` : ''"
                  @update:model-value="calcularTotales"
                />
              </div>

              <!-- Total a Cobrar -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.totalCobro"
                  id="totalacobrarregistrocobro"
                  label="Total a Cobrar"
                  type="number"
                  min="0.01"
                  :max="formulario.saldoPendiente"
                  step="0.01"
                  dense
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => (val !== null && val !== '') || 'Campo requerido',
                    (val) => parseFloat(val) > 0 || 'Debe ser mayor a 0',
                    (val) => parseFloat(val) <= parseFloat(formulario.saldoPendiente) || `No puede superar el saldo (${formulario.saldoPendiente} ${divisa})`,
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  :hint="`Saldo disponible: ${formulario.saldoPendiente} ${divisa}`"
                  @update:model-value="calcularNumeroCobros"
                >
                  <template v-slot:append>
                    <span class="text-weight-bold text-grey-7">{{ divisa }}</span>
                  </template>
                </q-input>
              </div>

              <!-- Saldo por Cobrar (informativo) -->
              <div class="col-12 col-sm-6 flex items-center">
                <div
                  class="stat-chip full-width"
                  :class="parseFloat(formulario.saldoPorCobrar) < 0 ? 'stat-chip--error' : 'stat-chip--accent'"
                >
                  <div class="stat-chip__label">Saldo por Cobrar</div>
                  <div
                    class="stat-chip__value text-h6"
                    :class="parseFloat(formulario.saldoPorCobrar) < 0 ? 'text-negative' : 'text-primary'"
                  >
                    {{ formulario.saldoPorCobrar }}
                    <span class="stat-chip__currency">{{ divisa }}</span>
                  </div>
                  <div v-if="parseFloat(formulario.saldoPorCobrar) < 0" class="text-negative" style="font-size:0.7rem">
                    ⚠ El monto cobrado supera el saldo
                  </div>
                </div>
              </div>

              <!-- Comprobante (imagen o PDF) -->
              <div class="col-12">
                <q-file
                  v-model="formulario.comprobante"
                  id="comprobanteregistrocobro"
                  label="Comprobante (imagen)"
                  dense
                  outlined
                  accept=".jpg,.jpeg,.png"
                  max-file-size="5242880"
                  lazy-rules
                  :rules="[(val) => !val || val.size <= 5242880 || 'Máximo 5 MB permitido']"
                  @update:model-value="handleArchivo"
                  @rejected="onArchivoRechazado"
                  :loading="isCompressing"
                  :disable="isCompressing"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" color="primary" />
                  </template>
                  <template v-slot:hint>JPG o PNG · Máximo 5 MB · La imagen se optimizará automáticamente</template>
                </q-file>

                <!-- Preview del archivo -->
                <div v-if="previewUrl" class="q-mt-sm preview-container">
                  <q-img
                    :src="previewUrl"
                    style="max-height: 180px; border-radius: 8px; border: 1px solid #ddd"
                    fit="contain"
                  />
                </div>
              </div>
            </div>

            <!-- Alerta saldo negativo -->
            <q-banner
              v-if="parseFloat(formulario.saldoPorCobrar) < 0"
              dense
              rounded
              class="bg-negative text-white q-mt-md"
              icon="warning"
            >
              El monto a cobrar supera el saldo pendiente. Corrija el Total a Cobrar.
            </q-banner>

            <div class="q-mt-lg row justify-center q-gutter-sm">
              <q-btn
                id="btnregistrarcobroformulario"
                label="Registrar Cobro"
                type="submit"
                color="primary"
                icon="check_circle"
                unelevated
                :disable="parseFloat(formulario.saldoPorCobrar) < 0 || isCompressing"
                :loading="isCompressing"
              />
              <q-btn label="Cancelar" color="grey-7" flat icon="close" @click="cerrarFormulario" />
            </div>
          </q-form>
        </q-card-section>
        </q-card>
    </q-dialog>

    <!-- Vista de detalles -->
    <div v-if="vistaActiva === 'detalles'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <q-btn
            id="btnvolverdetallescobro"
            label="Volver"
            icon="arrow_back"
            color="primary"
            @click="vistaActiva = 'principal'"
          />
        </div>
        <div class="col text-center">
          <div class="text-h6">Detalle de Cobros Realizados</div>
        </div>
        <div class="col"></div>
      </div>

      <q-table
        id="tabladetallescobro"
        :rows="detallesCobros"
        :columns="columnasDetalles"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:body-cell-comprobante="props">
          <q-td :props="props">
            <q-btn
              v-if="props.value"
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click="mostrarImagen(props.value)"
              title="Ver comprobante"
            />
          </q-td>
        </template>
      </q-table>

      <div class="row q-mt-md">
        <div class="col-8"></div>
        <div class="col-4">
          <q-markup-table flat bordered>
            <tbody>
              <tr>
                <td class="text-right">Total Venta</td>
                <td>{{ formatoMoneda(detalleSeleccionado.totalVenta) }}</td>
              </tr>
              <tr>
                <td class="text-right">Total Cobrado</td>
                <td>{{ formatoMoneda(totalCobrado) }}</td>
              </tr>
              <tr>
                <td class="text-right">Saldo</td>
                <td>{{ formatoMoneda(detalleSeleccionado.saldo) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <!-- Diálogo comprobante (imagen o PDF) -->
    <q-dialog v-model="mostrarDialogoImagen" maximized>
      <q-card class="column" style="height: 100%">
        <q-card-section class="bg-primary text-white row items-center q-py-sm q-flex-none">
          <div class="text-h6">Comprobante de Cobro</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pa-none flex flex-center" style="min-height: 0; overflow: auto; padding: 16px">
          <q-img
            :src="imagenSeleccionada"
            style="max-width: 100%; max-height: 100%"
            fit="contain"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-flex-none">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { decimas, redondear } from 'src/composables/FuncionesG'
import emitter from 'src/event-bus'
import tablaCuentasxCobrar from './tablaCuentasxCobrar.vue'
import { useCuentasxCobrar } from './composables/useCuentasxCobrar'

// ─── Composable ──────────────────────────────────────────────────────────────
const {
  vistaActiva,
  mostrarForm,
  mostrarDialogoImagen,
  imagenSeleccionada,
  divisa,
  opcionesAlmacenes,
  filtroAlmacen,
  filtroEstado,
  opcionesTipo,
  datosFiltrados,
  detallesCobros,
  detalleSeleccionado,
  totalCobrado,
  formulario,
  cargarAlmacenesAutorizados,
  cargarDatos,
  cargarFormulario,
  calcularTotales,
  calcularNumeroCobros,
  convertirImagen,
  registrarCobro,
  cerrarFormulario,
  mostrarDetalles,
  mostrarImagen,
  formatoMoneda,
  isCompressing,
} = useCuentasxCobrar()

const $q = useQuasar()

// ─── Ref formulario ──────────────────────────────────────────────────────────
const formRef = ref(null)

// ─── Preview del comprobante ──────────────────────────────────────────────────
const previewUrl = ref(null)

function handleArchivo(file) {
  // 1. Procesar el archivo para el FormData (composable)
  convertirImagen(file)

  // 2. Liberar URL anterior
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }

  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
}

function onArchivoRechazado(entries) {
  const { failedPropValidation } = entries[0]
  if (failedPropValidation === 'max-file-size') {
    $q.notify({ type: 'negative', message: 'El archivo supera el límite de 5 MB.' })
  } else {
    $q.notify({ type: 'negative', message: 'Tipo de archivo no permitido.' })
  }
}

// Limpia la preview al cerrar el diálogo
watch(mostrarForm, (abierto) => {
  if (!abierto && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
})

// ─── Fecha en formato dd/mm/yyyy ─────────────────────────────────────────────
const fechaMostrar = computed(() => {
  const f = formulario.value.fecha
  if (!f) return ''
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
})

// ─── Ref tabla hija ──────────────────────────────────────────────────────────
const refHijo = ref(null)

// ─── Columnas detalle ────────────────────────────────────────────────────────
const columnasDetalles = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecha', label: 'Fecha de cobro', field: 'fecha', align: 'center' },
  {
    name: 'cuotas',
    label: 'N° cobros',
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
  {
    name: 'monto',
    label: 'Total cobro',
    field: 'monto',
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val))),
  },
]

// ─── Teclado ─────────────────────────────────────────────────────────────────
function handleKeydown(e) {
  if (e.key === 'Escape') cerrarFormulario()
}

// ─── Ciclo de vida ───────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await cargarAlmacenesAutorizados()
  await cargarDatos()
  emitter.on('realizar-pago', (notification) => {
    const btn = document.getElementById(`btn-${notification.id}`)
    if (btn) btn.click()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* ── Bloque de información (campos readonly como texto) ──────────── */
.info-block {
  padding: 6px 10px;
  border-left: 3px solid var(--q-primary);
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  min-height: 44px;
}
.info-block__label {
  font-size: 0.72rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.2;
}
.info-block__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #222;
  word-break: break-word;
}

/* ── Chips de estadísticas (Total venta, Saldo, etc.) ───────────── */
.stat-chip {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
  border: 1px solid #e0e4ea;
}
.stat-chip--accent {
  background: #e8f0fe;
  border-color: #c5d5fb;
}
.stat-chip--error {
  background: #fff0f0;
  border-color: #ffbbbb;
}
.stat-chip__label {
  font-size: 0.7rem;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}
.stat-chip__value {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.stat-chip__currency {
  font-size: 0.75rem;
  font-weight: 400;
  color: #888;
}

/* ── Preview comprobante ─────────────────────────────────────────── */
.preview-container {
  border-radius: 8px;
  overflow: hidden;
}
.pdf-preview-badge {
  display: flex;
  align-items: center;
  background: #fff3f3;
  border: 1px solid #ffc7c7;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #333;
}
</style>
