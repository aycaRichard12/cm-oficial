import { ref, reactive } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import {
  getAlmacenes,
  getClientes,
  getCampanas,
  getReporte,
  getCategoriapProducto,
} from '../services/reporteService'
import { obtenerDivisaActiva } from 'src/services/divisaService'
import { getTipoFactura, getToken } from 'src/composables/FuncionesG'
import { getDefaultDates } from 'src/composables/FuncionesG'
// Cargar automáticamente al montar el componente

const ID_EMPRESA = idempresa_md5()
const ID_USUARIO = idusuario_md5()
const divisa = await obtenerDivisaActiva(ID_EMPRESA, getToken(), getTipoFactura())
console.log(divisa)
const fechasIniciales = getDefaultDates()

export const detalleColumns = [
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
    label: 'Precio Unit. (' + divisa.simbolo + ')',
    field: 'precio_unitario_promedio',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'total_vendido',
    label: 'Total Vendido (' + divisa.simbolo + ')',
    field: 'total_vendido',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_unitario_promedio',
    label: 'Costo Unit. (' + divisa.simbolo + ')',
    field: 'costo_unitario_promedio',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_total',
    label: 'Costo Total (' + divisa.simbolo + ')',
    field: 'costo_total',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: 'Utilidad (' + divisa.simbolo + ')',
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

export const graficoColumns = [
  {
    name: 'periodo',
    label: 'Periodo',
    field: 'periodo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'venta_bruta',
    label: 'Venta Bruta',
    field: 'venta_bruta',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'venta_neta',
    label: 'Venta Neta',
    field: 'venta_neta',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_ventas',
    label: 'Costo Ventas',
    field: 'costo_ventas',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: 'Utilidad',
    field: 'utilidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'margen_neta',
    label: 'Margen Neta %',
    field: 'margen_neta',
    align: 'center',
  },
]

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
      console.log(listaCategoriaProductos.value)
    } catch (error) {
      console.error('Error al cargar campañas:', error)
    } finally {
      loadingCategoriaProducto.value = false
    }
  }

  async function obtenerReporte() {
    obtenerResumen()
    errorMensaje.value = ''
    resumenData.value = null
    detalleData.value = []
    graficoData.value = []
    console.log(tipoReporte.value)

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

      const data = await getReporte(tipoReporte.value, params)

      if (data.estado === 'exito') {
        if (tipoReporte.value === 'detalle') {
          detalleData.value = data.data
        } else if (tipoReporte.value === 'grafico') {
          graficoData.value = data.data
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
    //console.log('hola')
    errorMensaje.value = ''
    resumenData.value = null
    detalleData.value = []
    graficoData.value = []
    console.log(tipoReporte.value)

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

  function init() {
    cargarAlmacenes()
    cargarClientes()
    cargarCampanas()
    cargarCategoriaProductos()
    console.log(fechasIniciales.fecha_fin)
  }

  return {
    loadingAlmacenes,
    loadingClientes,
    loadingCampanas,
    loadingCategoriaProducto,
    loadingReporte,
    errorMensaje,
    listaAlmacenes,
    listaClientes,
    listaCampanas,
    listaCategoriaProductos,
    form,
    tipoReporte,
    resumenData,
    detalleData,
    graficoData,
    divisa,
    cargarAlmacenes,
    cargarClientes,
    cargarCampanas,
    cargarCategoriaProductos,
    obtenerReporte,
    obtenerResumen,
    init,
  }
}
