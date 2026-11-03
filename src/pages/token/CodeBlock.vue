<template>
  <q-card flat bordered class="code-block-card q-mb-lg">
    <q-bar class="cm-surface-2 cm-text-muted">
      <div>{{ title }}</div>
      <q-space />
      <q-btn flat round dense icon="content_copy" @click="copyCode">
        <q-tooltip>{{ $t('ui.copiar-codigo-3b9435') }}</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section class="q-pa-none">
      <pre class="q-ma-none q-pa-md bg-grey-2 text-black">
        <code v-text="code"></code>
      </pre>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { useQuasar, copyToClipboard } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  title: String,
  code: String,
})

const copyCode = () => {
  copyToClipboard(props.code)
    .then(() => {
      $q.notify({
        message: i18nT('configuracion.credencialesServicio.dialog.copied'),
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 1000,
      })
    })
    .catch(() => {
      $q.notify({
        message: i18nT('configuracion.credencialesServicio.dialog.errorCopy'),
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 1000,
      })
    })
}
</script>
