<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Card principal -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">
              <q-icon name="notifications_active" size="md" class="q-mr-sm" />
              {{ $t('ui.sistema-de-notificaciones-push-443759') }}
            </div>
            <div class="text-subtitle2">{{ $t('ui.gestion-de-notificaciones-en-tiempo-real-76a30d') }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Botón principal -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="send" class="q-mr-sm" />
                      {{ $t('ui.enviar-notificacion-a4632e') }}
                    </div>
                    <p class="text-body2 text-grey-7">
                      {{ $t('ui.envie-notificaciones-personalizadas-a-usuarios-espec-2d0d15') }}
                    </p>
                    <q-btn
                      color="primary"
                      icon="add_circle"
                      :label="$t('ui.nueva-notificacion-fc4a17')"
                      unelevated
                      class="full-width"
                      @click="abrirDialogNotificacion"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <!-- Estadísticas (ejemplo) -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="analytics" class="q-mr-sm" />
                      {{ $t('ui.estadisticas-a580d5') }}
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-badge color="positive" class="full-width q-pa-sm">
                          <div class="text-caption">{{ $t('ui.enviadas-hoy-0766ef') }}</div>
                          <div class="text-h6">{{ stats.enviadas }}</div>
                        </q-badge>
                      </div>
                      <div class="col-6">
                        <q-badge color="info" class="full-width q-pa-sm">
                          <div class="text-caption">{{ $t('ui.usuarios-activos-8e9d06') }}</div>
                          <div class="text-h6">{{ stats.usuarios }}</div>
                        </q-badge>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Historial de notificaciones (ejemplo) -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-grey-2">
            <div class="text-h6">
              <q-icon name="history" class="q-mr-sm" />
              {{ $t('ui.historial-reciente-52d8a1') }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="(notif, index) in historialEjemplo" :key="index">
                <q-item-section avatar>
                  <q-avatar :color="getPrioridadColor(notif.prioridad)" text-color="white">
                    <q-icon name="notifications" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ notif.asunto }}</q-item-label>
                  <q-item-label caption>{{ notif.mensaje }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge :color="getPrioridadColor(notif.prioridad)">
                    {{ notif.prioridad }}
                  </q-badge>
                </q-item-section>
              </q-item>

              <q-item v-if="historialEjemplo.length === 0">
                <q-item-section>
                  <q-item-label class="text-grey-6 text-center">
                    {{ $t('ui.no-hay-notificaciones-recientes-6ddf74') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog de Notificación -->
    <NotificacionDialog
      v-model="dialogNotificacionOpen"
      :title="$t('ui.enviar-notificacion-push-048538')"
      @notificacion-enviada="onNotificacionEnviada"
    />
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import NotificacionDialog from 'src/components/pusher-notificaciones/NotificacionDialog.vue'

const $q = useQuasar()

const dialogNotificacionOpen = ref(false)
const stats = ref({
  enviadas: 0,
  usuarios: 0
})

const historialEjemplo = ref([])

function abrirDialogNotificacion() {
  dialogNotificacionOpen.value = true
}

function onNotificacionEnviada(datos) {
  console.log('Notificación enviada:', datos)
  
  // Agregar al historial
  historialEjemplo.value.unshift({
    asunto: datos.asunto,
    mensaje: datos.mensaje,
    prioridad: datos.prioridad,
    fecha: new Date().toLocaleString()
  })

  // Actualizar estadísticas
  stats.value.enviadas++

  $q.notify({
    type: 'positive',
    message: i18nT('ui.notificacion-enviada-exitosamente-869969'),
    position: 'top',
    icon: 'check_circle',
    timeout: 2000
  })
}

function getPrioridadColor(prioridad) {
  const colores = {
    alta: 'red',
    media: 'orange',
    baja: 'green'
  }
  return colores[prioridad] || 'grey'
}

onMounted(() => {
  // Cargar estadísticas iniciales
  stats.value = {
    enviadas: 0,
    usuarios: 0
  }
})
</script>

<style scoped>
.q-badge {
  padding: 12px;
}
</style>
