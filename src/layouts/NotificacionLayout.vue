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
            Notificaciones
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
                  {{ notification.title }} {{ 'en fecha ' + notification.fecha }}
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
              <q-item-section class="text-center text-grey"> No hay notificaciones </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import emitter from 'src/event-bus'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
// Estado de la UI
const showMenu = ref(false)
const compactMode = ref(true)

const getNotificaciones = async () => {
  const point = `getNotificaciones/${idusuario_md5()}/${idempresa_md5()}`
  console.log(point)
  const response = await api.get(point)

  console.log(response.data)
  notifications.value = response.data
}

// Datos de las notificaciones
const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: 'Pedido Aprobado',
    message: 'Tu pedido #123 fue aprobado y se está preparando para el envío.',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Actualización del sistema',
    message: 'Hemos lanzado una nueva versión con mejoras de rendimiento.',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Credenciales a punto de expirar',
    message: 'Tu contraseña caducará en 7 días. Por favor, actualízala.',
    read: true,
  },
  {
    id: 4,
    type: 'error',
    title: 'Fallo en la transacción',
    message: 'Hubo un error al procesar tu último pago. Revisa tus datos.',
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
    default:
      break
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

onMounted(() => {
  getNotificaciones()

  emitter.on('reiniciar-notificaciones', () => {
    getNotificaciones()
  })
})
</script>

<style scoped>
.bg-grey-3 {
  background-color: #f5f5f5 !important;
}
</style>
