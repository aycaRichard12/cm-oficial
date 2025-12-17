<template>
  <q-page class="q-pa-md">
    <div class="titulo">Reporte de Índice de Rotación por Almacén</div>

    <q-form @submit.prevent="generarReporte">
      <div class="row q-col-gutter-md">
        <div class="col-md-4">
          <q-input
            v-model="fechaInicio"
            label="Fecha Inicial*"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-md-4">
          <q-input
            v-model="fechaFin"
            label="Fecha Final*"
            type="date"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Campo obligatorio',
              (val) => validarFechas(val) || 'Fecha final debe ser mayor o igual a la inicial',
            ]"
          />
        </div>
        <div class="col-md-4">
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            label="Almacén*"
            outlined
            dense
            option-value="idalmacen"
            option-label="almacen"
            emit-value
            map-options
            :rules="[(val) => val >= 0 || 'Campo obligatorio']"
          />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <q-btn label="Generar Reporte" type="submit" color="primary" class="q-mr-sm" />
        <q-btn
          label="Vista Previa"
          color="secondary"
          @click="mostrarVistaPrevia"
          :disable="!datosFiltrados || datosFiltrados.length === 0"
        />
      </div>
    </q-form>

    <!-- Tabla de resultados -->
    <q-card>
      <div class="table-responsive">
        <q-table
          :rows="datosFiltrados"
          :columns="columnas"
          row-key="codigo"
          flat
          bordered
          :loading="cargando"
          :pagination="pagination"
        >
          <template v-slot:body-cell-rotacion="props">
            <q-td :props="props">
              {{ props.row.r }}
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>

    <q-card-section>
      <q-dialog v-model="mostrarModal" full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Vista previa de PDF</div>
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { PDF_REPORTE_DE_ROTACION_POR_ALMACEN } from 'src/utils/pdfReportGenerator'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)

const $q = useQuasar()
const cargando = ref(false)

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

// Configuración de la tabla
const columnas = [
  { name: 'numero', label: 'N°', field: (row) => row.index, align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: 'Cant. ventas', field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: 'Inv. externo', field: 'cantidadIE', align: 'right' },
  { name: 'rotacion', label: 'Rotación', field: 'rotacion', align: 'right' },
]

const pagination = {
  rowsPerPage: 10,
}

// Computed properties
const nombreAlmacenSeleccionado = computed(() => {
  const almacen = almacenesOptions.value.find((a) => a.idalmacen === almacenSeleccionado.value)
  return almacen ? almacen.almacen : ''
})

// Métodos
const validarFechas = (fechaFinValue) => {
  if (!fechaInicio.value || !fechaFinValue) return true
  return new Date(fechaInicio.value) <= new Date(fechaFinValue)
}

const calcularRotacion = (item) => {
  if (!fechaInicio.value || !fechaFin.value) return 0

  const date1 = new Date(fechaInicio.value)
  const date2 = new Date(fechaFin.value)

  date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset())
  date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset())

  const differences = date2.getTime() - date1.getTime()
  const dayss = differences / (1000 * 3600 * 24) + 1

  return ((item.cantidadventas - item.cantidadIE) / dayss).toFixed(2)
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
      message: 'Error al cargar los almacenes',
      caption: error.message,
    })
  }
}

const generarReporte = async () => {
  try {
    if (!fechaInicio.value || !fechaFin.value || almacenSeleccionado.value === null) {
      $q.notify({
        type: 'warning',
        message: 'Error',
        caption: 'Ingrese todos los datos necesarios',
      })
      return
    }

    cargando.value = true

    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    if (!idempresa) {
      throw new Error('Empresa no válida')
    }
    const point = `reporteindicerotacionalmacen/${almacenSeleccionado.value}/${fechaInicio.value}/${fechaFin.value}`
    const resp = await api.get(`${point}`)

    const data = resp.data
    console.log(data)
    datosOriginales.value = data
    datosFiltrados.value = data.map((item, index) => ({
      ...item,
      index: index + 1,
      r: calcularRotacion(item),
    }))

    // Guardar información del usuario y empresa para el PDF
    usuario.value = contenidousuario[0]
    empresa.value = contenidousuario[0]?.empresa || {}
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
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
      message: 'Error',
      caption: 'No se generó ningún reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_ALMACEN(datosFiltrados.value, {
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
  background-color: #fff;
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
  background: #fff;
  border-bottom: 1px solid #ddd;
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
