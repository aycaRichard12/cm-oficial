import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'

export function useAutorizarPermisos(emit) {
  const $q = useQuasar()
  const idempresa = idempresa_md5()

  // State
  const allUsuarios = ref([])
  const usuarios = ref([])
  const allMenus = ref([])
  const menuOptions = ref([])
  const permisosActualesUsuario = ref([])
  const cargandoPermisosActuales = ref(false)
  const loading = ref(false)
  const tipoPermiso = ref('operacion')

  const form = ref({
    id: null,
    codigo: '',
    operacion: '',
    menuSeleccionado: null,
    usuarioSeleccionado: null,
    graficosSeleccionados: []
  })

  // Configuración estática (SRP: Definida fuera o inyectada)
  const graficosOpciones = [
    { label: 'Gráfico Clientes', value: 'db_clientes' },
    { label: 'Gráfico Categorías', value: 'db_categoria' },
    { label: 'Gráfico Preferidos', value: 'db_preferido' },
    { label: 'Gráfico Monetario', value: 'db_monetario' },
    // { label: 'Evolución de Mayor Venta', value: 'db_mayor_venta' },
    { label: 'Gráfico Almacén', value: 'db_almacen' },
    { label: 'Vista Todos', value: 'db_todos' },
  ]

  const menusReferencia = [
    { titulo: 'Generar Pedidos Provedores', codigo: 'generarpedido' },
    { titulo: 'Registrar Compras', codigo: 'registrarcompra' },
    { titulo: 'Edición de Inventario Externo', codigo: 'inventarioexterno' },
    { titulo: 'Anular Compras de Forma Directa', codigo: 'anularcompradirecta' },
  ]

  // Computados
  const estadoOperacionPrevia = computed(() => {
    if (tipoPermiso.value !== 'operacion' || !form.value.menuSeleccionado || !form.value.usuarioSeleccionado) return null
    const coincidencia = permisosActualesUsuario.value.find(p => p.codigo === form.value.menuSeleccionado)
    if (!coincidencia) return null
    return Number(coincidencia.estado) === 1 ? 'activo' : 'inactivo'
  })

  const cantidadGraficosAsignados = computed(() => {
    return permisosActualesUsuario.value.filter(p => p.codigo.startsWith('db_') && Number(p.estado) === 1).length
  })

  // Funciones de Negocio
  async function loadUsuarios() {
    try {
      const response = await api.get(`usuariosConfiguracion/${idempresa}`)
      usuarios.value = response.data.map((item) => ({
        label: item.usuario,
        value: item.idusuario || item.id,
        data: [item.cargo, item.nombre, item.apellido],
      }))
      allUsuarios.value = usuarios.value
    } catch {
      $q.notify({ type: 'negative', message: 'Error cargando usuarios' })
    }
  }

  async function alCambiarUsuario(idUsuario) {
    if (!idUsuario) {
      permisosActualesUsuario.value = []
      form.value.graficosSeleccionados = []
      return
    }
    
    cargandoPermisosActuales.value = true
    try {
      const { data: response } = await api.get(`listarOperaciones/${idempresa}`)
      if (response?.data && Array.isArray(response.data)) {
        const usuarioObj = allUsuarios.value.find(u => u.value === idUsuario)
        const nombreBuscado = usuarioObj?.label
        
        const misPermisos = response.data.filter(it => {
          const matchesID = it.idusuario == idUsuario
          const nombreEnRegistro = it.usuario?.[0]?.usuario || ''
          return matchesID || (nombreBuscado && nombreEnRegistro === nombreBuscado)
        })
        
        permisosActualesUsuario.value = misPermisos
        form.value.graficosSeleccionados = misPermisos
          .filter(p => Number(p.estado) === 1 && graficosOpciones.some(opt => opt.value === p.codigo))
          .map(p => p.codigo)
      }
    } catch (error) {
      console.error(error)
    } finally {
      cargandoPermisosActuales.value = false
    }
  }

  function submitForm() {
    const usuario = allUsuarios.value.find((m) => m.value === form.value.usuarioSeleccionado)
    if (!usuario) return $q.notify({ type: 'warning', message: 'Selecciona un usuario' })

    if (tipoPermiso.value === 'operacion') {
      procesarEnvioOperacion(usuario)
    } else {
      procesarEnvioGraficos(usuario)
    }
  }

  function procesarEnvioOperacion(usuario) {
    if (estadoOperacionPrevia.value) {
      return $q.notify({ type: 'negative', message: 'Permiso ya existente.' })
    }

    const selected = allMenus.value.find((m) => m.value === form.value.menuSeleccionado)
    if (selected) {
      emit('on-submit', { 
        ...form.value, 
        codigo: selected.value, 
        operacion: selected.label, 
        idusuario: usuario.value 
      })
      form.value.menuSeleccionado = null
    }
  }

  function procesarEnvioGraficos(usuario) {
    const graficosNuevos = form.value.graficosSeleccionados.filter(codigo => 
      !permisosActualesUsuario.value.some(p => p.codigo === codigo)
    )

    if (graficosNuevos.length === 0) {
      return $q.notify({ type: 'info', message: 'Nada nuevo que asignar.' })
    }
    
    const payload = graficosNuevos.map(codigo => ({
      id: null,
      codigo,
      operacion: graficosOpciones.find(g => g.value === codigo).label,
      idusuario: usuario.value
    }))

    emit('on-submit', payload)
    setTimeout(() => alCambiarUsuario(usuario.value), 500)
    $q.notify({ type: 'positive', message: `Asignando ${graficosNuevos.length} ítems...` })
  }

  function resetForm() {
    form.value = { id: null, codigo: '', operacion: '', menuSeleccionado: null, usuarioSeleccionado: null, graficosSeleccionados: [] }
    permisosActualesUsuario.value = []
  }

  function filterUsuarios(val, update) {
    update(() => {
      const needle = val.toLowerCase()
      usuarios.value = allUsuarios.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
    })
  }

  function filterMenus(val, update) {
    update(() => {
      const needle = val.toLowerCase()
      menuOptions.value = allMenus.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
    })
  }

  return {
    form,
    tipoPermiso,
    usuarios,
    menuOptions,
    graficosOpciones,
    menusReferencia,
    loading,
    cargandoPermisosActuales,
    estadoOperacionPrevia,
    cantidadGraficosAsignados,
    loadUsuarios,
    alCambiarUsuario,
    submitForm,
    resetForm,
    filterUsuarios,
    filterMenus,
    allMenus
  }
}
