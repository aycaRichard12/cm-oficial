<template>
  <div class="pdf-container">
    <div v-if="loading" class="status-message">
      <q-spinner color="primary" size="3em" />
      <p class="text-subtitle1 q-mt-md">Generando comprobante...</p>
    </div>

    <div v-else-if="error" class="status-message text-negative">
      <q-icon name="error" size="3em" />
      <p class="text-subtitle1 q-mt-md">{{ error }}</p>
    </div>

    <template v-else-if="!isMobile && pdfUrl">
      <div class="toolbar">
        <span class="text-h6 text-weight-bold">Comprobante PDF</span>
        <q-btn
          color="primary"
          icon="download"
          label="Descargar"
          outline
          :href="pdfUrl"
          download="comprobante.pdf"
        />
      </div>
      <iframe :src="pdfUrl" class="pdf-viewer" frameborder="0" title="Comprobante PDF" />
    </template>

    <div v-else-if="isMobile && mobileFallbackUrl" class="status-message mobile-success">
      <q-icon name="check_circle" color="positive" size="4em" />
      <h5 class="text-weight-bold q-mb-sm">Comprobante listo</h5>
      <p class="text-body1">
        Si la descarga no inició automáticamente, usá el botón de abajo para obtener tu archivo.
      </p>
      <q-btn
        color="primary"
        icon="download"
        label="Descargar comprobante"
        type="a"
        :href="mobileFallbackUrl"
        download="comprobante.pdf"
        unelevated
        size="lg"
        class="q-mt-lg"
      />
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

const pdfUrl = ref(null)
const mobileFallbackUrl = ref(null)
const loading = ref(false)
const error = ref(null)
const isMobile = ref(window.innerWidth < 768)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const generarComprobantePDF = async () => {
  loading.value = true
  error.value = null

  try {
    const endpoint = `detallesCotizacion/${id}/${empresa}`
    const { data } = await api.get(endpoint)

    if (data.error) {
      error.value = data.error
      return
    }

    const resultado = await generarPdfCotizacion(data)
    if (!resultado?.doc) {
      error.value = 'No se pudo generar el PDF.'
      return
    }

    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
      pdfUrl.value = null
    }

    if (isMobile.value) {
      mobileFallbackUrl.value = resultado.mobileBlobUrl
    } else {
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
  window.removeEventListener('resize', checkMobile)
})

onMounted(() => {
  window.addEventListener('resize', checkMobile)
  generarComprobantePDF()
})
</script>

<style scoped>
.pdf-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  width: 100%;
  background: #fff;
}
.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 2rem;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
.pdf-viewer {
  flex: 1;
  width: 100%;
  border: none;
}
.mobile-success {
  justify-content: center;
}
</style>
