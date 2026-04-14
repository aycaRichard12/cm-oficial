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
            <th style="width: 60px">N°</th>
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
              >
                <template v-slot:prepend>
                  <q-icon name="edit" color="primary" size="18px" />
                </template>
                <template v-slot:append>
                  <div class="editor-actions">
                    <q-btn
                      flat
                      round
                      dense
                      size="10px"
                      icon="check"
                      color="positive"
                      @click.stop="confirmarEdicion(sub)"
                      class="editor-action-btn"
                    >
                      <q-tooltip>Guardar (Enter)</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      size="10px"
                      icon="close"
                      color="negative"
                      @click.stop="cancelarEdicion(sub)"
                      class="editor-action-btn"
                    >
                      <q-tooltip>Cancelar (Esc)</q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-input>
            </td>

            <td v-if="canDelete" class="text-center">
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                size="sm"
                @click="gestionarEliminacion(sub)"
              >
                <q-tooltip>Eliminar este registro</q-tooltip>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
  <div class="premium-footer">
    <div class="footer-content">
      <div class="footer-info">
        <q-icon name="schedule" size="14px" color="grey-6" class="q-mr-xs" />
        <span class="text-caption text-grey-6">
          Última actualización: {{ new Date().toLocaleString() }}
        </span>
      </div>
      <div class="footer-stats">
        <div class="stat-item">
          <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
          <span class="text-caption">
            {{ modelValue.filter((s) => s.codigo).length }}
            asignados
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const copiaRespaldo = ref('') // Para almacenar el valor original antes de editar
const props = defineProps({
  modelValue: { type: Array, required: true }, // Lista de códigos (productos_detallados)
  parentRow: { type: Object, required: true }, // Fila de la tabla padre para actualizar cantidad
  title: { type: String, default: 'Desglose de Identificadores' },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  apiMode: { type: Boolean, default: true }, // TRUE: API + Local, FALSE: Solo Local
  icon: { type: String, default: 'fingerprint' },
})

const emit = defineEmits(['update:modelValue', 'update-parent'])

const editandoId = ref(null)
const tempSerie = ref('')

const iniciarEdicion = (sub) => {
  if (!props.canEdit) return
  editandoId.value = sub.id
  tempSerie.value = sub.serie
  copiaRespaldo.value = sub.serie
}

const confirmarEdicion = (sub) => {
  if (editandoId.value === null) return
  const nuevoCodigo = { id: sub.id, codigo: tempSerie.value }

  // Si estamos en modo API, actualizamos en el servidor
  if (props.apiMode) {
    sub.serie = tempSerie.value
    actualizarCodigoIndividual(nuevoCodigo)
  } else {
    // Si no, solo actualizamos la referencia local
    sub.serie = tempSerie.value
  }
  editandoId.value = null
}
const cancelarEdicion = (sub) => {
  sub.serie = copiaRespaldo.value // Restauramos el valor
  editandoId.value = null
}

const gestionarEliminacion = (sub) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Deseas eliminar el código ${sub.serie || 'seleccionado'}? Esto reducirá la cantidad del producto principal.`,
    cancel: true,
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true,
  }).onOk(async () => {
    if (props.apiMode) {
      await eliminarSubCodigoAPI(sub)
    } else {
      eliminarLocal(sub)
    }
  })
}

// 1. ELIMINACIÓN LOCAL (Solo tabla)
function eliminarLocal(sub) {
  const nuevaLista = props.modelValue.filter((i) => i.id !== sub.id)

  // 1. Notificamos el cambio de la lista (v-model)
  emit('update:modelValue', nuevaLista)

  // 2. En lugar de props.parentRow.cantidad = ..., emitimos un evento
  emit('update-parent-quantity', nuevaLista.length)

  $q.notify({ type: 'info', message: 'Eliminado de la lista', timeout: 800 })
}

// 2. ELIMINACIÓN API (Base de datos + Tabla)
async function eliminarSubCodigoAPI(sub) {
  try {
    $q.loading.show()
    const response = await api.get(`eliminarProductoUnico/${sub.id}`)

    if (response.data.estado === 'exito') {
      // Reutilizamos la lógica local tras el éxito de la API
      eliminarLocal(sub)
      $q.notify({ type: 'positive', message: 'Eliminado de la base de datos' })
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error de servidor al eliminar' })
    console.error(error)
  } finally {
    $q.loading.hide()
  }
}

async function actualizarCodigoIndividual(subProducto) {
  try {
    const formData = new FormData()
    formData.append('id', subProducto.id)
    formData.append('codigo', subProducto.codigo)
    formData.append('ver', 'actualizarCodigoUnico')

    const response = await api.post('', formData)
    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: 'Código actualizado', timeout: 800 })
    }
  } catch (error) {
    console.error('Error al actualizar sub-código', error)
  }
}
</script>
