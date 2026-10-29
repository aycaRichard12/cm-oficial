<template>
  <BaseFilterableTable
    ref="refHijo"
    :title="$t('ui.reporte-ventas-b501c0')"
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
          :label="$t('common.active')"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('common.active') }}</q-tooltip>
        </q-badge>

        <q-badge
          v-else-if="props.row.estado === 'Anulado'"
          color="red"
          :label="$t('ui.anulado-c331a7')"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.anulado-c331a7') }}</q-tooltip>
        </q-badge>
        <q-badge
          v-else-if="props.row.estado === 'Devuelta'"
          color="orange"
          :label="$t('ui.devuelto-8334e9')"
          outline
          class="text-weight-bold shadow-1"
        >
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.anulado-c331a7') }}</q-tooltip>
        </q-badge>

        <q-badge v-else color="grey" :label="$t('ui.desconocido-452c8a')" outline class="text-weight-bold shadow-1">
          <q-tooltip content-class="bg-dark text-white text-caption">{{ $t('ui.estado-desconocido-c6f97c') }}</q-tooltip>
        </q-badge>
      </q-td>
    </template>
    <template #body-cell-acciones="props">
      <q-td align="center" :props="props">
        <div class="row items-center justify-center no-wrap q-gutter-xs">
          <q-btn
            id="btnverdetalle"
            size="sm"
            icon="visibility"
            flat
            @click="$emit('verDetalle', props.row)"
          />
          <q-btn
            size="sm"
            icon="email"
            flat
            color="primary"
            @click="$emit('crearMensaje', props.row)"
            class="q-ml-sm"
            id="btncrearmensaje"
          />
          <q-btn-dropdown
            color="grey-7"
            flat
            dense
            round
            dropdown-icon="more_vert"
            no-icon-animation
            v-if="props.row.tv >= 1"
          >
            <q-list style="min-width: 180px">
              <!-- <q-item clickable v-close-popup @click="$emit('verDetalle', props.row)">
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
            </q-item> -->

              <template v-if="props.row.tv >= 1">
                <q-separator />

                <q-item clickable v-close-popup @click="$emit('irAFactura', props.row)">
                  <q-item-section avatar>
                    <q-icon name="receipt_long" color="blue" size="xs" />
                  </q-item-section>
                  <q-item-section>{{ $t('ui.ver-factura-3d5c6a') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="$emit('irAImpuestos', props.row)">
                  <q-item-section avatar>
                    <q-icon name="policy" color="warning" size="xs" />
                  </q-item-section>
                  <q-item-section>{{ $t('ui.ver-url-sin-baa553') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="$emit('abrirModalNota', props.row)">
                  <q-item-section avatar>
                    <q-icon name="account_balance_wallet" color="orange" size="xs" />
                  </q-item-section>
                  <q-item-section>{{ $t('ui.nota-credito-debito-71c121') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
  {
    name: 'nro',
    label: i18nT('cotizacion.table.number'),
    field: 'nro',
    align: 'left',
    style: 'width: 50px',
    headerStyle: 'width: 50px',
  },
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha',
    dataType: 'date',
    align: 'left',
    style: 'width: 90px',
    headerStyle: 'width: 90px',
  },
  {
    name: 'nfactura',
    label: 'Nro.Fact',
    field: 'nfactura',
    dataType: 'text',
    style: 'width: 50px',
    headerStyle: 'width: 50px',
  },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    field: 'almacen',
    dataType: 'text',
    align: 'left',
    style: 'min-width: 150px',
    headerStyle: 'min-width: 150px',
  },

  {
    name: 'cliente',
    label: i18nT('ui.razon-social-adf906'),
    field: 'cliente',
    dataType: 'text',
    align: 'left',
    style: 'min-width: 250px',
    headerStyle: 'min-width: 250px',
  },
  {
    name: 'sucursal',
    label: i18nT('ui.sucursal-07d782'),
    field: 'sucursal',
    dataType: 'text',
    align: 'left',
    style: 'min-width: 150px',
    headerStyle: 'min-width: 150px',
  },
  {
    name: 'tipoventa',
    label: i18nT('ui.tipo-venta-96e441'),
    field: 'tipoventa',
    dataType: 'number',
    align: 'left',
    style: 'width: 100px',
    headerStyle: 'width: 100px',
  },
  {
    name: 'estado',
    label: i18nT('cotizacion.table.status'),
    field: 'estado',
    dataType: 'text',
    align: 'left',
    style: 'width: 100px',
    headerStyle: 'width: 100px',
  },
  {
    name: 'tipopago',
    label: i18nT('ui.tipo-pago-a21cbe'),
    field: 'tipopago',
    dataType: 'text',
    align: 'left',
    style: 'width: 120px',
    headerStyle: 'width: 120px',
  },

  {
    name: 'canal',
    label: i18nT('configuracion.canalesDeVenta.table.canal'),
    field: 'canal',
    dataType: 'text',
    align: 'left',
    style: 'width: 100px',
    headerStyle: 'width: 100px',
  },
  {
    name: 'total',
    label: i18nT('ventas.total'),
    field: 'total',
    align: 'right',
    dataType: 'number',
    style: 'width: 90px',
    headerStyle: 'width: 90px',
  },
  {
    name: 'descuento',
    label: i18nT('ui.dscto-dfa854'),
    field: 'descuento',
    align: 'right',
    dataType: 'number',
    style: 'width: 90px',
    headerStyle: 'width: 90px',
  },
  {
    name: 'ventatotal',
    label: i18nT('ui.monto-835dcd'),
    field: 'ventatotal',
    align: 'right',
    dataType: 'number',
    style: 'width: 100px',
    headerStyle: 'width: 100px',
  },
  {
    name: 'acciones',
    label: i18nT('common.actions'),
    field: 'acciones',
    align: 'center',
    sortable: false,
    style: 'width: 120px',
    headerStyle: 'width: 120px',
  },
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
