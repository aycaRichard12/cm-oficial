<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Reporte Cotización"
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
    <template v-slot:body-cell-estado="props">
      <q-td :props="props" class="text-center">
        <!-- Anulado -->
        <q-badge
          v-if="Number(props.row.condicion) === 2"
          color="red"
          label="ANU"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Anulado</q-tooltip>
        </q-badge>

        <!-- Proforma (Activo, Estado 1) -->
        <q-badge
          v-if="Number(props.row.estado) === 1 && Number(props.row.condicion) === 1"
          color="deep-purple"
          label="PREF"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Proforma / Cotización</q-tooltip>
        </q-badge>

        <!-- Normal (Activo, Estado 0) -->
        <q-badge
          v-if="Number(props.row.estado) === 0 && Number(props.row.condicion) === 1"
          color="blue"
          label="NOR"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Nota Normal</q-tooltip>
        </q-badge>

        <!-- Facturado (Activo, Estado 2) -->
        <q-badge
          v-if="Number(props.row.estado) === 2 && Number(props.row.condicion) === 1"
          color="positive"
          label="FACT"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Facturado</q-tooltip>
        </q-badge>

        <!-- Devolución (Activo, Estado 3) -->
        <q-badge
          v-if="Number(props.row.estado) === 3 && Number(props.row.condicion) === 1"
          color="orange"
          label="DEV"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Devolución</q-tooltip>
        </q-badge>
      </q-td>
    </template>

    <!-- Columna: Estado de Cobro -->
    <template v-slot:body-cell-estado_cobro="props">
      <q-td :props="props" class="text-center">
        <!-- Cobrado (2, 0 o null) -->
        <q-badge
          v-if="[2, 0, null].includes(Number(props.row.estado_cobro)) || props.row.estado_cobro == null"
          :label="estadoCobro[0].cobrado"
          color="positive"
          icon="check_circle"
          outline
          class="cursor-pointer q-px-sm shadow-1"
        
        >
          <q-tooltip>Ya esta cobrado, no se puede ir a gestionar cobro</q-tooltip>
        </q-badge>

        <!-- Pendiente (1 o 3) -->
        <q-badge
          v-if="Number(props.row.estado_cobro) === 1 || Number(props.row.estado_cobro) === 3"
          :label="estadoCobro[0].pendiente"
          color="warning"
          icon="schedule"
          outline
          class="cursor-pointer q-px-sm shadow-1"
          @click="irCuentasPorCobrar"
        >
          <q-tooltip>Ir a gestionar cobro, aun no esta cobrado</q-tooltip>
        </q-badge>

        <!-- Anulado (4) -->
        <q-badge
          v-if="Number(props.row.estado_cobro) === 4"
          :label="estadoCobro[0].anulado"
          color="negative"
          icon="block"
          outline
          class="shadow-1"
        >
          <q-tooltip>Cobro anulado</q-tooltip>
        </q-badge>
      </q-td>
    </template>

    <!-- Columna: Acciones -->
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" auto-width>
        <div class="row items-center justify-center no-wrap q-gutter-x-sm">
          <q-btn
            icon="picture_as_pdf"
            color="red-7"
            flat
            round
            dense
            @click="$emit('generarComprobantePDF', props.row.idcotizacion)"
          >
             <q-tooltip>Ver Comprobante</q-tooltip>
          </q-btn>
          <q-btn
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
             <q-tooltip>Facturar</q-tooltip>
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
      <q-td :props="props" class="text-right text-grey-7">
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
  { name: 'nro', label: 'N°', align: 'center', field: 'nro', sortable: true },
  { name: 'fecha', label: 'Fecha', align: 'left', field: 'fecha', dataType: 'date', sortable: true },
  { name: 'almacen', label: 'Almacén', align: 'left', field: 'almacen', dataType: 'text', sortable: true },
  { name: 'cliente', label: 'Cliente', align: 'left', field: 'cliente', dataType: 'text', sortable: true },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal', dataType: 'text', sortable: true },
  { name: 'estado', label: 'Tipo', align: 'center', field: 'estado', sortable: true },
  { name: 'monto', label: 'Monto', align: 'right', field: 'monto', dataType: 'number', sortable: true },
  { name: 'descuento', label: 'Desc.', align: 'right', field: 'descuento', dataType: 'number', sortable: true },
  { name: 'total_sumatorias', label: 'Total', align: 'right', field: 'total_sumatorias', dataType: 'number', sortable: true },
  { name: 'estado_cobro', label: 'Estado Pago', align: 'center', field: 'estado_cobro', dataType: 'text', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' },
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
    maximumFractionDigits: 2
  }).format(Number(value) || 0)
}

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha',
  'almacen',
  'cliente',
  'sucursal',
  'monto',
  'descuento',
  'total_sumatorias',
  'estado',
  'estado_cobro'
]

const summationHeaders = ['monto', 'descuento', 'total_sumatorias']
</script>
