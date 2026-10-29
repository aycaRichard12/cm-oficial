<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <q-btn :label="$t('ui.dialogo-de-informacion-bcca28')" color="primary" @click="showInfoDialog" />
      <q-btn :label="$t('ui.dialogo-de-pregunta-a76f8b')" color="warning" @click="showQuestionDialog" />
      <q-btn :label="$t('ui.dialogo-de-error-eb86d6')" color="negative" @click="showErrorDialog" />
      <q-btn :label="$t('ui.dialogo-de-advertencia-dda017')" color="orange" @click="showWarningDialog" />
    </div>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { showDialog } from 'src/utils/dialogs'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const showInfoDialog = async () => {
  const result = await showDialog(
    $q,
    'I',
    i18nT('ui.este-es-un-mensaje-informativo-la-operacion-se-compl-9f3bcf'),
  )
  console.log('Info dialog result:', result)
}

const showQuestionDialog = async () => {
  const result = await showDialog(
    $q,
    'Q',
    i18nT('ui.estas-seguro-de-que-deseas-eliminar-este-registro-es-a35dda'),
  )
  console.log('Question dialog result:', result)
  if (result) {
    $q.notify({ message: i18nT('ui.registro-eliminado-af3547'), color: 'positive' })
  } else {
    $q.notify({ message: i18nT('ui.accion-cancelada-4177e8'), color: 'info' })
  }
}

const showErrorDialog = async () => {
  const result = await showDialog(
    $q,
    'E',
    i18nT('ui.ha-ocurrido-un-error-inesperado-por-favor-intentelo-b9c64b'),
  )
  console.log('Error dialog result:', result)
}

const showWarningDialog = async () => {
  const result = await showDialog(
    $q,
    'W',
    i18nT('ui.advertencia-los-cambios-no-guardados-se-perderan-des-34864d'),
  )
  console.log('Warning dialog result:', result)
}
</script>
