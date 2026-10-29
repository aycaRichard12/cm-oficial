<template>
  <q-table
    :title="$t('ui.operaciones-registradas-4f84ef')"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :loading="loading"
    flat
    bordered
  >
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" class="q-gutter-xs">
        <q-btn
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
          @click="$emit('toggle-status', props.row)"
        >
          <q-tooltip>{{ $t('ui.autorizar-operacion-ab39b5') }}</q-tooltip>
        </q-btn>
        <q-btn
          icon="delete"
          color="negative"
          dense
          flat
          round
          @click="$emit('on-delete', props.row.id_operacion)"
        >
          <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="$t('ui.autorizado-b4fb49')" outline />
        <q-badge color="red" v-else :label="$t('ui.no-autorizado-988c4e')" outline />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
defineProps(['rows', 'loading'])
defineEmits(['on-delete'])

const columns = [
  { name: 'id', align: 'left', label: i18nT('cotizacion.table.number'), field: 'id', sortable: true },
  { name: 'usuario', align: 'left', label: i18nT('auth.user'), field: 'usuario', sortable: true },
  { name: 'codigo', align: 'left', label: i18nT('ui.codigo-c35510'), field: 'codigo', sortable: true },
  { name: 'operacion', align: 'left', label: i18nT('ui.operacion-3fe7bc'), field: 'operacion' },
  { name: 'estado', align: 'left', label: i18nT('cotizacion.table.status'), field: 'estado' },
  { name: 'acciones', align: 'center', label: i18nT('common.actions'), field: 'acciones' },
]
</script>
