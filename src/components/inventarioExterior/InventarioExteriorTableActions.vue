<template>
    <div class="row justify-center q-gutter-sm">
        <q-btn
            col="auto"
            color="info"
            icon="place"
            @click="$emit('viewMap', row)"
            size="sm"
        >
          <q-tooltip>Ver Ubicación</q-tooltip>
        </q-btn>
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
        
        <!-- Disabled state actions (when authorized) -->
         <!-- Note: Logic in original was: 
              if ((editar && row.Autorización !== 1) || (eliminar && row.Autorización !== 1)) -> Show active buttons
              else -> Show disabled buttons
         -->
        <template v-if="!canEdit && !canDelete && (hasEditPerm || hasDeletePerm)">
             <q-btn color="info" icon="edit" class="q-mr-sm" size="sm" disable v-if="hasEditPerm">
             <q-tooltip>Editar</q-tooltip>
             </q-btn>
             <q-btn color="info" icon="delete" size="sm" disable v-if="hasDeletePerm">
             <q-tooltip>Eliminar</q-tooltip>
             </q-btn>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    row: Object,
    editar: [Boolean, Number],
    eliminar: [Boolean, Number]
})

defineEmits(['edit', 'delete', 'viewMap'])

const hasEditPerm = computed(() => !!props.editar)
const hasDeletePerm = computed(() => !!props.eliminar)

const canEdit = computed(() => hasEditPerm.value && props.row.Autorización !== 1)
const canDelete = computed(() => hasDeletePerm.value && props.row.Autorización !== 1)

</script>
