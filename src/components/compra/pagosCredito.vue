<template>
  <q-form @submit.prevent="crearPago" ref="formularioRef">
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12 col-sm-6">
          <q-input
            v-model.number="formData.monto_total"
            id="monto"
            type="number"
            dense
            filled
            bg-color="grey-2"
            label="Monto Total del Crédito *"
            stack-label
            disable
            input-class="text-weight-bold text-grey-9"
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
            (val) => val > 0 || 'El monto debe ser mayor a 0',
          ]"
          >
            <template v-slot:prepend>
              <q-icon name="account_balance_wallet" size="xs" color="grey-7" />
            </template>
            <template v-slot:append>
              <span class="text-grey-9 text-weight-bold">{{ divisaActiva.simbolo }}</span>
            </template>
          </q-input>
        </div>

        <!-- Número de Cuotas -->
        <div class="col-xs-12 col-sm-6">
          <q-input
            v-model.number="formData.nro_cuotas"
            id="numero"
            type="number"
            dense
            filled
            bg-color="grey-2"
            label="Número de Cuotas *"
            stack-label
            lazy-rules
            :rules="[
              (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
              (val) => val > 0 || 'Debe haber al menos 1 cuota',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="format_list_numbered" size="xs" color="grey-7" />
            </template>
          </q-input>
        </div>

        <!-- Frecuencia de Pago -->
        <div class="col-xs-12 col-sm-6">
          <q-input
            v-model.number="formData.pago_cada_ciertos_dias"
            id="frecuencia"
            type="number"
            dense
            filled
            bg-color="grey-2"
            label="Frecuencia de Pago (en días) *"
            stack-label
            lazy-rules
            :rules="[
              (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
              (val) => val > 0 || 'La frecuencia debe ser de al menos 1 día',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="event_repeat" size="xs" color="grey-7" />
            </template>
            <template v-slot:hint>
              <span class="text-grey-8">Ej: 30 (mensual), 7 (semanal)</span>
            </template>
          </q-input>
        </div>

        <!-- Fecha de Inicio -->
        <div class="col-xs-12 col-sm-6">
          <q-input
            type="date"
            dense
            filled
            bg-color="grey-2"
            label="Fecha de Inicio del Primer Pago *"
            stack-label
            v-model="formData.fecha_inicio"
            id="fecha"
            :rules="[(val) => !!val || 'Debe seleccionar una fecha']"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" size="xs" color="grey-7" />
            </template>
          </q-input>
        </div>

        <!-- Cálculo del Monto por Cuota -->
        <div class="col-xs-12 col-sm-12 flex items-center justify-end q-pt-sm" v-if="montoPorCuotaNumero > 0">
          <q-item class="bg-primary-1 full-width rounded-borders text-right">
            <q-item-section>
              <q-item-label class="text-caption text-grey-7 text-weight-medium text-right">Monto Estimado por Cuota</q-item-label>
              <q-item-label class="text-h6 text-primary text-weight-bold row items-center justify-end">
                <q-icon name="payments" size="sm" class="q-mr-sm" />
                {{ montoPorCuotaFormateado }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md bg-transparent">
      <q-btn
        label="Generar Plan"
        type="submit"
        color="primary"
        icon="playlist_add_check"
        unelevated
        no-caps
        rounded
        :class="$q.screen.lt.sm ? 'full-width' : 'q-px-xl'"
        :loading="cargando"
      >
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          Procesando...
        </template>
      </q-btn>
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, computed } from 'vue' // Se importa 'computed'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { showDialog } from 'src/utils/dialogs'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
const divisaActiva = useCurrencyStore()
const emit = defineEmits(['cerrar'])

function cerrarFormulario() {
  emit('cerrar')
}
const props = defineProps({
  compra: Object,
})
// 1. INICIALIZACIÓN (sin cambios)
const $q = useQuasar()
const formularioRef = ref(null)
const cargando = ref(false)
const formData = ref({
  ver: 'registrarCompraCredito',
  compra_id: props.compra.id,
  monto_total: props.compra.total,
  nro_cuotas: null,
  fecha_inicio: obtenerFechaActualDato(),
  pago_cada_ciertos_dias: null,
})

// 2. LÓGICA DE NEGOCIO Y PROPIEDADES COMPUTADAS
// ---------------------------------------------
/**
 * ✨ NUEVO: Calcula el monto por cuota en tiempo real.
 * Retorna el valor numérico para posibles cálculos futuros.
 */
const montoPorCuotaNumero = computed(() => {
  const total = parseFloat(formData.value.monto_total)
  const cuotas = parseInt(formData.value.nro_cuotas, 10)
  return total > 0 && cuotas > 0 ? total / cuotas : 0
})

/**
 * ✨ NUEVO: Formatea el monto por cuota como un string de moneda.
 * Se usa para mostrarlo en la interfaz de forma amigable.
 */
const montoPorCuotaFormateado = computed(() => {
  const valor = montoPorCuotaNumero.value
  return valor.toFixed(2) + ' ' + divisaActiva.simbolo
})

/**
 * Se ejecuta al enviar el formulario (sin cambios en la lógica).
 */
const crearPago = async () => {
  cargando.value = true
  try {
    const form = objectToFormData(formData.value)
    for (let [x, y] of form.entries()) {
      console.log(`${x}:${y}`)
    }
    const respuesta = await api.post('', formData.value)
    console.log(respuesta.data)
    const res = respuesta.data
    if (res.estado == 'exito') {
      cerrarFormulario()
      const result = await showDialog(
        $q,
        'S',
        '¡Todo salió perfectamente! Los datos se han guardado correctamente y el proceso se completó sin errores.',
      )
      console.log('Success dialog result:', result)

      resetearFormulario()
    }
  } catch (error) {
    console.error('Error al crear el pago:', error)

    const result = await showDialog(
      $q,
      'E',
      error.response?.data?.message || 'Ocurrió un error al procesar la solicitud',
    )
    console.log('Success dialog result:', result)
  } finally {
    cargando.value = false
  }
}

/**
 * Resetea el formulario (sin cambios en la lógica).
 */
const resetearFormulario = () => {
  formData.value = {
    ver: 'registrarCompraCredito',
    compra_id: null,
    monto_total: null,
    nro_cuotas: null,
    fecha_inicio: null,
    pago_cada_ciertos_dias: null,
  }
}
</script>

<style scoped>
/* Ya no se necesita el estilo para el input oculto */
.q-item__label--caption {
  font-size: 0.85rem;
}
</style>
