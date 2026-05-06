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
            <div class="text-h6 text-weight-bold text-grey-9">{{ config.title }}</div>
          </div>

          <q-btn v-close-popup flat round dense icon="close" color="grey-7" class="self-start" />
        </div>
      </q-card-section>

      <q-card-section class="q-py-md">
        <div class="message-container q-pa-md bg-grey-1 text-body1 text-grey-8">
          {{ mensaje }}
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-pt-none">
        <q-btn
          v-if="tipo === 'Q'"
          flat
          :label="config.cancelLabel || 'Cancelar'"
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
  I: { icon: 'info', color: 'blue-7', title: 'Información', okLabel: 'Entendido' },
  Q: {
    icon: 'help',
    color: 'warning',
    title: 'Confirmación',
    okLabel: 'Confirmar',
    cancelLabel: 'Tal vez luego',
  },
  E: { icon: 'error', color: 'negative', title: 'Error del Sistema', okLabel: 'Cerrar' },
  W: { icon: 'warning', color: 'orange-8', title: 'Atención', okLabel: 'Aceptar' },
  S: { icon: 'check_circle', color: 'positive', title: 'Operación Exitosa', okLabel: 'Genial' },
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
