<template>
  <q-dialog v-model="dialogModel" persistent transition-show="scale" transition-hide="scale">
    <q-card class="q-pa-none shadow-24" style="width: 420px; max-width: 90vw; border-radius: 12px">
      <!-- Status Strip -->
      <div class="bg-warning text-white" style="height: 6px"></div>

      <q-card-section class="column items-center q-pt-lg q-pb-sm">
        <q-avatar
          size="72px"
          font-size="66px"
          color="orange-1"
          text-color="warning"
          icon="warning_amber"
          class="q-mb-md"
        />
        <div
          class="text-h3 text-weight-bold text-center text-grey-9 q-px-md"
          style="line-height: 1.2"
        >
          {{ title }}
        </div>
      </q-card-section>

      <q-card-section class="q-py-sm text-center q-px-lg">
        <div class="text-body1 text-grey-7">{{ message }}</div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md q-pt-lg">
        <q-btn
          outline
          label="Cancelar"
          color="grey-8"
          v-close-popup
          @click="closeDialog"
          class="q-mr-sm"
          style="min-width: 120px; border-radius: 8px; height: 40px"
          no-caps
        />
        <q-btn
          unelevated
          label="Aceptar"
          color="warning"
          text-color="dark"
          @click="onAccept"
          style="min-width: 120px; border-radius: 8px; height: 40px"
          class="text-weight-bold"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

// Props y emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Advertencia',
  },
  message: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'accepted', 'canceled', 'closed'])

// Variables reactivas
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Métodos
const onAccept = () => {
  emit('accepted')
  closeDialog()
}

const closeDialog = () => {
  dialogModel.value = false
  emit('closed')
}

const cancelDialog = () => {
  emit('canceled')
  closeDialog()
}

// Exponer métodos al padre
defineExpose({
  open: () => (dialogModel.value = true),
  close: closeDialog,
  cancel: cancelDialog,
})
</script>
