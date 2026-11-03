<template>
  <BaseFilterableTable
    ref="tableRef"
    :title="$t('ui.creditos-fa59a5')"
    :rows="props.rows"
    :columns="columns"
    row-key="idcredito"
    :array-headers="columns.map((c) => c.name)"
    :sum-columns="[
      'valorcuotas',
      'totalventa',
      'totalcobrado',
      'saldo',
      'totalatrasado',
      'totalanulado',
    ]"
    nombre-columna-totales="moradias"
    :loading="loading"
  >
    <template v-slot:body-cell-estado="scope">
      <q-td :props="scope">
        <q-badge
          v-if="scope.row.estado !== 5 && scope.row.estado !== ''"
          :color="colorEstado[Number(scope.row.estado)]"
        >
          {{ scope.value }}
        </q-badge>
      </q-td>
    </template>
    <template v-slot:body-cell-tipo_cobro="scope">
      <q-td :props="scope">
        <q-badge :color="scope.row.tipo_cobro == 'CF' ? 'green-14' : 'yellow-8'">
          {{ scope.value }}
        </q-badge>
      </q-td>
    </template>

    <!-- Reenvío de otros slots si fuera necesario -->
    <template v-for="slot in Object.keys($slots)" :key="slot" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps || {}" />
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const tableRef = ref(null)

// Exponer el método para obtener datos filtrados (útil para reportes PDF/Excel)
defineExpose({
  obtenerDatosFiltrados: () => tableRef.value?.obtenerDatosFiltrados() || [],
  obtenerColumnasVisibles: () => tableRef.value?.obtenerColumnasVisibles() || [],
})

const colorEstado = {
  1: 'green',
  2: 'blue',
  3: 'orange',
  4: 'red',
  5: '',
}

const columns = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'right', sortable: true },
  {
    name: 'tipo_cobro',
    align: 'center',
    label: i18nT('configGeneral.divisas.table.type'),
    field: 'tipo_cobro',

    dataType: 'text',
  },
  {
    name: 'fechaventa',
    align: 'center',
    label: i18nT('ui.fecha-credito-e22d16'),
    field: 'fechaventa',

    dataType: 'date',
  },
  {
    name: 'numFactura',
    align: 'center',
    label: i18nT('ui.num-factura-a2659f'),
    field: 'numFactura',

    dataType: 'number',
  },

  {
    name: 'razonsocial',
    align: 'left',
    label: i18nT('ui.razon-social-adf906'),
    field: 'razonsocial',
  },
  {
    name: 'sucursal',
    align: 'left',
    label: i18nT('ui.sucursal-07d782'),
    field: 'sucursal',
  },
  {
    name: 'fechalimite',
    align: 'center',
    label: i18nT('ui.fecha-limite-b037db'),
    field: 'fechalimite',

    dataType: 'date',
  },
  {
    name: 'ncuotas',
    align: 'center',
    label: i18nT('ui.cant-cuotas-a40f25'),
    field: 'ncuotas',

    dataType: 'number',
  },
  {
    name: 'cuotasprocesadas',
    align: 'center',
    label: i18nT('ui.cuotas-proc-654e7a'),
    field: 'cuotasprocesadas',
  },
  {
    name: 'estado',
    align: 'center',
    label: i18nT('cotizacion.table.status'),
    field: 'estadoLabel',
  },
  {
    name: 'moradias',
    align: 'right',
    label: i18nT('ui.mora-dias-db5528'),
    field: 'moradias',

    dataType: 'number',
  },
  {
    name: 'valorcuotas',
    align: 'right',
    label: i18nT('ui.valor-cuota-a02fdf'),
    field: 'valorcuotas',

    dataType: 'number',
  },
  {
    name: 'totalventa',
    align: 'right',
    label: i18nT('ui.total-venta-eaaafd'),
    field: 'totalventa',

    dataType: 'number',
  },
  {
    name: 'totalcobrado',
    align: 'right',
    label: i18nT('ui.total-cobrado-c3a2cb'),
    field: 'totalcobrado',

    dataType: 'number',
  },
  {
    name: 'saldo',
    align: 'right',
    label: i18nT('ui.saldo-8b0fcd'),
    field: 'saldo',

    dataType: 'number',
  },
  {
    name: 'totalatrasado',
    align: 'right',
    label: i18nT('ui.total-atrasado-5f639b'),
    field: 'totalatrasado',

    dataType: 'number',
  },
  {
    name: 'totalanulado',
    align: 'right',
    label: i18nT('ui.total-anulado-2a5202'),
    field: 'totalanulado',

    dataType: 'number',
  },
]
</script>
