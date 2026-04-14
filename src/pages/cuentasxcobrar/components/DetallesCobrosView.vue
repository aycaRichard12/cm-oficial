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
          <q-btn 
            v-if="props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro" 
            flat 
            round 
            dense 
            color="primary" 
            :icon="esArchivoPDF(props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro) ? 'picture_as_pdf' : 'photo'" 
            @click="$emit('ver-comprobante', props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro)"
          >
            <q-tooltip>Ver {{ esArchivoPDF(props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro) ? 'PDF' : 'Imagen' }}</q-tooltip>
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
import { decimas, redondear, cambiarFormatoFecha } from 'src/composables/FuncionesG'

defineProps({
  rows: Array,
  totalCobrado: [Number, String],
  divisa: String,
  detalleSeleccionado: Object,
  formatoMoneda: Function
})

defineEmits(['back', 'ver-comprobante'])

const esArchivoPDF = (url) => {
  if (!url) return false
  return String(url).toLowerCase().split('?')[0].endsWith('.pdf')
}

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { 
    name: 'fecha', 
    label: 'Fecha de cobro', 
    field: 'fecha', 
    align: 'center',
    format: (val) => val ? cambiarFormatoFecha(String(val).split(' ')[0]) : ''
  },
  {
    name: 'cuotas',
    label: 'N° cobros',
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
  {
    name: 'total_cobrado',
    label: 'Total cobro',
    field: row => row.total || row.monto,
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val || 0))),
  },
]
</script>
