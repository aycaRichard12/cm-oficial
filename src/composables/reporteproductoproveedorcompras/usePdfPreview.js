import { ref, onUnmounted } from 'vue'

/**
 * Composable para manejar la previsualización de PDFs en modal
 * Principio de Responsabilidad Única: Solo maneja preview de PDFs
 */
export function usePdfPreview() {
  const showPdfModal = ref(false)
  const pdfUrl = ref(null)

  const openPdfPreview = (pdfDoc) => {
    // Revocar URL anterior si existe
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }

    // Crear blob URL y mostrar en modal
    pdfUrl.value = URL.createObjectURL(pdfDoc.output('blob'))
    showPdfModal.value = true
  }

  const closePdfPreview = () => {
    showPdfModal.value = false
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
      pdfUrl.value = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
  })

  return {
    showPdfModal,
    pdfUrl,
    openPdfPreview,
    closePdfPreview,
  }
}
