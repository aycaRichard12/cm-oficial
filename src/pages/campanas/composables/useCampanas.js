import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import { URL_APICM } from 'src/composables/services'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useCampanaCore } from './useCampanaCore'

export function useCampanas(q) {
  const { idempresa, idusuario, almacenes, obtenerFechaActual } = useCampanaCore()
  const campanas = ref([])
  const idalmacenfiltro = ref(null)
  const busqueda = ref('')
  const formularioActivo = ref(false)

  const formData = ref({
    id: null,
    ver: 'registrarcampana',
    idusuario,
    idalmacen: null,
    fechai: obtenerFechaActual(),
    fechaf: obtenerFechaActual(),
    campana: '',
    porcentaje: '',
    estadoActivo: true,
  })

  // Computeds
  const campanasFiltradas = computed(() => {
    let filtered = campanas.value
    if (idalmacenfiltro.value) {
      const target = idalmacenfiltro.value.idalmacen || idalmacenfiltro.value
      filtered = filtered.filter((c) => String(c.idalmacen) === String(target))
    }
    return filtered.map((item, i) => ({ ...item, numero: i + 1 }))
  })

  // Métodos
  const listarAlmacenes = async () => {
    try {
      const res = await api.get(`listaResponsableAlmacen/${idempresa}`)
      if (res.data[0] === 'error') throw new Error(res.data.error)
      almacenes.value = res.data.filter((u) => u.idusuario == idusuario)
      if(almacenes.value.length) idalmacenfiltro.value = almacenes.value[0]
    } catch {
      q.notify({ type: 'negative', message: 'Error al cargar almacenes' })
    }
  }

  const listarCampanas = async () => {
    try {
      const res = await api.get(`campanas/${idempresa}`)
      if (res.data[0] === 'error') throw new Error(res.data.error)
      campanas.value = res.data || []
    } catch {
      q.notify({ type: 'negative', message: 'Error al cargar campañas' })
    }
  }

  const resetearFormulario = () => {
    formData.value = {
      id: null, ver: 'registrarcampana', idusuario, idalmacen: null,
      fechai: obtenerFechaActual(), fechaf: obtenerFechaActual(),
      campana: '', porcentaje: '', estadoActivo: true
    }
  }

  const registrarCampana = async () => {
    try {
      const form = objectToFormData(formData.value)
      form.append('ver', formData.value.id ? 'editarcampaña' : 'registrarcampana')
      form.append('idusuario', idusuario)
      form.append('idempresa', idempresa)
      form.append('estado', formData.value.estadoActivo ? '1' : '2')
      const res = await api.post('', form)
      if (res.data.estado === 'exito') {
        q.notify({ type: 'positive', message: res.data.mensaje || 'Éxito' })
        await listarCampanas()
        formularioActivo.value = false
        resetearFormulario()
      } else throw new Error(res.data.mensaje)
    } catch (e) {
      q.notify({ type: 'negative', message: e.message || 'Error al procesar' })
    }
  }

  const cargarEditarCampana = async (campana) => {
    try {
      const res = await peticionGET(`${URL_APICM}api/verificarExistenciacampana/${campana.id}`)
      if (res.estado === 'exito') {
        Object.assign(formData.value, {
          id: res.datos.id, ver: 'editarcampaña', idalmacen: res.datos.idalmacen,
          fechai: res.datos.fechai, fechaf: res.datos.fechaf,
          campana: res.datos.nombre, porcentaje: res.datos.porcentaje,
          estadoActivo: Number(res.datos.estado) === 1,
        })
        formularioActivo.value = true
      } else throw new Error(res.mensaje)
    } catch (e) {
      q.notify({ type: 'negative', message: e.message || 'Error al cargar' })
    }
  }

  const eliminar = async (id) => {
    q.dialog({ title: 'Confirmar', message: '¿Eliminar campaña?', cancel: true })
      .onOk(async () => {
        try {
          const res = await peticionGET(`${URL_APICM}api/eliminarcampana/${id}`)
          if (res.estado === 'exito') {
            q.notify({ type: 'positive', message: res.mensaje })
            await listarCampanas()
          } else throw new Error(res.mensaje)
        } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al eliminar' }) }
      })
  }

  const cambiarEstado = async (id, estado) => {
    try {
      const res = await peticionGET(`${URL_APICM}api/actualizarEstadocampana/${id}/${estado}`)
      if (res.estado === 'exito') {
        q.notify({ type: 'positive', message: res.mensaje })
        await listarCampanas()
      } else throw new Error(res.mensaje)
    } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al cambiar estado' }) }
  }

  return {
    campanas, idalmacenfiltro, busqueda, formularioActivo, formData, campanasFiltradas,
    listarAlmacenes, listarCampanas, resetearFormulario, registrarCampana, cargarEditarCampana,
    eliminar, cambiarEstado, almacenes
  }
}
