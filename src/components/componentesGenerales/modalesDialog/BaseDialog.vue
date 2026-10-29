<template>
  <q-dialog
    ref="dialogRef"
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @hide="onDialogHide"
    persistent
  >
    <q-card
      class="q-dialog-plugin shadow-24"
      style="border-radius: 16px; max-width: 450px; width: 100%"
    >
      <div :class="`bg-${config.color}`" style="height: 6px" />

      <q-card-section class="row items-center q-pb-none q-pt-lg">
        <div class="row no-wrap items-center full-width">
          <div class="col-auto">
            <q-avatar
              :icon="config.icon"
              :color="config.color"
              text-color="white"
              size="56px"
              class="shadow-5"
            />
          </div>

          <div class="col q-ml-md">
            <div class="text-h6 text-weight-bold cm-text">{{ config.title }}</div>
          </div>

          <q-btn v-close-popup flat round dense icon="close" color="grey-7" class="self-start" />
        </div>
      </q-card-section>

      <q-card-section class="q-py-md">
        <div class="message-container q-pa-md cm-surface-2 text-body1 cm-text">
          {{ mensaje }}
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-pt-none">
        <q-btn
          v-if="tipo === 'Q'"
          flat
          :label="config.cancelLabel || $t('common.cancel')"
          color="grey-7"
          no-caps
          class="q-px-lg text-weight-bold"
          @click="onCancelClick"
        />
        <q-btn
          unelevated
          :label="config.okLabel"
          :color="config.color"
          no-caps
          class="q-px-xl text-weight-bold"
          style="border-radius: 8px"
          @click="onOKClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  // Agrega modelValue para que Quasar pueda controlar la visibilidad
  modelValue: { type: Boolean, required: true },
  ...useDialogPluginComponent.props,
  tipo: { type: String, default: 'I' },
  mensaje: { type: String, required: true },
})

defineEmits([...useDialogPluginComponent.emits, 'update:modelValue'])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const configMap = {
  I: { icon: 'info', color: 'blue-7', title: i18nT('ui.informacion-45332d'), okLabel: i18nT('configuracion.clienteAlmacen.dialog.okButtonError') },
  Q: {
    icon: 'help',
    color: 'warning',
    title: i18nT('ui.confirmacion-9850af'),
    okLabel: i18nT('configGeneral.divisas.messages.deleteTitle'),
    cancelLabel: i18nT('ui.tal-vez-luego-05d968'),
  },
  E: { icon: 'error', color: 'negative', title: i18nT('ui.error-del-sistema-d00c95'), okLabel: i18nT('ui.cerrar-4b0816') },
  W: { icon: 'warning', color: 'orange-8', title: i18nT('ui.atencion-aa813c'), okLabel: i18nT('ui.aceptar-8f9f73') },
  S: { icon: 'check_circle', color: 'positive', title: i18nT('ui.operacion-exitosa-047492'), okLabel: i18nT('ui.genial-d6aa03') },
}

const config = computed(() => configMap[props.tipo] || configMap['I'])

function onOKClick() {
  onDialogOK(true)
}
function onCancelClick() {
  onDialogCancel()
}
</script>

<style scoped>
.message-container {
  border-left: 4px solid currentColor; /* Hereda el color del texto si lo necesitas, o usa variables */
  border-radius: 4px;
  line-height: 1.6;
}
/* Estilo específico para que el borde izquierdo coincida con el tipo */
.bg-grey-1 {
  border-left-color: v-bind('config.color') !important;
}
</style>
