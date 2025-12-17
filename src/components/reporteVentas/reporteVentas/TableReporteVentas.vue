<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Reporte ventas"
    nombreColumnaTotales="canal"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm"
  >
    <template #body-cell-acciones="props">
      <q-td align="center">
        <q-btn size="sm" icon="visibility" flat @click="$emit('verDetalle', props.row)" />
        <q-btn
          size="sm"
          icon="email"
          flat
          color="primary"
          @click="$emit('crearMensaje', props.row)"
          class="q-ml-sm"
        />
        <q-btn
          v-if="props.row.tv >= 1"
          icon="receipt_long"
          dense
          rounded
          flat
          color="blue"
          @click="$emit('irAFactura', props.row)"
          title="Ver Factura (Shortlink)"
        />
        <q-btn
          v-if="props.row.tv >= 1"
          icon="policy"
          dense
          rounded
          flat
          color="warning"
          @click="$emit('irAImpuestos', props.row)"
          title="Ver URL SIN"
        />
        <q-btn
          v-if="props.row.tv >= 1"
          icon="account_balance_wallet"
          flat
          color="orange"
          @click="$emit('abrirModalNota', props.row)"
          title="Abrir Nota Crédito/Débito"
        />
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
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
defineEmits([
  'verDetalle',
  'crearMensaje',
  'irAFactura',
  'irAImpuestos',
  'abrirModalNota',
  'column-filter-changed',
])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)
const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', dataType: 'date', align: 'left' },
  { name: 'almacen', label: 'Almacen', field: 'almacen', dataType: 'text', align: 'left' },

  { name: 'cliente', label: 'Cliente', field: 'cliente', dataType: 'text', align: 'left' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', dataType: 'text', align: 'left' },
  {
    name: 'tipoventa',
    label: 'Tipo-Venta',
    field: 'tipoventa',
    dataType: 'number',
    align: 'left',
  },
  { name: 'tipopago', label: 'Tipo-Pago', field: 'tipopago', dataType: 'text', align: 'left' },
  { name: 'nfactura', label: 'Nro.Factura', field: 'nfactura', dataType: 'text' },
  { name: 'canal', label: 'Canal', field: 'canal', dataType: 'text', align: 'left' },
  { name: 'total', label: 'Total', field: 'total', align: 'right', dataType: 'number' },
  { name: 'descuento', label: 'Dscto.', field: 'descuento', align: 'right', dataType: 'number' },
  { name: 'ventatotal', label: 'Monto', field: 'ventatotal', align: 'right', dataType: 'number' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha',
  'almacen',
  'cliente',
  'sucursal',
  'tipoventa',
  'tipopago',
  'nfactura',
  'canal',
  'total',
  'descuento',
  'ventatotal',
]
const summationHeaders = ['total', 'descuento', 'ventatotal']
</script>
