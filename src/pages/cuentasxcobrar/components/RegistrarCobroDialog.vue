<template>
  <q-dialog v-model="model" persistent>
    <q-card style="width: 680px; max-width: 96vw">
      <!-- Cabecera -->
      <q-card-section class="bg-primary text-white row items-center q-py-sm">
        <q-icon name="payments" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Registrar Cobro</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cerrar" />
      </q-card-section>

      <!-- Bloque de información -->
      <q-card-section class="q-pb-xs">
        <div class="row q-col-gutter-md q-mb-sm">
          <div class="col-12 col-sm-7">
            <div
              class="q-pa-sm bg-grey-2 rounded-borders"
              style="border-left: 4px solid var(--q-primary)"
            >
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                style="font-size: 0.65rem"
              >
                Cliente
              </div>
              <div class="text-subtitle2 text-weight-bolder">{{ localFormulario.cliente }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-5">
            <div
              class="q-pa-sm bg-grey-2 rounded-borders"
              style="border-left: 4px solid var(--q-primary)"
            >
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                style="font-size: 0.65rem"
              >
                Sucursal
              </div>
              <div class="text-subtitle2 text-weight-bolder">{{ localFormulario.sucursal }}</div>
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-xs text-center bg-blue-1 border-blue-2">
              <div
                class="text-caption text-blue-9 text-uppercase text-weight-bold"
                style="font-size: 0.6rem"
              >
                Total Venta
              </div>
              <div class="text-subtitle1 text-weight-bold text-primary">
                {{ localFormulario.deudaTotal }} <small class="text-caption">{{ divisa }}</small>
              </div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-xs text-center bg-orange-1 border-orange-2">
              <div
                class="text-caption text-orange-9 text-uppercase text-weight-bold"
                style="font-size: 0.6rem"
              >
                Saldo
              </div>
              <div class="text-subtitle1 text-weight-bold text-deep-orange">
                {{ localFormulario.saldoPendiente }}
                <small class="text-caption">{{ divisa }}</small>
              </div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-xs text-center bg-red-1 border-red-2">
              <div
                class="text-caption text-red-9 text-uppercase text-weight-bold"
                style="font-size: 0.6rem"
              >
                Cuotas Pend.
              </div>
              <div class="text-subtitle1 text-weight-bold text-negative">
                {{ localFormulario.cuotasPendientes }}
              </div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-xs text-center bg-green-1 border-green-2">
              <div
                class="text-caption text-green-9 text-uppercase text-weight-bold"
                style="font-size: 0.6rem"
              >
                V. Cuota
              </div>
              <div class="text-subtitle1 text-weight-bold text-positive">
                {{ localFormulario.valorCuota }} <small class="text-caption">{{ divisa }}</small>
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <q-form ref="formRef" @submit="guardar" greedy>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                :model-value="fechaMostrar"
                id="fecharegistrocobro"
                label="Fecha de cobro"
                dense
                outlined
                readonly
                :rules="[() => !!localFormulario.fecha || 'Seleccione una fecha']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-primary">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="localFormulario.fecha" mask="YYYY-MM-DD" today-btn @update:model-value="onFieldUpdate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localFormulario.numeroCobros"
                id="nrocobrosregistrocobro"
                label="N° Cobros"
                type="number"
                min="1"
                :max="localFormulario.cuotasPendientes"
                step="1"
                dense
                outlined
                :rules="[
                  (val) => !!val || 'Campo requerido'
                ]"
                :disable="localFormulario.cuotasPendientes === 1"
                :hint="
                  localFormulario.cuotasPendientes > 1
                    ? `Pendientes: ${localFormulario.cuotasPendientes}`
                    : ''
                "
                @keypress="onNumeroCobrosKeypress"
                @update:model-value="onNumeroCobrosInput"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="localFormulario.totalCobro"
                id="totalacobrarregistrocobro"
                label="Total a Cobrar"
                type="number"
                min="0.01"
                :max="localFormulario.saldoPendiente"
                step="0.01"
                dense
                outlined
                :rules="[
                  (val) => !!val || 'Campo requerido',
                  (val) => parseFloat(val) > 0 || 'Debe ser mayor a 0',
                  (val) =>
                    parseFloat(val) <= parseFloat(localFormulario.saldoPendiente) ||
                    `No puede superar el saldo`,
                ]"
                :disable="localFormulario.cuotasPendientes === 1"
                :hint="`Saldo disponible: ${localFormulario.saldoPendiente} ${divisa}`"
                @update:model-value="() => { onFieldUpdate(); $emit('calcular-numero-cobros') }"
              >
                <template v-slot:append>
                  <span class="text-weight-bold text-grey-7">{{ divisa }}</span>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6 flex items-center">
              <q-card
                flat
                bordered
                class="full-width q-pa-sm text-center"
                :class="
                  parseFloat(localFormulario.saldoPorCobrar) < 0
                    ? 'bg-red-1 border-red-3'
                    : 'bg-green-1 border-green-3'
                "
              >
                <div
                  class="text-caption text-grey-7 text-uppercase text-weight-bold"
                  style="font-size: 0.6rem"
                >
                  Nuevo Saldo
                </div>
                <div
                  class="text-h6 text-weight-bolder"
                  :class="
                    parseFloat(localFormulario.saldoPorCobrar) < 0
                      ? 'text-negative'
                      : 'text-primary'
                  "
                >
                  {{ localFormulario.saldoPorCobrar }}
                  <small class="text-caption">{{ divisa }}</small>
                </div>
              </q-card>
            </div>

            <div class="col-12">
              <q-file
                v-model="localFormulario.comprobante"
                id="comprobanteregistrocobro"
                label="Adjuntar Comprobante (JPG, PNG, PDF)"
                dense
                outlined
                accept=".jpg,.jpeg,.png,.pdf"
                max-file-size="5242880"
                @update:model-value="onArchivoCambiado"
                @rejected="
                  $q.notify({ type: 'negative', message: 'Archivo no válido o demasiado grande' })
                "
                :loading="isCompressing"
                :disable="isCompressing"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" color="primary" />
                </template>
              </q-file>

              <div v-if="previewUrl" class="q-mt-sm rounded-borders overflow-hidden border-grey-4">
                <div
                  v-if="localFormulario.tipoArchivo === 'pdf'"
                  class="q-pa-md bg-red-1 border-red-2 text-red-9 row items-center rounded-borders"
                >
                  <q-icon name="picture_as_pdf" size="lg" />
                  <div class="q-ml-md">
                    <div class="text-weight-bold">PDF Seleccionado</div>
                    <div class="text-caption text-grey-9 truncate" style="max-width: 250px">
                      {{ localFormulario.comprobante?.name }}
                    </div>
                  </div>
                </div>
                <q-img
                  v-else
                  :src="previewUrl"
                  style="max-height: 200px"
                  fit="contain"
                  class="bg-grey-1"
                />
              </div>
            </div>
          </div>

          <q-banner
            v-if="parseFloat(localFormulario.saldoPorCobrar) < 0"
            dense
            rounded
            class="bg-negative text-white q-mt-md"
            icon="warning"
          >
            El monto ingresado excede el saldo pendiente.
          </q-banner>

          <div class="q-mt-lg row justify-center q-gutter-sm">
            <q-btn
              label="Registrar Cobro"
              type="submit"
              color="primary"
              icon="check_circle"
              unelevated
              :disable="parseFloat(localFormulario.saldoPorCobrar) < 0 || isCompressing"
              :loading="isCompressing"
            />
            <q-btn label="Cancelar" color="grey-7" flat icon="close" @click="cerrar" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch, reactive } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  formulario: Object,
  divisa: String,
  isCompressing: Boolean,
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'submit',
  'handle-archivo',
  'calcular-totales',
  'calcular-numero-cobros',
  'update:formulario',
])

const localFormulario = reactive({ ...(props.formulario || {}) })

// keep local copy in sync when parent updates the prop
watch(
  () => props.formulario,
  (newVal) => {
    if (newVal) Object.assign(localFormulario, newVal)
  },
  { deep: true },
)

// emit updates when localFormulario changes to avoid mutating props directly
// No deep watch. We sync explicitly in the event handlers.

const $q = useQuasar()
const previewUrl = ref(null)

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const fechaMostrar = computed(() => {
  const f = localFormulario.fecha
  if (!f) return ''
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
})

function onNumeroCobrosKeypress(e) {
  // Evitar cualquier caracter que no sea número estricto
  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
    e.preventDefault()
  }
}

function onNumeroCobrosInput(val) {
  if (val === '' || val === null) {
    onFieldUpdate()
    emit('calcular-totales')
    return
  }
  
  let validVal = Math.floor(Number(val))
  let maximo = localFormulario.cuotasPendientes

  if (validVal < 1) {
    validVal = 1
  } else if (validVal > maximo) {
    validVal = maximo
  }

  localFormulario.numeroCobros = validVal
  
  onFieldUpdate()
  emit('calcular-totales')
}

function onFieldUpdate() {
  emit('update:formulario', { ...localFormulario })
}

function onArchivoCambiado(file) {
  onFieldUpdate()
  emit('handle-archivo', file)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file ? URL.createObjectURL(file) : null
}

function cerrar() {
  emit('update:modelValue', false)
  emit('close')
}

function guardar() {
  // Same here, avoid JSON.stringify to not destroy File objects
  emit('submit', { ...localFormulario })
}

watch(model, (abierto) => {
  if (!abierto && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
})
</script>
