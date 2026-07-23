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

    <!-- Visor del PDF -->
    <iframe
      v-else-if="pdfUrl"
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
import { generarPdfCotizacion } from 'src/utils/pdfs/DetallleCotizacion/reporteQR'
import { api } from 'src/boot/axios'

const route = useRoute()
const id = route.params.i
const empresa = route.params.e

const pdfUrl = ref(null)
const loading = ref(false)
const error = ref(null)

const generarComprobantePDF = async () => {
  loading.value = true
  error.value = null

  try {
    const endpoint = `detallesCotizacion/${id}/${empresa}`
    const response = await api.get(endpoint)
    const data = response.data

    if (data[0] === 'error') {
      error.value = data.error || 'Error desconocido al obtener los datos.'
    } else {
      const doc = await generarPdfCotizacion(data)
      if (doc) {
        const pdfBlob = doc.output('blob')
        // Revocar URL anterior si existe
        if (pdfUrl.value) {
          URL.revokeObjectURL(pdfUrl.value)
        }
        pdfUrl.value = URL.createObjectURL(pdfBlob)
      } else {
        error.value = 'No se pudo generar el PDF.'
      }
    }
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
    URL.revokeObjectURL(pdfUrl.value)
  }
})

onMounted(() => {
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
