<template>
  <q-card flat class="full-height cm-surface shadow-1">
    <q-card-section>
      <div class="text-h6 q-mb-md text-primary row items-center">
        <q-icon name="stars" class="q-mr-sm" />
        <div>{{ $t('ui.novedades-principales-715618') }}</div>
      </div>
      <q-separator class="q-mb-md" />
      <q-list class="q-gutter-y-sm">
        <q-item v-for="(item, idx) in features" :key="idx" dense>
          <q-item-section avatar>
            <q-icon name="check_circle" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body1 cm-text">{{ item }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  features: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
