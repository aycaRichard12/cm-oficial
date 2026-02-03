<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 450px; max-width: 600px">
      <!-- Header -->
      <q-card-section class="bg-primary text-white row items-center q-pb-md">
        <q-avatar color="white" text-color="primary" size="42px">
          <q-icon name="notifications_active" size="28px" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-h6 text-white">Nueva Notificación</div>
          <div class="text-caption text-white">
            {{ formatearFecha(datosNotificacion?.fecha) }}
          </div>
        </div>
        <q-space />
      </q-card-section>

      <q-separator />

      <!-- Contenido de la notificación -->
      <q-card-section class="q-pt-md">
        <!-- Asunto -->
        <div class="q-mb-md">
          <div class="text-overline text-grey-7">Asunto</div>
          <div class="text-h6 text-grey-9">
            {{ datosNotificacion?.asunto || 'Sin asunto' }}
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Descripción/Mensaje -->
        <div class="q-mb-md">
          <div class="text-overline text-grey-7">Descripción</div>
          <div class="text-body1 text-grey-9" style="white-space: pre-wrap">
            {{ datosNotificacion?.descripcion || 'Sin contenido' }}
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Acciones -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cerrar" color="grey-7" @click="cerrarNotificacion" v-close-popup />
        <q-btn
          v-if="datosNotificacion?.url_de_envio"
          unelevated
          label="Ir a la página"
          color="secondary"
          @click="irAPagina"
          icon="arrow_forward"
        />
        <!-- <q-btn
          unelevated
          label="Marcar como leída"
          color="primary"
          @click="marcarComoLeida"
          icon="done"
          class="q-ml-sm"
        /> -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const isOpen = ref(false)
const notificacion = ref(null)

// Computed para extraer los datos de la notificación
// La estructura puede venir como: { texto: {...} } o { mensaje: {...} }
const datosNotificacion = computed(() => {
  if (!notificacion.value) return null
  
  // Intentar obtener datos de diferentes estructuras posibles
  return notificacion.value.texto || 
         notificacion.value.mensaje || 
         notificacion.value
})

// Métodos
function mostrarNotificacion(data) {
  console.log('Mostrando notificación completa:', data)
  console.log('Datos extraídos:', data.texto || data.mensaje)
  
  notificacion.value = data
  isOpen.value = true

  // Reproducir sonido de notificación
  reproducirSonido()
}

function cerrarNotificacion() {
  isOpen.value = false
  setTimeout(() => {
    notificacion.value = null
  }, 300)
}

function irAPagina() {
  const urlDeEnvio = datosNotificacion.value?.url_de_envio
  
  if (urlDeEnvio) {
    console.log('Navegando a:', urlDeEnvio)
    
    // Cerrar el dialog
    cerrarNotificacion()
    
    // Navegar a la ruta (agregar / si no lo tiene)
    const ruta = urlDeEnvio.startsWith('/') ? urlDeEnvio : `/${urlDeEnvio}`
    router.push(ruta)
    
    $q.notify({
      type: 'info',
      message: 'Redirigiendo a la página...',
      position: 'top',
      timeout: 1500
    })
  }
}

// function marcarComoLeida() {
//   console.log('Notificación marcada como leída:', notificacion.value)

//   $q.notify({
//     type: 'positive',
//     message: 'Notificación marcada como leída',
//     position: 'top',
//     timeout: 1500,
//   })

//   cerrarNotificacion()
// }

function formatearFecha(fecha) {
  if (!fecha) return 'Ahora'

  try {
    // Manejar formato "2026-02-03 21:34:09" o "2026-02-03 17:20"
    let date
    
    // Si la fecha ya es un objeto Date
    if (fecha instanceof Date) {
      date = fecha
    } 
    // Si es string en formato "YYYY-MM-DD HH:mm:ss" o "YYYY-MM-DD HH:mm"
    else if (typeof fecha === 'string') {
      // Reemplazar espacio por 'T' para que sea compatible con ISO
      const fechaISO = fecha.replace(' ', 'T')
      date = new Date(fechaISO)
    } 
    else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', fecha)
      return 'Fecha inválida'
    }

    const ahora = new Date()
    const diferencia = ahora - date

    // Menos de 1 minuto
    if (diferencia < 60000) {
      return 'Hace un momento'
    }

    // Menos de 1 hora
    if (diferencia < 3600000) {
      const minutos = Math.floor(diferencia / 60000)
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`
    }

    // Menos de 24 horas
    if (diferencia < 86400000) {
      const horas = Math.floor(diferencia / 3600000)
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`
    }

    // Formato completo
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Fecha no disponible'
  }
}

function reproducirSonido() {
  try {
    // Crear un sonido de notificación simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('No se pudo reproducir el sonido de notificación', error)
  }
}

// Watch para debug
watch(isOpen, (newVal) => {
  console.log('Dialog isOpen:', newVal)
  if (newVal) {
    console.log('Datos de notificación:', datosNotificacion.value)
  }
})

// Exponer método para uso externo
defineExpose({
  mostrarNotificacion,
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
