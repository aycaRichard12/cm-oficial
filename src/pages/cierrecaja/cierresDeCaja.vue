<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="payments" size="md" class="q-mr-sm" />
          {{ $t('ui.cierres-de-caja-aa3c04') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">{{ $t('ui.administracion-de-cierres-de-caja-c085f0') }}</div>
      </div>
    </div>
    <div class="row" id="registrarCierre">
      <q-btn
        color="primary"
        @click="cierrecaja = true"
        class="btn-res q-md-lg"
        :title="$t('ui.registrar-cierre-caja-636437')"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">{{ $t('ui.registrar-cierre-caja-636437') }}</span>
      </q-btn>
    </div>
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Filtros avanzados -->

      <div class="col-xs-12 col-sm-6 col-md-3" id="autorizacion">
        <label for="autorizacion ">{{ $t('ui.autorizacion-077400') }}</label>
        <q-select
          v-model="filter.authorized"
          :options="authorizationOptions"
          id="autorizacion"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3" id="fechaCreacion">
        <label for="fechac">{{ $t('ui.fecha-de-creacion-3a561f') }}</label>
        <q-input
          v-model="filter.creationDate"
          id="fechac"
          dense
          outlined
          mask="##/##/####"
          clearable
          @update:model-value="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="filter.creationDate"
                  mask="DD/MM/YYYY"
                  @update:model-value="applyFilters"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Indicador de carga -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Tabla de resultados -->
    <div class="row flex justify-end">
      <div id="buscar">
        <label for="buscar">{{ $t('common.search') }}</label>
        <q-input borderless dense outlined v-model="tableFilter" :placeholder="$t('ui.buscar-a62405')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <tablaCierreCaja
      :rows="filteredData"
      @viewPdf="viewPdf"
      @autorizarCierreCaja="autorizarCierreCaja"
    />
    <!-- Mensaje si no hay resultados -->
    <q-banner v-if="!loading && filteredData.length === 0" class="cm-surface-2 cm-text-muted q-mt-md">
      <q-icon name="info" size="md" />
      {{ $t('ui.no-se-encontraron-resultados-para-los-filtros-selecc-512c0a') }}
    </q-banner>

    <q-dialog v-model="mostrarPDF" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarPDF = false" />
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
    <q-dialog v-model="cierrecaja" persistent full-width full-height>
      <q-card style="height: 100%; max-width: 100%">
        <q-card-section class="bg-primary text-white flex justify-between">
          <div class="text-h6">{{ $t('ui.registrar-cierre-caja-636437') }}</div>
          <q-space />
          <q-btn flat round icon="close" @click="cierrecaja = false" />
        </q-card-section>

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <cierre-caja-page @success="onCierreSuccess"></cierre-caja-page>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { date } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { PDFCierreCaja } from 'src/utils/pdfReportGenerator'
import CierreCajaPage from './CierreCajaPage.vue'
import tablaCierreCaja from './tablaCierreCaja.vue'
const mostrarPDF = ref(false)
const pdfData = ref(null)
const cierrecaja = ref(false)
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()

const onCierreSuccess = () => {
  cierrecaja.value = false
  fetchData()
}

// URL de la API
const API_URL = `cierres_registrados/${idempresa}/${idusuario}`
console.log(API_URL)
// Variables de estado
const loading = ref(true)
const originalData = ref([])
const tableFilter = ref('')

// Estructura de la tabla (columnas)

// Opciones de filtro para la autorización
const authorizationOptions = [
  { label: i18nT('ui.todos-a4114a'), value: null },
  { label: i18nT('ui.pendiente-7d63af'), value: 0 },
  { label: i18nT('ui.autorizado-b4fb49'), value: 1 },
  { label: i18nT('ui.rechazado-c282ee'), value: 2 },
]

// Estado de los filtros
const filter = ref({
  authorized: null,
  creationDate: null,
})

// Función para obtener los datos de la API
const fetchData = async () => {
  loading.value = true
  try {
    const response = await api.get(API_URL)
    console.log(response.data)
    if (response.data.estado === 'exito') {
      console.log(response.data.datos)
      originalData.value = response.data.datos
    } else {
      originalData.value = []
    }
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error)
    originalData.value = []
  } finally {
    loading.value = false
  }
}

// Lógica de filtrado
const filteredData = computed(() => {
  let temp = [...originalData.value] // Clonamos para evitar mutaciones directas

  // 1. Filtro por rango de fechas

  // 2. Filtro por autorización (Usar loose equality o asegurar tipos)
  if (filter.value.authorized !== null && filter.value.authorized !== undefined) {
    temp = temp.filter((row) => Number(row.autorizado) === Number(filter.value.authorized))
  }

  // 3. Filtro por fecha de creación
  if (filter.value.creationDate) {
    temp = temp.filter((row) => {
      const rowCreationDate = date.formatDate(row.creado_en, 'DD/MM/YYYY')
      return rowCreationDate === filter.value.creationDate
    })
  }

  return temp.map((row, index) => ({
    ...row,
    nro: index + 1,
  }))
})

// Función para aplicar los filtros
const applyFilters = () => {
  // El filtro se aplica automáticamente a través del computed property `filteredData`
  // gracias al v-model en los componentes de Quasar.
}

// Función para abrir el enlace del PDF
const viewPdf = async (id) => {
  // Reemplaza 'URL_BASE_DEL_PDF' con la URL real de tu servidor de PDF
  const response = await api.get(`reporteCierrePorId/${id}/${idusuario}`)
  console.log(response.data)
  const datosCierreCaja = response.data.datos
  const doc = PDFCierreCaja(datosCierreCaja)
  pdfData.value = doc.output('dataurlstring')
  mostrarPDF.value = true
}
const autorizarCierreCaja = async (cierre) => {
  // {
  //   id_cierre: 28,
  //   fecha_inicio: '2026-01-01',
  //   fecha_fin: '2026-04-18',
  //   observacion: '',
  //   creado_en: '2026-04-18 12:24:28',
  //   estado: 1,
  //   autorizado: 0,
  //   id_punto_venta: 59,
  //   punto_venta: 'PuntoVT-1',
  //   usuario: {
  //     id: '117',
  //     usuario: 'richard50',
  //     nombre: 'Richard',
  //     apellido: 'Ayca Acuña'
  //   }
  // }
  try {
    const response = await api.post('', {
      id_cierre: cierre.id_cierre,
      ver: 'AutorizacionCierre',
    })
    if (response.data.estado === 'exito') {
      fetchData() // Refrescar los datos después de autorizar
    } else {
      console.error('Error al autorizar el cierre de caja:', response.data.mensaje)
    }
  } catch (error) {
    console.error('Error en la solicitud de autorización:', error)
  }
}

// Llamar a la función de obtención de datos cuando el componente se monta
onMounted(async () => {
  await fetchData()
})
</script>
<style lang="scss">
.q-table__title {
  font-size: 24px;
  font-weight: 500;
}
</style>
