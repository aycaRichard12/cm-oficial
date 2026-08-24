// src/modules/Cotizacion/composables/useCliente.js
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { normalizeText, validarUsuario } from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'

export function useCliente(options) {
  const $q = useQuasar()
  const { soloAlmacen = ref(false), almacenesOptions = ref([]), salesChannels = ref([]) } = options

  const clientesOptions = ref([])
  const filteredClients = ref([])
  const selectedClient = ref(null)
  const idclienteCO = ref('')

  const sucursalesOptions = ref([])
  const filteredSucursales = ref([])
  const selectedSucursal = ref(null)
  const idsucursalCOS = ref('')

  const canalventa = ref(null)

  // ─── Cargar clientes ──────────────────────────────────────────────────────
  async function cargarClientes() {
    const user = await validarUsuario()
    const idempresa = user[0]?.empresa?.idempresa
    if (!idempresa) return

    try {
      const response = await api.get(`listaCliente/${idempresa}`)
      let data = response.data
      if (data[0] === 'error') {
        console.error(data.error)
        return
      }

      if (soloAlmacen.value) {
        const allowedIds = almacenesOptions.value.map((a) => a.idalmacen)
        data = data.filter((c) => {
          if (!c.almacenes || c.almacenes.length === 0) return true
          return c.almacenes.some((al) => allowedIds.includes(al.idalmacen))
        })
      }

      clientesOptions.value = data.map((c) => ({
        ...c,
        display: `${c.codigo} - ${c.nombre} - ${c.nombrecomercial} - ${c.ciudad} - ${c.nit}`,
      }))
      filteredClients.value = clientesOptions.value
    } catch (error) {
      console.error('Error cargando clientes:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar clientes' })
    }
  }

  // ─── Seleccionar sucursales ──────────────────────────────────────────────
  async function selectSucursal(clientId) {
    if (!clientId) {
      sucursalesOptions.value = []
      selectedSucursal.value = null
      idsucursalCOS.value = ''
      return
    }
    try {
      const response = await api.get(`listaSucursal/${clientId}`)
      const data = response.data
      if (data.length === 0) {
        $q.notify({ type: 'info', message: 'No hay sucursales para este cliente.' })
        sucursalesOptions.value = []
        selectedSucursal.value = null
        idsucursalCOS.value = ''
      } else {
        sucursalesOptions.value = data
        selectedSucursal.value = data[0]
        idsucursalCOS.value = data[0].id
      }
    } catch (error) {
      console.error('Error cargando sucursales:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar sucursales' })
    }
  }

  function selectCanalVenta(canalId) {
    canalventa.value = salesChannels.value.find((c) => Number(c.value) === Number(canalId)) || null
  }

  function elegirUnCliente(client) {
    if (client) {
      idclienteCO.value = client.id
      selectSucursal(client.id)
      selectCanalVenta(client.idcanal)
    } else {
      idclienteCO.value = ''
      selectedSucursal.value = null
      idsucursalCOS.value = ''
    }
  }

  // ─── Filtros para QSelect ────────────────────────────────────────────────
  function filterClient(val, update) {
    update(() => {
      const needle = normalizeText(val).toLowerCase()
      filteredClients.value = clientesOptions.value.filter((v) =>
        normalizeText(v.display).toLowerCase().includes(needle),
      )
    })
  }

  function setClientInputValue(val) {
    if (!clientesOptions.value.some((c) => c.display === val)) {
      selectedClient.value = null
      idclienteCO.value = ''
      selectedSucursal.value = null
      idsucursalCOS.value = ''
    }
  }

  function filterSucursal(val, update) {
    update(() => {
      const needle = normalizeText(val).toLowerCase()
      filteredSucursales.value = sucursalesOptions.value.filter((v) =>
        normalizeText(v.nombre).toLowerCase().includes(needle),
      )
    })
  }

  function setSucursalInputValue(val) {
    if (!sucursalesOptions.value.some((s) => s.nombre === val)) {
      selectedSucursal.value = null
      idsucursalCOS.value = ''
    }
  }

  function elegirUnaSucursal(sucursal) {
    if (sucursal) idsucursalCOS.value = sucursal.id
    else idsucursalCOS.value = ''
  }

  // ─── Registro rápido de cliente (modal) ─────────────────────────────────
  const showAddModal = ref(false)
  function RegistrarCliente() {
    showAddModal.value = !showAddModal.value
  }

  async function handleRecordCreated(newRecordData) {
    const formData = new FormData()
    Object.keys(newRecordData).forEach((key) => {
      formData.append(key, newRecordData[key])
    })
    try {
      const response = await api.post('', formData)
      if (response.data.estado === 'exito') {
        await cargarClientes()
        RegistrarCliente()
        $q.notify({ type: 'positive', message: 'Cliente guardado correctamente' })
      } else {
        $q.notify({ type: 'negative', message: response.data.mensaje || 'Error al guardar' })
      }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error en el registro' })
    }
  }

  return {
    clientesOptions,
    filteredClients,
    selectedClient,
    idclienteCO,
    sucursalesOptions,
    filteredSucursales,
    selectedSucursal,
    idsucursalCOS,
    canalventa,
    showAddModal,
    cargarClientes,
    selectSucursal,
    selectCanalVenta,
    elegirUnCliente,
    filterClient,
    setClientInputValue,
    filterSucursal,
    setSucursalInputValue,
    elegirUnaSucursal,
    RegistrarCliente,
    handleRecordCreated,
  }
}
