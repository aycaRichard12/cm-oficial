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
    class="q-ma-sm"
  >
    <template v-slot:body-cell-estado="props">
      <!-- <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline /> -->
      <q-td class="flex justify-center">
        <q-badge color="red" v-if="Number(props.row.condicion) === 2" label="ANU" outline="">
        </q-badge>
        <q-badge
          color="deep-purple"
          v-if="Number(props.row.estado) === 1 && Number(props.row.condicion) === 1"
          label="PREF"
          outline=""
        >
        </q-badge>
        <q-badge
          color="blue"
          v-if="Number(props.row.estado) === 0 && Number(props.row.condicion) === 1"
          label="NOR"
          outline=""
        >
        </q-badge>
        <q-badge
          color="green"
          v-if="Number(props.row.estado) === 2 && Number(props.row.condicion) === 1"
          label="FACT"
          outline=""
        >
        </q-badge>
        <q-badge
          color="orange"
          v-if="Number(props.row.estado) === 3 && Number(props.row.condicion) === 1"
          label="DEV"
          outline=""
        >
        </q-badge>
      </q-td>
    </template>
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props">
        <q-btn
          icon="picture_as_pdf"
          color="red"
          dense
          round
          flat
          @click="$emit('generarComprobantePDF', props.row.idcotizacion)"
          title="VER COMPROBANTE"
        />
        <q-btn
          v-if="
            (Number(tipoFactura) === 2 || Number(tipoFactura) === 1) &&
            Number(props.row.condicion) === 1 &&
            Number(props.row.estado) !== 2 &&
            Number(props.row.estado) !== 3
          "
          icon="payment"
          color="blue"
          dense
          round
          flat
          @click="$emit('facturarVenta', props.row.idcotizacion)"
          title="FACTURAR"
        />
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { getTipoFactura } from 'src/composables/FuncionesG'

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
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'left',
    field: 'fecha',
    dataType: 'date',
  },
  {
    name: 'almacen',
    label: 'Almacen',
    align: 'left',
    field: 'almacen',
    dataType: 'text',
  },
  { name: 'cliente', label: 'Cliente', align: 'left', field: 'cliente' },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal' },
  { name: 'estado', label: 'Tipo', align: 'left', field: 'estado' },
  {
    name: 'monto',
    label: 'Monto',
    align: 'right',
    field: 'monto',
    dataType: 'number',
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: 'descuento',
    dataType: 'number',
  },

  {
    name: 'total_sumatorias',
    label: 'Total',
    align: 'right',
    field: 'total_sumatorias',
    dataType: 'number',
  },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' },
]

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha',
  'almacen',
  'cliente',
  'sucursal',
  'monto',
  'descuento',
  'total_sumatorias',
]
const summationHeaders = ['monto', 'descuento', 'total_sumatorias']
</script>
