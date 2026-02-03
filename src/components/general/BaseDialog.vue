<template>
  <q-dialog v-model="isOpen" :persistent="persistent" :maximized="maximized">
    <q-card :class="cardClass" :style="cardStyle">
      <!-- Header -->
      <q-card-section 
        v-if="showHeader" 
        class="row items-center q-pb-none bg-primary text-white"
      >
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn 
          v-if="showCloseButton"
          icon="close" 
          flat 
          round 
          dense 
          @click="closeDialog"
        />
      </q-card-section>

      <q-separator v-if="showHeader" />

      <!-- Content -->
      <q-card-section :class="contentClass">
        <slot></slot>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions v-if="showActions" align="right" class="q-pa-md">
        <slot name="actions">
          <q-btn 
            v-if="showCancelButton"
            flat 
            :label="cancelLabel" 
            color="negative" 
            @click="onCancel"
          />
          <q-btn 
            v-if="showConfirmButton"
            unelevated 
            :label="confirmLabel" 
            :color="confirmColor"
            :loading="loading"
            @click="onConfirm"
          />
        </slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Diálogo'
  },
  persistent: {
    type: Boolean,
    default: false
  },
  maximized: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar'
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar'
  },
  confirmColor: {
    type: String,
    default: 'primary'
  },
  loading: {
    type: Boolean,
    default: false
  },
  cardClass: {
    type: String,
    default: 'responsive-dialog'
  },
  cardStyle: {
    type: String,
    default: 'min-width: 400px; max-width: 600px;'
  },
  contentClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
  closeDialog()
}
</script>

<style scoped>
.responsive-dialog {
  width: 100%;
  max-width: 90vw;
}

@media (min-width: 600px) {
  .responsive-dialog {
    min-width: 500px;
  }
}
</style>
