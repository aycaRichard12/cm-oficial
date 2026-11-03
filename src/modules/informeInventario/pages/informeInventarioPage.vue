<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md kardex-print-area">
      <q-card-section>
        <div class="row items-start justify-between q-mb-md">
          <div>
            <div class="text-h5 text-weight-bold">{{ $t('ui.reporte-de-inventario-fisico-valorado-edd7ba') }}</div>
            <div class="text-caption text-grey-7">{{ $t('ui.kardex-fisico-valorado-por-producto-150d85') }}</div>
          </div>
          <div class="row q-gutter-sm no-print">
            <q-btn
              outline
              color="green-7"
              icon="grid_on"
              :label="$t('ui.excel-a08e11')"
              :disable="!filasKardex.length"
              @click="exportarExcel"
            />
            <q-btn
              outline
              color="red-7"
              icon="picture_as_pdf"
              label="PDF"
              :disable="!filasKardex.length"
              @click="exportarPdf"
            />
            <q-btn
              outline
              color="primary"
              icon="print"
              :label="$t('ui.imprimir-6d7683')"
              :disable="!filasKardex.length"
              @click="imprimir"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              emit-value
              map-options
              :label="$t('inventario.warehouse')"
              dense
              outlined
              :loading="loadingAlmacenes"
              :disable="loadingAlmacenes || loading"
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item
                  ><q-item-section class="text-grey"
                    >{{ $t('ui.sin-almacenes-disponibles-cdf2fb') }}</q-item-section
                  ></q-item
                >
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-5">
            <DateRangeFilter
              v-model:fecha-inicial="fechaInicio"
              v-model:fecha-final="fechaFin"
              v-model:rango-valido="rangoValido"
            />
          </div>

          <div class="col-12 col-md-2 flex items-center">
            <q-btn
              color="primary"
              icon="assessment"
              :label="$t('ui.generar-1f31a1')"
              class="full-width"
              :loading="loading"
              :disable="!puedeGenerar"
              @click="generarInforme"
            >
              <q-tooltip v-if="!puedeGenerar">{{ $t('ui.seleccione-almacen-y-un-rango-valido-7d0024') }}</q-tooltip>
            </q-btn>
          </div>

          <div class="col-12 col-md-2 flex items-center">
            <q-btn
              outline
              dense
              color="primary"
              icon="refresh"
              :label="$t('ui.recargar-9d2c9d')"
              class="full-width"
              :loading="loadingAlmacenes"
              @click="cargarAlmacenes"
            />
          </div>
        </div>

        <div v-if="filasKardex.length" class="row q-gutter-sm q-mt-md">
          <q-chip icon="event" color="primary" text-color="white" dense>
            {{ $t('ui.del-717e1e') }} {{ fmtFechaDDMMYYYY(fechaInicio) }} {{ $t('ui.al-2f9ee2') }} {{ fmtFechaDDMMYYYY(fechaFin) }}
          </q-chip>
          <q-chip icon="store" color="primary" text-color="white" dense>
            {{ almacenNombre }}
          </q-chip>
          <q-chip v-if="divisaActiva" icon="attach_money" color="green-7" text-color="white" dense>
            {{ divisaActiva.codigosin || divisaActiva.nombre }}
          </q-chip>
          <q-chip icon="inventory_2" color="blue-grey-7" text-color="white" dense>
            {{ filasKardex.length }} {{ $t('ui.productos-2d7e7d') }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <q-banner
      v-if="advertenciasRaiz.length"
      dense
      rounded
      class="bg-orange-1 text-orange-9 q-mb-md no-print"
    >
      <template v-slot:avatar>
        <q-icon name="warning" color="orange-9" />
      </template>
      <div class="text-caption">
        <div v-for="(adv, i) in advertenciasRaiz" :key="`raiz-${i}`">{{ adv }}</div>
      </div>
    </q-banner>

    <q-card flat bordered class="kardex-print-area">
      <div class="row items-center q-pa-sm bg-grey-2 no-print">
        <div class="text-subtitle1 text-weight-bold">
          <q-icon name="table_chart" /> {{ $t('ui.detalle-por-producto-d22628') }}
          <q-badge v-if="filasKardex.length" color="primary" class="q-ml-sm">
            {{ filasKardexFiltradas.length }}
          </q-badge>
        </div>
        <q-space />
        <q-input
          v-model="filtroTexto"
          dense
          outlined
          :placeholder="$t('ui.buscar-producto-codigo-c0d55d')"
          style="min-width: 220px"
          class="q-mr-sm"
          clearable
        >
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
        <q-toggle v-model="soloInconsistentes" :label="$t('ui.solo-inconsistentes-268b93')" dense color="negative" />
      </div>

      <div class="kardex-scroll">
        <q-table
          :rows="filasKardexFiltradas"
          :columns="columnasPlaceholder"
          row-key="__id"
          v-model:pagination="paginacion"
          :rows-per-page-options="[10, 25, 50, 100, 0]"
          :loading="loading"
          flat
          dense
          wrap-cells
          class="kardex-table"
          :no-data-label="
            !filasKardex.length
              ? $t('ui.seleccione-almacen-y-rango-de-fechas-luego-presione-9dc711')
              : $t('ui.sin-productos-para-los-filtros-aplicados-122458')
          "
        >
          <template v-slot:header>
            <q-tr key="hdr-main">
              <q-th rowspan="2" class="kdx-th kdx-th-item">{{ $t('cotizacion.table.number') }}</q-th>
              <q-th rowspan="2" class="kdx-th kdx-th-desc">{{ $t('configuracion.servicios.table.descripcion') }}</q-th>
              <q-th colspan="3" class="kdx-th kdx-head-saldo-inicial">{{ $t('ui.saldo-inicial-f00275') }}</q-th>
              <q-th colspan="3" class="kdx-th kdx-head-entradas">{{ $t('ui.entradas-d1358d') }}</q-th>
              <q-th colspan="3" class="kdx-th kdx-head-salidas">{{ $t('ui.salidas-2779e6') }}</q-th>
              <q-th colspan="3" class="kdx-th kdx-head-saldo-final">{{ $t('ui.saldo-final-2cf0d6') }}</q-th>
              <q-th rowspan="2" class="kdx-th kdx-th-acciones no-print">{{ $t('common.actions') }}</q-th>
            </q-tr>
            <q-tr key="hdr-sub">
              <q-th class="kdx-th kdx-head-saldo-inicial kdx-num">{{ $t('ui.cantidad-b5b6f8') }}</q-th>
              <q-th class="kdx-th kdx-head-saldo-inicial kdx-num">{{ $t('ui.p-unit-b616d4') }}</q-th>
              <q-th class="kdx-th kdx-head-saldo-inicial kdx-num">{{ $t('ui.p-total-390805') }}</q-th>
              <q-th class="kdx-th kdx-head-entradas kdx-num">{{ $t('ui.cantidad-b5b6f8') }}</q-th>
              <q-th class="kdx-th kdx-head-entradas kdx-num">{{ $t('ui.p-unit-b616d4') }}</q-th>
              <q-th class="kdx-th kdx-head-entradas kdx-num">{{ $t('ui.p-total-390805') }}</q-th>
              <q-th class="kdx-th kdx-head-salidas kdx-num">{{ $t('ui.cantidad-b5b6f8') }}</q-th>
              <q-th class="kdx-th kdx-head-salidas kdx-num">{{ $t('ui.p-unit-b616d4') }}</q-th>
              <q-th class="kdx-th kdx-head-salidas kdx-num">{{ $t('ui.p-total-390805') }}</q-th>
              <q-th class="kdx-th kdx-head-saldo-final kdx-num">{{ $t('ui.cantidad-b5b6f8') }}</q-th>
              <q-th class="kdx-th kdx-head-saldo-final kdx-num">{{ $t('ui.p-unit-b616d4') }}</q-th>
              <q-th class="kdx-th kdx-head-saldo-final kdx-num">{{ $t('ui.p-total-390805') }}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr
              :props="props"
              :key="props.row.__id"
              :class="{ 'kdx-row-inconsistente': !props.row.cuadre?.consistente }"
            >
              <q-td key="item" :props="props" class="kdx-num">
                {{ props.rowIndex + 1 + offsetPaginacion }}
              </q-td>
              <q-td key="descripcion" :props="props" class="kdx-desc">
                <div class="text-weight-medium">{{ props.row.descripcion }}</div>
                <div class="text-caption text-grey-7">
                  {{ props.row.codigo }}
                </div>
              </q-td>

              <q-td key="siCantidad" :props="props" class="kdx-num kdx-body-saldo-inicial">{{
                fmtCantidad(props.row.siCantidad)
              }}</q-td>
              <q-td key="siPUnit" :props="props" class="kdx-num kdx-body-saldo-inicial">{{
                fmtMoneda(props.row.siPUnit)
              }}</q-td>
              <q-td key="siPTotal" :props="props" class="kdx-num kdx-body-saldo-inicial">{{
                fmtMoneda(props.row.siPTotal)
              }}</q-td>

              <q-td key="entCantidad" :props="props" class="kdx-num kdx-body-entradas">{{
                fmtCantidad(props.row.entCantidad)
              }}</q-td>
              <q-td key="entPUnit" :props="props" class="kdx-num kdx-body-entradas">{{
                fmtMoneda(props.row.entPUnit)
              }}</q-td>
              <q-td key="entPTotal" :props="props" class="kdx-num kdx-body-entradas">{{
                fmtMoneda(props.row.entPTotal)
              }}</q-td>

              <q-td key="salCantidad" :props="props" class="kdx-num kdx-body-salidas">{{
                fmtCantidad(props.row.salCantidad)
              }}</q-td>
              <q-td key="salPUnit" :props="props" class="kdx-num kdx-body-salidas">{{
                fmtMoneda(props.row.salPUnit)
              }}</q-td>
              <q-td key="salPTotal" :props="props" class="kdx-num kdx-body-salidas">{{
                fmtMoneda(props.row.salPTotal)
              }}</q-td>

              <q-td key="sfCantidad" :props="props" class="kdx-num kdx-body-saldo-final">{{
                fmtCantidad(props.row.sfCantidad)
              }}</q-td>
              <q-td key="sfPUnit" :props="props" class="kdx-num kdx-body-saldo-final">{{
                fmtMoneda(props.row.sfPUnit)
              }}</q-td>
              <q-td key="sfPTotal" :props="props" class="kdx-num kdx-body-saldo-final">{{
                fmtMoneda(props.row.sfPTotal)
              }}</q-td>

              <q-td key="acciones" :props="props" class="kdx-center no-print">
                <div class="row items-center justify-center no-wrap">
                  <q-btn
                    flat
                    dense
                    round
                    icon="visibility"
                    color="primary"
                    @click="abrirDetalle(props.row)"
                    size="sm"
                  >
                    <q-tooltip>{{ $t('ui.ver-compras-salidas-del-periodo-2953b1') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.advertencias && props.row.advertencias.length"
                    flat
                    dense
                    round
                    icon="warning"
                    color="orange-9"
                    size="sm"
                    class="q-ml-xs"
                    @click="abrirAdvertencias(props.row)"
                  >
                    <q-badge color="orange" floating>{{ props.row.advertencias.length }}</q-badge>
                    <q-tooltip>{{ $t('ui.ver-advertencias-a82f94') }}{{ props.row.advertencias.length }})</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr class="kdx-totales">
              <q-td colspan="2" class="kdx-num text-weight-bold">TOTALES</q-td>
              <q-td class="kdx-num kdx-body-saldo-inicial"></q-td>
              <q-td class="kdx-num kdx-body-saldo-inicial"></q-td>
              <q-td class="kdx-num kdx-body-saldo-inicial text-weight-bold">{{
                fmtMoneda(totalesKardex.siPTotal)
              }}</q-td>
              <q-td class="kdx-num kdx-body-entradas"></q-td>
              <q-td class="kdx-num kdx-body-entradas"></q-td>
              <q-td class="kdx-num kdx-body-entradas text-weight-bold">{{
                fmtMoneda(totalesKardex.entPTotal)
              }}</q-td>
              <q-td class="kdx-num kdx-body-salidas"></q-td>
              <q-td class="kdx-num kdx-body-salidas"></q-td>
              <q-td class="kdx-num kdx-body-salidas text-weight-bold">{{
                fmtMoneda(totalesKardex.salPTotal)
              }}</q-td>
              <q-td class="kdx-num kdx-body-saldo-final"></q-td>
              <q-td class="kdx-num kdx-body-saldo-final"></q-td>
              <q-td class="kdx-num kdx-body-saldo-final text-weight-bold">{{
                fmtMoneda(totalesKardex.sfPTotal)
              }}</q-td>
              <q-td class="kdx-center no-print"></q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card>

    <q-dialog v-model="dialogDetalle" maximized>
      <q-card class="modal-head-verde" style="min-width: 900px; max-width: 95vw">
        <q-card-section class="row items-center bg-green-10 text-white"><!-- theme-allow -->
          <div class="text-h6 text-white"><!-- theme-allow -->
            {{ detalleActual?.codigo }} — {{ detalleActual?.descripcion }}
          </div>
          <q-space />
          <div class="text-caption text-white q-mr-md"><!-- theme-allow -->
            <q-icon name="event" />
            {{ $t('ui.del-717e1e') }} {{ fmtFechaDDMMYYYY(fechaInicio) }} {{ $t('ui.al-2f9ee2') }} {{ fmtFechaDDMMYYYY(fechaFin) }}
          </div>
          <q-btn flat round icon="close" color="white" v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">{{ $t('ui.compras-del-periodo-0ba63d') }}</div>
          <BaseFilterableTable
            :rows="detalleActual?.detalle?.compras || []"
            :columns="columnasMovimientoEntrada"
            :array-headers="['documento', 'fecha']"
            :show-index="true"
            index-label="N°"
            :sticky-header="true"
            row-key="id"
          >
            <template v-slot:body-cell-documento="props">
              <q-td :props="props">
                <span
                  class="kdx-doc-badge"
                  :style="{ backgroundColor: colorDocumento(props.row.codigo) }"
                  >{{ props.value }}</span
                >
              </q-td>
            </template>
          </BaseFilterableTable>
          <div
            v-if="!detalleActual?.detalle?.compras?.length"
            class="text-caption text-grey q-mb-md"
          >
            {{ $t('ui.sin-compras-en-el-periodo-b3f9d0') }}
          </div>

          <div class="text-subtitle2 q-mt-md q-mb-sm">{{ $t('ui.salidas-del-periodo-8417d9') }}</div>
          <BaseFilterableTable
            :rows="detalleActual?.detalle?.salidas || []"
            :columns="columnasMovimientoSalida"
            :array-headers="['documento', 'fecha']"
            :show-index="true"
            index-label="N°"
            :sticky-header="true"
            row-key="id"
          >
            <template v-slot:body-cell-documento="props">
              <q-td :props="props">
                <span
                  class="kdx-doc-badge"
                  :style="{ backgroundColor: colorDocumento(props.row.codigo) }"
                  >{{ props.value }}</span
                >
              </q-td>
            </template>
          </BaseFilterableTable>
          <div v-if="!detalleActual?.detalle?.salidas?.length" class="text-caption text-grey">
            {{ $t('ui.sin-salidas-en-el-periodo-67e0f0') }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogAdvertencias">
      <q-card style="min-width: 520px; max-width: 90vw">
        <q-card-section class="row items-center bg-orange-9 text-white"><!-- theme-allow -->
          <q-icon name="warning" size="md" class="q-mr-sm" />
          <div class="text-h6 text-white"><!-- theme-allow -->{{ $t('ui.advertencias-del-producto-0860dc') }}</div>
          <q-space />
          <q-btn flat round icon="close" color="white" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section
          v-if="advertenciasActuales.codigo || advertenciasActuales.producto"
          class="q-pb-none"
        >
          <div class="text-subtitle2 text-weight-medium">
            {{ advertenciasActuales.codigo }} — {{ advertenciasActuales.producto }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-list v-if="advertenciasActuales.lista.length" separator bordered>
            <q-item v-for="(adv, i) in advertenciasActuales.lista" :key="i">
              <q-item-section avatar>
                <q-icon name="error_outline" color="orange-9" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">{{ adv }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-caption text-grey q-pa-sm">
            {{ $t('ui.sin-advertencias-para-este-producto-a8a082') }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('ui.cerrar-4b0816')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import {
  idempresa_md5,
  idusuario_md5,
  divisaEmonedaActiva,
} from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import DateRangeFilter from 'src/components/componentesGenerales/filtradoTabla/DateRangeFilter.vue'
import {
  transformarFilaKardex,
  calcularTotales,
  fmtCantidad,
  fmtMoneda,
} from '../utils/kardexUtils'
import { KardexPdfService } from '../services/KardexPdfService'
import { KardexExcelService } from '../services/KardexExcelService'

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

const loading = ref(false)
const loadingAlmacenes = ref(false)
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const fechaInicio = ref('')
const fechaFin = ref('')
const rangoValido = ref(false)
const filas = ref([])
const advertenciasRaiz = ref([])
const soloInconsistentes = ref(false)
const filtroTexto = ref('')
const divisaActiva = ref(null)

const dialogDetalle = ref(false)
const detalleActual = ref(null)
const dialogAdvertencias = ref(false)
const advertenciasActuales = ref({ producto: '', codigo: '', lista: [] })

const paginacion = ref({ page: 1, rowsPerPage: 0 })

const columnasPlaceholder = [
  { name: 'item', label: i18nT('ui.item-b49aca'), align: 'center', field: '__index' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), align: 'left', field: 'descripcion' },
  { name: 'siCantidad', label: i18nT('ui.si-cant-91048c'), align: 'right', field: 'siCantidad' },
  { name: 'siPUnit', label: i18nT('ui.si-p-u-5e87ac'), align: 'right', field: 'siPUnit' },
  { name: 'siPTotal', label: i18nT('ui.si-p-t-cb3130'), align: 'right', field: 'siPTotal' },
  { name: 'entCantidad', label: i18nT('ui.ent-cant-bd2a5a'), align: 'right', field: 'entCantidad' },
  { name: 'entPUnit', label: i18nT('ui.ent-p-u-9d28f6'), align: 'right', field: 'entPUnit' },
  { name: 'entPTotal', label: i18nT('ui.ent-p-t-7c923f'), align: 'right', field: 'entPTotal' },
  { name: 'salCantidad', label: i18nT('ui.sal-cant-600b0b'), align: 'right', field: 'salCantidad' },
  { name: 'salPUnit', label: i18nT('ui.sal-p-u-959a32'), align: 'right', field: 'salPUnit' },
  { name: 'salPTotal', label: i18nT('ui.sal-p-t-4a4199'), align: 'right', field: 'salPTotal' },
  { name: 'sfCantidad', label: i18nT('ui.sf-cant-73abf8'), align: 'right', field: 'sfCantidad' },
  { name: 'sfPUnit', label: i18nT('ui.sf-p-u-d57e81'), align: 'right', field: 'sfPUnit' },
  { name: 'sfPTotal', label: i18nT('ui.sf-p-t-f9210f'), align: 'right', field: 'sfPTotal' },
  { name: 'acciones', label: i18nT('common.actions'), align: 'center' },
]

const columnasMovimientoEntrada = [
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'documento',
    label: i18nT('ui.documento-8ae11c'),
    field: 'documento',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: i18nT('ui.n-factura-5a62ff'),
    field: 'nfactura',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'proveedor',
    label: i18nT('compras.supplier'),
    field: 'proveedor',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    field: 'cantidad',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'precioUnitario',
    label: i18nT('ui.p-unitario-a58e75'),
    field: 'precioUnitario',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'valor',
    label: i18nT('configProducto.parametroObsolescencia.form.valor'),
    field: 'valor',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
]

const columnasMovimientoSalida = [
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'documento',
    label: i18nT('ui.documento-8ae11c'),
    field: 'documento',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: i18nT('ui.n-factura-5a62ff'),
    field: 'nfactura',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    field: 'cantidad',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'precioUnitario',
    label: i18nT('ui.p-unitario-a58e75'),
    field: 'precioUnitario',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
  {
    name: 'valor',
    label: i18nT('configProducto.parametroObsolescencia.form.valor'),
    field: 'valor',
    align: 'right',
    sortable: true,
    dataType: 'number',
  },
]

const DOCUMENTO_POR_CODIGO = {
  VE: 'SALIDA (venta facturada)',
  MOV1: 'ENTRADA (increase / incremento)',
  MOV2: 'SALIDA (decrease / decremento)',
  MIC: 'ENTRADA (compras)',
  NUE: 'NUEVO (recién creado producto stock 0)',
  COT: 'SALIDA (venta sin factura cotización)',
  MER: 'SALIDA (merma)',
  AN: 'ENTRADA (anular venta facturada)',
  ANC: 'ENTRADA (anular venta sin factura cotización)',
  EXT: 'SALIDA (extravío producto)',
  'DEV VE': 'ENTRADA (devolución venta)',
  'ANUL COMP': 'SALIDA (anulación compra)',
  'DEV COT': 'ENTRADA (devolución venta sin factura)',
  DEV: 'ENTRADA (devolución venta)',
  'MER VE': 'SALIDA (merma venta con factura)',
  'ANUL DIRECTA': 'SALIDA (anulación compra)',
  'MER COT': 'SALIDA (merma cotización sin factura)',
}

const CODIGO_COLORES = {
  VE: '#1976d2',
  MOV1: '#2e7d32',
  MOV2: '#c62828',
  MIC: '#1b5e20',
  NUE: '#6a1b9a',
  COT: '#ef6c00',
  MER: '#b71c1c',
  AN: '#0277bd',
  ANC: '#00838f',
  EXT: '#4e342e',
  'DEV VE': '#43a047',
  'ANUL COMP': '#8e0000',
  'DEV COT': '#66bb6a',
  DEV: '#388e3c',
  'MER VE': '#d32f2f',
  'ANUL DIRECTA': '#6d0000',
  'MER COT': '#e64a19',
}

function colorDocumento(codigo) {
  const key = String(codigo || '')
    .trim()
    .toUpperCase()
  return CODIGO_COLORES[key] || '#546e7a'
}

function descripcionDocumento(codigoODoc) {
  const codigo = String(codigoODoc || '').trim()
  if (!codigo) return ''
  const desc = DOCUMENTO_POR_CODIGO[codigo.toUpperCase()]
  return desc ? `${codigo} — ${desc}` : codigo
}

const filasKardex = computed(() =>
  filas.value.map((r, i) => transformarFilaKardex(r, i)).filter(Boolean),
)

const filasKardexFiltradas = computed(() => {
  let data = filasKardex.value
  if (soloInconsistentes.value) {
    data = data.filter((f) => !f.cuadre?.consistente)
  }
  const q = (filtroTexto.value || '').trim().toLowerCase()
  if (q) {
    data = data.filter(
      (f) =>
        String(f.descripcion || '')
          .toLowerCase()
          .includes(q) ||
        String(f.codigo || '')
          .toLowerCase()
          .includes(q),
    )
  }
  return data
})

const totalesKardex = computed(() => calcularTotales(filasKardexFiltradas.value))

const offsetPaginacion = computed(() => {
  const rp = paginacion.value.rowsPerPage || 0
  if (rp <= 0) return 0
  return ((paginacion.value.page || 1) - 1) * rp
})

watch([filtroTexto, soloInconsistentes], () => {
  if ((paginacion.value.page || 1) !== 1) {
    paginacion.value = { ...paginacion.value, page: 1 }
  }
})

const almacenNombre = computed(() => {
  const opt = opcionesAlmacenes.value.find((o) => o.value === almacenSeleccionado.value)
  return opt?.label || i18nT('ui.sin-almacen-d9a4f5')
})

const puedeGenerar = computed(
  () =>
    almacenSeleccionado.value !== null &&
    almacenSeleccionado.value !== undefined &&
    almacenSeleccionado.value !== '' &&
    !!fechaInicio.value &&
    !!fechaFin.value &&
    rangoValido.value,
)

/**
 * Convierte cualquier valor a "YYYY-MM-DD" trabajando exclusivamente con
 * cadenas. Para objetos Date se usa toISOString().slice(0, 10), que NO
 * depende de la zona horaria local del navegador.
 */
function aFechaISO(value) {
  // [kdx-fix-timezone] Parseo robusto de fechas con/sin timezone.
  if (value == null || value === '') return ''

  // 1) Date object
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return value.toISOString().slice(0, 10)
  }

  // 2) Number (timestamp epoch)
  if (typeof value === 'number') {
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return ''
    return dt.toISOString().slice(0, 10)
  }

  // 3) String
  if (typeof value !== 'string') return ''
  const raw = value.trim()
  if (!raw) return ''

  // 3.a) YYYY-MM-DD exacto -> fecha-calendario literal (sin timezone)
  const mPure = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
  if (mPure) return `${mPure[1]}-${mPure[2]}-${mPure[3]}`

  // 3.b) DD/MM/YYYY exacto
  const mDmy = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (mDmy) return `${mDmy[3]}-${mDmy[2]}-${mDmy[1]}`

  // 3.c) ISO con tiempo (incluye offsets -04:00 y sufijo Z):
  //      "2025-12-16T20:00:00.000-04:00" -> "2025-12-17"
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const dt = new Date(raw)
    if (!Number.isNaN(dt.getTime())) {
      return dt.toISOString().slice(0, 10)
    }
  }

  // 3.d) Fallback: primer prefijo YYYY-MM-DD
  const mPrefix = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
  if (mPrefix) return `${mPrefix[1]}-${mPrefix[2]}-${mPrefix[3]}`

  return ''
}

function fmtFechaDDMMYYYY(value) {
  const iso = aFechaISO(value)
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

async function cargarDivisa() {
  try {
    divisaActiva.value = await divisaEmonedaActiva()
  } catch (e) {
    console.warn('[informeInventario] divisa:', e)
    divisaActiva.value = null
  }
}

async function cargarAlmacenes() {
  loadingAlmacenes.value = true
  try {
    const response = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
    if (Array.isArray(response.data)) {
      const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
      opcionesAlmacenes.value = [
        { label: i18nT('ui.todos-los-almacenes-949f2c'), value: 0 },
        ...filtrados.map((item) => ({
          label: item.almacen,
          value: item.idalmacen,
        })),
      ]
      const existe = opcionesAlmacenes.value.some((o) => o.value === almacenSeleccionado.value)
      if (!existe) {
        const primerAlmacenReal = opcionesAlmacenes.value.find((o) => o.value !== 0)
        almacenSeleccionado.value = primerAlmacenReal ? primerAlmacenReal.value : 0
      }
    }
  } catch (error) {
    console.error('[informeInventario] cargarAlmacenes:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-cargar-la-lista-de-almacenes-bcb90d') })
  } finally {
    loadingAlmacenes.value = false
  }
}

async function generarInforme() {
  if (!puedeGenerar.value) return
  loading.value = true
  advertenciasRaiz.value = []
  filas.value = []
  paginacion.value = { ...paginacion.value, page: 1 }
  try {
    const fIni = aFechaISO(fechaInicio.value)
    const fFin = aFechaISO(fechaFin.value)
    const idAlmacen = almacenSeleccionado.value ?? 0
    const url = `obtenerSaldosFinales/${fIni}/${fFin}/${idAlmacen}/${idempresa}`
    const response = await api.get(url)
    const body = response.data

    if (body?.estado === 'exito' && Array.isArray(body.data)) {
      filas.value = body.data
      if (Array.isArray(body.advertencias) && body.advertencias.length) {
        advertenciasRaiz.value = body.advertencias
      }
    } else {
      filas.value = []
      $q.notify({
        type: 'warning',
        message: body?.mensaje || i18nT('ui.la-respuesta-del-servidor-no-contiene-datos-validos-192fad'),
      })
    }
  } catch (error) {
    console.error('[informeInventario] generarInforme:', error)
    const msg =
      error?.response?.data?.mensaje ||
      i18nT('ui.no-se-pudo-generar-el-informe-de-inventario-intente-8650b7')
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loading.value = false
  }
}

function abrirDetalle(row) {
  const normalize = (arr, prefix) =>
    (arr || []).map((m, i) => {
      const fechaRaw = m.fecha || m.fechaMovimiento || ''
      const codigo = String(m.codigo || m.documento || m.numero || '')
        .trim()
        .toUpperCase()
      return {
        ...m,
        id: `${prefix}-${i}`,
        fecha: fechaRaw ? fmtFechaDDMMYYYY(fechaRaw) : '',
        documento: descripcionDocumento(codigo),
        codigo,
        nfactura: m.nfactura || m.numeroFactura || '',
        proveedor: m.proveedor || m.nombreProveedor || '',
        cantidad: Number(m.cantidad ?? 0),
        precioUnitario: Number(m.costoUnitario ?? m.precioUnitario ?? 0),
        valor: Number(m.valor ?? 0),
      }
    })
  detalleActual.value = {
    ...row,
    detalle: {
      compras: normalize(row.detalle?.compras, 'c'),
      salidas: normalize(row.detalle?.salidas, 's'),
    },
  }
  dialogDetalle.value = true
}

function abrirAdvertencias(row) {
  const raw = row?.advertencias
  const lista = Array.isArray(raw) ? [...raw] : raw ? [String(raw)] : []
  advertenciasActuales.value = {
    producto: row?.descripcion || '',
    codigo: row?.codigo || '',
    lista,
  }
  dialogAdvertencias.value = true
}

function divisaLabel() {
  return divisaActiva.value?.codigosin || divisaActiva.value?.nombre || '-'
}

function exportarExcel() {
  try {
    const svc = new KardexExcelService()
    const blob = svc.generate({
      filas: filasKardexFiltradas.value,
      titulo: i18nT('ui.reporte-de-inventario-fisico-valorado-edd7ba'),
      almacenNombre: almacenNombre.value,
      fechaInicio: aFechaISO(fechaInicio.value),
      fechaFin: aFechaISO(fechaFin.value),
      divisaActiva: divisaLabel(),
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Kardex_${aFechaISO(fechaInicio.value)}_${aFechaISO(fechaFin.value)}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    $q.notify({ type: 'positive', message: i18nT('ui.excel-generado-correctamente-793c9e') })
  } catch (e) {
    console.error('[informeInventario] exportarExcel:', e)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-generar-el-excel-fa81fb') })
  }
}

async function exportarPdf() {
  if (!filasKardexFiltradas.value.length) {
    $q.notify({ type: 'warning', message: i18nT('ui.no-hay-datos-para-exportar-0864ac') })
    return
  }
  loading.value = true
  try {
    const svc = new KardexPdfService()
    const doc = await svc.generate({
      filas: filasKardexFiltradas.value,
      titulo: i18nT('ui.reporte-de-inventario-fisico-valorado-edd7ba'),
      almacenNombre: almacenNombre.value,
      fechaInicio: aFechaISO(fechaInicio.value),
      fechaFin: aFechaISO(fechaFin.value),
      divisaActiva: divisaLabel(),
      orientation: 'landscape',
      format: 'a4',
    })
    doc.save(`Kardex_${aFechaISO(fechaInicio.value)}_${aFechaISO(fechaFin.value)}.pdf`)
    $q.notify({ type: 'positive', message: i18nT('ui.pdf-generado-correctamente-c748eb') })
  } catch (e) {
    console.error('[informeInventario] exportarPdf:', e)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-generar-el-pdf-dba951') })
  } finally {
    loading.value = false
  }
}

async function imprimir() {
  const original = paginacion.value
  paginacion.value = { ...original, rowsPerPage: 0, page: 1 }
  await nextTick()
  await nextTick()
  window.print()
  paginacion.value = original
}

/**
 * [kdx-fix-ocierrefiscal] Calcula la fecha de INICIO del periodo fiscal:
 * toma `empresa.ocierrefiscal` (formato "DD/MM") del localStorage
 * `mistersofts-cm`, le suma 1 dia y la ancla al año en curso.
 *   Ej: "31/12" -> "YYYY-01-01"  (año actual)
 *       "30/06" -> "YYYY-07-01"
 *       "28/02" -> "YYYY-03-01" (o "YYYY-02-29" si el año es bisiesto)
 * Fallback: "YYYY-01-01" si no hay dato valido.
 */
function calcularFechaInicioFiscal(yyyy) {
  const fallback = `${yyyy}-01-01`
  try {
    const raw = localStorage.getItem('mistersofts-cm')
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    const cierre = arr?.[0]?.empresa?.ocierrefiscal
    if (!cierre || typeof cierre !== 'string') return fallback
    const m = cierre.trim().match(/^(\d{1,2})[/-](\d{1,2})$/)
    if (!m) return fallback
    const dia = parseInt(m[1], 10)
    const mes = parseInt(m[2], 10)
    if (!Number.isFinite(dia) || !Number.isFinite(mes)) return fallback
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return fallback
    const base = new Date(yyyy, mes - 1, dia)
    if (Number.isNaN(base.getTime())) return fallback
    // Descarta fechas no reales (31/04, 29/02 en año no bisiesto, etc.).
    if (
      base.getFullYear() !== yyyy ||
      base.getMonth() !== mes - 1 ||
      base.getDate() !== dia
    ) {
      return fallback
    }
    base.setDate(base.getDate() + 1)
    const mmIni = String(base.getMonth() + 1).padStart(2, '0')
    const ddIni = String(base.getDate()).padStart(2, '0')
    // Anclamos SIEMPRE al año en curso, aunque +1 dia desborde a enero.
    return `${yyyy}-${mmIni}-${ddIni}`
  } catch (e) {
    console.warn('[informeInventario] No se pudo leer ocierrefiscal:', e)
    return fallback
  }
}

onMounted(async () => {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')
  fechaInicio.value = calcularFechaInicioFiscal(yyyy)
  fechaFin.value = `${yyyy}-${mm}-${dd}`
  rangoValido.value = true
  await Promise.all([cargarAlmacenes(), cargarDivisa()])
})
</script>

<style lang="scss" scoped>
.kardex-scroll {
  max-height: 65vh;
  overflow: auto;
}

.kardex-table :deep(thead tr th) {
  border: 1px solid #607d8b !important;
  color: #212121;
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
}
.kardex-table :deep(tbody td) {
  border: 1px solid #455a64 !important;
  font-size: 12px;
  white-space: nowrap;
}

.kardex-table :deep(thead tr:first-child th) {
  position: sticky;
  top: 0;
  z-index: 4;
  height: 30px;
}
.kardex-table :deep(thead tr:last-child th) {
  position: sticky;
  top: 30px;
  z-index: 3;
  height: 30px;
}

.kdx-head-saldo-inicial {
  background-color: #ffeb9c !important;
}
.kdx-head-entradas {
  background-color: #ffcc80 !important;
}
.kdx-head-salidas {
  background-color: #c8e6c9 !important;
}
.kdx-head-saldo-final {
  background-color: #b3e5fc !important;
}

.kdx-th-item,
.kdx-th-desc,
.kdx-th-acciones {
  background-color: #f5f5f5 !important;
}

.kdx-body-saldo-inicial {
  background-color: #fff9c4 !important;
}
.kdx-body-entradas {
  background-color: #ffe0b2 !important;
}
.kdx-body-salidas {
  background-color: #e8f5e9 !important;
}
.kdx-body-saldo-final {
  background-color: #e1f5fe !important;
}

.kdx-row-inconsistente {
  background-color: #fff3e0 !important;
}

.kdx-totales :deep(td) {
  background-color: var(--cm-surface-2) !important;
  border-top: 2px solid #37474f !important;
}

.kdx-num {
  text-align: right;
}
.kdx-desc {
  text-align: left;
}
.kdx-center {
  text-align: center;
}

.kardex-table :deep(thead tr th:nth-child(3)),
.kardex-table :deep(thead tr th:nth-child(6)),
.kardex-table :deep(thead tr th:nth-child(9)),
.kardex-table :deep(thead tr th:nth-child(12)),
.kardex-table :deep(tbody td:nth-child(3)),
.kardex-table :deep(tbody td:nth-child(6)),
.kardex-table :deep(tbody td:nth-child(9)),
.kardex-table :deep(tbody td:nth-child(12)) {
  border-left: 2px solid #607d8b !important;
}
.kardex-table :deep(thead tr th:nth-child(15)),
.kardex-table :deep(tbody td:nth-child(15)) {
  border-left: 2px solid #607d8b !important;
}

.kdx-doc-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--cm-on-primary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

@media print {
  .no-print {
    display: none !important;
  }
  .kardex-scroll {
    max-height: none;
    overflow: visible;
  }
  .kardex-print-area {
    box-shadow: none !important;
  }
  .kardex-table :deep(thead tr:first-child th),
  .kardex-table :deep(thead tr:last-child th) {
    position: static;
  }
}
</style>
