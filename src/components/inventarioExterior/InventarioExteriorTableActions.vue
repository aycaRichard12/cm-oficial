<template>
  <div class="row justify-center no-wrap items-center">
    <!-- Botón Ver Ubicación -->
    <q-btn
      flat
      round
      dense
      color="info"
      icon="place"
      @click="$emit('viewMap', row)"
      id="btnUbicacion"
    >
      <q-tooltip>Ver Ubicación</q-tooltip>
    </q-btn>

    <!-- Botón Editar -->
    <q-btn
      flat
      round
      dense
      color="primary"
      icon="edit"
      @click="$emit('edit', row)"
      v-if="canEdit"
      id="btnEditar"
    >
      <q-tooltip>Editar</q-tooltip>
    </q-btn>

    <!-- Botón Eliminar -->
    <q-btn
      flat
      round
      dense
      color="negative"
      icon="delete"
      @click="$emit('delete', row)"
      v-if="canDelete"
      id="btnEliminar"
    >
      <q-tooltip>Eliminar</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePermisosUsuario } from 'src/composables/inventarioExterior/usePermisosUsuario'

// Props
const props = defineProps({
  row: Object,
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})
defineEmits(['edit', 'delete', 'viewMap'])

// Usar el composable
const { permisoInventarioExterno, verificarPermisoUsuario } = usePermisosUsuario()

// Computed flags para botones
const hasEditPerm = computed(() => !!props.editar)
const hasDeletePerm = computed(() => !!props.eliminar)

const canEdit = computed(() =>
  hasEditPerm.value &&
  (Number(props.row.Autorización) !== 1 || permisoInventarioExterno.value)
)
const canDelete = computed(() =>
  hasDeletePerm.value &&
  (Number(props.row.Autorización) !== 1 || permisoInventarioExterno.value)
)

// Traer permisos al montar el componente
onMounted(() => {
  verificarPermisoUsuario()
})
</script>
