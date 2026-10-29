<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">{{ $t('ui.motivo-de-anulacion-171518') }}</div>
      </q-card-section>

      <q-card-section>
        <q-select
          :model-value="motivo"
          @update:model-value="$emit('update:motivo', $event)"
          :options="opciones"
          :label="$t('ui.seleccione-un-motivo-c536c3')"
          outlined
          dense
          emit-value
          map-options
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="negative" @click="$emit('cancelar')" />
        <q-btn flat :label="$t('configGeneral.divisas.messages.deleteTitle')" color="primary" @click="$emit('confirmar')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  motivo: { type: [Number, String], default: null },
  opciones: { type: Array, default: () => [] }
})

defineEmits(['update:modelValue', 'update:motivo', 'cancelar', 'confirmar'])
</script>
