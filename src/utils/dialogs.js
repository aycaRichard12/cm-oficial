/**
 * Muestra un diálogo centralizado con icono y color según el tipo
 * @param {object} $q - Instancia de Quasar (debe pasarse desde el componente)
 * @param {string} tipo - Tipo de diálogo: "I" (Info), "Q" (Pregunta), "E" (Error), "W" (Warning), "S" (Éxito)
 * @param {string} mensaje - Mensaje a mostrar en el diálogo
 * @returns {Promise<boolean>} Promise que resuelve a true si se acepta, false si se cancela
 */
export const showDialog = ($q, tipo, mensaje) => {
  // Configuración según el tipo
  const config = {
    I: {
      icon: 'info',
      color: 'primary',
      title: 'Información',
      okLabel: 'Aceptar',
    },
    Q: {
      icon: 'help',
      color: 'warning',
      title: 'Pregunta',
      okLabel: 'Sí',
      cancelLabel: 'No',
    },
    E: {
      icon: 'error',
      color: 'negative',
      title: 'Error',
      okLabel: 'Entendido',
    },
    W: {
      icon: 'warning',
      color: 'orange',
      title: 'Advertencia',
      okLabel: 'Aceptar',
    },
    S: {
      icon: 'check_circle',
      color: 'positive',
      title: '¡Éxito!',
      okLabel: 'Continuar',
    },
  }

  const dialogConfig = config[tipo] || config['I']

  // Configuración base del diálogo
  const dialogOptions = {
    html: true,
    title: `
      <div class="column items-center q-pb-md">
        <i class="material-icons text-${dialogConfig.color}" style="font-size: 48px;">${dialogConfig.icon}</i>
        <div class="text-h6 q-mt-sm">${dialogConfig.title}</div>
      </div>
    `,
    message: `
      <div class="text-center text-body1 q-mb-md">${mensaje}</div>
    `,
    ok: {
      label: `${dialogConfig.okLabel}`,
      color: dialogConfig.color,
      unelevated: true,
    },
    persistent: true,
    focus: 'ok',
  }

  // Agregar botón de cancelar solo para preguntas
  if (tipo === 'Q') {
    dialogOptions.cancel = {
      label: `${dialogConfig.cancelLabel}<`,
      color: 'grey-7',
      flat: true,
    }
  }

  return new Promise((resolve) => {
    $q.dialog(dialogOptions)
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}

// Exportar por defecto para importación conveniente
export default { showDialog }
