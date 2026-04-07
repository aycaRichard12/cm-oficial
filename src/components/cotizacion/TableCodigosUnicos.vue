<template>
  <div class="detail-panel q-pa-none rounded-borders overflow-hidden">
    <div class="panel-header row items-center q-px-lg q-py-md">
      <div class="row items-center">
        <q-avatar size="32px" :class="canEdit ? 'bg-primary' : 'bg-grey-7'" text-color="white">
          <q-icon :name="canEdit ? icon : 'visibility'" size="20px" />
        </q-avatar>
        <div>
          <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
          <div class="text-caption text-grey-7">
            {{ canEdit ? 'Modo Edición Habilitado' : 'Modo Lectura' }}
          </div>
        </div>
      </div>
      <q-space />
      <q-badge
        outline
        :color="canEdit ? 'primary' : 'grey-7'"
        :label="`${modelValue.length} registros`"
      />
    </div>

    <div class="q-px-lg q-pb-lg q-pt-sm">
      <q-markup-table flat bordered separator="cell" class="modern-table">
        <thead>
          <tr class="bg-grey-2">
            <th style="width: 60px">#</th>
            <th>Código de Identificación</th>
            <th v-if="canDelete" style="width: 80px text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sub, index) in modelValue" :key="sub.id">
            <td>{{ String(index + 1).padStart(2, '0') }}</td>

            <td class="text-left">
              <div
                v-if="editandoId !== sub.id"
                :class="canEdit ? 'cursor-pointer' : ''"
                @dblclick="iniciarEdicion(sub)"
              >
                <q-icon
                  :name="sub.serie ? 'check_circle' : 'info'"
                  :color="sub.serie ? 'positive' : 'grey-4'"
                  size="18px"
                  class="q-mr-sm"
                />
                <span :class="sub.serie ? '' : 'text-grey-6 text-italic'">
                  {{ sub.serie || 'Sin código asignado' }}
                </span>

                <q-tooltip v-if="canEdit">Doble clic para editar</q-tooltip>
              </div>

              <q-input
                v-else-if="canEdit"
                v-model="tempSerie"
                dense
                outlined
                autofocus
                @keyup.enter="confirmarEdicion(sub)"
                @blur="confirmarEdicion(sub)"
              />
            </td>

            <td v-if="canDelete" class="text-center">
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                size="sm"
                @click="eliminarRegistro(sub)"
              >
                <q-tooltip>Eliminar este registro</q-tooltip>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  title: { type: String, default: 'Desglose de Identificadores' },
  // --- NUEVOS PROPS DE CONTROL ---
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  // -------------------------------
  icon: { type: String, default: 'fingerprint' },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const editandoId = ref(null)
const tempSerie = ref('')

const iniciarEdicion = (sub) => {
  // Solo permitimos iniciar si tiene el prop canEdit en true
  if (!props.canEdit) return
  editandoId.value = sub.id
  tempSerie.value = sub.serie
}

const confirmarEdicion = (sub) => {
  if (editandoId.value === null) return
  emit('save', { id: sub.id, nuevaSerie: tempSerie.value })
  editandoId.value = null
}

const eliminarRegistro = (sub) => {
  emit('delete', sub)
}
</script>
