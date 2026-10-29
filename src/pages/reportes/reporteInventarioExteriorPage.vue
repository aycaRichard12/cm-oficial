<template>
  <q-page class="q-pa-md">
    <!-- titulo notable de la pagina  -->
    <!-- Título -->
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="lan" size="md" class="q-mr-sm" />
          {{ $t('ui.reporte-inventario-exterior-30eb1c') }}
        </div>
        <div class="text-subtitle2 cm-text-muted q-mt-xs">
          {{ $t('ui.en-esta-seccion-puedes-generar-un-reporte-de-inventa-79e231') }}
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t('ui.filtros-dbcf4f') }}</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md items-end">
              <!-- Fechas -->
              <div class="col-12 col-sm-4 col-md-3" id="fechaInicio">
                <q-input v-model="fechaInicio" type="date" :label="$t('ui.fecha-inicio-cecd90')" outlined dense />
              </div>
              <div class="col-12 col-sm-4 col-md-3" id="fechaFin">
                <q-input v-model="fechaFin" type="date" :label="$t('ui.fecha-final-fcea71')" outlined dense />
              </div>

              <!-- Botón Generar -->
              <div class="col-12 col-sm-4 col-md-3" id="btnGenerarReporte">
                <q-btn
                  color="primary"
                  :label="$t('reportes.generate')"
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
          id="tablaR"
          :title="$t('ui.reporte-inventario-exterior-30eb1c')"
          :rows="datosReporte"
          :columns="columns"
          :arrayHeaders="arrayHeaders"
          row-key="id"
        >
          <template v-slot:body-cell-ubicacion="props">
            <q-td :props="props">
              <q-btn col="auto" color="info" icon="place" @click="onViewMap(props.row)" size="sm">
                <q-tooltip>{{ $t('ui.ver-ubicacion-0c5f15') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-reporte="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="picture_as_pdf"
                @click="verPDF(props.row)"
                id="btnVerPDF"
              >
                <q-tooltip>{{ $t('ui.ver-detalle-4c9cbe') }}</q-tooltip>
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
      <q-card class="bg-grey-9" style="color: var(--cm-on-primary)">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="cm-surface text-primary">{{ $t('ui.cerrar-4b0816') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-none fit">
          <iframe v-if="pdfUrl" :src="pdfUrl" class="fit" frameborder="0"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
    <InventarioExteriorMapaDialog
      v-model="showMapDialog"
      :latitud="selectedLocation.lat"
      :longitud="selectedLocation.lng"
    />
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref } from 'vue'
import { useReporteInventarioExterior } from 'src/composables/useReporteInventarioExterior'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { PDF_REPORTE_DETALLE_INVENTARIO_EXTERIOR } from 'src/utils/pdfReportGenerator.js'
import { useQuasar } from 'quasar'
import InventarioExteriorMapaDialog from 'src/components/inventarioExterior/InventarioExteriorMapaDialog.vue'

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
    $q.loading.show({ message: i18nT('ui.generando-reporte-f36ceb') })
    const data = await generarReporteDetalladoIExternor(row.id)
    if (data) {
      const doc = PDF_REPORTE_DETALLE_INVENTARIO_EXTERIOR(data)
      pdfUrl.value = doc.output('bloburl')
      showPdfDialog.value = true
    } else {
      $q.notify({ type: 'negative', message: i18nT('ui.no-se-encontraron-detalles-para-este-registro-a18b38') })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-generar-el-pdf-f686e1') })
  } finally {
    $q.loading.hide()
  }
}
const showMapDialog = ref(false)

const selectedLocation = ref({ lat: '', lng: '' })

const onViewMap = (row) => {
  selectedLocation.value = {
    lat: row.latitud, // Ensure 'latitud' is in 'row' (from inventarioData mapping)
    lng: row.longitud,
  }
  showMapDialog.value = true
}

console.log('nuevos datos', columns)
</script>
