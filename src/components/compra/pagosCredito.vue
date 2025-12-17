<template>
  <q-form @submit.prevent="crearPago" ref="formularioRef">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <label for="monto">Monto Total del Crédito *</label>
        {{ formData.compra_id }}
        <q-input
          v-model.number="formData.monto_total"
          id="monto"
          type="number"
          :prefix="divisaActiva.simbolo"
          dense
          outlined
          disable
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
            (val) => val > 0 || 'El monto debe ser mayor a 0',
          ]"
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="numero">Número de Cuotas *</label>
        <q-input
          v-model.number="formData.nro_cuotas"
          id="numero"
          type="number"
          dense
          outlined
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
            (val) => val > 0 || 'Debe haber al menos 1 cuota',
          ]"
        />
      </div>

      <div class="col-12 col-md-4">
        <label for="frecuencia">Frecuencia de Pago (en días) *</label>
        <q-input
          v-model.number="formData.pago_cada_ciertos_dias"
          id="frecuencia"
          type="number"
          hint="Ej: 30 para pagos mensuales, 7 para semanales"
          lazy-rules
          dense
          outlined
          :rules="[
            (val) => (val !== null && val !== '') || 'Este campo es obligatorio',
            (val) => val > 0 || 'La frecuencia debe ser de al menos 1 día',
          ]"
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="fecha">Fecha de Inicio del Primer Pago *</label>
        <q-input
          type="date"
          dense
          outlined
          v-model="formData.fecha_inicio"
          id="fecha"
          :rules="[(val) => !!val || 'Debe seleccionar una fecha']"
        >
        </q-input>
      </div>
      <div class="col-12 col-md-4">
        <q-item v-if="montoPorCuotaNumero > 0" class="q-mt-sm">
          <q-item-section>
            <q-item-label caption>Monto por Cuota (calculado)</q-item-label>
            <q-item-label class="text-h6 text-positive text-weight-bold">
              {{ montoPorCuotaFormateado }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Generar Plan"
        type="submit"
        color="primary"
        icon="add_circle"
        unelevated
        rounded
        padding="sm lg"
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
  return valor + ' ' + divisaActiva.simbolo
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
