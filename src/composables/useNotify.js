import { useQuasar } from 'quasar'

export function useNotify() {
  const $q = useQuasar()

  /**
   * Llama al diálogo personalizado de Quasar
   * @param {string} tipo - I, Q, E, W, S
   * @param {string} mensaje - Texto a mostrar
   */
  const confirm = (tipo, mensaje) => {
    let title = 'Información'
    let color = 'primary'
    if (tipo === 'Q') { title = 'Confirmar'; color = 'primary' }
    else if (tipo === 'W') { title = 'Advertencia'; color = 'warning' }
    else if (tipo === 'E') { title = 'Error'; color = 'negative' }
    else if (tipo === 'S') { title = 'Éxito'; color = 'positive' }

    return new Promise((resolve) => {
      $q.dialog({
        title: title,
        message: mensaje,
        persistent: true,
        ok: {
          label: tipo === 'Q' ? 'Aceptar' : 'OK',
          color: color,
          unelevated: true
        },
        cancel: tipo === 'Q' ? {
          label: 'Cancelar',
          color: 'grey-7',
          flat: true
        } : false
      })
        .onOk(() => {
          resolve(true) // Usuario presionó el botón principal
        })
        .onCancel(() => {
          resolve(false) // Usuario canceló o cerró
        })
        .onDismiss(() => {
          resolve(false) // El diálogo se cerró por cualquier motivo
        })
    })
  }

  // Atajos para mayor comodidad
  return {
    info: (msg) => confirm('I', msg),
    success: (msg) => confirm('S', msg),
    error: (msg) => confirm('E', msg),
    warn: (msg) => confirm('W', msg),
    question: (msg) => confirm('Q', msg),
  }
}
