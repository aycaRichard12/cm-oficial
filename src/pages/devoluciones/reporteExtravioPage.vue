<template>
  <q-page class="q-pa-md">
    <div class="titulo">Reporte Extravio</div>

    <q-form @submit.prevent="generarReporte">
      <div class="row q-col-gutter-md flex justify-center">
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
      <div class="row justify-center q-mt-md">
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
          <template v-slot:body-cell-opciones="props">
            <q-td :props="props">
              <div class="q-gutter-sm">
                <q-btn
                  icon="visibility"
                  color="blue"
                  dense
                  flat
                  @click="generarComprobante(props.row)"
                />
              </div>
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
    <q-dialog v-model="modalDetalleExtravio" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary flex justify-between text-h6 text-white">
          <div>Lista de Productos</div>
          <q-btn
            color="white"
            icon="close"
            @click="modalDetalleExtravio = false"
            flat
            round
            dense
          />
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="productosDetalleExtravio"
            :columns="columnsExtravio"
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
          <q-btn flat label="Cerrar" color="primary" @click="modalDetalleExtravio = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { PDF_REPORTE_EXTRAVIO } from 'src/utils/pdfReportGenerator'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
const idusuario = idusuario_md5()
//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)

//modal Extravio
const modalDetalleExtravio = ref(false)
const productosDetalleExtravio = ref([])
const columnsExtravio = [
  { name: 'index', label: 'N°', field: 'index', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'caracteristica', label: 'Característica', field: 'caracteristica', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'codigolote', label: 'Código Lote', field: 'codigolote', align: 'center' },
]

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
const tipo = { 1: 'Autorizado', 2: 'No autorizado' }

// Configuración de la tabla
const columnas = [
  { name: 'numero', label: 'N°', field: (row) => row.index, align: 'left' },
  { name: 'fecha', label: 'fecha', field: 'fecha', align: 'left' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'autorizacion', label: 'Autorizacion', field: 'autorizacion', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'left' },
]

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
  console.log(dato)
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
    const point = `reporterobo/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
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
      id: item.idrobo,
    }))
    datosOriginales.value = JSON.parse(JSON.stringify(datosFiltrados.value))

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
  const doc = PDF_REPORTE_EXTRAVIO(datosFiltrados.value, {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    almacen: nombreAlmacenSeleccionado.value,
    empresa: empresa.value,
    usuario: usuario.value,
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const generarComprobante = async (robo) => {
  console.log(robo)
  // Cargar los detalles para el comprobante
  const response = await api.get(`listaDetallerobo/${robo.id}`)
  console.log(response.data)
  productosDetalleExtravio.value = response.data.map((obj, index) => {
    return {
      index: index + 1,
      ...obj,
    }
  })

  modalDetalleExtravio.value = true
}

// Función de validación de usuario (simplificada)

// Inicialización
onMounted(() => {
  // Establecer fechas por defecto (hoy)
  const hoy = new Date().toISOString().split('T')[0]
  fechaInicio.value = primerDiaDelMes().toISOString().slice(0, 10)
  console.log(primerDiaDelMes().toISOString().slice(0, 10))
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
