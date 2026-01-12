import { computed, ref } from 'vue'
import {
  obtenerFechaActualDato,
  validarUsuario,
  normalizeText,
  obtenerUbicacion,
  msgNegative,
} from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'

export function useInventarioExterior() {
  const $q = useQuasar()
  const formCollapse = ref(false)
  const tituloFormulario = ref('Nuevo registro')
  const filtroAlmacen = ref('')
  const searchQuery = ref('')
  const inventarioData = ref([])
  const idusuario = idusuario_md5()

  const formData = ref({
    ver: '',
    id: '',
    idusuario: idusuario,
    idcliente: '',
    idsucursal: '',
    almacen: '',
    clientes: '',
    sucursali: '',
    fecha: '',
    imagen: null,
    observacion: '',
    latitud: '',
    longitud: '', // Added missing field init
  })

  // Permisos - Note: This needs to be checked inside component usually, but if we pass it, it's fine.
  // However, since hooks run in setup, we can access store here.
  // We'll expose a function or verify permissions where needed.
  // For now we assume the consumer handles permissions or we can use store here.

  // Columnas para la tabla principal
  const columns = [
    { name: 'indice', label: 'N°', field: 'indice', align: 'right', sortable: true },
    { name: 'Fecha', label: 'Fecha', field: 'Fecha', align: 'right', sortable: true },
    { name: 'Almacén', label: 'Almacén', field: 'Almacén', align: 'left', sortable: true },
    { name: 'Cliente', label: 'Cliente', field: 'Cliente', align: 'left', sortable: true },
    { name: 'Sucursal', label: 'Sucursal', field: 'Sucursal', align: 'left', sortable: true },
    {
      name: 'Observación',
      label: 'Observación',
      field: 'Observación',
      align: 'left',
      sortable: true,
    },
    { name: 'Imagen', label: 'Imagen', field: 'Imagen', align: 'center' },
    { name: 'Autorización', label: 'Autorización', field: 'Autorización', align: 'center' },
    { name: 'Detalle', label: 'Detalle', field: 'Detalle', align: 'center' },
    { name: 'Opciones', label: 'Opciones', field: 'Opciones', align: 'center' },
  ]

  const filteredInventario = computed(() => {
    let tempInventario = inventarioData.value

    if (filtroAlmacen.value) {
      tempInventario = tempInventario.filter(
        (item) => String(item.almacenId) === filtroAlmacen.value,
      )
    }

    if (searchQuery.value) {
      const lowerCaseQuery = normalizeText(searchQuery.value).toLowerCase()
      tempInventario = tempInventario.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(lowerCaseQuery)),
      )
    }
    return tempInventario
  })

  async function listarDatos() {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    if (!idempresa) {
      console.error('ID de empresa no disponible para listar inventario.')
      return
    }

    const endpoint = `listainventarioexterno/${idempresa}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      console.log('Respuesta completa API de datos :', resultado)
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        inventarioData.value = []
      } else {
        // Filter logic was inside listarDatos previously, but filteredInventario does client-side filtering.
        // The original code did fetch all then filter by Almacen locally inside the same function if filter was set?
        // Wait, the original code had:
        // if (filtroAlmacen.value) filteredResult = resultado.filter(...)
        // But it also had a computed property `filteredInventario`.
        // It seems `filteredInventario` is redundant if `inventarioData` is already filtered.
        // However, `listarDatos` in original updates `inventarioData`.
        // Let's keep `inventarioData` as the full list or filtered list from server?
        // Original: `inventarioData.value = filteredResult.map(...)` where filteredResult came from `resultado`
        // AND `filtroAlmacen` check.
        // So `inventarioData` only held filtered items?
        // IF so, `filteredInventario` computed doing another filter is weird but ok.
        // Let's preserve original behavior: keys mapping.

        let filteredResult = resultado
        // Keeping original logic where it filters immediately upon fetch if filter is present?
        // Actually original code refetched on watcher of `filtroAlmacen`.

        // Let's just store everything in `inventarioData` if possible, OR filter it here.
        // Original:
        // if (filtroAlmacen.value) { filteredResult = resultado.filter(...) }

        if (filtroAlmacen.value) {
          filteredResult = resultado.filter(
            (item) => Number(item.idalmacen) === Number(filtroAlmacen.value),
          )
        }

        inventarioData.value = filteredResult.map((key, index) => ({
          indice: index + 1,
          Fecha: key.fecha,
          Almacén: key.almacen,
          Cliente: key.nombre,
          Sucursal: key.sucursal,
          Observación: key.observaciones,
          Imagen: key.foto,
          Autorización: key.estado, // 0 or 1
          id: key.id,
          almacenId: key.idalmacen,
          clienteId: key.idcliente,
          idsucursal: key.idsucursal,
          latitud: key.latitud,
          longitud: key.longitud,
        }))
      }
    } catch (error) {
      console.error('Error al obtener datos de inventario:', error)
      inventarioData.value = []
    }
  }

  async function displayLocation() {
    try {
      const location = await obtenerUbicacion()
      return [location.lat, location.lng]
    } catch (error) {
      console.error('Error al obtener la ubicación:', error)
      $q.notify({
        message: error, // Error string
        color: 'red',
        icon: 'close',
        position: 'top',
      })
      return false
    }
  }

  async function handleMainFormSubmit(escritura) {
    // Pass permissions needed
    if (!escritura) {
      msgNegative($q)
      return
    }
    $q.loading.show()
    try {
      const formDatos = new FormData()
      formDatos.append('idusuario', formData.value.idusuario)
      formDatos.append('ver', formData.value.ver)
      // Check if cliente is object or value
      const idClienteVal = formData.value.cliente?.value ?? formData.value.cliente
      formDatos.append('idcliente', idClienteVal)

      formDatos.append('observacion', formData.value.observacion)
      formDatos.append('almacen', formData.value.almacen)
      formDatos.append('fecha', formData.value.fecha)

      const idSucursalVal = formData.value.sucursal?.value ?? formData.value.sucursal
      formDatos.append('sucursal', idSucursalVal)

      formDatos.append('latitud', formData.value.latitud)
      formDatos.append('longitud', formData.value.longitud)

      if (formData.value.id != null && formData.value.id !== '') {
        formDatos.append('id', formData.value.id)
      }

      const response = await api.post('', formDatos)
      const data = response.data

      if (data.estado === 'exito') {
        $q.notify({
          message: 'Registro exitoso!',
          color: 'positive',
          icon: 'check_circle',
        })
        filtroAlmacen.value = String(data.almacen)
        await listarDatos()
        resetearFormulario()
        formCollapse.value = false
        tituloFormulario.value = 'Nuevo registro'
      } else {
        $q.notify({
          message: data.mensaje || 'Error al registrar.',
          color: 'negative',
          icon: 'error',
        })
      }
    } catch (error) {
      console.error('Error submitting main form:', error)
      $q.notify({
        message: 'Error de conexión o del servidor.',
        color: 'negative',
        icon: 'error',
      })
    } finally {
      $q.loading.hide()
    }
  }

  const toggleAutorizacion = async (row) => {
    const newEstado = Number(row.Autorización) === 2 ? 1 : 2
    const endpoint = `cambiarEstadoinvexterno/${row.id}/${newEstado}`
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado.estado === 'error') {
        $q.notify({
          message: resultado.mensaje || 'Error al cambiar estado.',
          color: 'negative',
        })
      } else {
        $q.notify({
          message:
            resultado.mensaje ||
            `Autorización de ${row.Cliente} cambiada a ${newEstado === 1 ? 'Autorizado' : 'No Autorizado'}`,
          color: 'positive',
        })
        await listarDatos()
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      $q.notify({
        message: 'Error de conexión o del servidor al cambiar estado.',
        color: 'negative',
      })
    }
  }

  const deleteItem = (row) => {
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el registro de ${row.Cliente} del ${row.Fecha}? No podrá recuperar este registro.`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const response = await api.get(`eliminarinvexterno/${row.id}`)
        const data = response.data
        if (data.estado === 'exito') {
          $q.notify({
            message: data.mensaje || 'Registro eliminado correctamente.',
            color: 'positive',
          })
          await listarDatos()
        } else {
          $q.notify({
            message: data.mensaje || 'Error al eliminar registro.',
            color: 'negative',
          })
        }
      } catch (error) {
        console.error('Error al eliminar:', error)
        $q.notify({
          message: 'Error de conexión o del servidor al eliminar.',
          color: 'negative',
        })
      }
    })
  }

  const editItem = async (row, clientesOptions) => {
    const endpoint = `verificarExistenciainvexterno/${row.id}`
    console.log('Endpoint:', row)
    try {
      const response = await api.get(endpoint)
      console.log('Respuesta completa API:', response.data)
      const resultado = response.data
      if (resultado.estado === 'exito') {
        formData.value.ver = 'editarInventarioExterno'
        formData.value.id = String(resultado.datos.id)
        formData.value.fecha = resultado.datos.fecha
        formData.value.almacen = String(resultado.datos.idalmacen)

        const clienteSeleccionado = clientesOptions.find((c) => {
          return Number(c.value) == Number(resultado.datos.idcliente)
        })
        formData.value.cliente = clienteSeleccionado
        formData.value.observacion = resultado.datos.observacion

        tituloFormulario.value = 'Editar registro'
        formCollapse.value = true
        formData.value.latitud = row.latitud
        formData.value.longitud = row.longitud
      
        // Note: consumer needs to call selectSucursal logic after this if needed,
        // or we handle it in the watcher inside the component or here.
        console.log('resultado',resultado.datos)
        return resultado.datos.idcliente // Return client ID so component can trigger sucursal load



      } else {
        $q.notify({
          message: resultado.mensaje || 'Error al cargar datos para edición.',
          color: 'negative',
        })
        return null
      }
    } catch (error) {
      console.error('Error al cargar datos para edición:', error)
      $q.notify({
        message: 'Error de conexión o del servidor al editar.',
        color: 'negative',
      })
      return null
    }
  }

  const resetearFormulario = (latitud, longitud, escritura) => {
    if (escritura) {
      formData.value.ver = 'registrarInventarioExterno'
    }
    formData.value.id = ''
    formData.value.idcliente = ''
    formData.value.idsucursal = ''
    formData.value.almacen = ''
    formData.value.clientes = ''
    formData.value.sucursali = ''
    formData.value.cliente = null
    formData.value.sucursal = null
    formData.value.imagen = null
    formData.value.observacion = ''
    formData.value.latitud = ''
    formData.value.longitud = ''
    formData.value.fecha = obtenerFechaActualDato()
    if (latitud) formData.value.latitud = latitud
    if (longitud) formData.value.longitud = longitud
    tituloFormulario.value = 'Nuevo registro'
  }

  const toggleFormCollapse = async (escritura) => {
    const position = await displayLocation()
    if (position) {
      formCollapse.value = !formCollapse.value
      if (formCollapse.value) {
        resetearFormulario(position[0], position[1], escritura)
      }
    }
  }

  return {
    formCollapse,
    tituloFormulario,
    filtroAlmacen,
    searchQuery,
    inventarioData,
    filteredInventario,
    formData,
    columns,
    listarDatos,
    handleMainFormSubmit,
    toggleAutorizacion,
    deleteItem,
    editItem,
    resetearFormulario,
    toggleFormCollapse,
  }
}
