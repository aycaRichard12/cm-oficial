<template>
  <q-page padding>
    <div class="titulo">Cierres de caja</div>
    <div class="row">
      <q-btn
        color="primary"
        text-color="white"
        label="Registrar Cierre Caja"
        @click="cierrecaja = true"
      />
    </div>
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Filtros avanzados -->
      <div class="row q-col-gutter-x-md"></div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <label for="fechaini">Fecha de Inicio</label>
        <q-input
          v-model="filter.dateRange.from"
          id="fechaini"
          mask="####-##-##"
          clearable
          dense
          outlined
          @update:model-value="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="filter.dateRange.from" @update:model-value="applyFilters" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <label for="Fechafin">Fecha de Fin</label>
        <q-input
          v-model="filter.dateRange.to"
          id="Fechafin"
          dense
          outlined
          mask="####-##-##"
          clearable
          @update:model-value="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="filter.dateRange.to" @update:model-value="applyFilters" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <label for="autorizacion ">Autorización</label>
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
      <div class="col-xs-12 col-sm-6 col-md-3">
        <label for="fechac">Fecha de Creación</label>
        <q-input
          v-model="filter.creationDate"
          id="fechac"
          dense
          outlined
          mask="####-##-##"
          clearable
          @update:model-value="applyFilters"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="filter.creationDate" @update:model-value="applyFilters" />
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
      <div>
        <label for="buscar">Buscar...</label>
        <q-input borderless dense outlined v-model="tableFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <q-table
      v-if="!loading && filteredData.length > 0"
      title="Cierres de Caja Registrados"
      :rows="filteredData"
      :columns="columns"
      row-key="id_cierre"
      :filter="tableFilter"
      :pagination="{ rowsPerPage: 10 }"
      class="q-mt-md"
    >
      <template v-slot:top-right> </template>

      <!-- Slot para chips de estado -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-chip :color="props.row.estado === 1 ? 'green' : 'red'" text-color="white" dense>
            {{ props.row.estado === 1 ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </q-td>
      </template>

      <!-- Slot para chips de autorización -->
      <template v-slot:body-cell-autorizado="props">
        <q-td :props="props">
          <q-chip :color="getAuthorizationColor(props.row.autorizado)" text-color="white" dense>
            {{ getAuthorizationText(props.row.autorizado) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Slot para el botón de acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="picture_as_pdf"
            label="Ver PDF"
            color="primary"
            flat
            dense
            @click="viewPdf(props.row.id_cierre)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Mensaje si no hay resultados -->
    <q-banner v-if="!loading && filteredData.length === 0" class="bg-grey-3 text-grey-8 q-mt-md">
      <q-icon name="info" size="md" />
      No se encontraron resultados para los filtros seleccionados.
    </q-banner>

    <q-dialog v-model="mostrarPDF" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
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
          <div class="text-h6">Registrar Cierre Caja</div>
          <q-space />
          <q-btn flat round icon="close" @click="cierrecaja = false" />
        </q-card-section>

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <cierre-caja-page></cierre-caja-page>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { date } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { PDFCierreCaja } from 'src/utils/pdfReportGenerator'
import CierreCajaPage from './CierreCajaPage.vue'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
const mostrarPDF = ref(false)
const pdfData = ref(null)
const cierrecaja = ref(false)
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()

// URL de la API
const API_URL = `cierres_registrados/${idempresa}/${idusuario}`

// Variables de estado
const loading = ref(true)
const originalData = ref([])
const tableFilter = ref('')

// Estructura de la tabla (columnas)
const columns = [
  {
    name: 'id_cierre',
    required: true,
    label: 'ID Cierre',
    align: 'left',
    field: 'id_cierre',
    sortable: true,
  },
  {
    name: 'fecha_inicio',
    label: 'Fecha Inicio',
    align: 'left',
    field: 'fecha_inicio',
    sortable: true,
  },
  { name: 'fecha_fin', label: 'Fecha Fin', align: 'left', field: 'fecha_fin', sortable: true },
  {
    name: 'observacion',
    label: 'Observación',
    align: 'left',
    field: 'observacion',
    sortable: true,
  },
  {
    name: 'punto_venta',
    label: 'Punto de Venta',
    align: 'left',
    field: 'punto_venta',
    sortable: true,
  },

  {
    name: 'creado_en',
    label: 'Fecha de Creación',
    align: 'left',
    field: 'creado_en',
    format: (val) => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss'),
    sortable: true,
  },

  { name: 'autorizado', label: 'Autorizado', align: 'left', field: 'autorizado', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

// Opciones de filtro para la autorización
const authorizationOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendiente', value: 0 },
  { label: 'Autorizado', value: 1 },
  { label: 'Rechazado', value: 2 },
]

// Estado de los filtros
const filter = ref({
  dateRange: { from: obtenerFechaActualDato(), to: obtenerFechaActualDato() },
  authorized: null,
  creationDate: null,
})

// Función para obtener los datos de la API
const fetchData = async () => {
  loading.value = true
  try {
    const response = await api.get(API_URL)
    if (response.data.estado === 'exito') {
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
  let temp = originalData.value

  // Filtro por rango de fechas
  if (filter.value.dateRange.from && filter.value.dateRange.to) {
    const start = new Date(filter.value.dateRange.from)
    const end = new Date(filter.value.dateRange.to)
    temp = temp.filter((row) => {
      const rowStartDate = new Date(row.fecha_inicio)
      const rowEndDate = new Date(row.fecha_fin)
      return rowStartDate >= start && rowEndDate <= end
    })
  }

  // Filtro por autorización
  if (filter.value.authorized !== null) {
    temp = temp.filter((row) => row.autorizado === filter.value.authorized)
  }

  // Filtro por fecha de creación
  if (filter.value.creationDate) {
    temp = temp.filter((row) => {
      const rowCreationDate = date.formatDate(row.creado_en, 'YYYY-MM-DD')
      return rowCreationDate === filter.value.creationDate
    })
  }

  return temp
})

// Función para aplicar los filtros
const applyFilters = () => {
  // El filtro se aplica automáticamente a través del computed property `filteredData`
  // gracias al v-model en los componentes de Quasar.
}

// Función para obtener el color del chip de autorización
const getAuthorizationColor = (status) => {
  switch (status) {
    case 0:
      return 'orange' // Pendiente
    case 1:
      return 'green' // Autorizado
    case 2:
      return 'red' // Rechazado
    default:
      return 'grey'
  }
}

// Función para obtener el texto del chip de autorización
const getAuthorizationText = (status) => {
  switch (status) {
    case 0:
      return 'Pendiente'
    case 1:
      return 'Autorizado'
    case 2:
      return 'Rechazado'
    default:
      return 'Desconocido'
  }
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

// Llamar a la función de obtención de datos cuando el componente se monta
onMounted(fetchData)
</script>

<style lang="scss">
.q-table__title {
  font-size: 24px;
  font-weight: 500;
}
</style>
