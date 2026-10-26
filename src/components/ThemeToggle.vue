<template>
  <q-btn
    flat
    round
    dense
    color="white"
    :icon="isDark ? 'light_mode' : 'dark_mode'"
    :aria-label="label"
    :aria-pressed="isDark ? 'true' : 'false'"
    @click="toggle"
  >
    <q-tooltip>{{ label }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from 'src/stores/theme'

const theme = useThemeStore()

const isDark = computed(() => theme.isDark)
const label = computed(() =>
  isDark.value ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
)

function toggle() {
  theme.toggle()
}
</script>
