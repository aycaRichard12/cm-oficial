// src/modules/Cotizacion/composables/useConfiguracion.js
import { ref, reactive } from 'vue'
import { api, apiCt } from 'src/boot/axios'
import { validarUsuario, getToken, getTipoFactura } from 'src/composables/FuncionesG'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

export function useConfiguracion() {
  const idempresa = idempresa_md5()
  const token = getToken()
  const tipoFactura = getTipoFactura()

  const almacenesOptions = ref([])
  const categoriasOptions = ref([])
  const puntosVenta = ref([])
  const salesChannels = ref([])
  const divisaActiva = reactive({ id: 0, nombre: '', tipo: '', codigosin: 0 })
  const leyendaFacturaActiva = reactive({ id: 0, codigosin: 0 })
  const leyendasCotizacion = ref([])
  const metodosPagos = ref([])
  const listaCajaBancos = ref([])
  const soloAlmacen = ref(false)

  async function fetchEstadoActual() {
    try {
      const { data } = await api.get(`configuracionclientesAlmacenEstadoActual/${idempresa}`)
      soloAlmacen.value = data.clientesAlmacen ?? data ?? false
    } catch (error) {
      console.error(error)
    }
  }

  async function divisaEmonedaActiva() {
    let endpoint = `listaDivisa/${idempresa}`
    if (token && tipoFactura) {
      endpoint = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
    }
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
      } else {
        const use = resultado.filter((u) => Number(u.estado) === 1)
        if (use.length > 0) {
          divisaActiva.id = use[0].id
          divisaActiva.nombre = use[0].nombre
          divisaActiva.tipo = use[0].tipo || 0
          divisaActiva.codigosin = use[0]?.monedasin?.codigo ?? 0
        }
      }
    } catch (error) {
      console.error('Error al cargar divisa activa:', error)
    }
  }

  async function leyendaActiva() {
    let endpoint = null
    if (token && tipoFactura) {
      endpoint = `listaLeyendaFactura/${idempresa}/${token}/${tipoFactura}`
    } else {
      leyendaFacturaActiva.id = 0
      leyendaFacturaActiva.codigosin = 0
      return
    }
    try {
      const response = await api.get(endpoint)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
      } else {
        const use = resultado.filter((u) => u.estado === 1)
        if (use.length > 0) {
          leyendaFacturaActiva.id = use[0].id || 0
          leyendaFacturaActiva.codigosin = use[0].leyendasin?.codigo || 0
        }
      }
    } catch (error) {
      console.error('Error al cargar leyenda activa:', error)
    }
  }

  async function cargarMetodoPagoFactura() {
    try {
      const user = await validarUsuario()
      const token = user[0]?.factura?.access_token
      const tipo = user[0]?.factura?.tipo
      const idempresa = user[0]?.empresa?.idempresa
      const response = await api.get(`listaMetodopagoFactura/${idempresa}/${token}/${tipo}`)
      const filtrado = response.data.filter((u) => u.estado == 1)
      metodosPagos.value = filtrado.map((item) => ({
        label: item.nombre,
        value: item.id,
      }))
    } catch (error) {
      console.error('Error cargando métodos de pago:', error)
    }
  }

  async function listarcajasbanco() {
    try {
      const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)
      listaCajaBancos.value = response.data.map((item) => ({
        label: item.codigo + ' ' + item.tipo_cuenta,
        value: item.idcaja_bancos,
        codigo: item.codigo,
        nombre: item.tipo_cuenta,
      }))
    } catch (error) {
      console.error('Error al cargar caja bancos:', error)
    }
  }

  async function cargarCanales() {
    try {
      const user = await validarUsuario()
      const idempresa = user[0]?.empresa?.idempresa
      const response = await api.get(`listaCanalVentaActivos/${idempresa}`)
      salesChannels.value = response.data.map((item) => ({
        label: item.canal,
        value: item.id,
      }))
    } catch (error) {
      console.error('Error cargando canales:', error)
    }
  }

  async function cargarLeyendasCotizacion() {
    try {
      const user = await validarUsuario()
      const idempresa = user[0]?.empresa?.idempresa
      if (!idempresa) {
        leyendasCotizacion.value = []
        return
      }
      const response = await api.get(`listaLeyendaCotizacion/${idempresa}`)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
        leyendasCotizacion.value = []
      } else {
        leyendasCotizacion.value = resultado.filter((u) => u.estado === 1)
      }
    } catch (error) {
      console.error('Error al cargar leyendas de cotización:', error)
      leyendasCotizacion.value = []
    }
  }

  async function cargarAlmacenes() {
    const user = await validarUsuario()
    const idempresa = user[0]?.empresa?.idempresa
    const idusuario = user[0]?.idusuario
    if (!idempresa || !idusuario) return
    try {
      const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
      const resultado = response.data
      if (resultado[0] === 'error') {
        console.error(resultado.error)
      } else {
        almacenesOptions.value = resultado.filter((u) => u.idusuario === idusuario)
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error)
    }
  }

  async function cargarConfiguracionInicial() {
    await divisaEmonedaActiva()
    await leyendaActiva()
    await cargarMetodoPagoFactura()
    await cargarCanales()
    await listarcajasbanco()
    await cargarLeyendasCotizacion()
    await cargarAlmacenes()
    await fetchEstadoActual()
  }

  return {
    almacenesOptions,
    categoriasOptions,
    puntosVenta,
    salesChannels,
    divisaActiva,
    leyendaFacturaActiva,
    leyendasCotizacion,
    metodosPagos,
    listaCajaBancos,
    soloAlmacen,
    fetchEstadoActual,
    cargarConfiguracionInicial,
    cargarAlmacenes,
    divisaEmonedaActiva,
    leyendaActiva,
    cargarMetodoPagoFactura,
    cargarCanales,
    listarcajasbanco,
    cargarLeyendasCotizacion,
  }
}
