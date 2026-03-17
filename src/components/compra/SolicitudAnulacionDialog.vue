<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 520px; max-width: 95vw">
      <!-- Header -->
      <q-card-section class="bg-deep-orange flex justify-between items-center text-white q-py-sm">
        <div class="text-h6 flex items-center gap-2">
          <q-icon name="block" class="q-mr-sm" />
          Solicitar Anulación de Compra
        </div>
        <q-btn icon="close" flat round dense @click="handleCancel" />
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md">
          <!-- Info de la compra -->
          <q-banner class="bg-orange-1 text-orange-9 rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            Compra: <strong>{{ compra?.nfactura }}</strong> — Proveedor:
            <strong>{{ compra?.proveedor }}</strong>
          </q-banner>

          <!-- Motivo de anulación -->
          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-sm">
              <q-icon name="edit_note" class="q-mr-xs" />
              Motivo de Anulación
            </div>
            <q-input
              v-model="formData.motivo"
              outlined
              dense
              type="textarea"
              rows="3"
              label="Motivo *"
              placeholder="Describe el motivo de la anulación..."
              :rules="[(val) => !!val?.trim() || 'El motivo es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>

          <q-separator />

          <!-- Sección de notificación -->
          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-sm">
              <q-icon name="notifications" class="q-mr-xs" />
              Notificar a Responsable
            </div>

            <q-select
              v-model="formData.usuarioSeleccionado"
              :options="usuariosOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              label="Seleccionar destinatario *"
              :loading="loadingUsuarios"
              :rules="[(val) => !!val || 'Debe seleccionar un destinatario']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No hay usuarios disponibles</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="formData.asunto"
              outlined
              dense
              label="Asunto *"
              :rules="[(val) => !!val?.trim() || 'El asunto es obligatorio']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="subject" />
              </template>
            </q-input>

            <q-input
              v-model="formData.mensaje"
              outlined
              dense
              type="textarea"
              rows="3"
              label="Mensaje de notificación *"
              :rules="[(val) => !!val?.trim() || 'El mensaje es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="message" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey" @click="handleCancel" :disable="loading" />
        <q-btn
          unelevated
          label="Enviar Solicitud"
          color="deep-orange"
          icon="send"
          :loading="loading"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAnulacionCompra } from 'src/composables/compra/useAnulacionCompra'
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  compra: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'solicitud-enviada'])

const { loading, enviarSolicitudAnulacion } = useAnulacionCompra()
const { responsables, loadUsuarios } = useNotificaciones()

const formRef = ref(null)
const loadingUsuarios = ref(false)

const formData = ref({
  motivo: '',
  usuarioSeleccionado: null,
  asunto: '',
  mensaje: '',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const usuariosOptions = computed(() =>
  responsables.value.map((u) => ({
    label: u.label || u.nombre || u.usuario,
    value: u.value || u.idusuarioMD5,
  })),
)

// Pre-rellenar asunto cuando cambia la compra
watch(
  () => props.compra,
  (c) => {
    if (c) {
      formData.value.asunto = `Solicitud de Anulación - Compra de factura N° ${c.nfactura || c.id}`
      formData.value.mensaje = `Se solicita la anulación de la compra de factura N° ${c.nfactura || c.id} del proveedor ${c.proveedor || ''}. Motivo: (pendiente de ingresar)`
    }
  },
  { immediate: true },
)

// Actualizar mensaje al cambiar el motivo
watch(
  () => formData.value.motivo,
  (motivo) => {
    if (props.compra) {
      formData.value.mensaje = `Se solicita la anulación de la compra de factura N° ${props.compra.nfactura || props.compra.id} del proveedor ${props.compra.proveedor || ''}. Motivo: ${motivo || ''}`
    }
  },
)

async function handleConfirm() {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  const exito = await enviarSolicitudAnulacion(formData.value, props.compra)
  if (exito) {
    emit('solicitud-enviada')
    isOpen.value = false
    resetForm()
  }
}

function handleCancel() {
  resetForm()
  isOpen.value = false
}

function resetForm() {
  formData.value = { motivo: '', usuarioSeleccionado: null, asunto: '', mensaje: '' }
  formRef.value?.resetValidation()
}

onMounted(async () => {
  loadingUsuarios.value = true
  try {
    await loadUsuarios()
  } finally {
    loadingUsuarios.value = false
  }
})
</script>
