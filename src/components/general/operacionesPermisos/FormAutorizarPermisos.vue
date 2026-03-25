<template>
  <q-card flat bordered class="q-pa-md">

    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-avatar color="primary" text-color="white" icon="admin_panel_settings" />
      <div class="text-h6 text-weight-medium text-grey-8 q-ml-sm">
        Gestionar Permiso
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="tipoPermiso"
      dense
      inline-label
      class="text-grey-7"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="operacion" label="Operaciones" icon="settings" />
      <q-tab name="graficos" label="Gráficos" icon="insert_chart" />
    </q-tabs>

    <q-separator class="q-my-md" />

    <!-- Form -->
    <q-form @submit="submitForm" class="q-gutter-md q-mb-md">

      <div class="row q-col-gutter-md ">

        <!-- Usuario -->
        <div class="col-12 col-md-6 ">
          <q-select
            v-model="form.usuarioSeleccionado"
            :options="usuarios"
            outlined
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterUsuarios"
            :rules="[(val) => !!val || 'Seleccione un usuario']"
            label="Usuario"
            @update:model-value="alCambiarUsuario"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>
        </div>

        <div v-show="tipoPermiso === 'operacion'" class="col-12 col-md-6">
          <q-select
            v-model="form.menuSeleccionado"
            :options="menuOptions"
            outlined
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterFn"
            :rules="[val => tipoPermiso === 'graficos' || !!val || 'Seleccione una operación']"
            label="Operación"
          >
            <template v-slot:prepend>
              <q-icon name="settings" color="primary" />
            </template>
          </q-select>

          <!-- Alerta de duplicado para operación -->
          <q-banner v-if="estadoOperacionPrevia" dense class="bg-amber-1 text-amber-9 rounded-borders q-mt-sm">
            <template v-slot:avatar>
              <q-icon name="warning" size="xs" />
            </template>
            <span v-if="estadoOperacionPrevia === 'activo'" class="text-caption">Esta operación ya está autorizada.</span>
            <span v-else class="text-caption">Esta operación ya existe pero está desactivada. Actívala en la tabla inferior.</span>
          </q-banner>
        </div>

      </div>

      <!-- Graficos -->
      <div v-show="tipoPermiso === 'graficos'" class="q-mt-sm">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-grey-7">Selecciona los gráficos a habilitar</div>
          <q-spinner-dots v-if="cargandoPermisosActuales" color="primary" size="1em" class="q-ml-sm" />
          <q-badge v-else-if="form.usuarioSeleccionado" color="grey-3" text-color="grey-9" class="q-ml-sm">
            {{ cantidadGraficosAsignados }} activos
          </q-badge>
        </div>

        <q-option-group
          v-model="form.graficosSeleccionados"
          :options="graficosOpciones"
          type="checkbox"
          color="primary"
          inline
        />

        <div
          v-if="tipoPermiso === 'graficos' && form.graficosSeleccionados.length === 0"
          class="text-negative text-caption q-mt-sm"
        >
          Debes seleccionar al menos un gráfico
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Actions -->
      <div class="row justify-between items-center">

        <q-btn
          flat
          icon="refresh"
          label="Limpiar"
          color="grey-7"
          @click="resetForm"
        />

        <q-btn
          :label="form.id ? 'Actualizar' : 'Asignar'"
          type="submit"
          color="primary"
          :loading="loading || cargandoPermisosActuales"
          :icon="form.id ? 'edit' : 'add'"
          unelevated
          :disable="tipoPermiso === 'operacion' && estadoOperacionPrevia"
        />

      </div>

    </q-form>

  </q-card>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const $q = useQuasar()

defineProps(['loading'])
const emit = defineEmits(['on-submit'])

const idempresa = idempresa_md5()
const allUsuarios = ref([])
const usuarios = ref([])
const allMenus = ref([])
const menuOptions = ref([])

// Estado para permisos existentes del usuario seleccionado
const permisosActualesUsuario = ref([])
const cargandoPermisosActuales = ref(false)

// Nuevo estado para controlar Pestañas
const tipoPermiso = ref('operacion')

// Definición de Gráficos (Dashboard)
const graficosOpciones = [
  { label: 'Gráfico Clientes', value: 'db_clientes' },
  { label: 'Gráfico Categorías', value: 'db_categoria' },
  { label: 'Gráfico Preferidos', value: 'db_preferido' },
  { label: 'Gráfico Monetario', value: 'db_monetario' },
  { label: 'Evolución de Mayor Venta', value: 'db_mayor_venta' },
  { label: 'Gráfico Almacén', value: 'db_almacen' },
  { label: 'Vista Todos', value: 'db_todos' },
]

const form = ref({
  id: null,
  codigo: '',
  operacion: '',
  menuSeleccionado: null,
  usuarioSeleccionado: null,
  graficosSeleccionados: []
})

// Computados para validación reactiva y prevención de duplicados
const estadoOperacionPrevia = computed(() => {
  if (tipoPermiso.value !== 'operacion' || !form.value.menuSeleccionado || !form.value.usuarioSeleccionado) return null
  const coincidencia = permisosActualesUsuario.value.find(p => p.codigo === form.value.menuSeleccionado)
  if (!coincidencia) return null
  return Number(coincidencia.estado) === 1 ? 'activo' : 'inactivo'
})

const cantidadGraficosAsignados = computed(() => {
  return permisosActualesUsuario.value.filter(p => p.codigo.startsWith('db_') && Number(p.estado) === 1).length
})

function filterFn(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    menuOptions.value = allMenus.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

function filterUsuarios(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    usuarios.value = allUsuarios.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

onMounted(() => {
  const menus = [
    { titulo: 'Generar Pedidos Provedores', codigo: 'generarpedido' },
    { titulo: 'Registrar Compras', codigo: 'registrarcompra' },
    { titulo: 'Edición de Inventario Externo', codigo: 'inventarioexterno' },
    { titulo: 'Anular Compras de Forma Directa', codigo: 'anularcompradirecta' },
  ]
  const mappedMenus = menus.map((menu) => ({ label: menu.titulo, value: menu.codigo }))
  loadUsuarios()
  allMenus.value = mappedMenus
  menuOptions.value = mappedMenus
})

async function loadUsuarios() {
  try {
    const response = await api.get(`usuariosConfiguracion/${idempresa}`)
    console.log('Respuesta cruda de usuariosConfiguracion:', response.data)
    
    usuarios.value = response.data.map((item) => {
      const mapping = {
        label: item.usuario,
        value: item.idusuario || item.id,
        data: [item.cargo, item.nombre, item.apellido],
      }
      return mapping
    })
    console.log('Primer usuario mapeado:', usuarios.value[0])
    allUsuarios.value = usuarios.value
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los datos' })
  }
}

async function alCambiarUsuario(idUsuario) {
  console.log('--- Cambio de Usuario Detectado ---')
  
  // Buscar el objeto usuario completo para tener el label (nombre de richard50)
  const usuarioObj = allUsuarios.value.find(u => u.value === idUsuario)
  const nombreUsuarioBuscado = usuarioObj ? usuarioObj.label : null
  
  console.log('ID buscado:', idUsuario)
  console.log('Nombre usuario buscado:', nombreUsuarioBuscado)
  
  if (!idUsuario) {
    permisosActualesUsuario.value = []
    form.value.graficosSeleccionados = []
    return
  }
  
  cargandoPermisosActuales.value = true
  try {
    const { data: response } = await api.get(`listarOperaciones/${idempresa}`)
    
    if (response?.data && Array.isArray(response.data)) {
      // Filtrar TODOS los permisos para este usuario (sin importar estado para detección de duplicados en DB)
      const misPermisos = response.data.filter(it => {
        const matchesID = it.idusuario == idUsuario
        const nombreEnRegistro = it.usuario && it.usuario[0] ? it.usuario[0].usuario : ''
        const matchesNombre = nombreUsuarioBuscado && nombreEnRegistro === nombreUsuarioBuscado
        return matchesID || matchesNombre
      })
      
      console.log('Total histórico de permisos para este usuario:', misPermisos)
      permisosActualesUsuario.value = misPermisos
      
      // Solo pre-marcar checkboxes de aquellos que estén REALMENTE ACTIVOS (estado 1)
      const graficosActivos = misPermisos
        .filter(p => Number(p.estado) === 1 && graficosOpciones.some(opt => opt.value === p.codigo))
        .map(p => p.codigo)
      
      console.log('Gráficos ACTIVOS pre-marcados:', graficosActivos)
      form.value.graficosSeleccionados = graficosActivos
    }
  } catch (error) {
    console.error('Error cargando permisos actuales:', error)
  } finally {
    cargandoPermisosActuales.value = false
  }
}

const submitForm = () => {
  const usuario = allUsuarios.value.find((m) => m.value === form.value.usuarioSeleccionado)
  
  if (!usuario) {
    $q.notify({ type: 'warning', message: 'Por favor, selecciona un usuario' })
    return
  }

  if (tipoPermiso.value === 'operacion') {
    if (operacionYaAsignada.value) {
      $q.notify({ type: 'negative', message: 'Este usuario ya tiene asignado este permiso.' })
      return
    }

    const selected = allMenus.value.find((m) => m.value === form.value.menuSeleccionado)
    if (selected) {
      form.value.codigo = selected.value
      form.value.operacion = selected.label
      form.value.idusuario = usuario.value
      emit('on-submit', { ...form.value })
      // No reseteamos usuario para permitir seguir asignando a la misma persona
      form.value.menuSeleccionado = null
    } else {
      $q.notify({ type: 'warning', message: 'Selecciona una operación válida' })
    }
  } else {
    // Es el modo Gráficos Estadísticos
    if (form.value.graficosSeleccionados.length === 0) {
      $q.notify({ type: 'warning', message: 'Selecciona al menos un gráfico estadístico' })
      return
    }

    // Filtrar solo los gráficos que NO tiene ya asignados
    const graficosNuevos = form.value.graficosSeleccionados.filter(codigo => 
      !permisosActualesUsuario.value.some(p => p.codigo === codigo)
    )

    if (graficosNuevos.length === 0) {
      $q.notify({ type: 'info', message: 'Todos los gráficos seleccionados ya estaban asignados anteriormente.' })
      return
    }
    
    // Crear un array de objetos para emisión múltiple
    const multiPayload = graficosNuevos.map(codigoDB => {
      const graficoReferencia = graficosOpciones.find(g => g.value === codigoDB)
      return {
        id: null,
        codigo: codigoDB,
        operacion: graficoReferencia.label,
        idusuario: usuario.value
      }
    })

    emit('on-submit', multiPayload)
    // Actualizar localmente después de emitir
    setTimeout(() => alCambiarUsuario(usuario.value), 500)
    $q.notify({ type: 'positive', message: `Asignando ${graficosNuevos.length} nuevo(s) gráfico(s)...` })
  }
}

const resetForm = () => {
  form.value = { id: null, codigo: '', operacion: '', menuSeleccionado: null, usuarioSeleccionado: null, graficosSeleccionados: [] }
  permisosActualesUsuario.value = []
}
</script>
