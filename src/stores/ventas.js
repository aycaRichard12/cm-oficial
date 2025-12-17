import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export const useVentasStore = defineStore('ventas', () => {
  const $q = useQuasar()

  // Estado reactivo
  const carrito = ref({
    idalmacen: 0,
    codigosinsucursal: null,
    token: '',
    tipo: '',
    iddivisa: 0,
    idcampana: 0,
    ventatotal: 0,
    subtotal: 0,
    descuento: 0,
    nropagos: 0,
    valorpagos: 0,
    dias: 0,
    fechalimite: '',
    listaProductos: [],
    listaProductosFactura: [],
    listaFactura: {},
  })

  const formularioActivo = ref(0)
  const privilegios = ref([])
  const idalmacenfiltro = ref(0)
  const idporcentajeventa = ref(0)
  const divisaActiva = ref(null)
  const leyendaActiva = ref(null)
  const tiposVenta = ref([])
  const almacenes = ref([])
  const categorias = ref([])
  const campanas = ref([])
  const productos = ref([])
  const clientes = ref([])
  const canalesVenta = ref([])
  const metodosPago = ref([])
  const puntosVenta = ref([])

  // Computed properties
  const mostrarCampana = computed(() => campanas.value.length > 0)
  const productosFiltrados = computed(() => {
    return productos.value.filter(
      (p) =>
        !carrito.value.listaProductos.some((lp) => lp.idproductoalmacen === p.id) &&
        p.idporcentaje === idporcentajeventa.value,
    )
  })

  const totalCarrito = computed(() => {
    return carrito.value.listaProductos.reduce((total, producto) => {
      return total + producto.cantidad * producto.precio
    }, 0)
  })

  // Métodos
  async function inicializarVentas(codigo, permisos) {
    try {
      $q.loading.show({ message: 'Validando datos...' })
      privilegios.value = [...permisos.toString()].map((digito) => parseInt(digito))

      // Cargar datos iniciales en paralelo
      await Promise.all([
        crearCarritoVenta(),
        cargarTiposVenta(),
        cargarAlmacenes(),
        cargarClientes(),
        cargarCanalesVenta(),
        cargarMetodosPago(),
      ])

      $q.loading.hide()
    } catch (error) {
      $q.loading.hide()
      mostrarError('Error al inicializar ventas', error)
    }
  }

  async function crearCarritoVenta() {
    try {
      const usuario = validarUsuario()
      const [divisa, leyenda] = await Promise.all([obtenerDivisaActiva(), obtenerLeyendaActiva()])

      divisaActiva.value = divisa
      leyendaActiva.value = leyenda

      carrito.value = {
        ...carrito.value,
        token: usuario.factura?.access_token,
        tipo: usuario.factura?.tipo,
        iddivisa: divisa.id,
        listaProductos: [],
        listaProductosFactura: [],
        listaFactura: {},
      }
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`)
    }
  }

  function validarUsuario() {
    // Implementar lógica para validar usuario
    // Esto debería venir de tu store de autenticación
    const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
    if (contenidousuario) {
      return contenidousuario
    } else {
      alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
      console.log('Los elementos no existen en localStorage')
      localStorage.clear()
      window.location.assign('../../vapp/')
    }
  }

  async function obtenerDivisaActiva() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(
        `/api/listaDivisa/${usuario.empresa.idempresa}/${usuario.factura.access_token}/${usuario.factura.tipo}`,
      )

      const divisa = response.data.find((d) => d.estado === 1)
      return {
        id: divisa.id,
        nombre: divisa.nombre,
        tipo: divisa.tipo,
        codigosin: divisa.monedasin?.codigo || null,
      }
    } catch (error) {
      throw new Error(`Error al obtener divisa: ${error.message}`)
    }
  }

  async function obtenerLeyendaActiva() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(
        `/api/listaLeyendaFactura/${usuario.empresa.idempresa}/${usuario.factura.access_token}/${usuario.factura.tipo}`,
      )

      const leyenda = response.data.find((l) => l.estado === 1)
      return {
        id: leyenda.id,
        codigosin: leyenda.leyendasin.codigo,
      }
    } catch (error) {
      throw new Error(`Error al obtener leyenda: ${error.message}`)
    }
  }

  async function cargarTiposVenta() {
    try {
      const usuario = validarUsuario()
      let resultado = []

      if (usuario.factura.access_token) {
        const response = await api.get(
          `/api/listaLeyendaSIN/tiposector/${usuario.factura.access_token}/${usuario.factura.tipo}`,
        )
        resultado = response.data.data || []
      }

      // Agregar opción por defecto si no existe
      if (!resultado.some((item) => item.codigoDocumentSector === 0)) {
        resultado.unshift({
          codigoDocumentSector: 0,
          codigoSucursal: '0',
          documentoSector: 'COMPROBANTE DE VENTA',
          tipoFactura: 'FACTURA SIN DERECHO A CREDITO FISCAL',
          isActive: 1,
        })
      }

      tiposVenta.value = resultado
    } catch (error) {
      throw new Error(`Error al cargar tipos de venta: ${error.message}`)
    }
  }

  async function cargarAlmacenes() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(`/api/listaResponsableAlmacen/${usuario.empresa.idempresa}`)

      almacenes.value = response.data
        .filter((a) => a.idusuario === usuario.idusuario)
        .map((a) => ({
          id: a.idalmacen,
          nombre: a.almacen,
          codigosin: a.sucursales[0]?.codigosin || null,
        }))
    } catch (error) {
      throw new Error(`Error al cargar almacenes: ${error.message}`)
    }
  }

  async function cargarCategorias() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(`/api/listaCategoriaPrecio/${usuario.empresa.idempresa}`)

      categorias.value = response.data
        .filter((c) => c.estado === 1 && c.idalmacen === idalmacenfiltro.value)
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
        }))
    } catch (error) {
      throw new Error(`Error al cargar categorías: ${error.message}`)
    }
  }

  async function cargarCampanas() {
    try {
      const response = await api.get(`/api/listaCampañasDisponible/${idalmacenfiltro.value}`)

      if (response.data.estado === 'exito') {
        campanas.value = response.data.almacenes
        campanas.value.unshift({ id: 0, nombre: 'Sin Campaña' })
      } else {
        campanas.value = []
      }
    } catch (error) {
      throw new Error(`Error al cargar campañas: ${error.message}`)
    }
  }

  async function cargarCategoriasCampana(idCampana) {
    try {
      const response = await api.get(`/api/listaCategoriasCampanas/${idCampana}`)

      categorias.value = response.data.datos.map((c) => ({
        id: c.id,
        nombre: c.nombre,
      }))
    } catch (error) {
      throw new Error(`Error al cargar categorías de campaña: ${error.message}`)
    }
  }

  async function cargarProductos() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(
        `/api/listaProductosDisponiblesVenta/${usuario.empresa.idempresa}`,
      )

      productos.value = response.data.datos.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        descripcion: p.descripcion,
        stock: p.stock,
        idstock: p.idstock,
        idporcentaje: p.idporcentaje,
        precio: p.precio,
        codigosin: p.codigosin,
        actividadsin: p.actividadsin,
        unidadsin: p.unidadsin,
        codigonandina: p.codigonandina,
      }))
    } catch (error) {
      throw new Error(`Error al cargar productos: ${error.message}`)
    }
  }

  async function cargarClientes() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(`/api/listaCliente/${usuario.empresa.idempresa}`)

      clientes.value = response.data.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        nombrecomercial: c.nombrecomercial,
        ciudad: c.ciudad,
        nit: c.nit,
        textotipodocumento: c.textotipodocumento,
        tipodocumento: c.tipodocumento,
        telefono: c.telefono,
        direccion: c.direccion,
        pais: c.pais,
        idcanal: c.idcanal,
      }))
    } catch (error) {
      throw new Error(`Error al cargar clientes: ${error.message}`)
    }
  }

  async function cargarCanalesVenta() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(`/api/listaCanalVenta/${usuario.empresa.idempresa}`)

      canalesVenta.value = response.data
        .filter((c) => c.estado === 1)
        .map((c) => ({
          id: c.id,
          nombre: c.canal,
        }))
    } catch (error) {
      throw new Error(`Error al cargar canales de venta: ${error.message}`)
    }
  }

  async function cargarMetodosPago() {
    try {
      const usuario = validarUsuario()

      if (usuario.factura.access_token) {
        const response = await api.get(
          `/api/listaMetodopagoFactura/${usuario.empresa.idempresa}/${usuario.factura.access_token}/${usuario.factura.tipo}`,
        )

        metodosPago.value = response.data
          .filter((m) => m.estado === 1)
          .map((m) => ({
            codigo: m.metodopagosin.codigo,
            nombre: m.nombre,
          }))
      } else {
        metodosPago.value = []
      }
    } catch (error) {
      throw new Error(`Error al cargar métodos de pago: ${error.message}`)
    }
  }

  async function cargarPuntosVenta() {
    try {
      const usuario = validarUsuario()
      const response = await api.get(`/api/listaPuntoVentaFactura/${usuario.idusuario}`)

      puntosVenta.value = response.data.datos
        .filter((p) => p.idalmacen === carrito.value.idalmacen)
        .map((p) => ({
          codigo: p.codigosin,
          nombre: p.nombre,
        }))

      // Actualizar punto de venta en el carrito
      if (puntosVenta.value.length > 0) {
        carrito.value.listaFactura.codigoPuntoVenta = puntosVenta.value[0].codigo
      }
    } catch (error) {
      throw new Error(`Error al cargar puntos de venta: ${error.message}`)
    }
  }

  function agregarProducto(producto) {
    const nuevoProducto = {
      idproductoalmacen: producto.id,
      cantidad: producto.cantidad,
      precio: producto.precio,
      idstock: producto.idstock,
      idporcentaje: producto.idporcentaje,
      candiponible: producto.stock,
      descripcion: producto.descripcion,
      codigo: producto.codigo,
    }

    const nuevoProductoFactura = {
      codigoProducto: producto.codigo,
      codigoActividadSin: producto.actividadsin,
      codigoProductoSin: producto.codigosin,
      descripcion: producto.descripcion,
      unidadMedida: producto.unidadsin,
      precioUnitario: producto.precio,
      subTotal: calcularSubTotal(producto.cantidad, producto.precio),
      cantidad: producto.cantidad,
      numeroSerie: '',
      montoDescuento: 0,
      numeroImei: '',
      codigoNandina: producto.codigonandina,
    }

    // Actualizar carrito
    carrito.value.listaProductos.push(nuevoProducto)
    carrito.value.listaProductosFactura.push(nuevoProductoFactura)

    // Actualizar totales
    actualizarTotales()
  }

  function eliminarProducto(idProducto) {
    // Filtrar productos
    carrito.value.listaProductos = carrito.value.listaProductos.filter(
      (p) => p.idproductoalmacen !== idProducto,
    )

    carrito.value.listaProductosFactura = carrito.value.listaProductosFactura.filter(
      (p) => p.codigoProducto !== idProducto,
    )

    // Actualizar totales
    actualizarTotales()
  }

  function actualizarTotales() {
    // Calcular subtotal
    carrito.value.subtotal = carrito.value.listaProductos.reduce(
      (total, producto) => total + producto.cantidad * producto.precio,
      0,
    )

    // Calcular venta total
    carrito.value.ventatotal = carrito.value.subtotal - carrito.value.descuento

    // Actualizar en factura si existe
    if (carrito.value.listaFactura) {
      carrito.value.listaFactura.descuentoAdicional = carrito.value.descuento
      carrito.value.listaFactura.montoTotal = carrito.value.ventatotal
      carrito.value.listaFactura.montoTotalMoneda = carrito.value.ventatotal
      carrito.value.listaFactura.montoTotalSujetoIva = carrito.value.ventatotal
    }
  }

  function calcularSubTotal(cantidad, precio) {
    return parseFloat((cantidad * precio).toFixed(2))
  }

  function actualizarDescuento(nuevoDescuento) {
    carrito.value.descuento = parseFloat(nuevoDescuento) || 0
    actualizarTotales()
  }

  async function crearFormularioFactura(tipo) {
    try {
      const usuario = validarUsuario()

      switch (tipo) {
        case 1: // Factura Compra-Venta
          carrito.value.listaFactura = {
            numeroFactura: '',
            nombreRazonSocial: '',
            codigoPuntoVenta: puntosVenta.value[0]?.codigo || 0,
            fechaEmision: new Date().toISOString(),
            cafc: '',
            codigoExcepcion: '',
            descuentoAdicional: carrito.value.descuento,
            montoGiftCard: 0,
            codigoTipoDocumentoIdentidad: 0,
            numeroDocumento: 0,
            complemento: '',
            codigoCliente: '',
            codigoMetodoPago: metodosPago.value[0]?.codigo || 0,
            numeroTarjeta: '',
            montoTotal: carrito.value.ventatotal,
            codigoMoneda: divisaActiva.value.codigosin,
            montoTotalMoneda: carrito.value.ventatotal,
            usuario: usuario.usuario,
            emailCliente: 'factura@yofinanciero.com',
            telefonoCliente: 0,
            extras: { facturaTicket: '' },
            codigoLeyenda: leyendaActiva.value.codigosin,
            montoTotalSujetoIva: carrito.value.ventatotal,
            tipoCambio: 1,
            detalles: carrito.value.listaProductosFactura,
          }
          break

        case 2: // Factura Alquileres
          // Similar estructura con campos específicos
          break

        case 3: // Factura Exportación
          // Similar estructura con campos específicos
          break

        default: // Comprobante de Venta
          carrito.value.listaFactura = null
      }

      formularioActivo.value = tipo
    } catch (error) {
      throw new Error(`Error al crear formulario de factura: ${error.message}`)
    }
  }

  async function validarNit(nit) {
    try {
      const usuario = validarUsuario()
      $q.loading.show({ message: 'Validando NIT...' })

      const response = await api.get(
        `/api/ValidarNit/${nit}/${usuario.factura.access_token}/${usuario.factura.tipo}`,
      )

      if (response.data.status === 'success') {
        if (response.data.data.descripcion === 'NIT ACTIVO') {
          carrito.value.listaFactura.codigoExcepcion = 0
          return { valido: true, mensaje: response.data.data.descripcion }
        } else {
          carrito.value.listaFactura.codigoExcepcion = 1
          return { valido: false, mensaje: response.data.data.descripcion }
        }
      } else {
        throw new Error(response.data.error || 'Error al validar NIT')
      }
    } catch (error) {
      throw new Error(`Error al validar NIT: ${error.message}`)
    } finally {
      $q.loading.hide()
    }
  }

  async function enviarVenta(formulario) {
    try {
      $q.loading.show({ message: 'Procesando venta...' })

      const datos = new FormData(formulario)
      datos.append('jsonDetalles', JSON.stringify(carrito.value))

      const response = await api.post('/api/', datos)

      if (response.data.estado === 'exito') {
        if (response.data.tipoventa === 'facturado' && response.data.errores) {
          throw new Error(response.data.errores.join('\n'))
        }

        return response.data
      } else {
        throw new Error(
          response.data.estadoFactura?.errores?.join('\n') || 'Error al procesar venta',
        )
      }
    } catch (error) {
      throw new Error(`Error al enviar venta: ${error.message}`)
    } finally {
      $q.loading.hide()
    }
  }

  function limpiarCarrito() {
    carrito.value = {
      ...carrito.value,
      listaProductos: [],
      listaProductosFactura: [],
      listaFactura: {},
      ventatotal: 0,
      subtotal: 0,
      descuento: 0,
    }
  }

  function mostrarError(titulo, error) {
    $q.notify({
      type: 'negative',
      message: titulo,
      caption: error.message || 'Error desconocido',
      position: 'top',
    })
    console.error(titulo, error)
  }

  return {
    // Estado
    carrito,
    formularioActivo,
    almacenes,
    categorias,
    campanas,
    productos,
    clientes,
    canalesVenta,
    metodosPago,
    puntosVenta,
    tiposVenta,

    // Computed
    mostrarCampana,
    productosFiltrados,
    totalCarrito,

    // Métodos
    inicializarVentas,
    crearCarritoVenta,
    cargarTiposVenta,
    cargarAlmacenes,
    cargarCategorias,
    cargarCampanas,
    cargarCategoriasCampana,
    cargarProductos,
    cargarClientes,
    cargarCanalesVenta,
    cargarMetodosPago,
    cargarPuntosVenta,
    agregarProducto,
    eliminarProducto,
    actualizarTotales,
    actualizarDescuento,
    crearFormularioFactura,
    validarNit,
    enviarVenta,
    limpiarCarrito,
    mostrarError,
  }
})
