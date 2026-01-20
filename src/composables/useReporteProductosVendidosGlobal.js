import { ref, watch, computed } from 'vue'
import { api } from 'src/boot/axios'
import { date, useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { exportToXLSX_Reporte_Productos } from 'src/utils/XCLReportImport'
import { decimas, redondear } from 'src/composables/FuncionesG'

export function useReporteProductosVendidosGlobal() {
  const $q = useQuasar()

  // --- Constantes / Mapeos ---
  const tipoVenta = {
    4: 'Cotización',
    0: 'Comprobante Venta',
    1: 'Factura Compra-Venta',
    2: 'Factura Alquileres',
    3: 'Factura Comercial Exportación',
    24: 'Nota de Crédito-Débito',
  }

  // --- Estado ---
  const fechaInicial = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
  const fechaFinal = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
  const cargando = ref(false)
  const datosOriginales = ref([])
  const datosFiltrados = ref([])

  // Filtros
  const almacenesOptions = ref([{ label: 'Todos los almacenes', value: 0 }])
  const almacenSeleccionado = ref(0)
  const clientesOptions = ref([])
  const clientesOriginal = ref([])
  const clienteSeleccionado = ref(null)
  const sucursalesOptions = ref([])
  const sucursalesOriginal = ref([])
  const sucursalSeleccionada = ref(null)

  // --- Helpers locales ---
  const formatearFecha = (fecha) => date.formatDate(fecha, 'DD/MM/YYYY')
  const formatearNumero = (numero) => parseFloat(numero || 0).toFixed(2)

  const validarFechas = (fechaFin) => {
    if (!fechaInicial.value || !fechaFin) return true
    return date.getDateDiff(fechaFin, fechaInicial.value, 'days') >= 0
  }

  // --- Cargas de Datos (Almacenes, Clientes, Sucursales) ---
  const cargarAlmacenes = async () => {
    try {
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const response = await api.get(`listaAlmacen/${idempresa}`)
      if (response.data && Array.isArray(response.data)) {
        almacenesOptions.value = [
          { label: 'Todos los almacenes', value: 0 },
          ...response.data.map((almacen) => ({
            label: almacen.nombre,
            value: almacen.id,
          })),
        ]
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar la lista de almacenes' })
    }
  }

  const cargarClientes = async () => {
    try {
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const response = await api.get(`listaCliente/${idempresa}`)
      if (response.data && Array.isArray(response.data)) {
        clientesOriginal.value = response.data.map((cliente) => ({
          label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`,
          value: cliente.id,
          raw: cliente,
        }))
        clientesOptions.value = [...clientesOriginal.value]
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar la lista de clientes' })
    }
  }

  const filtrarClientes = (val, update) => {
    update(() => {
      if (val === '') {
        clientesOptions.value = clientesOriginal.value
      } else {
        const needle = val.toLowerCase()
        clientesOptions.value = clientesOriginal.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1,
        )
      }
    })
  }

  const cargarSucursales = async (idCliente) => {
    try {
      if (!idCliente) {
        sucursalesOptions.value = []
        sucursalesOriginal.value = []
        return
      }
      const response = await api.get(`listaSucursal/${idCliente}`)
      if (response.data && Array.isArray(response.data)) {
        sucursalesOriginal.value = response.data.map((sucursal) => ({
          label: sucursal.nombre,
          value: sucursal.id,
          raw: sucursal,
        }))
        sucursalesOptions.value = [...sucursalesOriginal.value]
        if (response.data.length === 0) {
          $q.notify({
            type: 'info',
            message: 'No existen sucursales registradas del cliente seleccionado',
          })
        }
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar la lista de sucursales' })
    }
  }

  const filtrarSucursales = (val, update) => {
    update(() => {
      if (val === '') {
        sucursalesOptions.value = sucursalesOriginal.value
      } else {
        const needle = val.toLowerCase()
        sucursalesOptions.value = sucursalesOriginal.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1,
        )
      }
    })
  }

  // --- Lógica Principal: Generar Reporte ---
  const generarReporte = async () => {
    try {
      cargando.value = true
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const point = `reporteventasporproductosglobal/${idempresa}/${fechaInicial.value}/${fechaFinal.value}`
      const response = await api.get(point)

      if (response.data && Array.isArray(response.data)) {
        datosOriginales.value = response.data.filter((item) => item.estado == 1)
        console.log(datosOriginales.value)
        datosFiltrados.value = [...datosOriginales.value]

        // Cargar listas filtros si no se cargaron (aunque se llaman en onMounted usualmente en el componente,
        // aquí los llamamos on demand si se quiere, o desde el componente)
        // Optamos por separar la lógica: el componente montado llama a cargarAlmacenes si quiere.
        // Aquí los cargamos tras generar para asegurar consistencia si los selectores están vacíos
        if (almacenesOptions.value.length <= 1) await cargarAlmacenes()
        if (clientesOriginal.value.length === 0) await cargarClientes()
      } else {
        datosOriginales.value = []
        datosFiltrados.value = []
        $q.notify({
          type: 'info',
          message: 'No se encontraron datos para el rango de fechas seleccionado',
        })
      }
    } catch (error) {
      console.error('Error al generar reporte:', error)
      $q.notify({ type: 'negative', message: 'Error al generar el reporte' })
    } finally {
      cargando.value = false
    }
  }

  // --- Lógica de Filtrado Local (Almacén, Cliente, Sucursal) ---
  const filtrarYOrdenarDatos = () => {
    let temp = [...datosOriginales.value]

    if (almacenSeleccionado.value && almacenSeleccionado.value !== 0) {
      temp = temp.filter((item) => item.idalmacen == almacenSeleccionado.value)
    }
    if (clienteSeleccionado.value) {
      temp = temp.filter((item) => item.idclienteve == clienteSeleccionado.value)
    }
    if (sucursalSeleccionada.value) {
      temp = temp.filter((item) => item.idsucursalve == sucursalSeleccionada.value)
    }
    datosFiltrados.value = temp
  }

  // Watchers
  watch(almacenSeleccionado, filtrarYOrdenarDatos)
  watch(clienteSeleccionado, (newVal) => {
    sucursalSeleccionada.value = null
    if (newVal) {
      cargarSucursales(newVal)
    } else {
      sucursalesOptions.value = []
    }
    filtrarYOrdenarDatos()
  })
  watch(sucursalSeleccionada, filtrarYOrdenarDatos)

  // --- Computed Sumatorias ---
  const sumatorias = computed(() => {
    return datosFiltrados.value.reduce(
      (acc, item) => {
        acc.cantidad += parseFloat(item.cantidad) || 0
        acc.importe += parseFloat(item.importe) || 0
        acc.descuento += parseFloat(item.descuento) || 0
        acc.totalcosto += parseFloat(item.totalcosto) || 0
        acc.totalventa += parseFloat(item.totalventa) || 0
        return acc
      },
      { cantidad: 0, importe: 0, descuento: 0, totalcosto: 0, totalventa: 0 },
    )
  })

  // --- Exportar Excel ---
  // Ahora recibe dataToExport explícitamente para soportar el filtrado de la tabla visual
  const exportarTablaAExcel = (dataToExport) => {
    exportToXLSX_Reporte_Productos(
      dataToExport || datosFiltrados.value,
      fechaInicial.value,
      fechaFinal.value,
      almacenSeleccionado,
      clienteSeleccionado,
      sucursalSeleccionada,
      almacenesOptions,
      clientesOptions,
      sucursalesOptions,
    )
  }

  return {
    // Estado
    fechaInicial,
    fechaFinal,
    cargando,
    datosFiltrados,
    // Filtros
    almacenesOptions,
    almacenSeleccionado,
    clientesOptions,
    clienteSeleccionado,
    clientesOriginal, // Para el filtro UI
    sucursalesOptions,
    sucursalSeleccionada,
    sucursalesOriginal, // Para el filtro UI
    // Computados/Constantes
    sumatorias,
    tipoVenta,
    // Métodos
    validarFechas,
    generarReporte,
    exportarTablaAExcel,
    filtrarClientes,
    filtrarSucursales,
    cargarAlmacenes, // Si se necesita llamar manualmente
    formatearFecha,
    formatearNumero,
    decimas,
    redondear,
  }
}
