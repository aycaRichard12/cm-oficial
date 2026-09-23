import { ref, reactive, computed, watch } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import {
  getAlmacenes,
  getClientes,
  getCampanas,
  getReporte,
  getCategoriapProducto,
} from '../services/reporteService'
import { obtenerDivisaActiva } from 'src/services/divisaService'
import { getTipoFactura, getToken, getDefaultDates } from 'src/composables/FuncionesG'

// Constantes que no dependen de asincronía
const ID_EMPRESA = idempresa_md5()
const ID_USUARIO = idusuario_md5()
const fechasIniciales = getDefaultDates()

// ---------------------------------------
// Funciones para generar las columnas
// de forma dinámica según el símbolo de la divisa
// ---------------------------------------
export function createDetalleColumns(simboloDivisa) {
  return [
    {
      name: 'codigo_producto',
      label: 'Código',
      field: 'codigo_producto',
      align: 'left',
      sortable: true,
    },
    {
      name: 'nombre_producto',
      label: 'Producto',
      field: 'nombre_producto',
      align: 'left',
      sortable: true,
    },
    {
      name: 'categoria',
      label: 'Categoría Producto',
      field: 'categoria',
      align: 'left',
      sortable: true,
    },
    {
      name: 'origen',
      label: 'Tipo',
      field: 'origen',
      align: 'left',
      sortable: true,
    },
    {
      name: 'categoria_precio',
      label: 'Categoría Precio',
      field: 'categoria_precio',
      align: 'left',
    },
    {
      name: 'cantidad_vendida',
      label: 'Cantidad',
      field: 'cantidad_vendida',
      align: 'center',
    },
    {
      name: 'precio_unitario_promedio',
      label: `Precio Unit. (${simboloDivisa})`,
      field: 'precio_unitario_promedio',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
    },
    {
      name: 'total_vendido',
      label: `Total Vendido (${simboloDivisa})`,
      field: 'total_vendido',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
    },
    {
      name: 'costo_unitario_promedio',
      label: `Costo Unit. (${simboloDivisa})`,
      field: 'costo_unitario_promedio',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
    },
    {
      name: 'costo_total',
      label: `Costo Total (${simboloDivisa})`,
      field: 'costo_total',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
    },
    {
      name: 'utilidad',
      label: `Utilidad (${simboloDivisa})`,
      field: 'utilidad',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
    },
    {
      name: 'margen_sobre_venta_neta',
      label: 'Margen V.Neta %',
      field: 'margen_sobre_venta_neta',
      align: 'center',
    },
    {
      name: 'margen_sobre_venta_bruta',
      label: 'Margen V.Bruta %',
      field: 'margen_sobre_venta_bruta',
      align: 'center',
    },
  ]
}

export function createGraficoColumns(simboloDivisa) {
  return [
    {
      name: 'periodo',
      label: 'Periodo',
      field: 'periodo',
      align: 'left',
      datatype: 'text',
    },
    {
      name: 'venta_bruta',

      label: `Venta Bruta (${simboloDivisa})`,
      field: 'venta_bruta',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
      datatype: 'number',
    },
    {
      name: 'venta_neta',

      label: `Venta Neta (${simboloDivisa})`,
      field: 'venta_neta',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
      datatype: 'number',
    },
    {
      name: 'costo_ventas',
      label: `Costo Ventas (${simboloDivisa})`,
      field: 'costo_ventas',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
      datatype: 'number',
    },
    {
      name: 'utilidad',
      label: 'Utilidad',
      field: 'utilidad',
      align: 'right',
      format: (val) => Number(val).toFixed(2),
      datatype: 'number',
    },
    {
      name: 'margen_neta',
      label: 'Margen Neta %',
      field: 'margen_neta',
      align: 'center',
      datatype: 'number',
    },
  ]
}

// ---------------------------------------
// Composable principal
// ---------------------------------------
export function useReporteVentas() {
  const loadingAlmacenes = ref(false)
  const loadingClientes = ref(false)
  const loadingCampanas = ref(false)
  const loadingCategoriaProducto = ref(false)
  const loadingReporte = ref(false)
  const errorMensaje = ref('')

  const listaAlmacenes = ref([])
  const listaClientes = ref([])
  const listaCampanas = ref([])
  const listaCategoriaProductos = ref([])

  // Divisa reactiva, se cargará de forma asíncrona
  const divisa = ref(null)

  const form = reactive({
    fecha_inicio: fechasIniciales.fecha_inicio,
    fecha_fin: fechasIniciales.fecha_fin,
    almacen_id: null,
    categoriaProd: null,
    cliente_id: null,
    campana_id: null,
    granularidad: 'dia',
  })

  const tipoReporte = ref('detalle')
  const resumenData = ref(null)
  const detalleData = ref([])
  const graficoData = ref([])

  // Watcher para actualizar el reporte cuando cambia la granularidad
  watch(
    () => form.granularidad,
    (newVal) => {
      if (tipoReporte.value === 'grafico' && newVal) {
        obtenerReporte()
      }
    },
  )

  // Columnas computadas que usan el símbolo de la divisa actual
  const detalleColumns = computed(() => {
    const simbolo = divisa.value?.simbolo || ''
    return createDetalleColumns(simbolo)
  })

  const graficoColumns = computed(() => {
    const simbolo = divisa.value?.simbolo || ''
    return createGraficoColumns(simbolo)
  })

  // Carga de la divisa activa
  async function cargarDivisa() {
    try {
      const data = await obtenerDivisaActiva(ID_EMPRESA, getToken(), getTipoFactura())
      divisa.value = data
      console.log('Divisa cargada:', data)
    } catch (error) {
      console.error('Error al cargar divisa:', error)
      // Se podría dejar un valor por defecto
      divisa.value = { simbolo: '$' }
    }
  }

  async function cargarAlmacenes() {
    loadingAlmacenes.value = true
    try {
      const data = await getAlmacenes(ID_EMPRESA)
      const filtrados = data.filter((a) => a.idusuario == ID_USUARIO)

      listaAlmacenes.value = filtrados.map((item) => ({
        label: item.almacen,
        value: item.idalmacen,
      }))
    } catch (error) {
      console.error('Error al cargar almacenes:', error)
    } finally {
      loadingAlmacenes.value = false
    }
  }

  async function cargarClientes() {
    loadingClientes.value = true
    try {
      const data = await getClientes(ID_EMPRESA)
      listaClientes.value = data.map((item) => ({
        label: item.nombre,
        value: item.id,
      }))
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      loadingClientes.value = false
    }
  }

  async function cargarCampanas() {
    loadingCampanas.value = true
    try {
      const data = await getCampanas(ID_EMPRESA)
      listaCampanas.value = data.map((item) => ({
        label: item.nombre,
        value: item.id,
      }))
    } catch (error) {
      console.error('Error al cargar campañas:', error)
    } finally {
      loadingCampanas.value = false
    }
  }

  async function cargarCategoriaProductos() {
    loadingCategoriaProducto.value = true
    try {
      const data = await getCategoriapProducto(ID_EMPRESA)
      listaCategoriaProductos.value = data.map((item) => ({
        label: item.nombre,
        value: item.id,
        children: item.children,
      }))
    } catch (error) {
      console.error('Error al cargar categorías de producto:', error)
    } finally {
      loadingCategoriaProducto.value = false
    }
  }

  async function obtenerReporte() {
    errorMensaje.value = ''
    detalleData.value = []
    graficoData.value = []

    if (!form.fecha_inicio || !form.fecha_fin) {
      errorMensaje.value = 'Debe seleccionar un rango de fechas.'
      return
    }

    loadingReporte.value = true

    try {
      const params = {
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        almacen_id: form.almacen_id || '',
        cliente_id: form.cliente_id || '',
        campana_id: form.campana_id || '',
        categoriaProd: form.categoriaProd || '',
        idmd5: idempresa_md5(),
      }

      if (tipoReporte.value === 'grafico') {
        params.granularidad = form.granularidad
      }

      console.log(tipoReporte.value)

      const data = await getReporte(tipoReporte.value, params)

      if (data.estado === 'exito') {
        if (tipoReporte.value === 'detalle') {
          detalleData.value = data.data
        } else if (tipoReporte.value === 'grafico') {
          graficoData.value = data.data
          console.log(graficoData.value)
        }
      } else {
        errorMensaje.value = data.mensaje || 'Error al obtener el reporte.'
      }
    } catch (error) {
      console.error('Error en reporte:', error)
      errorMensaje.value = 'Error de conexión al obtener el reporte.'
    } finally {
      loadingReporte.value = false
    }
  }

  async function obtenerResumen() {
    errorMensaje.value = ''
    resumenData.value = null
    detalleData.value = []
    graficoData.value = []

    if (!form.fecha_inicio || !form.fecha_fin) {
      errorMensaje.value = 'Debe seleccionar un rango de fechas.'
      return
    }

    loadingReporte.value = true

    try {
      const params = {
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        almacen_id: form.almacen_id || '',
        cliente_id: form.cliente_id || '',
        campana_id: form.campana_id || '',
        categoriaProd: form.categoriaProd || '',
        idmd5: idempresa_md5(),
      }

      const data = await getReporte('resumen', params)

      if (data.estado === 'exito') {
        resumenData.value = data.data
      } else {
        errorMensaje.value = data.mensaje || 'Error al obtener el reporte.'
      }
    } catch (error) {
      console.error('Error en reporte:', error)
      errorMensaje.value = 'Error de conexión al obtener el reporte.'
    } finally {
      loadingReporte.value = false
    }
  }

  function limpiarFiltros() {
    const fechas = getDefaultDates()
    form.fecha_inicio = fechas.fecha_inicio
    form.fecha_fin = fechas.fecha_fin
    form.almacen_id = null
    form.categoriaProd = null
    form.cliente_id = null
    form.campana_id = null
    form.granularidad = 'dia'
    resumenData.value = null
    detalleData.value = []
    graficoData.value = []
    errorMensaje.value = ''
  }

  async function init() {
    // Cargar divisa primero para que las columnas estén listas
    await cargarDivisa()
    // Las demás cargas pueden ir en paralelo
    await Promise.all([
      cargarAlmacenes(),
      cargarClientes(),
      cargarCampanas(),
      cargarCategoriaProductos(),
    ])
  }

  return {
    // Estados de carga
    loadingAlmacenes,
    loadingClientes,
    loadingCampanas,
    loadingCategoriaProducto,
    loadingReporte,
    errorMensaje,

    // Listas para selects
    listaAlmacenes,
    listaClientes,
    listaCampanas,
    listaCategoriaProductos,

    // Formulario
    form,
    tipoReporte,

    // Datos de reporte
    resumenData,
    detalleData,
    graficoData,

    // Divisa y columnas reactivas
    divisa,
    detalleColumns, // ← computed, ya incluye el símbolo actual
    graficoColumns, // ← computed

    // Métodos
    cargarAlmacenes,
    cargarClientes,
    cargarCampanas,
    cargarCategoriaProductos,
    obtenerReporte,
    obtenerResumen,
    limpiarFiltros,
    init,
  }
}
