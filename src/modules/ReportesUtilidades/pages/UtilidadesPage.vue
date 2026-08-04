<template>
  <q-page class="q-pa-md">
    <FiltrosReporte
      :form="form"
      :listaAlmacenes="listaAlmacenes"
      :loadingAlmacenes="loadingAlmacenes"
      :listaClientes="listaClientes"
      :loadingClientes="loadingClientes"
      :listaCampanas="listaCampanas"
      :loadingCampanas="loadingCampanas"
      :listaCategoriaProductos="listaCategoriaProductos"
      :loadingCategoriaProducto="loadingCategoriaProducto"
      :mostrarGranularidad="tipoReporte === 'grafico'"
      :loadingReporte="loadingReporte"
      @update:form="actualizarFormulario"
      @submit="obtenerResumen"
      @limpiar="limpiar"
    />

    <ResumenCards
      v-if="resumenData"
      :data="resumenData"
      :divisa="divisa"
      currency="Bs."
      class="q-mt-md"
    />

    <div class="q-my-md">
      <q-btn color="primary" label="Ver Detalle" @click="obtenerReporte" />
    </div>
    <div class="q-my-md">
      <q-tabs
        v-model="tipoReporte"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="detalle" label="Detalle" />
        <q-tab name="grafico" label="Gráfico" />
      </q-tabs>
    </div>

    <div class="q-mt-md" v-if="tipoReporte === 'grafico' && graficoData">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Configuración de Gráfico</div>
          <q-select
            v-model="form.granularidad"
            label="Agrupar por"
            :options="['dia', 'semana', 'mes', 'anual']"
            emit-value
            map-options
            dense
            outlined
            class="full-width"
            @update:model-value="(val) => form.granularidad = val"
          />
        </div>
      </div>
    </div>

    <div class="q-mt-md">
      <TablaReporte
        ref="refHijo"
        v-if="tipoReporte === 'detalle' && detalleData.length"
        title="Productos vendidos"
        :rows="detalleData"
        :columns="detalleColumns"
        row-key="codigo_producto"
        :rowsPerPage="15"
        @cerrar="cerrarReporte"
        @descargar-excel="descargarExcel"
        @descargar-p-d-f="descargarPDF"
      />
      <tablaGrafico
        v-if="tipoReporte === 'grafico' && graficoData"
        title="Ventas por periodo"
        :rows="graficoData"
        :columns="graficoColumns"
        :divisa="divisa"
        :granularidad="form.granularidad"
        row-key="periodo"
        :rowsPerPage="30"
        @update:granularidad="form.granularidad = $event"
      />

      <div v-if="errorMensaje" class="text-negative q-mt-md">
        {{ errorMensaje }}
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useReporteVentas } from '../composables/useReporteVentas'
import FiltrosReporte from '../components/FiltrosReporte.vue'
import ResumenCards from '../components/ResumenCards.vue'
import TablaReporte from '../components/TablaReporte.vue'
import tablaGrafico from '../components/tablaGrafico.vue'
import { PDFreporteUtilidadesProductos } from 'src/utils/pdfs/utilidades/reporte'
import { exportToXLSX_Reporte_Utilidades } from 'src/utils/XCLReportImport'

const refHijo = ref(null)
const $q = useQuasar()
$q.iconSet.currency = 'AA'

const getSelectedLabels = () => {
  const selectedAlmacen =
    listaAlmacenes.value.find((item) => item.value === form.almacen_id)?.label || null
  const selectedCliente =
    listaClientes.value.find((item) => item.value === form.cliente_id)?.label || null
  const selectedCampana =
    listaCampanas.value.find((item) => item.value === form.campana_id)?.label || null

  let selectedCategoria = null
  for (const cat of listaCategoriaProductos.value) {
    if (cat.value === form.categoriaProd) {
      selectedCategoria = cat.label
      break
    }
    if (cat.children) {
      const sub = cat.children.find((child) => child.id === form.categoriaProd)
      if (sub) {
        selectedCategoria = sub.nombre
        break
      }
    }
  }
  return { selectedAlmacen, selectedCliente, selectedCampana, selectedCategoria }
}

const descargarPDF = () => {
  const datos = refHijo.value.obtenerDatos()
  console.log(datos)
  const { selectedAlmacen, selectedCliente, selectedCampana, selectedCategoria } =
    getSelectedLabels()
  const doc = PDFreporteUtilidadesProductos(
    datos,
    form.fecha_inicio,
    form.fecha_fin,
    selectedAlmacen,
    selectedCliente,
    selectedCampana,
    selectedCategoria,
  )
  if (doc) {
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url)
  }
}

const descargarExcel = () => {
  const datos = refHijo.value.obtenerDatos()
  const { selectedAlmacen, selectedCliente, selectedCampana, selectedCategoria } =
    getSelectedLabels()
  exportToXLSX_Reporte_Utilidades(
    datos,
    form.fecha_inicio,
    form.fecha_fin,
    selectedAlmacen,
    selectedCliente,
    selectedCampana,
    selectedCategoria,
  )
}

const cerrarReporte = () => {
  detalleData.value = []
}

const {
  loadingAlmacenes,
  loadingClientes,
  loadingCampanas,
  loadingCategoriaProducto,
  loadingReporte,
  errorMensaje,
  listaAlmacenes,
  listaClientes,
  listaCampanas,
  listaCategoriaProductos,
  form,
  tipoReporte,
  resumenData,
  detalleData,
  graficoData,
  divisa,
  detalleColumns,
  graficoColumns,
  obtenerReporte,
  obtenerResumen,
  init,
} = useReporteVentas()

watch(tipoReporte, (newVal, oldVal) => {
  if (resumenData.value && newVal !== oldVal) {
    obtenerReporte()
  }
})
const actualizarFormulario = (newForm) => {
  Object.assign(form, newForm)
}
onMounted(() => {
  init()
})
</script>
