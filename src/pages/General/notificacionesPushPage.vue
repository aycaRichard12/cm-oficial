<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Card principal -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">
              <q-icon name="notifications_active" size="md" class="q-mr-sm" />
              Sistema de Notificaciones Push
            </div>
            <div class="text-subtitle2">Gestión de notificaciones en tiempo real</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Botón principal -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="send" class="q-mr-sm" />
                      Enviar Notificación
                    </div>
                    <p class="text-body2 text-grey-7">
                      Envíe notificaciones personalizadas a usuarios específicos del sistema.
                    </p>
                    <q-btn
                      color="primary"
                      icon="add_circle"
                      label="Nueva Notificación"
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
                      Estadísticas
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-badge color="positive" class="full-width q-pa-sm">
                          <div class="text-caption">Enviadas Hoy</div>
                          <div class="text-h6">{{ stats.enviadas }}</div>
                        </q-badge>
                      </div>
                      <div class="col-6">
                        <q-badge color="info" class="full-width q-pa-sm">
                          <div class="text-caption">Usuarios Activos</div>
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
              Historial Reciente
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
                    No hay notificaciones recientes
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
      title="Enviar Notificación Push"
      @notificacion-enviada="onNotificacionEnviada"
    />
  </div>
</template>

<script setup>
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
    message: 'Notificación enviada exitosamente',
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
