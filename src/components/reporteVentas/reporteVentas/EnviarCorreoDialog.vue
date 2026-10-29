<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 380px">
      <q-card-section>
        <div class="text-h6">{{ $t('ui.enviar-documento-4b5664') }}</div>
        <div class="text-caption text-grey">{{ $t('ui.complete-los-datos-y-seleccione-que-enviar-e77aa5') }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          filled
          v-model="correo"
          type="email"
          :label="$t('ui.correo-del-cliente-e81aae')"
          :placeholder="$t('ui.ingrese-el-correo-c521bc')"
          :rules="[(val) => !!val || $t('ui.correo-obligatorio-48e091')]"
        />

        <q-option-group
          v-model="opcion"
          :options="opciones"
          type="radio"
          :label="$t('ui.seleccione-tipo-de-envio-c28a27')"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="negative" @click="cancelar" />
        <q-btn flat :label="$t('ui.enviar-a91a95')" color="primary" @click="aceptar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean, // mostrar/ocultar modal
  emailInicial: String, // email cargado del cliente (o vacío)
  opciones: Array, // [{label:i18nT('ui.comprobante-7f8d58'),value:'comprobante'},...]
})
// console.log(props.emailInicial) // Puedes eliminar o comentar este log

const emit = defineEmits(['update:modelValue', 'ok', 'cancel'])

const $q = useQuasar()

const show = ref(props.modelValue)
// Inicialización del correo:
const correo = ref(props.emailInicial || '')
const opcion = ref(null)

// --- ¡AGREGAR ESTE BLOQUE DE CÓDIGO! ---
// 1. Observa el prop `emailInicial` para actualizar el campo de correo
watch(
  () => props.emailInicial,
  (newEmail) => {
    correo.value = newEmail || ''
  },
  { immediate: true }, // Esto asegura que se ejecute al inicio también
)
// ----------------------------------------

watch(
  () => props.modelValue,
  (val) => (show.value = val),
)
watch(show, (val) => {
  // Cuando el diálogo se oculta (show=false), reinicia la opción para el próximo uso.
  if (!val) {
    opcion.value = null
  }
  emit('update:modelValue', val)
})

function aceptar() {
  if (!correo.value.trim()) {
    return $q.notify({ type: 'warning', message: i18nT('ui.debe-ingresar-un-correo-valido-b7335d') })
  }
  if (!opcion.value) {
    return $q.notify({ type: 'warning', message: i18nT('ui.debe-seleccionar-una-opcion-561dc3') })
  }

  emit('ok', {
    correo: correo.value,
    opcion: opcion.value,
  })
  show.value = false
}

function cancelar() {
  emit('cancel')
  show.value = false
}
</script>
