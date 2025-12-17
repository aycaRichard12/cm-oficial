import { useQuasar } from 'quasar'
import { useProveedorStore } from 'stores/proveedor'
import ProviderSearchDialog from 'components/ProviderSearchDialog.vue' // Import your new component

export function useWhatsapp() {
  const $q = useQuasar()
  const proveedorStore = useProveedorStore()

  const mostrarDialogoWhatsapp = async (mensaje) => {
    try {
      if (proveedorStore.lista.length === 0) {
        await proveedorStore.getProveedor()
      }

      $q.dialog({
        component: ProviderSearchDialog,
        componentProps: {
          providers: proveedorStore.lista,
        },
      })
        .onOk((selectedNumber) => {
          if (selectedNumber) {
            const url = `https://wa.me/${selectedNumber}?text=${encodeURIComponent(mensaje)}`
            window.open(url, '_blank')
          } else {
            $q.notify({ type: 'negative', message: 'No se seleccionó ningún proveedor.' })
          }
        })
        .onCancel(() => {
          // Dialog was cancelled
        })
        .onDismiss(() => {
          // Dialog was dismissed (e.g., by clicking outside)
        })
    } catch (error) {
      console.error('Error al obtener mensaje de pedido:', error)
      $q.notify({ type: 'negative', message: 'No se pudo generar el mensaje para WhatsApp' })
    }
  }

  return { mostrarDialogoWhatsapp }
}
