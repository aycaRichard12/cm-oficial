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
    <template #body-cell-estado="props">
      <q-td :props="props" class="text-center">
        <q-badge
          v-if="props.row.estado === 'Valido'"
          color="green"
          label="Activo"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Activo</q-tooltip>
        </q-badge>

        <q-badge
          v-else-if="props.row.estado === 'Anulado'"
          color="red"
          label="Anulado"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Anulado</q-tooltip>
        </q-badge>
        <q-badge
          v-else-if="props.row.estado === 'Devuelta'"
          color="orange"
          label="Devuelto"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">Anulado</q-tooltip>
        </q-badge>

        <q-badge v-else color="grey" label="Desconocido" outline class="text-weight-bold shadow-1">
          <q-tooltip content-class="bg-dark text-white text-caption">Estado desconocido</q-tooltip>
        </q-badge>
      </q-td>
    </template>
    <template #body-cell-acciones="props">
      <q-td align="center">
        <q-btn-dropdown color="grey-7" flat dense round dropdown-icon="more_vert" no-icon-animation>
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup @click="$emit('verDetalle', props.row)">
              <q-item-section avatar>
                <q-icon name="visibility" size="xs" />
              </q-item-section>
              <q-item-section>Ver detalle</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$emit('crearMensaje', props.row)">
              <q-item-section avatar>
                <q-icon name="email" color="primary" size="xs" />
              </q-item-section>
              <q-item-section>Enviar mensaje</q-item-section>
            </q-item>

            <template v-if="props.row.tv >= 1">
              <q-separator />

              <q-item clickable v-close-popup @click="$emit('irAFactura', props.row)">
                <q-item-section avatar>
                  <q-icon name="receipt_long" color="blue" size="xs" />
                </q-item-section>
                <q-item-section>Ver Factura</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$emit('irAImpuestos', props.row)">
                <q-item-section avatar>
                  <q-icon name="policy" color="warning" size="xs" />
                </q-item-section>
                <q-item-section>Ver URL SIN</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$emit('abrirModalNota', props.row)">
                <q-item-section avatar>
                  <q-icon name="account_balance_wallet" color="orange" size="xs" />
                </q-item-section>
                <q-item-section>Nota Crédito/Débito</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-btn-dropdown>
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
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    dataType: 'text',
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
  'estado',
  'tipopago',
  'nfactura',
  'canal',
  'total',
  'descuento',
  'ventatotal',
]
const summationHeaders = ['total', 'descuento', 'ventatotal']
</script>
