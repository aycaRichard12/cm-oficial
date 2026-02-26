import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import { URL_APICM } from 'src/composables/services'
import { useCampanaCore } from './useCampanaCore'

export function usePreciosCampana(q, campanas, idalmacenfiltro) {
  const { idempresa } = useCampanaCore()
  const dialogoPrecios = ref(false)
  const cargandoGuardarPrecio = ref(false)

  const preciosCampana = ref([])
  const filtroPrecioCampania = ref(null)
  
  const productosAlmacen = ref([])
  const productoSeleccionado = ref(null)
  const productosNoAsignados = ref([])
  const productosNoAsignadosOptions = ref([])
  const categoriasCampanaPrecioOptions = ref([])

  const precioForm = ref({
    idcampaña: '', producto: '', precio: '', id_detalle_campanas: null,
    idproducto: null, idproductoalmacen: null, idcategoriacampaña: null,
  })

  // Computeds
  const preciosCampanaFiltrados = computed(() => {
    let filtered = preciosCampana.value
    if (filtroPrecioCampania.value !== null && filtroPrecioCampania.value !== '') {
      filtered = filtered.filter((i) => 
        String(i.idcategoriaprecio) === String(filtroPrecioCampania.value) || 
        String(i.idcategoriacampaña) === String(filtroPrecioCampania.value))
    }
    return filtered.map((item, idx) => ({ ...item, numero: idx + 1 }))
  })

  // Métodos
  const listarProductosAlmacen = async () => {
    try {
      const res = await api.get(`listaProductoAlmacen/${idempresa}`)
      if (res.data && Array.isArray(res.data)) {
        // Deduplicar por ID para evitar productos repetidos en el select
        const unicos = new Map()
        res.data.forEach(prod => {
          if (!unicos.has(prod.id)) {
            unicos.set(prod.id, prod)
          }
        })
        productosAlmacen.value = Array.from(unicos.values())
      }
    } catch { console.error('Error listaProductoAlmacen') }
  }

  const cargarPrecios = async (idCampana) => {
    try {
      precioForm.value.idcampaña = idCampana
      cancelarEdicionPrecio()

      const [res1, res2] = await Promise.all([
        peticionGET(`${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`),
        peticionGET(`${URL_APICM}api/listapreciocampaña/${idCampana}`)
      ])

      categoriasCampanaPrecioOptions.value = res1 || []
      preciosCampana.value = res2 || []
      
      console.log('Productos asociados en la campaña:', preciosCampana.value)

      dialogoPrecios.value = true
    } catch { console.error('Error cargarPrecios') }
  }

  const cancelarEdicionPrecio = () => {
    productoSeleccionado.value = null
    Object.assign(precioForm.value, {
      id_detalle_campanas: null, idproducto: null, idproductoalmacen: null,
      producto: '', precio: '', idcategoriacampaña: null
    })
    productosNoAsignados.value = []
    productosNoAsignadosOptions.value = []
  }

  const onCategoriaCampañaSeleccionada = (idCatCampaña) => {
    productoSeleccionado.value = null
    precioForm.value.idproductoalmacen = null
    precioForm.value.idproducto = null
    precioForm.value.producto = ''

    if (!idCatCampaña) {
      productosNoAsignados.value = []
      productosNoAsignadosOptions.value = []
      return
    }

    const campanaActual = campanas.value.find(c => String(c.id) === String(precioForm.value.idcampaña))
    const idAlmacenCampana = campanaActual?.idalmacen || idalmacenfiltro.value?.idalmacen || idalmacenfiltro.value

    const almacenProds = productosAlmacen.value.filter(p => String(p.idalmacen) === String(idAlmacenCampana))
    const asignados = preciosCampana.value.filter(p => String(p.idcategoriacampaña) === String(idCatCampaña))
    const idsAsignados = asignados.map(p => String(p.idproductoalmacen || p.idproducto))

    productosNoAsignados.value = almacenProds.filter(p => !idsAsignados.includes(String(p.id)))
    productosNoAsignadosOptions.value = productosNoAsignados.value
  }

  const registrarPrecioCampaña = async () => {
    try {
      cargandoGuardarPrecio.value = true
      
      const isEditing = !!precioForm.value.id_detalle_campanas
      let res
      
      if (isEditing) {
        const formData = new FormData()
        formData.append('ver', 'editarPreciocampana')
        formData.append('idproducto', precioForm.value.idproducto || '')
        formData.append('precio', precioForm.value.precio || '')
        formData.append('idcategoriacampaña', precioForm.value.idcategoriacampaña || '')
        formData.append('idproductoalmacen', precioForm.value.idproductoalmacen || '')
        formData.append('id_detalle_campanas', precioForm.value.id_detalle_campanas)
        res = await api.post('', formData)
      } else {
        const payload = {
          ver: 'registrarProductoPrecioCampana',
          idproducto: precioForm.value.idproductoalmacen || '',
          precio: precioForm.value.precio || '',
          idcategoriacampaña: precioForm.value.idcategoriacampaña || ''
        }
        res = await api.post('', payload)
        console.log('Respuesta al registrar precio:', payload)
      }
      
      if (res.data.estado === 'exito') {
        q.notify({ type: 'positive', message: res.data.mensaje || 'Éxito' })
        const currId = precioForm.value.idcampaña
        cancelarEdicionPrecio()
        precioForm.value.idcampaña = currId
        await cargarPrecios(currId)
      } else throw new Error(res.data.mensaje)
    } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al registrar' }) 
    } finally { cargandoGuardarPrecio.value = false }
  }

  const eliminarPrecioCampana = async (id) => {
    q.dialog({ title: 'Confirmar', message: '¿Eliminar precio?', cancel: true })
      .onOk(async () => {
        try {
          const res = await peticionGET(`${URL_APICM}api/eliminarpreciocampana/${id}`)
          if (res.estado === 'exito') {
            q.notify({ type: 'positive', message: res.mensaje })
            await cargarPrecios(precioForm.value.idcampaña)
          } else throw new Error(res.mensaje)
        } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al eliminar' }) }
      })
  }

  const editarPrecioCampana = (precio) => {
    precioForm.value.id_detalle_campanas = precio.id
    precioForm.value.idproducto = precio.idproducto
    precioForm.value.idproductoalmacen = precio.idproductoalmacen
    precioForm.value.producto = precio.descripcion || precio.producto
    precioForm.value.precio = precio.precio
    precioForm.value.idcategoriacampaña = precio.idcategoriacampaña
  }

  const filtrarProductos = (val, update) => {
    update(() => {
      if (!val) productosNoAsignadosOptions.value = productosNoAsignados.value
      else {
        const needle = val.toLowerCase()
        productosNoAsignadosOptions.value = productosNoAsignados.value.filter(v => 
          (v.descripcion || v.producto || '').toLowerCase().includes(needle) || 
          (v.codigo || '').toLowerCase().includes(needle)
        )
      }
    })
  }

  const alSeleccionarProducto = async (val) => {
    if (val) {
      precioForm.value.idproductoalmacen = val.id || null
      precioForm.value.idproducto = val.idproducto || null
      precioForm.value.producto = val.descripcion || val.producto || ''
      
      let porcentaje = 0
      
      try {
        // Obtenemos el porcentaje de descuento de la campaña
        const resCampana = await peticionGET(`${URL_APICM}api/verificarExistenciacampana/${precioForm.value.idcampaña}`)
        if (resCampana && resCampana.estado === 'exito') {
          porcentaje = parseFloat(resCampana.datos?.porcentaje || 0)
        }
      } catch (e) {
        console.error('Error al obtener el porcentaje de la campaña:', e)
      }
      
      // Aplicamos el descuento al precioSugerido del producto
      const precioBase = val.precioSugerido ? parseFloat(val.precioSugerido) : 0
      if (precioBase > 0) {
        const precioDescontado = precioBase - (precioBase * (porcentaje / 100))
        precioForm.value.precio = parseFloat(precioDescontado).toFixed(2)
      } else {
        precioForm.value.precio = '0.00'
      }
    } else {
      precioForm.value.idproductoalmacen = null
      precioForm.value.idproducto = null
      precioForm.value.producto = ''
      precioForm.value.precio = ''
    }
  }

  return {
    dialogoPrecios, cargandoGuardarPrecio, preciosCampanaFiltrados, filtroPrecioCampania,
    productoSeleccionado, productosNoAsignadosOptions, precioForm, categoriasCampanaPrecioOptions,
    listarProductosAlmacen, cargarPrecios, onCategoriaCampañaSeleccionada, registrarPrecioCampaña,
    eliminarPrecioCampana, editarPrecioCampana, cancelarEdicionPrecio, filtrarProductos, alSeleccionarProducto
  }
}
