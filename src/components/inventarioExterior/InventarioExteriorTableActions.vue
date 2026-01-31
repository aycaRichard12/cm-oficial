<template>
  <div class="row justify-center q-gutter-sm">
    <!-- Botón Ver Ubicación -->
    <q-btn
      col="auto"
      color="info"
      icon="place"
      @click="$emit('viewMap', row)"
      size="sm"
    >
      <q-tooltip>Ver Ubicación</q-tooltip>
    </q-btn>

    <!-- Botón Editar: solo si tiene permiso y row permite editar -->
    <q-btn
      col="auto"
      color="primary"
      icon="edit"
      @click="$emit('edit', row)"
      size="sm"
      v-if="canEdit"
    >
      <q-tooltip>Editar</q-tooltip>
    </q-btn>

    <!-- Botón Eliminar: solo si tiene permiso y row permite eliminar -->
    <q-btn
      col="auto"
      color="negative"
      icon="delete"
      @click="$emit('delete', row)"
      size="sm"
      v-if="canDelete"
    >
      <q-tooltip>Eliminar</q-tooltip>
    </q-btn>

    <!-- Botones deshabilitados si tiene permiso pero row bloquea acción -->
    <template v-if="!canEdit && !canDelete && (hasEditPerm || hasDeletePerm)">
      <q-btn
        color="info"
        icon="edit"
        class="q-mr-sm"
        size="sm"
        disable
        v-if="hasEditPerm"
      >
        <q-tooltip>Editar</q-tooltip>
      </q-btn>
      <q-btn
        color="negative"
        icon="delete"
        size="sm"
        disable
        v-if="hasDeletePerm"
      >
        <q-tooltip>Eliminar</q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

// Props
const props = defineProps({
  row: Object,
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})
defineEmits(['edit', 'delete', 'viewMap'])

// Empresa y usuario actual
const IDMD5 = idempresa_md5()
const idUsuarioMD5 = idusuario_md5()

// Flags de permisos
const permisos = ref([]) // guardamos todas las operaciones del usuario
const permisoInventarioExterno = ref(false)

// Computed flags para botones
const hasEditPerm = computed(() => !!props.editar)
const hasDeletePerm = computed(() => !!props.eliminar)

const canEdit = computed(() =>
  hasEditPerm.value &&
  permisoInventarioExterno.value &&
  props.row.Autorización !== 1
)
const canDelete = computed(() =>
  hasDeletePerm.value &&
  props.row.Autorización !== 1
)

// Función para traer permisos desde la API
async function verificarPermisoUsuario() {
  try {
    const { data: response } = await api.get(`listarOperaciones/${IDMD5}`)

    if (!response?.data || !Array.isArray(response.data)) {
      console.error('Respuesta inválida de permisos')
      return
    }

    // Guardamos todas las operaciones del usuario
    permisos.value = response.data.filter(
      item => item.idusuario === idUsuarioMD5 && item.estado === 1
    )

    // Flag para inventario externo
    permisoInventarioExterno.value = permisos.value.some(
      item => item.codigo === 'inventarioexterno'
    )

    console.log('Permisos cargados:', permisos.value)
    console.log('Permiso inventario externo:', permisoInventarioExterno.value)

  } catch (error) {
    console.error('Error al verificar permisos del usuario:', error)
    permisoInventarioExterno.value = false
  }
}

// Traer permisos al montar el componente
onMounted(() => {
  verificarPermisoUsuario()
})
</script>
