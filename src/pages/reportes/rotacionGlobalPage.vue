<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <div class="titulo">Reporte de Índice de Rotación Global</div>
    <div class="row justify-center q-col-gutter-md">
      <div class="col-md-4">
        <q-input
          v-model="fechaInicio"
          label="Fecha Inicial*"
          type="date"
          outlined
          dense
          @update:model-value="validarFechas"
        />
      </div>
      <div class="col-md-4">
        <q-input
          v-model="fechaFin"
          label="Fecha Final*"
          type="date"
          outlined
          dense
          @update:model-value="validarFechas"
        />
      </div>
    </div>

    <div class="row justify-center q-mt-sm">
      <q-btn
        label="Generar reporte"
        color="primary"
        class="q-mr-sm"
        @click="generarReporte"
        :disable="!fechasValidas"
      />
      <q-btn
        label="Vista previa del Reporte"
        color="primary"
        @click="mostrarVistaPrevia"
        :disable="!datosFiltrados || datosFiltrados.length === 0"
      />
    </div>

    <!-- Tabla de resultados -->
    <q-table
      :rows="datosFiltrados"
      :columns="columnas"
      row-key="codigo"
      flat
      bordered
      :pagination="pagination"
    >
      <template v-slot:body-cell-rotacion="props">
        <q-td :props="props">
          {{ props.row.r }}
        </q-td>
      </template>
    </q-table>

    <!-- Modal de vista previa PDF -->
    <q-dialog v-model="modalVistaPrevia" full-width persistent>
      <q-card style="min-width: 800px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">REPORTE DE ÍNDICE DE ROTACIÓN GLOBAL</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section id="reportePDF">
          <div class="invoice overflow-auto">
            <div style="min-width: 600px">
              <header>
                <div class="row">
                  <div class="col company-details">
                    <h6 class="name">
                      <p>
                        <strong>{{ empresa.nombre }}</strong>
                      </p>
                    </h6>
                    <div>
                      <strong>{{ empresa.direccion }}</strong>
                    </div>
                    <div>
                      <strong>{{ empresa.telefono }}</strong>
                    </div>
                  </div>

                  <div class="col text-center">
                    <h6 class="text-center">
                      <strong>REPORTE DE INDICE DE ROTACION GLOBAL</strong>
                    </h6>
                    <div class="col-form-label text-center">
                      Entre <span>{{ cambiarFormatoFecha(fechaInicio) }}</span> Y
                      <span>{{ cambiarFormatoFecha(fechaFin) }}</span>
                    </div>
                  </div>

                  <div class="col text-right">
                    <img :src="empresa.logo" width="130" height="130" />
                  </div>
                </div>
              </header>

              <main>
                <div class="row contacts">
                  <div class="col invoice-to">
                    <div><strong>DATOS DEL REPORTE:</strong></div>
                    <div class="date">
                      <strong>Fecha de Impresión:</strong> {{ fechaActualFormateada }}
                    </div>
                  </div>
                  <div class="col invoice-details">
                    <div><strong>DATOS DEL ENCARGADO:</strong></div>
                    <div>{{ usuario.nombre }}</div>
                    <div class="date">{{ usuario.cargo }}</div>
                  </div>
                </div>

                <table class="table" border="0" cellspacing="0" cellpadding="0">
                  <thead class="table-success">
                    <tr>
                      <th>N°</th>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cant. ventas</th>
                      <th>Inv.externo</th>
                      <th>Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in datosFiltrados" :key="item.codigo">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.codigo }}</td>
                      <td>{{ item.producto }}</td>
                      <td>{{ item.categoria }}</td>
                      <td>{{ item.descripcion }}</td>
                      <td>{{ item.unidad }}</td>
                      <td>{{ item.cantidadventas }}</td>
                      <td>{{ item.cantidadIE }}</td>
                      <td>{{ calcularRotacion(item) }}</td>
                    </tr>
                  </tbody>
                </table>
              </main>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="secondary" v-close-popup />
          <q-btn label="Descargar PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
import { html2pdf } from 'html2pdf.js'
import { cambiarFormatoFecha, validarUsuario } from 'src/composables/FuncionesG'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { PDF_REPORTE_DE_ROTACION_POR_GLOBAL } from 'src/utils/pdfReportGenerator'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
const usuarioValido = validarUsuario()
const idempresa = idempresa_md5()

//pdf
const pdfData = ref(null)
const mostrarModal = ref(false)

const $q = useQuasar()
const fechaInicio = ref('')
const fechaFin = ref('')
const datosOriginales = ref([])
const datosFiltrados = ref([])
const modalVistaPrevia = ref(false)
const empresa = ref({})
const usuario = ref({})

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'cantidadventas', label: 'Cant. ventas', field: 'cantidadventas', align: 'right' },
  { name: 'cantidadIE', label: 'Inv.externo', field: 'cantidadIE', align: 'right' },
  { name: 'rotacion', label: 'Rotación', field: 'rotacion', align: 'right' },
]

const pagination = {
  rowsPerPage: 10,
}

const fechasValidas = computed(() => {
  return (
    fechaInicio.value && fechaFin.value && new Date(fechaInicio.value) <= new Date(fechaFin.value)
  )
})

const fechaActualFormateada = computed(() => {
  return cambiarFormatoFecha(new Date().toISOString().split('T')[0])
})

onMounted(() => {
  const usuarioData = JSON.parse(localStorage.getItem('usuario'))
  if (usuarioData) {
    usuario.value = usuarioData
    empresa.value = usuarioData.empresa
  }

  // Establecer fecha por defecto (hoy)
  const hoy = new Date().toISOString().split('T')[0]
  fechaInicio.value = primerDiaDelMes().toISOString().slice(0, 10)
  fechaFin.value = hoy
})

function calcularDias() {
  const date1 = new Date(fechaInicio.value)
  const date2 = new Date(fechaFin.value)
  const difference = date2.getTime() - date1.getTime()
  return difference / (1000 * 3600 * 24) + 1
}

function calcularRotacion(item) {
  const days = calcularDias()
  return ((item.cantidadventas - item.cantidadIE) / days).toFixed(2)
}

function validarFechas() {
  if (fechaInicio.value && fechaFin.value) {
    const inicio = new Date(fechaInicio.value)
    const fin = new Date(fechaFin.value)

    if (inicio > fin) {
      $q.notify({
        type: 'negative',
        message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
      })
      fechaFin.value = fechaInicio.value
    }
  }
}

async function generarReporte() {
  try {
    if (!fechasValidas.value) {
      $q.notify({
        type: 'warning',
        message: 'Ingrese todas las fechas válidas',
      })
      return
    }

    const point = `reporteindicerotacionglobal/${idempresa}/${fechaInicio.value}/${fechaFin.value}`
    console.log(point)
    const response = await api.get(`${point}`)
    console.log(response.data)
    datosOriginales.value = response.data
    datosFiltrados.value = response.data.map((item, index) => ({
      ...item,
      index: index + 1,
      r: calcularRotacion(item),
    }))

    $q.notify({
      type: 'positive',
      message: 'Reporte generado con éxito',
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  }
}

function mostrarVistaPrevia() {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se generó ningún reporte',
    })
    return
  }
  const doc = PDF_REPORTE_DE_ROTACION_POR_GLOBAL(datosFiltrados.value, {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    almacen: 'GLOBAL',

    usuario: usuarioValido[0],
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

function descargarPDF() {
  const element = document.getElementById('reportePDF')
  const opt = {
    margin: 0.5,
    filename: `Reporte de Indice Rotacion Global ${fechaActualFormateada.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  // Necesitarás importar html2pdf.js en tu proyecto
  html2pdf().set(opt).from(element).save()
}
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

.invoice .contacts {
  margin-bottom: 20px;
}

.invoice .invoice-to {
  text-align: left;
}

.invoice .invoice-details {
  text-align: right;
}

.table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.table th {
  padding: 5px;
  background: #3989c6;
  color: #fff;
  border-bottom: 1px solid #fff;
}

.table td {
  padding: 8px;
  background: #fff;
  border-bottom: 1px solid #e3e3e3;
}

.table-hover tbody tr:hover td {
  background: #f0f0f0;
}
</style>
