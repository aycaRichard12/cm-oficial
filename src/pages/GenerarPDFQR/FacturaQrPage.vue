<template>
  <div class="pdf-container">
    <div v-if="loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Generando comprobante...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <q-icon name="error" color="negative" size="2em" />
      <p>{{ error }}</p>
    </div>

    <!-- Visor solo en escritorio -->
    <iframe
      v-else-if="!isMobile && pdfUrl"
      :src="pdfUrl"
      class="pdf-viewer"
      frameborder="0"
      title="Comprobante PDF"
    ></iframe>

    <!-- Mensaje para móviles (la apertura/descarga ya se intentó) -->
    <div v-else-if="isMobile && mobileFallbackUrl" class="mobile-success">
      <q-icon name="check_circle" color="positive" size="2em" />
      <p>Comprobante generado. Si no se abrió automáticamente, podés descargarlo manualmente.</p>
      <a :href="mobileFallbackUrl" download="comprobante.pdf" class="download-link">
        Descargar comprobante
      </a>
    </div>
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

const pdfUrl = ref(null) // para el iframe de escritorio
const mobileFallbackUrl = ref(null) // enlace de descarga manual para móvil
const loading = ref(false)
const error = ref(null)
const isMobile = ref(false)

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

    const resultado = await generarPdfCotizacion(data)
    if (!resultado || !resultado.doc) {
      error.value = 'No se pudo generar el PDF.'
      return
    }

    // Limpiar blob anterior
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
      pdfUrl.value = null
    }

    if (isMobile.value) {
      // En móvil, la función ya intentó abrir/descargar.
      // Solo guardamos la URL para el enlace manual.
      mobileFallbackUrl.value = resultado.mobileBlobUrl
    } else {
      // Escritorio: crear blob para el iframe
      const pdfBlob = resultado.doc.output('blob')
      pdfUrl.value = URL.createObjectURL(pdfBlob)
    }
  } catch (err) {
    console.error('Error al generar comprobante PDF:', err)
    error.value = 'Ocurrió un error inesperado al generar el comprobante.'
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  // mobileFallbackUrl no se revoca porque el enlace lo usa; el navegador lo libera al cerrar la página
})

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  generarComprobantePDF()
})
</script>

<style scoped>
/* Tus estilos actuales más lo nuevo */
.mobile-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}
.download-link {
  color: var(--q-primary);
  font-weight: bold;
  text-decoration: underline;
}
</style>
