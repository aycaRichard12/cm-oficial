<template>
  <BaseDialog
    v-model="isOpen"
    :title="title"
    :loading="loading"
    :confirm-label="$t('ui.solicitar-permiso-venta-sin-stock-4d8e21')"
    confirm-color="primary"
    card-style="min-width: 500px; max-width: 700px;"
    @confirm="handleEnviar"
    @cancel="handleCancel"
  >
    <q-form ref="formRef" class="q-gutter-md">
      <div class="q-mb-md">
        <div class="text-subtitle2 cm-text q-mb-sm">
          <q-icon name="person" class="q-mr-xs" />
          {{ $t('ui.almacen-673013') }}
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
          :label="$t('ui.seleccionar-almacen-fe625b')"
          :rules="[(val) => !!val || $t('ui.debe-seleccionar-un-almacen-ab2da4')]"
          :loading="loadingUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="account_circle" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> {{ $t('ui.no-hay-almacenes-disponibles-6339fe') }} </q-item-section>
            </q-item>
          </template>
          <template v-slot:append>
            <q-btn
              icon="refresh"
              flat
              round
              dense
              color="primary"
              @click.stop="loadAAlmacenes"
              :disable="loadingUsuarios"
            >
              <q-tooltip>{{ $t('ui.recargar-datos-3840f2') }}</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </div>

      <!-- Sección: Destinatario -->
      <div class="q-mb-md">
        <div class="text-subtitle2 cm-text q-mb-sm">
          <q-icon name="person" class="q-mr-xs" />
          {{ $t('ui.destinatario-74f553') }}
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
          :label="$t('ui.seleccionar-usuario-dd5afd')"
          :rules="[(val) => !!val || $t('ui.debe-seleccionar-un-usuario-5015d6')]"
          :loading="loadingUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="account_circle" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> {{ $t('ui.no-hay-usuarios-disponibles-2bf41f') }} </q-item-section>
            </q-item>
          </template>
          <template v-slot:append>
            <q-btn
              icon="refresh"
              flat
              round
              dense
              color="primary"
              @click.stop="loadUsuarios"
              :disable="loadingUsuarios"
            >
              <q-tooltip>{{ $t('ui.recargar-datos-3840f2') }}</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </div>

      <q-separator />

      <!-- Sección: Detalles de la Notificación -->
      <div class="q-mb-md">
        <div class="text-subtitle2 cm-text q-mb-sm">
          <q-icon name="mail" class="q-mr-xs" />
          {{ $t('ui.motivo-de-la-solicitud-5f7b85') }}
        </div>

        <q-input
          v-model="formData.asunto"
          outlined
          dense
          :label="$t('ui.asunto-82fa9b')"
          :placeholder="$t('ui.ej-permiso-para-venta-sin-stock-solicitud-de-aprobac-205469')"
          :rules="[(val) => !!val || $t('ui.el-asunto-es-obligatorio-6588e3')]"
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
          :label="$t('ui.mensaje-870575')"
          :placeholder="$t('ui.escriba-el-contenido-de-la-solicitud-c6dba7')"
          :rules="[(val) => !!val || $t('ui.el-mensaje-es-obligatorio-1fd439')]"
        >
          <template v-slot:prepend>
            <q-icon name="message" />
          </template>
        </q-input>
      </div>

      <!-- Vista previa del formato -->
      <q-card flat bordered class="cm-surface-2 q-mt-md">
        <q-card-section>
          <div class="text-caption cm-text-muted q-mb-sm">{{ $t('ui.vista-previa-del-formato-822873') }}</div>
          <div class="text-body2">
            <div><strong>{{ $t('ui.asunto-a92531') }}</strong> {{ formData.asunto || $t('ui.sin-asunto-52427d') }}</div>
            <div><strong>{{ $t('ui.mensaje-813d0e') }}</strong> {{ formData.mensaje || $t('ui.sin-mensaje-ead80a') }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </BaseDialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
    default: i18nT('ui.enviar-notificacion-a4632e'),
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
