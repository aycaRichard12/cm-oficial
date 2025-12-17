<template>
  <q-card flat bordered class="code-block-card q-mb-lg">
    <q-bar class="bg-grey-3 text-grey-8">
      <div>{{ title }}</div>
      <q-space />
      <q-btn flat round dense icon="content_copy" @click="copyCode">
        <q-tooltip>Copiar código</q-tooltip>
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
        message: 'Copiado al portapapeles',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 1000,
      })
    })
    .catch(() => {
      $q.notify({
        message: 'Error al copiar',
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 1000,
      })
    })
}
</script>
