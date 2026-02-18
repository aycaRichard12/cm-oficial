<template>
  <BaseDialog
    v-model="isOpen"
    :title="title"
    :loading="loading"
    confirm-label="Solicitar Permiso venta sin stock"
    confirm-color="primary"
    card-style="min-width: 500px; max-width: 700px;"
    @confirm="handleEnviar"
    @cancel="handleCancel"
  >
    <q-form ref="formRef" class="q-gutter-md">
      <div class="q-mb-md">
        <div class="text-subtitle2 text-grey-8 q-mb-sm">
          <q-icon name="person" class="q-mr-xs" />
          Almacen
        </div>
        <q-select
          v-model="formData.almacenSeleccionado"
          :options="almacenesOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          label="Seleccionar almacen *"
          :rules="[(val) => !!val || 'Debe seleccionar un almacen']"
          :loading="loadingUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="account_circle" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay almacenes disponibles </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Sección: Destinatario -->
      <div class="q-mb-md">
        <div class="text-subtitle2 text-grey-8 q-mb-sm">
          <q-icon name="person" class="q-mr-xs" />
          Destinatario
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
          label="Seleccionar usuario *"
          :rules="[(val) => !!val || 'Debe seleccionar un usuario']"
          :loading="loadingUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="account_circle" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay usuarios disponibles </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <q-separator />

      <!-- Sección: Detalles de la Notificación -->
      <div class="q-mb-md">
        <div class="text-subtitle2 text-grey-8 q-mb-sm">
          <q-icon name="mail" class="q-mr-xs" />
          Motivo de la solicitud
        </div>

        <q-input
          v-model="formData.asunto"
          outlined
          dense
          label="Asunto *"
          placeholder="Ej: Permiso para venta sin stock, Solicitud de aprobación, etc."
          :rules="[(val) => !!val || 'El asunto es obligatorio']"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="subject" />
          </template>
        </q-input>

        <q-input
          v-model="formData.mensaje"
          outlined
          type="textarea"
          rows="5"
          label="Mensaje *"
          placeholder="Escriba el contenido de la solicitud..."
          :rules="[(val) => !!val || 'El mensaje es obligatorio']"
        >
          <template v-slot:prepend>
            <q-icon name="message" />
          </template>
        </q-input>
      </div>

      <!-- Vista previa del formato -->
      <q-card flat bordered class="bg-grey-1 q-mt-md">
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-sm">Vista Previa del Formato</div>
          <div class="text-body2">
            <div><strong>Asunto:</strong> {{ formData.asunto || '(sin asunto)' }}</div>
            <div><strong>Mensaje:</strong> {{ formData.mensaje || '(sin mensaje)' }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseDialog from '../general/BaseDialog.vue'
import { useSolicitudes } from 'src/composables/ventasSinStock/useSolicitudes'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useNotificaciones } from 'src/composables/pusher-notificaciones/useNotificaciones'
import { getUsuario } from 'src/composables/FuncionesGenerales'
const idusuario = idusuario_md5()
const nombreUsuario = getUsuario()
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Enviar Notificación',
  },
})

const emit = defineEmits(['update:modelValue', 'notificacion-enviada'])

const {
  almacenesResponsable,
  responsables,
  loading,
  loadUsuarios,
  crearSolicitudPermiso,
  loadAAlmacenes,
} = useSolicitudes()

const { enviarNotificacion } = useNotificaciones()

const formRef = ref(null)
const loadingUsuarios = ref(false)

const formData = ref({
  usuarioSeleccionado: null,
  asunto: '',
  mensaje: '',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
const almacenesOptions = computed(() => {
  console.log('Almacenes para opciones:', almacenesResponsable.value)
  return almacenesResponsable.value.map((almacen) => ({
    label: almacen.label,
    value: almacen.value,
  }))
})
const usuariosOptions = computed(() => {
  return responsables.value.map((user) => ({
    label: user.label || user.nombre || user.usuario,
    value: user.value || user.id_usuario || user.id,
  }))
})

async function handleEnviar() {
  const isValid = await formRef.value.validate()

  if (!isValid) {
    return
  }

  try {
    // Capturar automáticamente la ruta actual

    await crearSolicitudPermiso({
      idusuario_md5: idusuario,
      id_almacen: formData.value.almacenSeleccionado,
      id_admin_md5: formData.value.usuarioSeleccionado,
      motivo: formData.value.asunto + ', ' + formData.value.mensaje,
      datos_adicionales: {
        url_de_envio: 'autorizarventassinstock',
      },
    })
    await enviarNotificacion({
      id_usuario: formData.value.usuarioSeleccionado,
      asunto: formData.value.asunto,
      mensaje: formData.value.mensaje,
      datos_adicionales: {
        nombre_usuario_notificacion: nombreUsuario,
        url_de_envio: 'autorizarventassinstock',
      },
    })

    emit('solicitud-enviada', formData.value)
    resetForm()
    isOpen.value = false
  } catch (error) {
    console.error('Error al enviar notificación:', error)
  }
}

function handleCancel() {
  resetForm()
}

function resetForm() {
  formData.value = {
    usuarioSeleccionado: null,
    asunto: '',
    mensaje: '',
  }
  formRef.value?.resetValidation()
}

onMounted(async () => {
  loadingUsuarios.value = true
  try {
    await loadUsuarios()
    await loadAAlmacenes()
  } finally {
    loadingUsuarios.value = false
  }
})
</script>

<style scoped>
.q-field {
  margin-bottom: 0;
}
</style>
