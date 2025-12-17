<template>
  <q-btn
    round
    :icon="isListening ? 'mic_off' : 'mic'"
    :color="isListening ? 'red' : 'primary'"
    size="md"
    @click="toggleListening"
    :loading="isProcessing"
  >
    <template v-slot:loading>
      <q-spinner v-if="isProcessing || isListening" size="1em" color="white" />
    </template>
  </q-btn>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaHoraNumerica } from 'src/composables/FuncionesG'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
import emitter from 'src/event-bus'

// Globales del navegador
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechSynthesisUtterance =
  window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance

// Instancias de Quasar y Vue Router
const { proxy } = getCurrentInstance() // Acceso a this.$q y this.$axios
const $q = proxy.$q
const $axios = proxy.$axios

// --- ESTADO REACTIVO ---
const PHP_ENDPOINT_URL = 'https://vivasoft.link/app/cmv1/api/detectar_intencion'

const isListening = ref(false)
const isProcessing = ref(false)
const sessionId = ref(null)
const recognition = ref(null)

// Bandera para controlar la escucha continua
const isContinuousMode = ref(false)

// --- UTILIDADES ---

const notify = (message, type = 'info') => {
  $q.notify({
    message: message,
    color: type === 'negative' ? 'negative' : type === 'positive' ? 'positive' : 'info',
    position: 'top',
    timeout: 2000,
  })
}

const emitirVoz = (texto, onEndCallback = null) => {
  if ('speechSynthesis' in window && texto) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-ES'
    if (onEndCallback) {
      // Agrega un callback que se ejecuta al terminar de hablar
      utterance.onend = onEndCallback
    }
    window.speechSynthesis.speak(utterance)
  } else if (onEndCallback) {
    // Si no hay voz, ejecuta el callback inmediatamente
    onEndCallback()
  }
}

// --- GESTIÓN DE SESIÓN ---

const createOrRetrieveSessionId = () => {
  let id = idusuario_md5() + obtenerFechaHoraNumerica().toString()

  if (!id) {
    // Generar un ID simple y guardar para persistencia
    id = 'guest-' + Date.now() + Math.random().toString(36).substring(2, 9)
    localStorage.setItem('dialogflow_session_id', id)
  }

  sessionId.value = id
  console.log(`[Session] Dialogflow Session ID: ${sessionId.value}`)
}
// --- LÓGICA DE ACCIÓN Y NAVEGACIÓN ---
const ejecutarAccion = (data) => {
  console.log(data)
  const { intencion, respuestaPorVoz, parametros, comandoOriginal } = data
  console.log(`[Acción] Ejecutando acción para la intención: ${intencion}`) // 1. Manejo de comando de salida
  console.log(`[Acción] Comando original: ${comandoOriginal}`)

  if (
    comandoOriginal &&
    ['salir', 'finalizar', 'detener', 'adiós'].includes(respuestaPorVoz.toLowerCase().trim())
  ) {
    emitirVoz('Modo de voz desactivado. ¡Hasta pronto!', stopRecognition)
    return
  } // 2. Ejecución de acción (Navegación/Retroalimentación)

  const ruta = parametros.menu || null
  console.log(`[Acción] Ruta extraída de parámetros: ${ruta}`)
  const navegar = verificarexistenciapagina(ruta)

  const onActionComplete = () => {
    // Después de ejecutar y hablar, reinicia el reconocimiento si estamos en modo continuo
    if (isContinuousMode.value) {
      restartRecognition()
    }
  }

  if (navegar) {
    emitter.emit('abrir-submenu', navegar)
    notify(respuestaPorVoz, 'positive')
    emitirVoz(respuestaPorVoz, onActionComplete)
  } else {
    $q.loading.show({
      message: 'El comando ingresado no fue reconocido o no cuenta con los permisos necesarios.',
    })
    notify(
      'El comando ingresado no fue reconocido o no cuenta con los permisos necesarios',
      'negative',
    )
    emitirVoz(
      'El comando ingresado no fue reconocido o no cuenta con los permisos necesarios',
      () => {
        $q.loading.hide()
        onActionComplete()
      },
    )
  }
}

// --- LÓGICA DE VOZ Y HTTP ---

const setupSpeechRecognition = () => {
  if (!SpeechRecognition) {
    console.error('ERROR: Tu navegador no soporta el reconocimiento de voz.')
    notify('El control por voz no está disponible en este navegador.', 'negative')
    return
  }

  recognition.value = new SpeechRecognition()
  recognition.value.lang = 'es-ES' // **CLAVE:** Habilita `continuous` para múltiples comandos.
  recognition.value.continuous = true
  recognition.value.interimResults = false
  recognition.value.maxAlternatives = 1

  recognition.value.onstart = () => {
    isListening.value = true
    notify('Modo de escucha activado. Di un comando.')
  }

  recognition.value.onresult = (event) => {
    // Detenemos el reconocimiento temporalmente mientras procesamos,
    // para evitar que capture audio de la propia respuesta del sistema.
    stopRecognition(false)

    const command = event.results[event.results.length - 1][0].transcript // Último resultado completo
    console.log(`[Voz] Comando reconocido: "${command}"`) // Verifica comando de salida inmediatamente
    if (['salir', 'finalizar', 'detener', 'adiós'].includes(command.toLowerCase().trim())) {
      ejecutarAccion({ comandoOriginal: command })
    } else {
      sendToDialogflow(command)
    }
  }

  recognition.value.onend = () => {
    console.log('[Voz] Reconocimiento de voz finalizado.')
    isListening.value = false // Si estamos en modo continuo, reiniciamos automáticamente solo si no estamos procesando
    // La función `ejecutarAccion` ahora se encarga de llamar a `restartRecognition`
    // una vez que la voz ha terminado de hablar.
    if (isContinuousMode.value && !isProcessing.value) {
      // Caso de error o fin inesperado sin comando de salida
      // Puede que sea necesario manejarlo aquí, pero lo simplificamos para el ejemplo
    }
  }

  recognition.value.onerror = (event) => {
    isListening.value = false
    isProcessing.value = false
    console.error(`[Voz] Error: ${event.error}`)
    notify(`Error al escuchar: ${event.error}. Inténtalo de nuevo.`, 'negative')
    isContinuousMode.value = false // Desactiva modo continuo ante un error
  }
}

const startRecognition = () => {
  if (recognition.value && !isListening.value) {
    isContinuousMode.value = true // Entra en modo de escucha continua
    try {
      recognition.value.start()
    } catch (e) {
      notify('Asegúrate de conceder permiso al micrófono.', 'negative')
      console.error('Error al iniciar micrófono:', e)
      isContinuousMode.value = false
    }
  }
}

const stopRecognition = (resetMode = true) => {
  if (recognition.value && isListening.value) {
    // El `stop()` dispara el evento `onend`
    recognition.value.stop()
    if (resetMode) {
      isContinuousMode.value = false
      notify('Modo de voz desactivado.', 'info')
    }
  } else if (resetMode) {
    isContinuousMode.value = false
  }
}

const restartRecognition = () => {
  if (isContinuousMode.value && !isListening.value && !isProcessing.value) {
    console.log('[Voz] Reiniciando la escucha para el siguiente comando...')
    notify('Di tu siguiente comando...', 'info')
    startRecognition()
  }
}

const toggleListening = () => {
  if (isProcessing.value) return

  if (isListening.value) {
    // Detener la escucha y salir del modo continuo
    stopRecognition(true)
  } else {
    // Iniciar la escucha en modo continuo
    startRecognition()
  }
}

const sendToDialogflow = async (command) => {
  isProcessing.value = true
  notify('Procesando comando...', 'info')

  try {
    const response = await $axios.post(PHP_ENDPOINT_URL, {
      comando: command,
      sessionId: sessionId.value,
    })

    const data = response.data
    console.log(`[IA] Intención: ${data.intencion}, Respuesta: "${data.respuestaPorVoz}"`)

    ejecutarAccion(data)
  } catch (error) {
    notify('Error de comunicación con el servidor. Revisar consola.', 'negative')
    emitirVoz('Lo siento, no pude comunicarme con el servidor.', () => {
      if (isContinuousMode.value) restartRecognition()
    })
    console.error('Error en la petición PHP/Dialogflow:', error)
  } finally {
    isProcessing.value = false
  }
}

// --- CICLO DE VIDA ---

onMounted(() => {
  createOrRetrieveSessionId() // Inicializa o recupera el ID de sesión
  setupSpeechRecognition()
})
</script>
