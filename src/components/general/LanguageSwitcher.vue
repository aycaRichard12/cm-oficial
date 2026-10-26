<template>
  <q-btn-dropdown
    flat
    dense
    no-caps
    icon="translate"
    :label="currentLabel"
    :color="color"
    class="language-switcher"
  >
    <q-list dense>
      <q-item
        v-for="option in options"
        :key="option.value"
        clickable
        v-close-popup
        :active="locale === option.value"
        active-class="language-active"
        @click="changeLocale(option.value)"
      >
        <q-item-section>{{ option.label }}</q-item-section>
        <q-item-section side v-if="locale === option.value">
          <q-icon name="check" color="primary" size="18px" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeLocale } from 'src/i18n'

defineProps({
  color: {
    type: String,
    default: 'primary',
  },
})

const { t, locale } = useI18n()

const options = computed(() => [
  { value: 'es-ES', label: t('language.es') },
  { value: 'en-US', label: t('language.en') },
])

const currentLabel = computed(
  () => options.value.find((option) => option.value === locale.value)?.label || t('language.label'),
)

function changeLocale(value) {
  locale.value = value
  storeLocale(value)
}
</script>

<style scoped>
.language-switcher :deep(.q-btn__content) {
  text-transform: none;
}

.language-active {
  font-weight: 600;
}
</style>
