<template>
  <div class="row q-col-gutter-sm items-start">
    <div class="col-12 col-sm-6">
      <q-input
        v-model="modelInicial"
        label="Fecha Inicial"
        outlined
        dense
        mask="##/##/####"
        placeholder="dd/mm/yyyy"
        :error="!!errorInicial"
        :error-message="errorInicial"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="modelInicial" mask="DD/MM/YYYY" minimal>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="col-12 col-sm-6">
      <q-input
        v-model="modelFinal"
        label="Fecha Final"
        outlined
        dense
        mask="##/##/####"
        placeholder="dd/mm/yyyy"
        :error="!!errorFinal"
        :error-message="errorFinal"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="modelFinal" mask="DD/MM/YYYY" minimal>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
// [kdx-fix-timezone-drf] Import removido: useFechaRango parseaba/formateaba
// con new Date(string) (UTC) + getDate/getMonth locales, causando el bug 17→16
// en zonas UTC-X. Este componente ahora usa helpers local-safe inline.

const props = defineProps({
  fechaInicial: { type: [String, Date], default: null },
  fechaFinal: { type: [String, Date], default: null },
})

const emit = defineEmits([
  'update:fechaInicial',
  'update:fechaFinal',
  'update:rangoValido',
])

const errorInicial = ref('')
const errorFinal = ref('')

// [kdx-fix-timezone-drf] Helpers LOCAL-SAFE: nunca construyen Date a partir de
// un string de fecha. Trabajan con strings ISO "YYYY-MM-DD" y evitan el
// desplazamiento UTC↔local en UTC-X.
function isoFromAny(value) {
  if (value == null || value === '') return ''
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return value.toISOString().slice(0, 10)
  }
  const raw = String(value).trim()
  if (!raw) return ''
  // "YYYY-MM-DD" o "YYYY/MM/DD" exacto
  const mIso = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
  if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`
  // "DD/MM/YYYY" o "DD-MM-YYYY" exacto (formato del q-date)
  const mDmy = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (mDmy) return `${mDmy[3]}-${mDmy[2]}-${mDmy[1]}`
  // Prefijo "YYYY-MM-DD..." (ISO con hora u offset): toma la parte UTC
  const mPrefix = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
  if (mPrefix) return `${mPrefix[1]}-${mPrefix[2]}-${mPrefix[3]}`
  return ''
}

function fmtDDMMYYYY(value) {
  const iso = isoFromAny(value)
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const modelInicial = computed({
  get: () => fmtDDMMYYYY(props.fechaInicial),
  set: (v) => emit('update:fechaInicial', isoFromAny(v)),
})

const modelFinal = computed({
  get: () => fmtDDMMYYYY(props.fechaFinal),
  set: (v) => emit('update:fechaFinal', isoFromAny(v)),
})

// [kdx-fix-timezone-drf] Validacion por comparacion lexicografica de strings
// ISO ("YYYY-MM-DD"), sin Date ni timezone. Elimina ademas el branch
// `if (ff < fi)` que era identico a `if (fi > ff)` y por tanto inalcanzable.
const validar = () => {
  errorInicial.value = ''
  errorFinal.value = ''
  const fi = isoFromAny(props.fechaInicial)
  const ff = isoFromAny(props.fechaFinal)
  if (!fi || !ff) {
    emit('update:rangoValido', false)
    return
  }
  if (fi > ff) {
    errorFinal.value = 'La fecha final no puede ser menor a la fecha inicial.'
    emit('update:rangoValido', false)
    return
  }
  emit('update:rangoValido', true)
}

watch(() => [props.fechaInicial, props.fechaFinal], validar, { immediate: true })
</script>
