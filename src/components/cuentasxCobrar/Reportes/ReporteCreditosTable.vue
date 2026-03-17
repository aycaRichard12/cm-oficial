<template>
  <BaseFilterableTable
    ref="tableRef"
    title="Créditos"
    :rows="props.rows"
    :columns="columns"
    row-key="idcredito"
    :array-headers="columns.map(c => c.name)"
    :sum-columns="['valorcuotas', 'totalventa', 'totalcobrado', 'saldo', 'totalatrasado', 'totalanulado']"
    nombre-columna-totales="moradias"
    :loading="loading"
  >
    <template v-slot:body-cell-estado="scope">
      <q-td :props="scope">
        <q-badge v-if="scope.row.estado !== 5 && scope.row.estado !== ''" :color="colorEstado[Number(scope.row.estado)]">
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
  { name: 'numero', label: 'N°', field: 'numero', align: 'right', sortable: true },
  {
    name: 'fechaventa',
    align: 'center',
    label: 'Fecha Crédito',
    field: 'fechaventa',
    
    dataType: 'date',
  },
  {
    name: 'razonsocial',
    align: 'left',
    label: 'Cliente',
    field: 'razonsocial',
    
  },
  {
    name: 'sucursal',
    align: 'left',
    label: 'Sucursal',
    field: 'sucursal',
    
  },
  {
    name: 'fechalimite',
    align: 'center',
    label: 'Fecha Límite',
    field: 'fechalimite',
    
    dataType: 'date',
  },
  {
    name: 'ncuotas',
    align: 'center',
    label: 'Cant. Cuotas',
    field: 'ncuotas',
    
    dataType: 'number',
  },
  {
    name: 'cuotasprocesadas',
    align: 'center',
    label: 'Cuotas Proc.',
    field: 'cuotasprocesadas',
    
  },
   {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: 'estadoLabel',
    
  },
   {
    name: 'moradias',
    align: 'right',
    label: 'Mora Días',
    field: 'moradias',
    
    dataType: 'number',
  },
  {
    name: 'valorcuotas',
    align: 'right',
    label: 'Valor Cuota',
    field: 'valorcuotas',
    
    dataType: 'number',
  },
  {
    name: 'totalventa',
    align: 'right',
    label: 'Total Venta',
    field: 'totalventa',
    
    dataType: 'number',
  },
  {
    name: 'totalcobrado',
    align: 'right',
    label: 'Total Cobrado',
    field: 'totalcobrado',
    
    dataType: 'number',
  },
  {
    name: 'saldo',
    align: 'right',
    label: 'Saldo',
    field: 'saldo',
    
    dataType: 'number',
  },
  {
    name: 'totalatrasado',
    align: 'right',
    label: 'Total Atrasado',
    field: 'totalatrasado',
    
    dataType: 'number',
  },
  {
    name: 'totalanulado',
    align: 'right',
    label: 'Total Anulado',
    field: 'totalanulado',
    
    dataType: 'number',
  },
 
 
]
</script>



