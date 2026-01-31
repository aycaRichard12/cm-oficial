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
  permisoInventarioExterno.value &&
  props.row.Autorización !== 1
)
const canDelete = computed(() =>
  hasDeletePerm.value &&
  props.row.Autorización !== 1
)

// Traer permisos al montar el componente
onMounted(() => {
  verificarPermisoUsuario()
})
</script>
