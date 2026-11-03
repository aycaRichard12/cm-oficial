<template>
  <q-card flat class="my-card">
    <q-table
      :title="$t('ui.almacenes-asignados-a4a0b9')"
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      id="tablaAlmacenesAsignados"
    >
      <template v-slot:body-cell-opciones="props">
        <q-td align="center">
          <q-btn
            dense
            icon="delete"
            color="negative"
            @click="eliminar(props.row.id)"
            :title="$t('common.delete')"
            flat
            id="eliminarAlmacen"
          />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['eliminar'])

const columns = [
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha', align: 'center' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
]

function eliminar(id) {
  emit('eliminar', id)
}
</script>
