<template>
  <div class="detail-panel q-pa-none rounded-borders overflow-hidden">
    <div class="panel-header row items-center q-px-lg q-py-md">
      <div class="row items-center">
        <q-avatar size="32px" class="bg-primary" text-color="white">
          <q-icon :name="icon" size="20px" />
        </q-avatar>
        <div>
          <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
          <div class="text-caption text-grey-7">Gestión de productos devueltos</div>
        </div>
      </div>
      <q-space />
      <q-badge outline color="primary" :label="`${modelValue.length} registros`" />
    </div>

    <div class="q-px-lg q-pb-lg q-pt-sm">
      <q-markup-table flat bordered separator="cell" class="modern-table">
        <thead>
          <tr class="bg-grey-2">
            <th style="width: 50px">N°</th>
            <th class="text-left">Código de Identificación</th>
            <th class="text-center">Estado</th>
            <th class="text-center">¿Es Merma?</th>
            <th v-if="canDelete" style="width: 80px" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sub, index) in modelValue" :key="sub.id_devolucion_producto_unico">
            <td class="text-center">{{ String(index + 1).padStart(2, '0') }}</td>

            <td class="text-left">
              <q-icon name="fingerprint" color="grey-4" size="18px" class="q-mr-sm" />
              <span class="text-weight-medium">{{ sub.serie }}</span>
            </td>

            <td class="text-center">
              <q-badge :color="sub.estado === 'Vendido' ? 'orange' : 'blue'" label>
                {{ sub.estado }}
              </q-badge>
            </td>

            <td class="text-center">
              <q-checkbox
                v-model="sub.es_merma"
                :true-value="1"
                :false-value="0"
                color="negative"
                @update:model-value="(val) => toggleMerma(sub, val)"
              >
                <q-tooltip>Marcar como pérdida/dañado</q-tooltip>
              </q-checkbox>
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
                <q-tooltip>Eliminar de la devolución</q-tooltip>
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
        <q-icon name="info" size="14px" color="grey-6" class="q-mr-xs" />
        <span class="text-caption text-grey-6">
          Los productos marcados como merma no retornarán al stock disponible.
        </span>
      </div>
      <div class="footer-stats">
        <div class="stat-item">
          <q-icon name="warning" size="14px" color="negative" class="q-mr-xs" />
          <span class="text-caption">
            {{ modelValue.filter((s) => s.es_merma === 1).length }} Mermas
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Array, required: true },
  parentRow: { type: Object, required: true },
  title: { type: String, default: 'Desglose de Identificadores' },
  canDelete: { type: Boolean, default: true },
  icon: { type: String, default: 'assignment_return' },
})

const emit = defineEmits(['update:modelValue', 'update-parent-quantity'])

/**
 * ACTUALIZAR MERMA EN API
 * @param {Object} sub - El objeto del producto único
 * @param {Number} valor - 1 o 0
 */
async function toggleMerma(sub, valor) {
  try {
    const response = await api.get(`actulizarEsmerma/${sub.id_devolucion_producto_unico}`)
    console.log('Respuesta de actualización de merma:', response.data)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: valor === 1 ? 'warning' : 'positive',
        message: valor === 1 ? 'Producto marcado como merma' : 'Producto restaurado',
        timeout: 1000,
      })
      emit('update-parent-quantity', props.modelValue.length)
    } else {
      // Si falla en servidor, revertimos el cambio localmente
      sub.es_merma = valor === 1 ? 0 : 1
      $q.notify({ type: 'negative', message: 'No se pudo actualizar el estado' })
    }
  } catch (error) {
    sub.es_merma = valor === 1 ? 0 : 1
    console.error('Error al cambiar merma', error)
  }
}

/**
 * GESTIONAR ELIMINACIÓN
 */
const gestionarEliminacion = (sub) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Deseas quitar el código ${sub.serie} de esta devolución?`,
    cancel: true,
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true,
  }).onOk(async () => {
    await eliminarSubCodigoAPI(sub)
  })
}

async function eliminarSubCodigoAPI(sub) {
  try {
    $q.loading.show()
    // Usamos el ID específico de la relación de devolución para eliminar
    const response = await api.get(
      `eliminarDevolucioneProductoUnico/${sub.id_devolucion_producto_unico}`,
    )
    //console.log('Respuesta al eliminar sub-código:', response.data)

    if (response.data.estado === 'success') {
      emit('update-parent-quantity', props.modelValue.length)

      $q.notify({ type: 'positive', message: 'Registro eliminado correctamente' })
    }
  } catch (error) {
    console.error('Error al eliminar el registro', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar el registro' })
  } finally {
    $q.loading.hide()
  }
}
</script>
