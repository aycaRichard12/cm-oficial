<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ editing ? 'Editar Credenciales' : 'Registrar Credenciales' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <FormCredencialesServicio
        :editing="editing"
        :modal-value="selectedData"
        @submit="handleSubmit"
        @cancel="closeDialog"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormCredencialesServicio from './FormCredencialesServicio.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editing: {
    type: Boolean,
    default: false
  },
  selectedData: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const dialogVisible = ref(props.modelValue)

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    dialogVisible.value = newValue
  }
)

// Watch for changes in dialogVisible and emit to parent
watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

// Handle form submission
const handleSubmit = () => {
  closeDialog()
  emit('refresh')
}

// Close dialog
const closeDialog = () => {
  dialogVisible.value = false
}
</script>
