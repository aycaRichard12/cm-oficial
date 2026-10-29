<template>
  <div class="q-pa-md">
    <q-btn flat dense round icon="notifications" ref="notificationsBtn">
      <q-badge v-if="unreadCount > 0" color="red" floating>
        {{ unreadCount }}
      </q-badge>
      <q-menu
        v-model="showMenu"
        anchor="bottom right"
        self="top right"
        :offset="[0, 8]"
        transition-show="jump-down"
        transition-hide="jump-up"
      >
        <q-list style="min-width: 300px">
          <q-item-label header class="">
            {{ $t('ui.notificaciones-6b3d32') }}
            <q-toggle
              v-model="compactMode"
              checked-icon="minimize"
              unchecked-icon="list"
              class="q-ml-md"
              dense
            />
          </q-item-label>

          <q-separator />

          <template v-if="notifications.length">
            <q-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'bg-grey-3': !notification.read }"
              clickable
              @click="markAsRead(notification)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="notificationIcons[notification.type]"
                  :color="notificationColors[notification.type]"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle2" :lines="1">
                  {{ notification.title }} {{ $t('ui.en-fecha-1b2091') + notification.fecha }}
                  <q-btn
                    v-if="notification.codigo == 'importacion_pendiente'"
                    color="primary"
                    :label="$t('ui.aprobar-c2505a')"
                    @click="aprobarImportacion(notification)"
                  />
                </q-item-label>
                <q-item-label v-if="!compactMode" caption lines="2">
                  {{ notification.message }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  @click.stop="removeNotification(notification.id)"
                />
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
          <template v-else>
            <q-item>
              <q-item-section class="text-center text-grey"> {{ $t('ui.no-hay-notificaciones-ebcd17') }} </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'src/boot/axios'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import emitter from 'src/event-bus'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'
const $q = useQuasar()
// Estado de la UI
const showMenu = ref(false)
const compactMode = ref(true)

const getNotificaciones = async () => {
  const point = `getNotificaciones/${idusuario_md5()}/${idempresa_md5()}`
  console.log(point)
  try {
    const response = await api.get(point)
    console.log(response.data)
    notifications.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('[getNotificaciones] Error:', error)
    notifications.value = []
    $q.notify({
      type: 'negative',
      message: i18nT('ui.no-se-pudieron-cargar-las-notificaciones-0bf6a8'),
      position: 'top',
    })
  }
}

// Datos de las notificaciones
const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: i18nT('ui.pedido-aprobado-c3815f'),
    message: i18nT('ui.tu-pedido-123-fue-aprobado-y-se-esta-preparando-para-a40cfd'),
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: i18nT('ui.actualizacion-del-sistema-3013a4'),
    message: i18nT('ui.hemos-lanzado-una-nueva-version-con-mejoras-de-rendi-582558'),
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: i18nT('ui.credenciales-a-punto-de-expirar-f345c6'),
    message: i18nT('ui.tu-contrasena-caducara-en-7-dias-por-favor-actualiza-85e1ed'),
    read: true,
  },
  {
    id: 4,
    type: 'error',
    title: i18nT('ui.fallo-en-la-transaccion-ec4aa4'),
    message: i18nT('ui.hubo-un-error-al-procesar-tu-ultimo-pago-revisa-tus-a0b8f5'),
    read: false,
  },
])

// Mapeos de íconos y colores por tipo
const notificationIcons = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
}

const notificationColors = {
  success: 'green',
  info: 'blue',
  warning: 'orange',
  error: 'red',
}

// Contador de notificaciones no leídas
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

// Funciones
const markAsRead = (notif) => {
  console.log(notif)
  const codigo = notif.codigo
  const gestionPedidos = verificarexistenciapagina('gestionPedido')

  const ventasNoDespachadas = verificarexistenciapagina('procesarventaspendientes')
  const cxc = verificarexistenciapagina('cuentasporcobrar')

  switch (codigo) {
    case 'pedido':
      emitter.emit('abrir-submenu', gestionPedidos)
      break
    case 'vnd':
      emitter.emit('abrir-submenu', ventasNoDespachadas)
      break
    case 'cxc':
      emitter.emit('abrir-submenu', cxc)
      emitter.emit('realizar-pago', notif)
      break
    case 'importacion_pendiente':
      break
    default:
      break
  }
}

const aprobarImportacion = async (notif) => {
  console.log(notif)
  const point = `autorizarProductoVarianteImportacion/${notif.id}`
  console.log(point)
  try {
    const response = await api.get(point)
    const data = response.data

    if (data.status === 'ok') {
      $q.notify({
        type: 'positive',
        message: i18nT('ui.importacion-autorizada-y-procesada-correctamente-d61e89'),
        icon: 'check_circle',
        timeout: 3000,
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || i18nT('ui.error-al-autorizar-la-importacion-24b55f'),
        icon: 'error',
        timeout: 5000,
        position: 'top',
      })
    }

    // Recargar notificaciones para reflejar el cambio
    await getNotificaciones()
  } catch (error) {
    console.error('[aprobarImportacion]', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-conexion-al-procesar-la-solicitud-dc2402'),
      icon: 'error',
      timeout: 5000,
      position: 'top',
    })
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// Ejemplo de cómo agregar una notificación que se autoelimina
// autoRemoveNotification(1, 10);

const handleReiniciarNotificaciones = () => {
  getNotificaciones()
}

onMounted(() => {
  getNotificaciones()
  emitter.on('reiniciar-notificaciones', handleReiniciarNotificaciones)
})

onUnmounted(() => {
  emitter.off('reiniciar-notificaciones', handleReiniciarNotificaciones)
})
</script>

<style scoped>
.bg-grey-3 {
  background-color: #f5f5f5 !important;
}
</style>
