<template>
  <div class="pdf-container">
    <!-- Indicador de carga mientras se genera el PDF -->
    <div v-if="loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Generando comprobante...</p>
    </div>

    <!-- Mensaje de error si falla -->
    <div v-else-if="error" class="error-message">
      <q-icon name="error" color="negative" size="2em" />
      <p>{{ error }}</p>
    </div>

    <!-- Visor del PDF (solo en escritorio) -->
    <iframe
      v-else-if="!isMobile && pdfUrl"
      :src="pdfUrl"
      class="pdf-viewer"
      frameborder="0"
      title="Comprobante PDF"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { generarPdfCotizacion } from 'src/utils/pdfs/DetallleCotizacion/reporteqr'
import { api } from 'src/boot/axios'

const route = useRoute()
const id = route.params.i
const empresa = route.params.e

const pdfUrl = ref(null)
const loading = ref(false)
const error = ref(null)
const isMobile = ref(false) // indica si el dispositivo es móvil/tablet

const generarComprobantePDF = async () => {
  loading.value = true
  error.value = null

  try {
    const endpoint = `detallesCotizacion/${id}/${empresa}`
    const response = await api.get(endpoint)
    const data = response.data

    if (data[0] === 'error') {
      error.value = data.error || 'Error desconocido al obtener los datos.'
      return
    }

    const doc = await generarPdfCotizacion(data)
    if (!doc) {
      error.value = 'No se pudo generar el PDF.'
      return
    }

    const pdfBlob = doc.output('blob')

    // Revocar URL anterior si existe
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
    pdfUrl.value = URL.createObjectURL(pdfBlob)

    // Si es dispositivo móvil, intentar abrir en nueva pestaña
    if (isMobile.value) {
      const newWindow = window.open(pdfUrl.value, '_blank')
      if (!newWindow) {
        // Pop-up bloqueado: forzar descarga
        const link = document.createElement('a')
        link.href = pdfUrl.value
        link.download = 'comprobante.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        newWindow.focus()
      }
      // No limpiar la URL ahora, la nueva pestaña/descarga la necesita
      // La limpieza se hará al desmontar el componente si es necesario
    }
    // Si es escritorio, el iframe ya está vinculado a pdfUrl (se muestra automáticamente)
  } catch (err) {
    console.error('Error al generar comprobante PDF:', err)
    error.value = 'Ocurrió un error inesperado al generar el comprobante.'
  } finally {
    loading.value = false
  }
}

// Limpiar la URL del blob al desmontar el componente
onBeforeUnmount(() => {
  if (pdfUrl.value) {
    // Solo revocar si no se compartió con una nueva ventana/descarga (móvil)
    if (!isMobile.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
    // En móvil, el blob sigue referenciado por la nueva pestaña o la descarga,
    // el navegador lo liberará cuando ya no sea necesario.
  }
})

onMounted(() => {
  // Detectar si es un dispositivo móvil por tamaño de pantalla (ajustable)
  isMobile.value = window.innerWidth < 768
  generarComprobantePDF()
})
</script>

<style scoped>
.pdf-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.loading,
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #555;
}

.error-message {
  color: #c10015;
}

.pdf-viewer {
  width: 100vw;
  height: 100vh;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
