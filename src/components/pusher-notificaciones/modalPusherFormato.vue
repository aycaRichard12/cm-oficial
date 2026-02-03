<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="notifications" class="q-mr-sm" />
          Sistema de Notificaciones
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-md">
          Envíe notificaciones a los usuarios responsables del sistema.
        </div>

        <q-btn
          color="primary"
          icon="send"
          label="Nueva Notificación"
          unelevated
          @click="mostrarDialogNotificacion = true"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog de Notificación -->
    <NotificacionDialog
      v-model="mostrarDialogNotificacion"
      title="Enviar Notificación"
      @notificacion-enviada="onNotificacionEnviada"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import NotificacionDialog from './NotificacionDialog.vue'

const $q = useQuasar()
const mostrarDialogNotificacion = ref(false)

function onNotificacionEnviada(datos) {
  console.log('Notificación enviada:', datos)
  
  $q.notify({
    type: 'positive',
    message: 'La notificación ha sido enviada exitosamente',
    position: 'top',
    icon: 'check_circle',
    timeout: 2000
  })
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
