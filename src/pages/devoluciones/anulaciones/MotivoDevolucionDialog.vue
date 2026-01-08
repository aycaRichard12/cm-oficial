<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Motivo de Devolución</div>
      </q-card-section>

      <q-card-section>
        <q-input
          :model-value="motivo"
          @update:model-value="$emit('update:motivo', $event)"
          label="Describa el motivo"
          outlined
          dense
          type="textarea"
          autogrow
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="$emit('cancelar')" />
        <q-btn flat label="Confirmar" color="primary" @click="$emit('confirmar')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  motivo: { type: String, default: '' }
})

defineEmits(['update:modelValue', 'update:motivo', 'cancelar', 'confirmar'])
</script>
