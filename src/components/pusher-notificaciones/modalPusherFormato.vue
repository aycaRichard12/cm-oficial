<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="notifications" class="q-mr-sm" />
          {{ $t('ui.sistema-de-notificaciones-e1f588') }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-md">
          {{ $t('ui.envie-notificaciones-a-los-usuarios-responsables-del-be67e3') }}
        </div>

        <q-btn
          color="primary"
          icon="send"
          :label="$t('ui.nueva-notificacion-fc4a17')"
          unelevated
          @click="mostrarDialogNotificacion = true"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog de Notificación -->
    <NotificacionDialog
      v-model="mostrarDialogNotificacion"
      :title="$t('ui.enviar-notificacion-a4632e')"
      @notificacion-enviada="onNotificacionEnviada"
    />
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import NotificacionDialog from './NotificacionDialog.vue'

const $q = useQuasar()
const mostrarDialogNotificacion = ref(false)

function onNotificacionEnviada(datos) {
  console.log('Notificación enviada:', datos)
  
  $q.notify({
    type: 'positive',
    message: i18nT('ui.la-notificacion-ha-sido-enviada-exitosamente-957b6a'),
    position: 'top',
    icon: 'check_circle',
    timeout: 2000
  })
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
