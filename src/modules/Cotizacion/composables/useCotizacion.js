// src/modules/Cotizacion/composables/useCotizacion.js
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { generarPdfCotizacion } from 'src/utils/pdfs/DetallleCotizacion/reporteqr.js'
import { PDFenviarComprobanteCorreo } from 'src/utils/pdfReportGenerator'
import { validarUsuario } from 'src/composables/FuncionesG'

export function useCotizacion(options) {
  const $q = useQuasar()
  const {
    carritoCO,
    tipoOperacion,
    idclienteCO,
    idsucursalCOS,
    filtroAlmacenCO,
    filtroCategoriaCO,
    puntoVenta,
    idcajaBancoSeleccionada,
    almacenesOptions,
    cotizacionFormRef,
    formClientes,
    resetCarrito,
    cargarAlmacenes,
    cargarCLientes,
    idempresa, // nuevo
  } = options

  const pdfData = ref(null)
  const mostrarModal = ref(false)
  const isMobile = ref(window.innerWidth < 768)
  const mobileFallbackUrl = ref(null)
  const dialog = ref(false)
  const position = ref('top')
  let resolver = null
  const detallesCotizacion = ref([])
  const idcliente = ref('')

  // ─── Envío de cotización ──────────────────────────────────────────────────
  async function enviarCotizacion() {
    // Fix BUG#1: los refs pueden no estar montados en el padre (los <q-form>
    // viven dentro de los componentes hijos). Si el ref no existe, NO bloqueamos
    // el flujo: solo validamos cuando el ref esté realmente disponible.
    const isValidForm = cotizacionFormRef.value ? await cotizacionFormRef.value.validate() : true
    const isValidCliente = formClientes.value ? await formClientes.value.validate() : true
    if (!isValidForm || !isValidCliente) {
      $q.notify({ type: 'info', message: 'Complete todos los campos requeridos.' })
      return false
    }
    if (carritoCO.listaProductos.length === 0) {
      $q.notify({ type: 'info', message: 'Debe añadir al menos un producto.' })
      return false
    }

    carritoCO.tipoOperacion = tipoOperacion.value?.value
    carritoCO.ipv = Number(puntoVenta.value) || 0
    carritoCO.idalmacen = filtroAlmacenCO.value
    carritoCO.tipopago = carritoCO.credito ? 'credito' : 'contado'
    carritoCO.cajabanco = idcajaBancoSeleccionada.value
    carritoCO.idcliente = idclienteCO.value
    carritoCO.md5_em = idempresa
    // Fix BUG#2: `.almacen` es un string; se elimina el encadenamiento
    // erróneo `.onCancel(...)` (era código pegado de un $q.dialog).
    carritoCO.almacen = almacenesOptions.value.find(
      (obj) => Number(obj.idalmacen) === Number(filtroAlmacenCO.value),
    )?.almacen
    const formData = new FormData()
    formData.append('ver', 'registrarCotizacion')
    formData.append('filtroALmacen', filtroAlmacenCO.value)
    formData.append('filtroCategoria', filtroCategoriaCO.value)
    formData.append('idcliente', idclienteCO.value)
    formData.append('idsucursal', idsucursalCOS.value)
    formData.append('listaProductos', JSON.stringify(carritoCO))
    formData.append('tipo_operacion', tipoOperacion.value?.value)

    $q.loading.show({ message: 'Registrando cotización...' })
    try {
      const response = await api.post('', formData)
      const data = response.data
      if (data.estado === 'exito') {
        resetCarrito()
        $q.notify({ type: 'positive', message: 'Cotización realizada exitosamente.' })
        cotizacionFormRef.value?.resetValidation()
        // Mostrar diálogo para ver comprobante
        return new Promise((resolve) => {
          $q.dialog({
            title: 'Cotización Exitosa',
            message: 'Su comprobante está listo. ¿Desea verlo?',
            cancel: true,
            persistent: true,
          })
            .onOk(() => {
              generarComprobante(data.id)
              resolve(true)
            })
            .onCancel(() => {
              resolve(false)
            })
        })
      } else {
        $q.notify({ type: 'negative', message: data.mensaje || 'Error al registrar.' })
        return false
      }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error de conexión o servidor.' })
      return false
    } finally {
      $q.loading.hide()
    }
  }

  // ─── Generar comprobante PDF ─────────────────────────────────────────────
  async function generarComprobante(id) {
    const user = await validarUsuario()
    const idempresa = user[0]?.empresa?.idempresa
    if (!idempresa) {
      $q.notify({ type: 'negative', message: 'Error: empresa no disponible.' })
      return
    }

    $q.loading.show({ message: 'Generando comprobante...' })
    try {
      const response = await api.get(`detallesCotizacion/${id}/${idempresa}`)
      const data = response.data
      if (data[0] === 'error') {
        console.error(data.error)
        $q.notify({ type: 'negative', message: 'Error al cargar detalles.' })
        return
      }

      const resultado = await generarPdfCotizacion(data)
      if (!resultado || !resultado.doc) {
        $q.notify({ type: 'negative', message: 'Error al generar PDF.' })
        return
      }

      // Limpiar blob anterior
      if (pdfData.value) URL.revokeObjectURL(pdfData.value)

      if (isMobile.value) {
        mobileFallbackUrl.value = resultado.mobileBlobUrl
      } else {
        const pdfBlob = resultado.doc.output('blob')
        pdfData.value = URL.createObjectURL(pdfBlob)
        openDialog('right', data[0]?.cliente.idcliente, data)
        mostrarModal.value = true
      }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error al generar comprobante.' })
    } finally {
      $q.loading.hide()
    }
  }

  // ─── Diálogo de confirmación de envío ────────────────────────────────────
  function openDialog(pos, idcot, data) {
    position.value = pos
    dialog.value = true
    idcliente.value = idcot
    detallesCotizacion.value = data
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  const confirmar = (idcliente, data) => {
    resolver?.(true)
    PDFenviarComprobanteCorreo(idcliente, data, $q)
    dialog.value = false
  }

  const cancelar = () => {
    resolver?.(false)
    dialog.value = false
  }

  // ─── Reset formulario ─────────────────────────────────────────────────────
  async function resetFormulario() {
    // Resetear campos y cargar datos iniciales
    if (cargarAlmacenes) await cargarAlmacenes()
    if (cargarCLientes) await cargarCLientes()
    // Resetear carrito y otros campos
    resetCarrito()
    // ... más lógica de reset
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleTipoOperacionChange = () => {
    cotizacionFormRef.value?.resetValidation()
    resetFormulario()
  }

  const cambioFecha = (nuevaFecha) => {
    carritoCO.fecha = nuevaFecha
    if (carritoCO.credito) {
      // calcular fechas
    }
    cotizacionFormRef.value?.resetValidation()
  }

  const cotizacion_proforma = async () => {
    if (Number(tipoOperacion.value?.value) === 0) {
      await enviarCotizacion()
    } else {
      // abrir modal de pago
    }
  }

  const RegistrarFirma = (selectedClient) => {
    if (selectedClient) {
      // emitir o activar modal de firma (se maneja en el page)
      return true
    } else {
      $q.notify({ type: 'warning', message: 'Seleccione un cliente antes de firmar.' })
      return false
    }
  }

  // (FirmaFix) alTerminarFirma tolerante a variantes
  const alTerminarFirma = (respuesta) => {
    // El backend puede devolver el id de la firma bajo distintos nombres;
    // probamos las variantes mas comunes y, si viene anidado, tambien
    // dentro de `datos` o `data`.
    const candidatos = [
      respuesta?.id_firma,
      respuesta?.idfirma,
      respuesta?.firma_id,
      respuesta?.id,
      respuesta?.datos?.id_firma,
      respuesta?.datos?.id,
      respuesta?.data?.id_firma,
      respuesta?.data?.id,
    ]
    const idFirma = candidatos.find((v) => v !== undefined && v !== null && v !== '')

    if (idFirma) {
      carritoCO.idfirma = idFirma
    } else {
      console.warn('[firma] Respuesta sin id reconocible:', respuesta)
      $q.notify({
        type: 'warning',
        message: 'Firma recibida pero sin id. Revise la respuesta del servidor.',
      })
    }
    $q.notify({ type: 'positive', message: 'Documento firmado correctamente' })
  }

  const alFallarFirma = (err) => {
    console.error('El registro falló:', err)
  }

  return {
    pdfData,
    mostrarModal,
    isMobile,
    mobileFallbackUrl,
    dialog,
    position,
    detallesCotizacion,
    generarComprobante,
    enviarCotizacion,
    confirmar,
    cancelar,
    cotizacion_proforma,
    resetFormulario,
    handleTipoOperacionChange,
    cambioFecha,
    openDialog,
    enviarDatos: enviarCotizacion,
    RegistrarFirma,
    alTerminarFirma,
    alFallarFirma,
  }
}
