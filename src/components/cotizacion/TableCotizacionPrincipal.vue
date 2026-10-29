<template>
  <BaseFilterableTable
    ref="refHijo"
    :title="$t('cotizacion.title')"
    nombreColumnaTotales="estado"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm shadow-2 rounded-borders"
  >
    <!-- Columna: Tipo (Estado) -->
    <template v-slot:body-cell-estadoResumido="props">
      <q-td :props="props" class="text-center">
        <!-- Anulado -->
        <!-- Mostrar el texto del estado resumido -->
        <q-badge
          v-if="props.row.estadoResumido === 'ANU'"
          color="red"
          label="ANU"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.anulado-c331a7') }}</q-tooltip>
        </q-badge>

        <!-- Proforma (Activo, Estado 1) -->
        <q-badge
          v-if="props.row.estadoResumido === 'PREF'"
          color="deep-purple"
          label="PREF"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption"
            >{{ $t('ui.proforma-cotizacion-49062b') }}</q-tooltip
          >
        </q-badge>

        <!-- Normal (Activo, Estado 0) -->
        <q-badge
          v-if="props.row.estadoResumido === 'NOR'"
          color="blue"
          label="NOR"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.nota-normal-09b375') }}</q-tooltip>
        </q-badge>

        <!-- Facturado (Activo, Estado 2) -->
        <q-badge
          v-if="props.row.estadoResumido === 'FACT'"
          color="positive"
          label="FACT"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.facturado-e66f6e') }}</q-tooltip>
        </q-badge>

        <!-- Devolución (Activo, Estado 3) -->
        <q-badge
          v-if="props.row.estadoResumido === 'DEV'"
          color="orange"
          label="DEV"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.devolucion-ce2809') }}</q-tooltip>
        </q-badge>
      </q-td>
    </template>

    <!-- Columna: Estado de Cobro -->
    <template v-slot:body-cell-estadoCobroResumido="props">
      <q-td :props="props" class="text-center">
        <!-- Cobrado (2, 0 o null) -->
        <q-badge
          v-if="props.row.estadoCobroResumido == 'Cobrado'"
          :label="estadoCobro[0].cobrado"
          color="positive"
          icon="check_circle"
          outline
          class="cursor-pointer q-px-sm shadow-1"
        >
          <q-tooltip>{{ $t('ui.ya-esta-cobrado-no-se-puede-ir-a-gestionar-cobro-70a972') }}</q-tooltip>
        </q-badge>

        <!-- Pendiente (1 o 3) -->
        <q-badge
          v-if="props.row.estadoCobroResumido === 'Pendiente'"
          :label="estadoCobro[0].pendiente"
          color="warning"
          icon="schedule"
          outline
          class="cursor-pointer q-px-sm shadow-1"
          @click="irCuentasPorCobrar"
        >
          <q-tooltip>{{ $t('ui.ir-a-gestionar-cobro-aun-no-esta-cobrado-738d65') }}</q-tooltip>
        </q-badge>

        <!-- Anulado (4) -->
        <q-badge
          v-if="props.row.estadoCobroResumido === 'Anulado'"
          :label="estadoCobro[0].anulado"
          color="negative"
          icon="block"
          outline
          class="shadow-1"
        >
          <q-tooltip>{{ $t('ui.cobro-anulado-ef9221') }}</q-tooltip>
        </q-badge>
      </q-td>
    </template>

    <!-- Columna: Acciones -->
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" auto-width>
        <div class="row items-center justify-center no-wrap q-gutter-x-sm">
          <q-btn
            id="btnvercomprobantecotizacion"
            icon="picture_as_pdf"
            color="red-7"
            flat
            round
            dense
            @click="$emit('generarComprobantePDF', props.row.idcotizacion)"
          >
            <q-tooltip>{{ $t('ui.ver-comprobante-7f0b83') }}</q-tooltip>
          </q-btn>
          <q-btn
            id="btneditarcotizacion"
            v-if="props.row.estadoResumido === 'NOR'"
            icon="edit"
            color="orange-8"
            flat
            round
            dense
            @click="$emit('editarCotizacion', props.row.idcotizacion)"
          >
            <q-tooltip>{{ $t('ui.editar-cotizacion-24dc81') }}</q-tooltip>
          </q-btn>
          <q-btn
            id="btnfacturarcotizacion"
            v-if="
              (Number(tipoFactura) === 2 || Number(tipoFactura) === 1) &&
              Number(props.row.condicion) === 1 &&
              Number(props.row.estado) !== 2 &&
              Number(props.row.estado) !== 3
            "
            icon="receipt_long"
            color="primary"
            flat
            round
            dense
            @click="$emit('facturarVenta', props.row.idcotizacion)"
          >
            <q-tooltip>{{ $t('ui.facturar-0c8fd3') }}</q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>

    <!-- Formateo de Moneda -->
    <template v-slot:body-cell-monto="props">
      <q-td :props="props" class="text-right">
        {{ formatCurrency(props.row.monto) }}
      </q-td>
    </template>
    <template v-slot:body-cell-descuento="props">
      <q-td :props="props" class="text-right cm-text-muted">
        {{ formatCurrency(props.row.descuento) }}
      </q-td>
    </template>
    <template v-slot:body-cell-total_sumatorias="props">
      <q-td :props="props" class="text-right text-weight-bold">
        {{ formatCurrency(props.row.total_sumatorias) }}
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { getTipoFactura } from 'src/composables/FuncionesG'
import emitter from 'src/event-bus'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'

const tipoFactura = getTipoFactura()
const refHijo = ref(null)

// Propiedades recibidas del componente padre
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
console.log('Props recibidas en TableReporteCotizacion:', props.rows)
defineExpose({ obtenerDatos: () => ejecutarDesdePadre(), getActiveFiltersReport })

function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()

  console.log('Resultado recibido del hijo:', resultado)
  return resultado
}

// Eventos que serán emitidos al componente padre
defineEmits(['facturarVenta', 'generarComprobantePDF', 'column-filter-changed'])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)
const columnas = [
  { name: 'nro', label: i18nT('cotizacion.table.number'), align: 'center', field: 'nro', sortable: true },
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    align: 'left',
    field: 'fecha',
    dataType: 'date',
    sortable: true,
  },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    align: 'left',
    field: 'almacen',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cliente',
    label: i18nT('ui.razon-social-adf906'),
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nombreComercial',
    label: i18nT('ui.nombre-comercial-55a6ae'),
    align: 'left',
    field: 'nombreComercial',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'sucursal',
    label: i18nT('ui.sucursal-07d782'),
    align: 'left',
    field: 'sucursal',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'numFactura',
    label: i18nT('ui.n-factura-5a62ff'),
    align: 'right',
    field: 'numFactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'estadoCobroResumido',
    label: i18nT('ui.estado-pago-a3e139'),
    align: 'center',
    field: 'estadoCobroResumido',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'estadoResumido',
    label: i18nT('configGeneral.divisas.table.type'),
    align: 'center',
    field: 'estadoResumido',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'monto',
    label: i18nT('ui.monto-835dcd'),
    align: 'right',
    field: 'monto',
    dataType: 'number',
    sortable: true,
  },

  { name: 'acciones', label: i18nT('common.actions'), align: 'center', field: 'acciones' },
]

const estadoCobro = [
  {
    pendiente: 'Pendiente',
    cobrado: 'Cobrado',
    anulado: 'Anulado',
  },
]

// estado de cobro
// 1: 'Activo',
//   2: 'Finalizado',
//   3: 'Atrasado',
//   4: 'Anulado',

function irCuentasPorCobrar() {
  const gestionCuentasPorCobrar = verificarexistenciapagina('cuentasporcobrar')
  emitter.emit('abrir-submenu', gestionCuentasPorCobrar)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha',
  'almacen',
  'cliente',
  'nombreComercial',
  'sucursal',
  'monto',
  'estadoCobroResumido',
  'numFactura',
]

const summationHeaders = []
</script>
