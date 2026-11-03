<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <q-btn :label="$t('ui.volver-84a715')" icon="arrow_back" color="primary" flat @click="$emit('back')" />
      </div>
      <div class="col text-center">
        <div class="text-h6 text-weight-bold text-primary">{{ $t('ui.detalle-de-cobros-91fe6d') }}</div>
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
      class="cm-surface rounded-borders"
    >
      <template v-slot:body-cell-comprobante="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro"
            flat
            round
            dense
            color="primary"
            :icon="
              esArchivoPDF(props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro)
                ? 'picture_as_pdf'
                : 'photo'
            "
            @click="
              $emit(
                'ver-comprobante',
                props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro,
              )
            "
          >
            <q-tooltip
              >{{ $t('ui.ver-49b372') }}
              {{
                esArchivoPDF(props.row.imagen || props.row.urlpdf || props.row.foto_detalle_cobro)
                  ? 'PDF'
                  : $t('ui.imagen-100f99')
              }}</q-tooltip
            >
          </q-btn>
        </q-td>
      </template>
      <!-- Template: agregar slot para acciones (después del body-cell-comprobante) -->
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <div class="row justify-center items-center q-gutter-xs">
            <q-btn
              flat
              round
              dense
              color="warning"
              icon="edit"
              @click="$emit('editar-cobro', props.row)"
            >
              <q-tooltip>{{ $t('ui.editar-cobro-083ffa') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="$emit('eliminar-cobro', props.row)"
            >
              <q-tooltip>{{ $t('ui.eliminar-cobro-c7d71a') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <div class="row q-mt-md justify-end">
      <div class="col-12 col-md-4">
        <q-markup-table flat bordered class="rounded-borders">
          <tbody class="text-weight-medium">
            <tr>
              <td class="text-grey-7">{{ $t('ui.total-venta-eaaafd') }}</td>
              <td class="text-right text-subtitle2">
                {{ formatoMoneda(detalleSeleccionado.totalVenta) }} {{ divisa }}
              </td>
            </tr>
            <tr class="bg-green-1">
              <td class="text-positive text-weight-bold">{{ $t('ui.total-cobrado-c3a2cb') }}</td>
              <td class="text-right text-subtitle2 text-positive text-weight-bold">
                {{ formatoMoneda(totalCobrado) }} {{ divisa }}
              </td>
            </tr>
            <tr class="bg-orange-1">
              <td class="text-deep-orange text-weight-bold">{{ $t('ui.saldo-actual-cb16e6') }}</td>
              <td class="text-right text-subtitle2 text-deep-orange text-weight-bold">
                {{ formatoMoneda(detalleSeleccionado.saldo) }} {{ divisa }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { decimas, redondear, cambiarFormatoFecha } from 'src/composables/FuncionesG'

defineProps({
  rows: Array,
  totalCobrado: [Number, String],
  divisa: String,
  detalleSeleccionado: Object,
  formatoMoneda: Function,
})

defineEmits(['back', 'ver-comprobante', 'editar-cobro', 'eliminar-cobro'])

const esArchivoPDF = (url) => {
  if (!url) return false
  return String(url).toLowerCase().split('?')[0].endsWith('.pdf')
}

const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
  {
    name: 'fecha',
    label: i18nT('ui.fecha-de-cobro-557cc3'),
    field: 'fecha',
    align: 'center',
    format: (val) => (val ? cambiarFormatoFecha(String(val).split(' ')[0]) : ''),
  },
  {
    name: 'num_documento',
    label: i18nT('ui.n-doc-2a0176'),
    field: 'num_documento',
    align: 'left',
  },
  {
    name: 'cuotas',
    label: i18nT('ui.n-cobros-da8546'),
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: i18nT('ui.comprobante-7f8d58'), field: 'imagen', align: 'center' },
  {
    name: 'total_cobrado',
    label: i18nT('ui.total-cobro-b8bff4'),
    field: (row) => row.total || row.monto,
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val || 0))),
  },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
]
</script>
