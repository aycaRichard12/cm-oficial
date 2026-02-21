import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import { URL_APICM } from 'src/composables/services'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useCampanaCore } from './useCampanaCore'

export function useCategoriasCampana(q, campanas) {
  const { idempresa, idusuario } = useCampanaCore()
  const dialogoCategorias = ref(false)
  const categoriasPrecio = ref([])
  const categoriasCampana = ref([])
  const campanasConCategorias = ref(new Set())

  const categoriaForm = ref({
    ver: 'registrocategoriacampaña',
    idcampaña: '',
    almacen: '',
    idempresa,
    idcategoriaprecio: null,
  })

  // Computeds
  const categoriasPrecioOptions = computed(() => {
    return categoriasPrecio.value.filter((cat) => String(cat.idalmacen) === String(categoriaForm.value.almacen))
  })

  // Métodos
  const listarCategoriasPrecio = async () => {
    try {
      const res = await peticionGET(`${URL_APICM}api/listaCategoriaPrecio/${idempresa}`)
      categoriasPrecio.value = res || []
    } catch { console.error('Error listaCategoriaPrecio') }
  }

  const actualizarCampanasConCategorias = async () => {
    try {
      const promises = campanas.value.map(async (camp) => {
        const res = await peticionGET(`${URL_APICM}api/listacategoriapreciocampaña/${camp.id}`)
        if (res && res.length > 0) campanasConCategorias.value.add(camp.id)
      })
      await Promise.all(promises)
    } catch(e) { console.error('Error actualizarCampanasConCategorias', e) }
  }

  const resetearCategoriaForm = () => {
    categoriaForm.value.idcategoriaprecio = null
  }

  const cargarcategoria = async (idCampana, idAlmacen) => {
    try {
      categoriaForm.value.idcampaña = idCampana
      categoriaForm.value.almacen = idAlmacen

      const [res1, res2] = await Promise.all([
        peticionGET(`${URL_APICM}api/listaCategoriaPrecio/${idempresa}`),
        peticionGET(`${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`)
      ])
      categoriasPrecio.value = res1 || []
      categoriasCampana.value = (res2 || []).map((i, idx) => ({ ...i, numero: idx + 1 }))

      if (res2 && res2.length > 0) campanasConCategorias.value.add(idCampana)
      else campanasConCategorias.value.delete(idCampana)

      dialogoCategorias.value = true
    } catch { console.error('Error cargarcategoria') }
  }

  const registrarCategoria = async () => {
    try {
      const form = objectToFormData(categoriaForm.value)
      form.append('ver', 'registrocategoriacampaña')
      form.append('idusuario', idusuario)
      form.append('idempresa', idempresa)
      const res = await api.post('', form)

      if (res.data.estado === 'exito') {
        q.notify({ type: 'positive', message: res.data.mensaje || 'Éxito' })
        await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
        resetearCategoriaForm()
      } else throw new Error(res.data.mensaje)
    } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al registrar' }) }
  }

  const eliminarCategoriaCampana = async (id) => {
    q.dialog({ title: 'Confirmar', message: '¿Eliminar categoría?', cancel: true })
      .onOk(async () => {
        try {
          const res = await peticionGET(`${URL_APICM}api/eliminarcategoriapreciocampaña/${id}`)
          if (res.estado === 'exito') {
            q.notify({ type: 'positive', message: res.mensaje })
            await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
          } else throw new Error(res.mensaje)
        } catch(e) { q.notify({ type: 'negative', message: e.message || 'Error al eliminar' }) }
      })
  }

  const tieneCategorias = (idCampana) => campanasConCategorias.value.has(idCampana)

  return {
    dialogoCategorias, categoriasCampana, categoriaForm, categoriasPrecioOptions,
    listarCategoriasPrecio, resetearCategoriaForm, cargarcategoria, registrarCategoria, 
    eliminarCategoriaCampana, tieneCategorias, actualizarCampanasConCategorias, campanasConCategorias
  }
}
