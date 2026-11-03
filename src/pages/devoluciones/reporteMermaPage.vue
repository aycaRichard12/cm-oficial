<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para mermas o reducción de inventario -->
          <q-icon name="remove_shopping_cart" size="md" class="q-mr-sm" />
          {{ $t('ui.reporte-de-mermas-2450a5') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.seguimiento-de-productos-danados-caducados-o-perdida-cc226f') }}
        </div>
      </div>
    </div>

    <q-form @submit.prevent="generarReporte">
      <div class="row q-col-gutter-md flex justify-center">
        <div class="col-md-4" id="fechainicioreportemerma">
          <q-input
            v-model="fechaInicio"
            :label="$t('ui.fecha-inicial-2b461a')"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
          />
        </div>
        <div class="col-md-4" id="fechafinreportemerma">
          <q-input
            v-model="fechaFin"
            :label="$t('ui.fecha-final-33d0e8')"
            type="date"
            outlined
            dense
            :rules="[
              (val) => !!val || $t('configuracion.canalesDeVenta.form.required'),
              (val) => validarFechas(val) || $t('ui.fecha-final-debe-ser-mayor-o-igual-a-la-inicial-543555'),
            ]"
          />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <q-btn
          id="btngenerarreportemerma"
          :label="$t('reportes.generate')"
          type="submit"
          color="primary"
          class="q-mr-sm"
        />
        <q-btn
          id="btnvistapreviareportemerma"
          :label="$t('ui.vista-previa-58a2c3')"
          color="secondary"
          @click="mostrarVistaPrevia"
          :disable="!datosFiltrados || datosFiltrados.length === 0"
        />
      </div>
      <div class="row justify-center q-mt-md">
        <div class="col-md-4" id="almacenreportemerma">
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            :label="$t('ui.almacen-3e3724')"
            outlined
            dense
            option-value="idalmacen"
            option-label="almacen"
            emit-value
            map-options
            :rules="[(val) => val >= 0 || $t('configuracion.canalesDeVenta.form.required')]"
          />
        </div>
      </div>
    </q-form>

    <!-- Tabla de resultados -->
    <q-card>
      <div class="table-responsive">
        <BaseFilterableTable
          id="tablareportemerma"
          :title="$t('ui.reporte-de-merma-76246d')"
          ref="tableRef"
          :rows="datosFiltrados"
          :columns="columnas"
          :arrayHeaders="arrayHeaders"
          :no-data-label="$t('ui.no-hay-datos-0f3172')"
          row-key="codigo"
          flat
          bordered
          :loading="cargando"
          :pagination="pagination"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                id="btnverdetallereportemerma"
                dense
                icon="visibility"
                color="blue"
                flat
                @click="showComprobante(props.row)"
              />
            </q-td>
          </template>
        </BaseFilterableTable>
      </div>
    </q-card>

    <q-card-section>
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
    </q-card-section>

    <q-dialog v-model="modalDetalleMerma" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary flex justify-between text-h6 text-white">
          <div>{{ $t('ui.lista-de-productos-f84a55') }}</div>
          <q-btn color="white" icon="close" @click="modalDetalleMerma = false" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="productosDetalleMerma"
            :columns="columnsMerma"
            row-key="id"
            flat
            bordered
            dense
          >
            <template v-slot:body-cell-cantidad="props">
              <q-td :props="props">{{ props.row.cantidad }}</q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('ui.cerrar-4b0816')" color="primary" @click="modalDetalleMerma = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { PDF_REPORTE_MERMA } from 'src/utils/pdfReportGenerator'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const idusuario = idusuario_md5()
//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)
const tableRef = ref(null)

const $q = useQuasar()
const cargando = ref(false)

//modal Extravio
const modalDetalleMerma = ref(false)
const productosDetalleMerma = ref([])
const columnsMerma = [
  { name: 'index', label: i18nT('cotizacion.table.number'), field: 'index', align: 'left', dataType: 'number' },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left', dataType: 'text' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'center', dataType: 'text' },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    field: 'descripcion',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'caracteristica',
    label: i18nT('configProducto.caracteristicaProducto.table.nombre'),
    field: 'caracteristica',
    align: 'left',
    dataType: 'text',
  },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), field: 'cantidad', align: 'right', dataType: 'number' },
  {
    name: 'codigolote',
    label: i18nT('ui.codigo-lote-04fcf6'),
    field: 'codigolote',
    align: 'center',
    dataType: 'text',
  },
]

// Datos del formulario
const fechaInicio = ref('')
const fechaFin = ref('')
const almacenSeleccionado = ref(null)
const almacenesOptions = ref([])

// Datos del reporte
const datosOriginales = ref([])
const datosFiltrados = ref([])

// Información del usuario y empresa
const usuario = ref({})
const empresa = ref({})
const tipo = { 1: 'Autorizado', 2: 'No autorizado' }

// Configuración de la tabla
const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'index', align: 'left', dataType: 'number' },
  { name: 'fecha', label: i18nT('ui.fecha-c01a46'), field: 'fecha', align: 'left', dataType: 'date' },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left', dataType: 'text' },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    field: 'descripcion',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'autorizacion',
    label: i18nT('ui.autorizacion-f525a8'),
    field: 'autorizacion',
    align: 'left',
    dataType: 'text',
  },
  { name: 'actions', label: i18nT('configGeneral.divisas.table.options'), field: 'actions', align: 'left' },
]

const arrayHeaders = ['numero', 'fecha', 'almacen', 'descripcion', 'autorizacion']

const pagination = {
  rowsPerPage: 10,
}

// Computed properties
const nombreAlmacenSeleccionado = computed(() => {
  const almacen = almacenesOptions.value.find((a) => a.idalmacen === almacenSeleccionado.value)
  return almacen ? almacen.almacen : ''
})
watch(almacenSeleccionado, (newVal) => {
  filtrarYOrdenarDatos(newVal)
})
function filtrarYOrdenarDatos(dato) {
  if (Number(dato) === 0) {
    datosFiltrados.value = [...datosOriginales.value]
  } else {
    datosFiltrados.value = datosOriginales.value.filter((u) => String(u.idalmacen) === String(dato))
  }
}
// Métodos
const validarFechas = (fechaFinValue) => {
  if (!fechaInicio.value || !fechaFinValue) return true
  return new Date(fechaInicio.value) <= new Date(fechaFinValue)
}

const cargarAlmacenes = async () => {
  try {
    const contenidousuario = validarUsuario()
    if (!contenidousuario || !contenidousuario[0]) {
      throw new Error('Usuario no válido')
    }

    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const idusuario = contenidousuario[0]?.idusuario

    if (!idempresa) {
      throw new Error('Empresa no válida')
    }

    const endpoint = `listaResponsableAlmacenReportes/${idempresa}`
    const response = await api.get(endpoint)
    console.log(response.data)
    const resultado = response.data
    if (resultado[0] === 'error') {
      throw new Error(resultado.error)
    }

    // Filtrar almacenes del usuario actual y agregar opción "Todos"
    const userAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
    almacenesOptions.value = [{ idalmacen: 0, almacen: 'Todos los almacenes' }, ...userAlmacenes]

    // Seleccionar "Todos los almacenes" por defecto
    almacenSeleccionado.value = 0
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-cargar-los-almacenes-5919ff'),
      caption: error.message,
    })
  }
}

const generarReporte = async () => {
  try {
    if (!fechaInicio.value || !fechaFin.value || almacenSeleccionado.value === null) {
      $q.notify({
        type: 'warning',
        message: i18nT('configProducto.configuracionProductoUnico.messages.error'),
        caption: i18nT('ui.ingrese-todos-los-datos-necesarios-0aff9f'),
      })
      return
    }

    cargando.value = true

    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    if (!idempresa) {
      throw new Error('Empresa no válida')
    }
    const point = `reportemerma/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
    const resp = await api.get(`${point}`)

    const data = resp.data
    console.log(data)
    datosFiltrados.value = data.map((item, index) => ({
      index: index + 1,
      fecha: cambiarFormatoFecha(item.fecha),
      almacen: item.almacen,
      descripcion: item.descripcion,
      autorizacion: tipo[item.autorizacion],
      idalmacen: item.idalmacen,
      id: item.idmerma,
    }))
    datosOriginales.value = JSON.parse(JSON.stringify(datosFiltrados.value))

    // Guardar información del usuario y empresa para el PDF
    usuario.value = contenidousuario[0]
    empresa.value = contenidousuario[0]?.empresa || {}
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-generar-el-reporte-01d807'),
      caption: error.message,
    })
  } finally {
    cargando.value = false
  }
}

const mostrarVistaPrevia = () => {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: i18nT('configProducto.configuracionProductoUnico.messages.error'),
      caption: i18nT('ui.no-se-genero-ningun-reporte-816b8f'),
    })
    return
  }
  const datosExportar = tableRef.value?.obtenerDatosFiltrados() || datosFiltrados.value
  const doc = PDF_REPORTE_MERMA(datosExportar, {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    almacen: nombreAlmacenSeleccionado.value,
    empresa: empresa.value,
    usuario: usuario.value,
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Función de validación de usuario (simplificada)
const showComprobante = async (item) => {
  try {
    const response = await api.get(`listaDetallemerma/${item.id}`)
    console.log(response.data)
    productosDetalleMerma.value = response.data.map((obj, index) => {
      return {
        index: index + 1,
        ...obj,
      }
    })

    modalDetalleMerma.value = true
  } catch (error) {
    console.error('Error al cargar comprobante:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-cargar-comprobante-7d80b6'),
    })
  }
}
// Inicialización
onMounted(() => {
  // Establecer fechas por defecto (hoy)
  const hoy = new Date().toISOString().split('T')[0]
  fechaInicio.value = primerDiaDelMes().toISOString().slice(0, 10)
  fechaFin.value = hoy

  // Cargar almacenes
  cargarAlmacenes()

  // Validar usuario
  const usuarioData = validarUsuario()
  if (usuarioData && usuarioData[0]) {
    usuario.value = usuarioData[0]
    empresa.value = usuarioData[0]?.empresa || {}
  }
})
</script>

<style scoped>
.invoice {
  position: relative;
  background-color: var(--cm-surface);
  min-height: 680px;
  padding: 15px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #3989c6;
}

.invoice .company-details {
  text-align: right;
}

.invoice .company-details .name {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .contacts {
  margin-bottom: 20px;
}

.invoice .invoice-to {
  text-align: left;
}

.invoice .invoice-details {
  text-align: right;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 5px;
  background: var(--cm-surface);
  border-bottom: 1px solid var(--cm-border);
  text-align: center;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 12px;
  background: #eee;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}
</style>
