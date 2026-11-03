<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 520px; max-width: 95vw">
      <!-- Header -->
      <q-card-section class="bg-deep-orange flex justify-between items-center text-white q-py-sm"> <!-- theme-allow -->
        <div class="text-h6 flex items-center gap-2">
          <q-icon name="block" class="q-mr-sm" />
          {{ $t('ui.solicitar-anulacion-de-compra-e615f2') }}
        </div>
        <div class="row q-gutter-x-xs">
          <q-btn
            icon="refresh"
            flat
            round
            dense
            :loading="loadingUsuarios"
            @click="recargarUsuarios"
          >
            <q-tooltip>{{ $t('ui.recargar-usuarios-88a623') }}</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense @click="handleCancel" />
        </div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md">
          <!-- Info de la compra -->
          <q-banner class="bg-orange-1 text-orange-9 rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            {{ $t('ui.compra-a4dbc1') }} <strong>{{ compra?.nfactura }}</strong> {{ $t('ui.proveedor-938914') }}
            <strong>{{ compra?.proveedor }}</strong>
          </q-banner>

          <!-- Motivo de anulación -->
          <div>
            <div class="text-subtitle2 cm-text q-mb-sm">
              <q-icon name="edit_note" class="q-mr-xs" />
              {{ $t('ui.motivo-de-anulacion-171518') }}
            </div>
            <q-input
              v-model="formData.motivo"
              outlined
              dense
              type="textarea"
              rows="3"
              :label="$t('ui.motivo-49005a')"
              :placeholder="$t('ui.describe-el-motivo-de-la-anulacion-3457d1')"
              :rules="[(val) => !!val?.trim() || $t('ui.el-motivo-es-obligatorio-9e2508')]"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>

          <q-separator />

          <!-- Sección de notificación -->
          <div>
            <div class="text-subtitle2 cm-text q-mb-sm">
              <q-icon name="notifications" class="q-mr-xs" />
              {{ $t('ui.notificar-a-responsable-66d9ca') }}
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
              :label="$t('ui.seleccionar-destinatario-a5dcd3')"
              :loading="loadingUsuarios"
              :rules="[(val) => !!val || $t('ui.debe-seleccionar-un-destinatario-048911')]"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">{{ $t('ui.no-hay-usuarios-disponibles-2bf41f') }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="formData.asunto"
              outlined
              dense
              :label="$t('ui.asunto-82fa9b')"
              :rules="[(val) => !!val?.trim() || $t('ui.el-asunto-es-obligatorio-6588e3')]"
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
              :label="$t('ui.mensaje-de-notificacion-a05f32')"
              :rules="[(val) => !!val?.trim() || $t('ui.el-mensaje-es-obligatorio-1fd439')]"
            >
              <template v-slot:prepend>
                <q-icon name="message" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="$t('common.cancel')" color="grey" @click="handleCancel" :disable="loading" />
        <q-btn
          unelevated
          :label="$t('ui.enviar-solicitud-7c09ba')"
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

async function recargarUsuarios() {
  loadingUsuarios.value = true
  try {
    await loadUsuarios()
  } finally {
    loadingUsuarios.value = false
  }
}

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
