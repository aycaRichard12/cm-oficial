<template>
  <q-page>
    <div>
      <div class="row q-col-gutter-x-md flex justify-between q-mb-md">
        <div class="col-12 col-md-4" id="filtrosAlmacen">
          <label for="almacen">{{ $t('ui.seleccione-un-almacen-fc2f9e') }}</label>
          <q-select
            v-model="filtroAlmacen"
            :options="almacenes"
            id="almacen"
            clearable
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-2" id="filtrosProducto">
          <label for="buscar">{{ $t('common.search') }}</label>
          <q-input dense debounce="300" v-model="busqueda" id="buscar" outlined>
            <template v-slot:append>
              <q-icon name="search" />
              <q-btn
                round
                dense
                flat
                icon="refresh"
                color="primary"
                :loading="loading"
                @click.stop.prevent="$emit('recargar')"
              >
                <q-tooltip>{{ $t('ui.recargar-compras-eba6c9') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Tabla -->
      <q-table
        id="tablaCompras"
        :title="$t('ui.compras-43a802')"
        :rows="processedRows"
        :columns="columnas"
        row-key="id"
        :filter="busqueda"
        dense
      >

        <template v-slot:body-cell-autorizacion="props">
          <q-td :props="props">
            <q-badge
              color="green"
              v-if="Number(props.row.autorizacion) === 1"
              :label="$t('ui.autorizado-b4fb49')"
              outline
            />
            <q-badge color="red" v-else :label="$t('ui.no-autorizado-988c4e')" outline />
          </q-td>
        </template>
        <template v-slot:body-cell-tipocompra="props">
          <q-td :props="props">
            {{ Number(props.row.tipocompra) === 2 ? $t('ui.contado-447b89') : $t('ui.a-credito-d25cc3') }}
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            <q-btn
              id="anadirCarrito"
              :title="$t('ui.anadir-carrito-881812')"
              icon="shopping_cart"
              color="primary"
              dense
              flat
              @click="$emit('detalleCompra', props.row)"
            />
            <q-btn
              id="detalleCredito"
              v-if="Number(props.row.tipocompra) === 1"
              :title="$t('ui.detelle-credito-1b7c8f')"
              icon="payment"
              color="blue"
              flat=""
              @click="FormularioCredito(props.row)"
              label=""
            />
          </q-td>
        </template>

        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <div v-if="Number(props.row.autorizacion) === 2">
              <q-btn
                id="autorizar"
                icon="toggle_off"
                dense
                flat
                color="grey"
                @click="$emit('toggle-status', props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="credito">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">{{ $t('ui.registrar-datos-para-credito-2b96e8') }}</div>
          <q-btn icon="close" dense flat round @click="credito = false" />
        </q-card-section>
        <q-card-section>
          <pagos-credito :compra="compra" @cerrar="closeModalCredito"></pagos-credito>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, watch } from 'vue'

import pagosCredito from './pagosCredito.vue'
import { useQuasar } from 'quasar'
import { showDialog } from 'src/utils/dialogs'

const $q = useQuasar()
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const pdfData = ref(null)
const busqueda = ref('')
const filtroAlmacen = ref(null)
const mostrarModal = ref(false)
const credito = ref(false)
const compra = ref({})
const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), align: 'right', field: 'numero' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), align: 'right', field: 'fecha' },
  { name: 'proveedor', label: i18nT('compras.supplier'), field: 'proveedor', align: 'left' },
  { name: 'lote', label: i18nT('ui.nombre-lote-c7e013'), field: 'lote', align: 'left' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo' },
  { name: 'nfactura', label: i18nT('ui.n-factura-5a62ff'), align: 'right', field: 'nfactura' },
  { name: 'tipocompra', label: i18nT('ui.tipo-compra-7e2b47'), field: 'tipocompra', align: 'center' },
  { name: 'total', label: i18nT('ui.total-compra-51fdc9'), align: 'right', field: 'total' },
  { name: 'autorizacion', label: i18nT('ui.autorizacion-077400'), field: 'autorizacion', align: 'center' },
  { name: 'detalle', label: i18nT('ui.detalle-be605b'), field: 'detalle', align: 'right' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
]
defineEmits(['add', 'repDesglosado', 'repCompras', 'edit', 'delete', 'recargar'])

const filteredCompra = computed(() => {
  if (!filtroAlmacen.value) {
    return props.rows // ← muestra todos si no hay filtro
  }
  return props.rows.filter(
    (compra) => compra.idalmacen == filtroAlmacen.value.value && compra.autorizacion == 2,
  )
})

const processedRows = computed(() => {
  return filteredCompra.value.map((row, index) => ({
    ...row,
    total: parseFloat(row.total).toFixed(2) || '0.00',
    numero: index + 1,
  }))
})

watch(
  () => props.almacenes,
  (nuevo) => {
    if (nuevo.length > 0 && !filtroAlmacen.value) {
      filtroAlmacen.value = nuevo[0]
    }
  },
  { immediate: true },
)

async function FormularioCredito(c) {
  //const response = await
  if (Number(c.autorizacion) == 1) {
    console.log(c)
    compra.value = c
    credito.value = true
  } else {
    // Dialog con iconos correctos

    const result = await showDialog(
      $q,
      'W',
      i18nT('ui.advertencia-la-compra-esta-en-espera-de-autorizacion-f7c8b2'),
    )
    console.log('Warning dialog result:', result)
  }
}
function closeModalCredito() {
  credito.value = false
}
</script>
