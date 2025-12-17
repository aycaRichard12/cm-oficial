<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 380px">
      <q-card-section>
        <div class="text-h6">Enviar documento</div>
        <div class="text-caption text-grey">Complete los datos y seleccione qué enviar.</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          filled
          v-model="correo"
          type="email"
          label="Correo del cliente"
          placeholder="Ingrese el correo"
          :rules="[(val) => !!val || 'Correo obligatorio']"
        />

        <q-option-group
          v-model="opcion"
          :options="opciones"
          type="radio"
          label="Seleccione tipo de envío:"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cancelar" />
        <q-btn flat label="Enviar" color="primary" @click="aceptar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean, // mostrar/ocultar modal
  emailInicial: String, // email cargado del cliente (o vacío)
  opciones: Array, // [{label:'Comprobante',value:'comprobante'},...]
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
    return $q.notify({ type: 'warning', message: 'Debe ingresar un correo válido' })
  }
  if (!opcion.value) {
    return $q.notify({ type: 'warning', message: 'Debe seleccionar una opción' })
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
