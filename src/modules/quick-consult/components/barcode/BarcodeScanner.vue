<!-- src/modules/quick-consult/components/barcode/BarcodeScanner.vue -->
<template>
  <q-dialog
    v-model="isOpen"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @show="onDialogOpen"
    @hide="onDialogClose"
  >
    <q-card class="bg-black text-white overflow-hidden column no-wrap">
      <!-- Header Overlay -->
      <div class="scanner-header q-pa-md row items-center justify-between">
        <div class="row items-center">
          <q-icon name="qr_code_scanner" size="md" color="primary" class="q-mr-sm" />
          <div>
            <div class="text-subtitle1 text-weight-bold">Escáner de Barras</div>
            <div class="text-caption opacity-70">Apunta al código del producto</div>
          </div>
        </div>
        <q-btn flat round icon="close" color="white" v-close-popup />
      </div>

      <!-- Scanner Container -->
      <div class="scanner-viewport col relative-position">
        <!-- HTML5-QRCode Target -->
        <div id="qr-reader" class="full-height full-width"></div>

        <!-- Overlay de guía (Custom) -->
        <div class="scanner-overlay" v-if="isScanning">
          <div class="scan-region">
            <div class="scan-corner top-left"></div>
            <div class="scan-corner top-right"></div>
            <div class="scan-corner bottom-left"></div>
            <div class="scan-corner bottom-right"></div>
            <div class="scan-line"></div>
          </div>

          <div class="scanner-tip text-center q-pa-md">
            {{ statusMessage }}
          </div>
        </div>

        <!-- Loading / Permission state -->
        <div v-if="isLoading" class="absolute-full flex flex-center bg-black z-top">
          <div class="text-center">
            <q-spinner-dots color="primary" size="3rem" />
            <div class="q-mt-md">Iniciando cámara...</div>
          </div>
        </div>

        <!-- Error state -->
        <div v-if="error" class="absolute-full flex flex-center bg-black q-pa-xl z-top">
          <div class="text-center">
            <q-icon name="error_outline" color="negative" size="4rem" />
            <div class="text-h6 q-mt-md">Error de cámara</div>
            <div class="text-body2 q-mt-sm text-grey-5">{{ error }}</div>
            <q-btn
              color="primary"
              label="Reintentar"
              class="q-mt-lg"
              rounded
              @click="startScanner"
            />
            <q-btn
              flat
              color="white"
              label="Ingresar manualmente"
              class="q-mt-sm full-width"
              @click="showManualInput = true"
            />
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="scanner-footer q-pa-lg">
        <div class="row q-col-gutter-sm justify-center">
          <div class="col-6">
            <q-btn
              outline
              color="white"
              icon="flashlight_on"
              :label="isFlashOn ? 'Apagar luz' : 'Encender luz'"
              class="full-width rounded-btn"
              @click="toggleFlash"
              :disable="!hasFlash"
            />
          </div>
          <div class="col-6">
            <q-btn
              outline
              color="white"
              icon="flip_camera_ios"
              label="Girar"
              class="full-width rounded-btn"
              @click="toggleCamera"
            />
          </div>
        </div>

        <q-btn
          flat
          color="primary"
          icon="edit"
          label="Ingresar código manualmente"
          class="full-width q-mt-md"
          @click="showManualInput = true"
          no-caps
        />
      </div>

      <!-- Manual Input Dialog -->
      <q-dialog v-model="showManualInput" position="bottom">
        <q-card style="width: 100%; border-radius: 20px 20px 0 0">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Código manual</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-sm">
            <q-input
              v-model="manualCode"
              label="Ingresa el código de barras"
              outlined
              autofocus
              @keyup.enter="handleManualSubmit"
            >
              <template v-slot:append>
                <q-btn round dense flat icon="arrow_forward" @click="handleManualSubmit" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
//import { useQuasar } from 'quasar'
import { Html5Qrcode } from 'html5-qrcode'
import { useQuickConsultUiStore } from '../../stores/uiStore'

//const $q = useQuasar()
const uiStore = useQuickConsultUiStore()

const emit = defineEmits(['scan'])

// State
const isLoading = ref(true)
const isScanning = ref(false)
const error = ref(null)
const statusMessage = ref('Buscando código...')
const isFlashOn = ref(false)
const hasFlash = ref(false)
const showManualInput = ref(false)
const manualCode = ref('')
const currentCameraId = ref(null)

let html5QrCode = null

const isOpen = computed({
  get: () => uiStore.isScannerOpen,
  set: (val) => uiStore.setScannerOpen(val),
})

const onDialogOpen = () => {
  startScanner()
}

const onDialogClose = () => {
  stopScanner()
}

const startScanner = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Obtener cámaras disponibles
    const devices = await Html5Qrcode.getCameras()
    if (!devices || devices.length === 0) {
      throw new Error('No se detectaron cámaras en el dispositivo')
    }

    // Preferir la cámara trasera
    const backCamera = devices.find(
      (device) =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('trasera'),
    )
    currentCameraId.value = backCamera ? backCamera.id : devices[0].id

    // 2. Iniciar escáner
    html5QrCode = new Html5Qrcode('qr-reader')

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
        const size = Math.floor(minEdge * 0.7)
        return { width: size, height: size * 0.6 } // Rectangular para códigos de barras
      },
      aspectRatio: 1.0,
    }

    await html5QrCode.start(currentCameraId.value, config, onScanSuccess, onScanFailure)

    isScanning.value = true
    isLoading.value = false

    // Verificar si tiene flash (algunos dispositivos lo exponen vía track)
    try {
      const track = html5QrCode.getRunningTrack()
      const capabilities = track.getCapabilities()
      hasFlash.value = !!capabilities.torch
    } catch (e) {
      console.warn('No se pudo verificar capacidad de flash:', e)
      hasFlash.value = false
    }
  } catch (err) {
    console.error('Error starting scanner:', err)
    error.value = err.message || 'Error desconocido al iniciar la cámara'
    isLoading.value = false
  }
}

const stopScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (e) {
      console.warn('Error stopping scanner:', e)
    }
  }
  isScanning.value = false
  isFlashOn.value = false
}

const onScanSuccess = (decodedText) => {
  // Evitar disparos múltiples
  if (!isScanning.value) return

  // Haptic feedback si es posible
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(100)
  }

  emit('scan', decodedText)

  // El padre decidirá si cerrar el diálogo o no basado en el resultado
}

const onScanFailure = (err) => {
  console.warn('Scan failed:', err)
  // Este callback se llama constantemente mientras no hay código, lo ignoramos para no saturar
}

const toggleFlash = async () => {
  if (!hasFlash.value || !html5QrCode) return

  try {
    isFlashOn.value = !isFlashOn.value
    await html5QrCode.applyVideoConstraints({
      advanced: [{ torch: isFlashOn.value }],
    })
  } catch (e) {
    console.error('Error toggling flash:', e)
    isFlashOn.value = false
  }
}

const toggleCamera = async () => {
  await stopScanner()
  // Lógica simple para rotar entre cámaras (asumiendo 2 cámaras principales)
  try {
    const devices = await Html5Qrcode.getCameras()
    const currentIndex = devices.findIndex((d) => d.id === currentCameraId.value)
    const nextIndex = (currentIndex + 1) % devices.length
    currentCameraId.value = devices[nextIndex].id
    startScanner()
  } catch (e) {
    console.error('Error toggling camera:', e)
    startScanner()
  }
}

const handleManualSubmit = () => {
  if (manualCode.value.trim()) {
    emit('scan', manualCode.value.trim())
    showManualInput.value = false
    manualCode.value = ''
  }
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.scanner-viewport {
  background-color: black;
  overflow: hidden;
}

#qr-reader {
  border: none !important;
}

/* Forzar que el video ocupe el contenedor correctamente */
#qr-reader :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Ocultar elementos internos de html5-qrcode que no queremos */
#qr-reader :deep(img) {
  display: none !important;
}

.scanner-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-region {
  width: 70%;
  max-width: 400px;
  aspect-ratio: 1.6;
  position: relative;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4);
}

.scan-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid #26a69a;
}

.top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}
.top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}
.bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}
.bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.scan-line {
  position: absolute;
  left: 5%;
  width: 90%;
  height: 2px;
  background-color: #26a69a;
  box-shadow: 0 0 8px rgba(38, 166, 154, 0.8);
  animation: scan-animation 2s infinite ease-in-out;
}

@keyframes scan-animation {
  0% {
    top: 10%;
  }
  50% {
    top: 90%;
  }
  100% {
    top: 10%;
  }
}

.scanner-tip {
  margin-top: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  font-size: 0.9rem;
  pointer-events: auto;
}

.scanner-footer {
  background-color: #121212;
}

.rounded-btn {
  border-radius: 12px;
  padding: 8px 16px;
}

.z-top {
  z-index: 100;
}
</style>
