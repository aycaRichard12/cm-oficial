<template>
  <q-page class="q-pa-md">
    <!-- titulo notable de la pagina  -->
    <!-- Título -->
    <div class="q-mb-md">
      <div class="text-h5 text-weight-bold titulo">Reporte Inventario Exterior</div>
      <div class="text-subtitle text-grey-6">
        En esta sección puedes generar un reporte de inventario exterior
      </div>
    </div>

    <div class="row q-col-gutter-md overflow-hidden">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Filtros</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md items-end">
              <!-- Fechas -->
              <div class="col-12 col-sm-4 col-md-3">
                <q-input v-model="fechaInicio" type="date" label="Fecha Inicio" outlined dense />
              </div>
              <div class="col-12 col-sm-4 col-md-3">
                <q-input v-model="fechaFin" type="date" label="Fecha Final" outlined dense />
              </div>

              <!-- Botón Generar -->
              <div class="col-12 col-sm-4 col-md-3">
                <q-btn
                  color="primary"
                  label="Generar Reporte"
                  class="full-width"
                  @click="generarReporte"
                  :loading="cargando"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sección de Tabla -->
      <div class="col-12">
        <BaseFilterableTable
          title="Reporte Inventario Exterior"
          :rows="datosReporte"
          :columns="columns"
          :arrayHeaders="arrayHeaders"
          row-key="id"
        >
          <template v-slot:body-cell-reporte="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="picture_as_pdf"
                @click="verPDF(props.row)"
              >
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </BaseFilterableTable>
      </div>
    </div>

    <!-- Dialogo visor PDF -->
    <q-dialog
      v-model="showPdfDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-9 text-white">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-none fit">
          <iframe v-if="pdfUrl" :src="pdfUrl" class="fit" frameborder="0"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useReporteInventarioExterior } from 'src/composables/useReporteInventarioExterior'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { PDF_REPORTE_DETALLE_INVENTARIO_EXTERIOR } from 'src/utils/pdfReportGenerator.js'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const showPdfDialog = ref(false)
const pdfUrl = ref(null)

const {
  fechaInicio,
  fechaFin,
  cargando,
  datosReporte,
  generarReporte,
  generarReporteDetalladoIExternor,
  columns,
  arrayHeaders,
} = useReporteInventarioExterior()

const verPDF = async (row) => {
  try {
    $q.loading.show({ message: 'Generando reporte...' })
    const data = await generarReporteDetalladoIExternor(row.id)
    if (data) {
      const doc = PDF_REPORTE_DETALLE_INVENTARIO_EXTERIOR(data)
      pdfUrl.value = doc.output('bloburl')
      showPdfDialog.value = true
    } else {
      $q.notify({ type: 'negative', message: 'No se encontraron detalles para este registro.' })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF.' })
  } finally {
    $q.loading.hide()
  }
}

console.log('nuevos datos', columns)
</script>
