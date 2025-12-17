<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <q-btn label="Diálogo de Información" color="primary" @click="showInfoDialog" />
      <q-btn label="Diálogo de Pregunta" color="warning" @click="showQuestionDialog" />
      <q-btn label="Diálogo de Error" color="negative" @click="showErrorDialog" />
      <q-btn label="Diálogo de Advertencia" color="orange" @click="showWarningDialog" />
    </div>
  </q-page>
</template>

<script setup>
import { showDialog } from 'src/utils/dialogs'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const showInfoDialog = async () => {
  const result = await showDialog(
    $q,
    'I',
    'Este es un mensaje informativo. La operación se completó exitosamente.',
  )
  console.log('Info dialog result:', result)
}

const showQuestionDialog = async () => {
  const result = await showDialog(
    $q,
    'Q',
    '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
  )
  console.log('Question dialog result:', result)
  if (result) {
    $q.notify({ message: 'Registro eliminado', color: 'positive' })
  } else {
    $q.notify({ message: 'Acción cancelada', color: 'info' })
  }
}

const showErrorDialog = async () => {
  const result = await showDialog(
    $q,
    'E',
    'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.',
  )
  console.log('Error dialog result:', result)
}

const showWarningDialog = async () => {
  const result = await showDialog(
    $q,
    'W',
    'Advertencia: Los cambios no guardados se perderán. ¿Desea continuar?',
  )
  console.log('Warning dialog result:', result)
}
</script>
