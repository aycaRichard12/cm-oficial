<template>
  <q-dialog :model-value="modelValue" persistent full-width full-height>
    <q-card class="" style="height: 100%; max-width: 100%; border-radius: 10px">
      <q-card-section class="row items-center q-pb-none bg-primary" style="color: white">
        <div class="text-h5 text-bold">{{ title }}</div>
        <q-space />
        <q-btn flat round icon="close" @click="$emit('close')" />
      </q-card-section>
      <q-separator />

      <q-card-section class="q-pa-none" style="height: calc(100% - 60px); overflow: auto">
        <slot />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    required: true, // It's good practice to mark required props
  },
  title: {
    // Renamed 'titulo' to 'title' for better English readability
    type: String,
    default: 'Modal',
  },
})
</script>

<style scoped>
/* Add any specific styles for your modal here if needed */
</style>
