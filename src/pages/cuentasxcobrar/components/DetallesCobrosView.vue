<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <q-btn label="Volver" icon="arrow_back" color="primary" flat @click="$emit('back')" />
      </div>
      <div class="col text-center">
        <div class="text-h6 text-weight-bold text-primary">Detalle de Cobros</div>
      </div>
      <div class="col"></div>
    </div>

    <q-table
      id="tabladetallescobro"
      :rows="rows"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 20 }"
      class="bg-white rounded-borders"
    >
      <template v-slot:body-cell-comprobante="props">
        <q-td :props="props">
          <q-btn v-if="props.value" flat round dense color="primary" icon="visibility" @click="$emit('ver-comprobante', props.value)">
            <q-tooltip>Ver comprobante</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <div class="row q-mt-md justify-end">
      <div class="col-12 col-md-4">
        <q-markup-table flat bordered class="rounded-borders">
          <tbody class="text-weight-medium">
            <tr>
              <td class="text-grey-7">Total Venta</td>
              <td class="text-right text-subtitle2">{{ formatoMoneda(detalleSeleccionado.totalVenta) }} {{ divisa }}</td>
            </tr>
            <tr class="bg-green-1">
              <td class="text-positive text-weight-bold">Total Cobrado</td>
              <td class="text-right text-subtitle2 text-positive text-weight-bold">{{ formatoMoneda(totalCobrado) }} {{ divisa }}</td>
            </tr>
            <tr class="bg-orange-1">
              <td class="text-deep-orange text-weight-bold">Saldo Actual</td>
              <td class="text-right text-subtitle2 text-deep-orange text-weight-bold">{{ formatoMoneda(detalleSeleccionado.saldo) }} {{ divisa }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { decimas, redondear } from 'src/composables/FuncionesG'

const props = defineProps({
  rows: Array,
  totalCobrado: [Number, String],
  divisa: String,
  detalleSeleccionado: Object,
  formatoMoneda: Function
})

const emit = defineEmits(['back', 'ver-comprobante'])

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecha', label: 'Fecha de cobro', field: 'fecha', align: 'center' },
  {
    name: 'cuotas',
    label: 'N° cobros',
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
  {
    name: 'monto',
    label: 'Total cobro',
    field: 'monto',
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val))),
  },
]
</script>
