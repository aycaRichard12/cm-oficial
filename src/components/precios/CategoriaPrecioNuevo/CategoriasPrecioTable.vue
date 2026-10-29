<template>
  <q-table
    :title="$t('ui.lista-de-categorias-76d6f9')"
    :rows="categorias"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :rows-per-page-options="[10, 25, 50, 100]"
    :no-data-label="$t('ui.no-se-encontraron-categorias-de-precios-77018a')"
    v-model:pagination="pagination"
  >
    <template v-slot:body-cell-indice="props">
      <q-td :props="props">
        {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
      </q-td>
    </template>
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge :color="props.row.estado === 1 ? 'green' : 'red'">
          {{ props.row.estado === 1 ? $t('common.active') : $t('common.inactive') }}
        </q-badge>
      </q-td>
    </template>

    <template v-slot:body-cell-acciones="props">
      <q-td :props="props">
        <q-btn
          icon="edit"
          flat
          round
          dense
          color="primary"
          @click="$emit('editar', props.row)"
          :title="$t('common.edit')"
        />
        <q-btn
          :icon="props.row.estado === 1 ? 'toggle_off' : 'toggle_on'"
          flat
          round
          dense
          :color="props.row.estado === 1 ? 'red' : 'green'"
          @click="$emit('cambiar-estado', props.row)"
          :title="props.row.estado === 1 ? $t('configProducto.configuracionProductoUnico.tooltipDesactivar') : $t('configProducto.configuracionProductoUnico.tooltipActivar')"
        />
        <q-btn
          icon="delete"
          flat
          round
          dense
          color="negative"
          @click="$emit('eliminar', props.row)"
          :title="$t('common.delete')"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { defineProps, defineEmits } from 'vue'
import { ref } from 'vue'
// --- Definición de Props ---
defineProps({
  categorias: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  // ... otras opciones
})
// --- Definición de Emits ---
defineEmits(['editar', 'eliminar', 'cambiar-estado'])

// --- Configuración de QTable ---
const columns = [
  {
    name: 'indice',
    label: i18nT('cotizacion.table.number'),
    field: 'indice',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre_categoria',
    label: i18nT('configGeneral.tipoAlmacen.form.name'),
    field: 'nombre_categoria',
    align: 'left',
    sortable: true,
  },
  {
    name: 'porcentaje',
    label: i18nT('ui.porcentaje-452cef'),
    field: 'porcentaje',
    align: 'right',
    sortable: true,
  },
  {
    name: 'estado',
    label: i18nT('cotizacion.table.status'),
    field: 'estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: i18nT('common.actions'),
    field: 'acciones',
    align: 'center',
  },
]
</script>
