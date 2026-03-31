/**
 * useCuentasxCobrar.js
 *
 * Composable que encapsula toda la lógica de negocio de la página
 * Cuentas por Cobrar (SRP – Single Responsibility Principle).
 *
 * Regla de acceso (bug corregido):
 *   – Un usuario sólo puede ver/cobrar las CxC que pertenecen a los
 *     almacenes que le están explícitamente asignados.
 *   – Si tiene exactamente 1 almacén autorizado, el filtro se fija en
 *     ese almacén y NO se muestra la opción "Todos".
 *   – Si tiene más de 1 almacén autorizado, puede elegir entre ellos
 *     o ver la unión de todos sus almacenes autorizados.
 *   – NUNCA puede ver datos de almacenes a los que no está asignado.
 */
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import {
  validarUsuario,
  cambiarFormatoFecha,
  redondear,
  decimas,
  obtenerFechaActualDato,
} from 'src/composables/FuncionesG'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import imageCompression from 'browser-image-compression'
import { useCurrencyStore } from 'src/stores/currencyStore'

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const ESTADOS_LABEL = {
  1: 'Activo',
  2: 'Finalizado',
  3: 'Atrasado',
  4: 'Anulado',
}

const OPCIONES_TIPO = [
  { value: '', label: 'Todos' },
  { value: 'VE', label: 'Ventas-Facturadas' },
  { value: 'COT', label: 'Cotizaciones' },
]

// ─────────────────────────────────────────────
// Helpers privados (no expuestos al template)
// ─────────────────────────────────────────────
function mapearFila(obj, index) {
  return {
    id: obj.id,
    fechaventa: cambiarFormatoFecha(obj.fechaventa),
    cliente: obj.cliente,
    ncuotas: Number(obj.ncuotas),
    valorcuota: obj.valorcuota,
    saldo: Number(decimas(redondear(parseFloat(obj.saldo)))),
    ventatotal: Number(decimas(redondear(parseFloat(obj.ventatotal)))),
    fechalimite: cambiarFormatoFecha(obj.fechalimite),
    idalmacen: obj.idalmacen,
    cuotaspagas: obj.cuotaspagas || 0,
    estado: obj.estado,
    estadoLabel: ESTADOS_LABEL[obj.estado],
    nfactura: Number(obj.nfactura),
    estadoventa: obj.estadoventa,
    sucursal: obj.sucursal,
    totalcobrado: Number(decimas(redondear(parseFloat(obj.totalcobrado ?? 0.0)))),
    tipo_cobro: obj.tipo_cobro,
    almacen: obj.almacen,
    numero: index + 1,
    // Guardamos la fecha original (sin formato) para comparaciones de fecha
    _fechalimiteRaw: obj.fechalimite,
  }
}

function formularioInicial() {
  return {
    idCredito: null,
    cliente: '',
    sucursal: '',
    deudaTotal: '0.00',
    saldoPendiente: '0.00',
    cuotasPendientes: 0,
    valorCuota: '0.00',
    fecha: obtenerFechaActualDato(),
    numeroCobros: 0,
    totalCobro: '0.00',
    saldoPorCobrar: '0.00',
    comprobante: null,
    imagenConvertida: null,
    urlpdf: '',
    tipoArchivo: '', // 'image' o 'pdf'
  }
}

// ─────────────────────────────────────────────
// Composable principal
// ─────────────────────────────────────────────
export function useCuentasxCobrar() {
  const $q = useQuasar()

  // ── Divisa ────────────────────────────────
  const currencyStore = useCurrencyStore()

  // ── Estado de UI ──────────────────────────
  const vistaActiva = ref('principal')
  const mostrarForm = ref(false)
  const cargando = ref(false)
  const mostrarDialogoImagen = ref(false)
  const imagenSeleccionada = ref('')
  const isCompressing = ref(false)

  /** Símbolo de la divisa activa (p. ej. '$', 'Bs.') */
  const divisa = computed(() => currencyStore.simbolo)

  // ── Datos ─────────────────────────────────
  const rows = ref([])

  /**
   * IDs de almacenes a los que el usuario tiene acceso.
   * Este conjunto es la fuente de verdad para todas las restricciones de acceso.
   * Se carga una sola vez en cargarAlmacenesAutorizados().
   */
  const idsAlmacenesAutorizados = ref([])

  /**
   * Opciones disponibles en el select de almacén dentro de la página.
   * - Si el usuario tiene 1 almacén → sólo ese almacén (sin opción "Todos").
   * - Si tiene varios → sus almacenes + "Todos mis almacenes".
   */
  const opcionesAlmacenes = ref([])

  /** Almacén seleccionado en el filtro de la vista principal. */
  const filtroAlmacen = ref(null)

  /** Tipo de cobro seleccionado. */
  const filtroEstado = ref({ value: '', label: 'Todos' })

  /** Para la vista de detalles */
  const detallesCobros = ref([])
  const detalleSeleccionado = ref({ id: null, totalVenta: 0, saldo: 0 })

  /** Formulario de cobro */
  const formulario = ref(formularioInicial())

  // ── Computed ──────────────────────────────

  /** Sólo expone filas cuyos almacenes el usuario tiene autorización de ver. */
  const datosFiltrados = computed(() => {
    // 1. Partimos de las filas ya restringidas por almacenes autorizados
    let datos = rows.value // rows ya viene filtrado desde cargarDatos()

    // 2. Filtro adicional por almacén seleccionado en el select
    if (filtroAlmacen.value && Number(filtroAlmacen.value.value) !== 0) {
      datos = datos.filter(
        (item) => Number(item.idalmacen) === Number(filtroAlmacen.value.value),
      )
    }

    // 3. Filtro por tipo
    if (filtroEstado.value?.value !== '') {
      datos = datos.filter((item) => item.tipo_cobro === filtroEstado.value?.value)
    }

    return datos
  })

  const totalCobrado = computed(() =>
    detallesCobros.value.reduce((total, item) => total + parseFloat(item.monto || 0), 0),
  )

  const opcionesTipo = OPCIONES_TIPO

  // ── Métodos de carga de datos ─────────────

  /**
   * Carga y normaliza la lista de almacenes autorizados para el usuario actual.
   * Aplica la restricción de acceso:
   *   – 1 almacén  → preselecciona ese almacén; no hay opción "Todos".
   *   – N almacenes → ofrece "Todos mis almacenes" + cada almacén individual.
   */
  async function cargarAlmacenesAutorizados() {
    // Carga la divisa activa en paralelo con los almacenes
    if (!currencyStore.divisa) {
      currencyStore.cargarDivisaActiva()
    }

    try {
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const idusuario = contenidousuario[0]?.idusuario

      const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
      const resultado = response.data

      if (!Array.isArray(resultado)) {
        throw new Error('Respuesta inesperada al cargar almacenes.')
      }

      // Sólo los almacenes asignados a este usuario
      const almacenesDelUsuario = resultado.filter((u) => u.idusuario == idusuario)

      // Guardamos los IDs para filtrar los datos de la tabla
      idsAlmacenesAutorizados.value = almacenesDelUsuario.map((a) => Number(a.idalmacen))

      if (almacenesDelUsuario.length === 0) {
        // Sin asignaciones: no puede ver nada
        opcionesAlmacenes.value = []
        filtroAlmacen.value = null
        return
      }

      if (almacenesDelUsuario.length === 1) {
        // Un solo almacén: forzamos ese almacén, sin opción "Todos"
        const unico = almacenesDelUsuario[0]
        opcionesAlmacenes.value = [{ value: Number(unico.idalmacen), label: unico.almacen }]
        filtroAlmacen.value = opcionesAlmacenes.value[0]
      } else {
        // Varios almacenes: ofrecemos la opción "Todos mis almacenes" (value: 0)
        // e individualmente cada uno
        opcionesAlmacenes.value = [
          { value: 0, label: 'Todos mis almacenes' },
          ...almacenesDelUsuario.map((a) => ({
            value: Number(a.idalmacen),
            label: a.almacen,
          })),
        ]
        filtroAlmacen.value = opcionesAlmacenes.value[0]
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al cargar almacenes: ${error.message}` })
    }
  }

  /**
   * Carga las CxC de la empresa y filtra en el cliente para mostrar
   * sólo los registros de los almacenes autorizados del usuario.
   */
  async function cargarDatos() {
    cargando.value = true
    try {
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa

      const response = await api.get(`listacuentasxcobrar/${idempresa}`)
      const data = response.data

      if (data.estado === 'error') throw new Error(data.error)

      // Mapeamos y restringimos: sólo filas de almacenes autorizados
      const todasLasFilas = data.map(mapearFila)

      rows.value =
        idsAlmacenesAutorizados.value.length > 0
          ? todasLasFilas.filter((row) =>
              idsAlmacenesAutorizados.value.includes(Number(row.idalmacen)),
            )
          : [] // Sin almacenes autorizados → tabla vacía

      await actualizarEstados(data)
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al cargar datos: ${error.message}` })
    } finally {
      cargando.value = false
    }
  }

  async function actualizarEstados(data) {
    const candidatos = data.filter((u) => u.estado == 1 && u.saldo != 0 && u.estadoventa == 1)
    const hoyDias = Math.floor(new Date().getTime() / (1000 * 3600 * 24))

    const promises = candidatos.map(async (item) => {
      const limiteDias = Math.floor(new Date(item.fechalimite).getTime() / (1000 * 3600 * 24))
      if (hoyDias > limiteDias && item.saldo > 0 && item.estado != 3 && item.estadoventa == 1) {
        await cambiarEstadoCredito(item.id, 3)
      }
    })

    await Promise.all(promises)
  }

  async function cambiarEstadoCredito(id, code) {
    try {
      await api.get(`cambiarcreditomoroso/${id}/${code}`)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    }
  }

  // ── Lógica del formulario de cobro ────────

  function cargarFormulario(dato) {
    const cuotasPendientes = parseFloat(dato.ncuotas) - parseFloat(dato.cuotaspagas || 0)

    formulario.value = {
      ...formularioInicial(),
      idCredito: dato.id,
      cliente: dato.cliente,
      sucursal: dato.sucursal,
      deudaTotal: decimas(dato.ventatotal),
      saldoPendiente: decimas(dato.saldo),
      cuotasPendientes,
      valorCuota: decimas(dato.valorcuota),
    }

    // Si sólo queda 1 cuota, se completa automáticamente
    if (cuotasPendientes === 1) {
      formulario.value.numeroCobros = 1
      formulario.value.totalCobro = decimas(redondear(parseFloat(formulario.value.saldoPendiente)))
      formulario.value.saldoPorCobrar = '0.00'
    }

    mostrarForm.value = true
  }

  function calcularTotales() {
    const numCobros = parseFloat(formulario.value.numeroCobros || 0)
    const valorCuota = parseFloat(formulario.value.valorCuota || 0)
    const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)

    if (numCobros > formulario.value.cuotasPendientes) {
      $q.notify({ type: 'warning', message: 'El N°Cobros no puede ser mayor a los cobros pendientes' })
      formulario.value.numeroCobros = 0
      formulario.value.totalCobro = '0.00'
      return
    }

    if (numCobros === formulario.value.cuotasPendientes) {
      formulario.value.totalCobro = decimas(redondear(saldoPendiente))
      formulario.value.saldoPorCobrar = '0.00'
    } else {
      formulario.value.totalCobro = decimas(redondear(numCobros * valorCuota))
      formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - numCobros * valorCuota))
    }
  }

  function calcularNumeroCobros() {
    const totalCobro = parseFloat(formulario.value.totalCobro || 0)
    const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)
    const valorCuota = parseFloat(formulario.value.valorCuota || 0)

    if (totalCobro > saldoPendiente) {
      formulario.value.totalCobro = '0.00'
      formulario.value.numeroCobros = 0
      formulario.value.saldoPorCobrar = '0.00'
      $q.notify({ type: 'warning', message: 'El monto ingresado no puede ser mayor al saldo pendiente' })

      if (formulario.value.cuotasPendientes === 1) {
        formulario.value.totalCobro = formulario.value.saldoPendiente
        formulario.value.numeroCobros = formulario.value.cuotasPendientes
        formulario.value.saldoPorCobrar = '0.00'
      }
      return
    }

    if (totalCobro === saldoPendiente) {
      formulario.value.saldoPorCobrar = '0.00'
      formulario.value.numeroCobros = formulario.value.cuotasPendientes
    } else if (totalCobro <= valorCuota) {
      formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
      formulario.value.numeroCobros = 1
    } else {
      formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
      formulario.value.numeroCobros = Math.floor(totalCobro / valorCuota)
    }
  }

  async function convertirImagen(file) {
    if (!file || !(file instanceof File)) {
      formulario.value.imagenConvertida = null
      formulario.value.tipoArchivo = ''
      return
    }

    // Identificar el tipo de archivo
    if (file.type === 'application/pdf') {
      formulario.value.tipoArchivo = 'pdf'
      formulario.value.imagenConvertida = file // No se comprime el PDF
      formulario.value.urlpdf = '' // Se limpiará cualquier URL previa
      return
    } else if (file.type.startsWith('image/')) {
      formulario.value.tipoArchivo = 'image'
    } else {
      formulario.value.tipoArchivo = ''
    }

    try {
      isCompressing.value = true
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8,
      }

      const compressedBlob = await imageCompression(file, options)
      
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.jpg'
      const compressedFile = new File([compressedBlob], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      formulario.value.imagenConvertida = compressedFile

      $q.notify({
        message: 'Imagen optimizada con éxito',
        color: 'positive',
        icon: 'check_circle',
        timeout: 1500,
      })
    } catch (error) {
      console.error('Error al optimizar imagen:', error)
      formulario.value.imagenConvertida = file
    } finally {
      isCompressing.value = false
    }
  }

  async function registrarCobro(onSuccess) {
    if (parseFloat(formulario.value.saldoPorCobrar) < 0) {
      $q.notify({ type: 'negative', message: 'No se calculó el saldo por cobrar, inténtelo nuevamente' })
      return
    }

    try {
      let linkPdfSubido = ''

      // PASO 1: Si es un PDF, primero lo subimos para obtener el link (Lógica de baucherPedido.vue)
      if (formulario.value.tipoArchivo === 'pdf' && formulario.value.imagenConvertida) {
        console.log('--- PASO 1: SUBIENDO PDF AL SERVIDOR ---')
        const formDataPDF = new FormData()
        formDataPDF.append('idpedido', formulario.value.idCredito)
        formDataPDF.append('recibo', formulario.value.imagenConvertida)
        formDataPDF.append('ver', 'uploadRecibo')

        const resPDF = await api.post('', formDataPDF)
        
        if (resPDF.data.estado === 'exito') {
          // Extraemos solo la parte relativa del link: "uploads/recibos/..."
          // El servidor puede devolver dominios distintos, así que buscamos desde "uploads/"
          const rutaCompleta = resPDF.data.ruta_recibo
          const indexUploads = rutaCompleta.indexOf('uploads/')
          linkPdfSubido = indexUploads !== -1 ? rutaCompleta.substring(indexUploads) : rutaCompleta
          
          console.log('PDF subido. Ruta relativa extraída:', linkPdfSubido)
        } else {
          throw new Error('No se pudo subir el PDF al servidor: ' + resPDF.data.mensaje)
        }
      }

      // PASO 2: Registro final del cobro
      const dataForForm = {
        ver: 'registroPagoCuentaxCobrar',
        idestadocobro: formulario.value.idCredito,
        ncuotas: formulario.value.numeroCobros,
        total: formulario.value.totalCobro,
        saldo: formulario.value.saldoPorCobrar,
        fecha: formulario.value.fecha,
        // Las imágenes se envían directo, los PDFs envían el link relativo
        imagen: formulario.value.tipoArchivo === 'image' ? (formulario.value.imagenConvertida ?? '') : '',
        urlpdf: linkPdfSubido,
      }

      const datos = objectToFormData(dataForForm)

      // LOGS DE DEPURACIÓN
      console.log('--- PASO 2: REGISTRANDO COBRO FINAL ---')
      console.log('Datos finales:', dataForForm)

      const response = await api.post(``, datos)
      const data = response.data
      console.log("Respuesta servidor:", data)

      if (data.estado === 'exito') {
        $q.notify({ type: 'positive', message: 'Cobro registrado correctamente' })
        mostrarForm.value = false
        if (onSuccess) onSuccess()
      } else {
        throw new Error(data.mensaje || 'Error al registrar el cobro')
      }
    } catch (error) {
      console.error('Error en el proceso de registro:', error)
      $q.notify({ type: 'negative', message: `${error.message}` })
    }
  }

  function cerrarFormulario() {
    mostrarForm.value = false
  }

  // ── Vista de detalles ────────────────────

  async function mostrarDetalles(dato) {
    detalleSeleccionado.value = {
      id: dato.id,
      totalVenta: dato.ventatotal,
      saldo: dato.saldo,
    }

    try {
      const response = await api.get(`listadetallecobros/${dato.id}`)
      const data = response.data
      console.log("detalle", data)

      if (data.estado === 'error') throw new Error(data.error)

      detallesCobros.value = data.map((item, index) => ({
        ...item,
        numero: index + 1,
        // Construimos la URL completa usando VITE_API_URL (api.defaults.baseURL) + la ruta guadada
        imagen: item.urlpdf ? `${api.defaults.baseURL}${item.urlpdf}` : (item.imagen ? `${api.defaults.baseURL}${item.imagen}` : null),
      }))

      vistaActiva.value = 'detalles'
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al cargar detalles: ${error.message}` })
    }
  }

  function mostrarImagen(imagen) {
    imagenSeleccionada.value = imagen
    mostrarDialogoImagen.value = true
  }

  // ── Formato ──────────────────────────────
  function formatoMoneda(valor) {
    return decimas(redondear(parseFloat(valor || 0)))
  }

  // ─────────────────────────────────────────
  return {
    // Estado UI
    vistaActiva,
    mostrarForm,
    cargando,
    mostrarDialogoImagen,
    imagenSeleccionada,
    divisa,

    // Datos y filtros
    rows,
    opcionesAlmacenes,
    filtroAlmacen,
    filtroEstado,
    opcionesTipo,
    datosFiltrados,

    // Detalles
    detallesCobros,
    detalleSeleccionado,
    totalCobrado,

    // Formulario
    formulario,
    isCompressing,

    // Métodos de inicialización
    cargarAlmacenesAutorizados,
    cargarDatos,

    // Métodos de formulario
    cargarFormulario,
    calcularTotales,
    calcularNumeroCobros,
    convertirImagen,
    registrarCobro,
    cerrarFormulario,

    // Métodos de detalles
    mostrarDetalles,
    mostrarImagen,

    // Formato
    formatoMoneda,
  }
}
