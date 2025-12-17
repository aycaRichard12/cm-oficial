<template>
  <!-- Tabla de clientes -->
  <q-table
    title="Creditos"
    :rows="props.rows"
    :columns="columns"
    row-key="idcredito"
    flat
    bordered
    :loading="loading"
    no-data-label="No hay datos para mostrar"
    class="sticky-header-table"
  >
    <template v-slot:body-cell-estado="props">
      <q-td :props="props" v-if="props.row.estado !== 5">
        <q-badge :color="colorEstado[Number(props.row.estado)]">{{
          keyEstado[Number(props.row.estado)]
        }}</q-badge>
      </q-td>
    </template>
  </q-table>
</template>
<script setup>
// Props desde el componente padre
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
const keyEstado = {
  1: 'Activo',
  2: 'Finalizado',
  3: 'Atrasado',
  4: 'Anulado',
  5: '',
}

const colorEstado = {
  1: 'green',
  2: 'blue',
  3: 'orange',
  4: 'red',
  5: '',
}

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right', sortable: true },
  {
    name: 'fechaventa',
    align: 'center',
    label: 'Fecha Crédito',
    field: 'fechaventa',
    sortable: true,
  },
  {
    name: 'razonsocial',
    align: 'left',
    label: 'Cliente',
    field: 'razonsocial',
    sortable: true,
  },
  {
    name: 'sucursal',
    align: 'left',
    label: 'Sucursal',
    field: 'sucursal',
    sortable: true,
  },
  {
    name: 'fechalimite',
    align: 'center',
    label: 'Fecha Límite',
    field: 'fechalimite',
    sortable: true,
  },
  {
    name: 'ncuotas',
    align: 'center',
    label: 'Catidad Cuotas',
    field: 'ncuotas',
    sortable: true,
  },
  {
    name: 'cuotasprocesadas',
    align: 'center',
    label: 'Cuotas Procesadas',
    field: 'cuotasprocesadas',
    sortable: true,
  },
  {
    name: 'valorcuotas',
    align: 'right',
    label: 'Valor Cuota',
    field: 'valorcuotas',
    sortable: true,
  },
  {
    name: 'totalventa',
    align: 'right',
    label: 'Total Venta',
    field: 'totalventa',
    sortable: true,
  },
  {
    name: 'totalcobrado',
    align: 'right',
    label: 'Total Cobrado',
    field: 'totalcobrado',
    sortable: true,
  },
  {
    name: 'saldo',
    align: 'right',
    label: 'Saldo',
    field: 'saldo',

    sortable: true,
  },
  {
    name: 'totalatrasado',
    align: 'right',
    label: 'Total Atrasado',
    field: 'totalatrasado',
    sortable: true,
  },
  {
    name: 'totalanulado',
    align: 'right',
    label: 'Total Anulado',
    field: 'totalanulado',
    sortable: true,
  },
  {
    name: 'moradias',
    align: 'right',
    label: 'Mora Días',
    field: 'moradias',
    sortable: true,
  },
  {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: 'estado',
    sortable: true,
  },
]

// Emit para comunicar al componente padre

// Filtrar los clientes según los filtros aplicados
</script>

<style scoped></style>
