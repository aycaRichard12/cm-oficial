
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'

export function useInventarioExteriorDetalle() {
  const $q = useQuasar()
  const showDetalle = ref(false)
  
  const detalleFormData = ref({
    ver: 'registrarDetalleInvexterno',
    id: '', 
    idinventarioexterno: '',
    idproductoalmacen: '',
    productos: '',
    cantidad: '',
    fecha: '',
    estado: 0,
  })

  const detalleInventario = ref([])

  const detalleColumns = [
    { name: 'indice', label: 'N°', field: 'indice', align: 'right', sortable: true },
    { name: 'Código', label: 'Código', field: 'Código', align: 'left', sortable: true },
    {
      name: 'Descripción',
      label: 'Descripción',
      field: 'Descripción',
      align: 'left',
      sortable: true,
    },
    { name: 'Cantidad', label: 'Cantidad', field: 'Cantidad', align: 'right', sortable: true },
    {
      name: 'Fecha Ingreso',
      label: 'Fecha Ingreso',
      field: 'Fecha Ingreso',
      align: 'left',
      sortable: true,
    },
    { name: 'Opciones', label: 'Opciones', field: 'Opciones', align: 'center' },
  ]

  const resetearDetalleFormulario = () => {
    detalleFormData.value.ver = 'registrarDetalleInvexterno'
    detalleFormData.value.id = ''
    detalleFormData.value.idproductoalmacen = ''
    detalleFormData.value.productos = ''
    detalleFormData.value.cantidad = ''
    detalleFormData.value.fecha = obtenerFechaActualDato()
  }

  async function listaDetalleMovimiento() {
    const datosMov = JSON.parse(localStorage.getItem('detalleInventario'))
    if (!datosMov || !datosMov.idregistro) {
      console.error('ID de registro de inventario no disponible para detalle.')
      detalleInventario.value = []
      return
    }

    const endpoint = `listadetalleInvExterno/${datosMov.idregistro}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        detalleInventario.value = []
      } else {
        detalleInventario.value = resultado.map((key, index) => ({
          indice: index + 1,
          Código: key.codigo,
          Descripción: key.descripcion,
          Cantidad: key.cantidad,
          'Fecha Ingreso': key.fechavencimiento,
          id: key.id,
          idproductoalmacen: key.idproductoalmacen,
          cantidad: key.cantidad,
          fecha: key.fecha,
        }))
      }
    } catch (error) {
      console.error('Error al obtener detalle de movimiento:', error)
      detalleInventario.value = []
    }
  }

  async function handleDetailFormSubmit(callbackRefresh) {
    $q.loading.show()
    try {
      const dataToSend = new FormData()
      for (const key in detalleFormData.value) {
        dataToSend.append(key, detalleFormData.value[key])
      }

      const response = await api.post('', dataToSend) 
      const data = response.data

      if (data.estado === 'exito') {
        $q.notify({
          message: 'Producto añadido al detalle!',
          color: 'positive',
          icon: 'check_circle',
        })
        if(callbackRefresh) await callbackRefresh()
        await listaDetalleMovimiento()
        resetearDetalleFormulario()
      } else {
        $q.notify({
          message: data.mensaje || 'Error al añadir producto.',
          color: 'negative',
          icon: 'error',
        })
      }
    } catch (error) {
      console.error('Error submitting detail form:', error)
      $q.notify({
        message: 'Error de conexión o del servidor.',
        color: 'negative',
        icon: 'error',
      })
    } finally {
      $q.loading.hide()
    }
  }

  const elminarDetalleMovimiento = (id, callbackRefresh) => {
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar este producto del detalle?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const response = await api.get(`eliminardetalleinvexterno/${id}`)
        const resultado = response.data
        if (resultado.estado === 'error') {
          console.error(resultado.mensaje)
          $q.notify({
            message: resultado.mensaje || 'Error al eliminar detalle.',
            color: 'negative',
          })
        } else {
          $q.notify({
            message: resultado.mensaje || 'Producto de detalle eliminado correctamente.',
            color: 'positive',
          })
          if (callbackRefresh) await callbackRefresh() 
          await listaDetalleMovimiento()
        }
      } catch (error) {
        console.error('Error al eliminar detalle de movimiento:', error)
        $q.notify({
          message: 'Error de conexión o del servidor al eliminar detalle.',
          color: 'negative',
        })
      }
    })
  }

  const actualizarDetalleINV = async (id) => {
    try {
      const response = await api.get(`verificarExistenciaDetalleInv/${id}`)
      const resultado = response.data
      if (resultado.estado === 'exito') {
        detalleFormData.value.ver = 'editarDetalleInvexterno'
        detalleFormData.value.id = String(resultado.datos.id)
        detalleFormData.value.idproductoalmacen = String(resultado.datos.idproductoalmacen)
        detalleFormData.value.productos = `${resultado.datos.codigo} - ${resultado.datos.descripcion}`
        detalleFormData.value.cantidad = resultado.datos.cantidad
        detalleFormData.value.fecha = resultado.datos.fecha
      } else {
        $q.notify({
          message: resultado.mensaje || 'Error al cargar datos del detalle para edición.',
          color: 'negative',
        })
      }
    } catch (error) {
      console.error('Error al actualizar detalle INV:', error)
      $q.notify({
        message: 'Error de conexión o del servidor al actualizar detalle.',
        color: 'negative',
      })
    }
  }
  
  const showDetail = async (row, callbackRefresh) => {
    showDetalle.value = true
    detalleFormData.value.idinventarioexterno = String(row.id)
    detalleFormData.value.estado = row.Autorización

    const detalleINV = {
        idregistro: row.id,
        almacen: row.almacenId,
        estado: row.Autorización,
    }
    localStorage.setItem('detalleInventario', JSON.stringify(detalleINV))

    if(callbackRefresh) await callbackRefresh()
    await listaDetalleMovimiento()
    resetearDetalleFormulario()
  }

  const hideDetail = () => {
    showDetalle.value = false
    detalleInventario.value = []
    localStorage.removeItem('detalleInventario')
  }

  return {
    showDetalle,
    detalleFormData,
    detalleInventario,
    detalleColumns,
    resetearDetalleFormulario,
    listaDetalleMovimiento,
    handleDetailFormSubmit,
    elminarDetalleMovimiento,
    actualizarDetalleINV,
    showDetail,
    hideDetail
  }
}
