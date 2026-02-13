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
      color: 'blue',
      title: 'Información',
      okLabel: 'Aceptar',
    },
    Q: {
      icon: 'help',
      color: 'warning',
      title: 'Pregunta',
      okLabel: 'Sí, Deseo Continuar',
      cancelLabel: 'No, Cancelar',
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
      title: 'Éxito',
      okLabel: 'Continuar',
    },
  }

  const dialogConfig = config[tipo] || config['I']

  // Configuración base del diálogo con diseño mejorado y ALTURA AUTOMÁTICA
  const dialogOptions = {
    html: true,
    title: `
      <div class="q-px-lg q-pt-lg q-pb-md">
        <div class="row items-center no-wrap">
          <div class="col-auto">
            <div class="rounded-borders flex items-center justify-center" 
                 style="width: 64px; height: 64px; background: var(--q-${dialogConfig.color}-0, rgba(var(--q-${dialogConfig.color}), 0.1))">
              <i class="material-icons text-${dialogConfig.color}" style="font-size: 40px;">${dialogConfig.icon}</i>
            </div>
          </div>
          <div class="col q-ml-md">
            <div class="text-h5 text-weight-600">${dialogConfig.title}</div>
          </div>
        </div>
        <div class="q-mt-md q-ml-sm" style="border-left: 3px solid var(--q-${dialogConfig.color}); padding-left: 16px;">
          <div class="text-body1 text-weight-500" style="line-height: 1.5; color: #2c3e50; word-break: break-word;">${mensaje}</div>
        </div>
      </div>
    `,
    message: '',
    ok: {
      label: dialogConfig.okLabel,
      color: dialogConfig.color,
      unelevated: true,
      noCaps: false,
      padding: '',
      class: 'q-px-xl',
      size: 'lg',
    },
    persistent: true,
    focus: 'ok',
    class: 'shadow-24',
    style: 'border-radius: 10px; max-width: 520px; width: 100%;',
  }

  // Agregar botón de cancelar solo para preguntas
  if (tipo === 'Q') {
    dialogOptions.cancel = {
      label: dialogConfig.cancelLabel,
      color: 'grey-7',
      flat: true,
      noCaps: false,
      padding: '',
      class: 'q-px-xl',
      size: 'lg',
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
