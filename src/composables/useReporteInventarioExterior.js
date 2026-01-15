import { ref } from 'vue'
import { date } from 'quasar'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import axios from 'axios'
import 'jspdf-autotable'

export function useReporteInventarioExterior() {
  // --- Estado ---
  const fechaInicio = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
  const fechaFin = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
  const datosReporte = ref([])
  const cargando = ref(false)

  const idusuario = idusuario_md5()
  // const idusuario = '03afdbd66e7929b125f8597834fa83a4'

  const idempresa = idempresa_md5()
  console.log('ID Empresa MD5:', idempresa)

  const generarReporte = async () => {
    cargando.value = true
    try {
      const endpoint = `reporteinvexterno/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
      console.log('Generando reporte con endpoint:', endpoint)
      const response = await api.get(endpoint)
      // Map data to add index and composite location
      const promises = response.data.map(async (item, index) => {
        const direccion = await obtenerDireccionComoString(item.latitud, item.longitud)
        return {
          ...item,
          id: item.id_inv_externo,
          indice: index + 1,
          ubicacion: direccion,
        }
      })
      datosReporte.value = await Promise.all(promises)
      console.log('Datos del reporte recibidos (procesados):', datosReporte.value)
    } catch (error) {
      console.error('Error al generar reporte:', error)
      datosReporte.value = []
    } finally {
      cargando.value = false
    }
  }

  async function obtenerDireccionComoString(lat, lng) {
    try {
      const url = 'https://nominatim.openstreetmap.org/reverse'

      const response = await axios.get(url, {
        params: {
          format: 'json',
          lat: lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1,
        },
        headers: {
          Accept: 'application/json',
        },
      })

      // Retorna toda la dirección en una sola cadena no una promesa
      return response.data.display_name || 'Dirección no disponible'
    } catch (error) {
      console.error('Error obteniendo la dirección:', error)
      return 'Dirección no disponible'
    }
  }

  //función para generar reporte detallado
  const generarReporteDetalladoIExternor = async (idInventario) => {
    try {
      const endpoint = `detalleInventarioExterior/${idInventario}/${idempresa}`
      console.log('Generando reporte detallado con endpoint:', endpoint)
      const response = await api.get(endpoint)
      console.log('Datos del reporte detallado recibidos:', response.data)
      
      // Limpiar descripción de productos
      if (response.data && response.data.length > 0 && response.data[0].detalle) {
        response.data[0].detalle = response.data[0].detalle.map(item => ({
          ...item,
          descripcion_producto: item.descripcion_producto 
            ? item.descripcion_producto.replace(/\s+/g, ' ').trim() 
            : item.descripcion_producto
        }))
      }

      return response.data // Retorna los datos detallados del inventario
    } catch (error) {
      console.error('Error al generar reporte detallado:', error)
    }
  }

  return {
    fechaInicio,
    fechaFin,
    datosReporte,
    cargando,
    generarReporte,

    columns: [
      // Columnas reales para la tabla UI
      { name: 'indice', label: 'Nº', field: 'indice', sortable: true },
      { name: 'fecha', label: 'Fecha', field: 'fecha_control', sortable: true, dataType: 'date' },
      { name: 'almacen', label: 'Almacén', field: 'almacen', sortable: true },
      { name: 'cliente', label: 'Cliente', field: 'cliente', sortable: true },
      { name: 'sucursal', label: 'Sucursal', field: 'sucursal', sortable: true },
      { name: 'observaciones', label: 'Obs.', field: 'observaciones' },
      { name: 'ubicacion', label: 'Ubicacion', field: 'ubicacion' },
      { name: 'reporte', label: 'Reporte', field: 'reporte' }, // Added name and label.reporte matching table
    ],
    arrayHeaders: ['fecha', 'almacen', 'cliente', 'sucursal'], // Filtros de columna activados
    generarReporteDetalladoIExternor
  }
}
