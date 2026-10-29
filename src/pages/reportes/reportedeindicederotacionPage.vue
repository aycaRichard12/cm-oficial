<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row justify-center q-col-gutter-md">
          <div class="col-md-4">
            <q-input
              v-model="fechaInicio"
              :label="$t('ui.fecha-inicial-2b461a')"
              type="date"
              outlined
              dense
              @update:model-value="validarFechas"
            />
          </div>
          <div class="col-md-4">
            <q-input
              v-model="fechaFin"
              :label="$t('ui.fecha-final-33d0e8')"
              type="date"
              outlined
              dense
              @update:model-value="validarFechas"
            />
          </div>
        </div>

        <div class="row justify-center q-mt-sm">
          <q-btn
            :label="$t('ui.generar-reporte-eeafce')"
            color="primary"
            class="q-mr-sm"
            @click="generarReporte"
            :disable="!fechasValidas"
          />
          <q-btn
            :label="$t('ui.vista-previa-del-reporte-60d956')"
            color="primary"
            @click="mostrarVistaPrevia"
            :disable="!datosFiltrados || datosFiltrados.length === 0"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de resultados -->
    <q-card v-if="datosFiltrados && datosFiltrados.length > 0">
      <q-table
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="codigo"
        flat
        bordered
        dense
        :pagination="pagination"
      >
        <template v-slot:body-cell-rotacion="props">
          <q-td :props="props">
            {{ calcularRotacion(props.row) }}
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de vista previa PDF -->
    <q-dialog v-model="modalVistaPrevia" full-width persistent>
      <q-card style="min-width: 800px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ui.reporte-de-indice-de-rotacion-global-3b74f4') }}</div>
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
                      <strong>{{ $t('ui.reporte-de-indice-de-rotacion-global-35b273') }}</strong>
                    </h6>
                    <div class="col-form-label text-center">
                      {{ $t('ui.entre-4ea354') }} <span>{{ formatearFecha(fechaInicio) }}</span> {{ $t('ui.y-2b1f3c') }}
                      <span>{{ formatearFecha(fechaFin) }}</span>
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
                    <div><strong>{{ $t('ui.datos-del-reporte-c7e471') }}</strong></div>
                    <div class="date">
                      <strong>{{ $t('ui.fecha-de-impresion-709027') }}</strong> {{ fechaActualFormateada }}
                    </div>
                  </div>
                  <div class="col invoice-details">
                    <div><strong>{{ $t('ui.datos-del-encargado-6be170') }}</strong></div>
                    <div>{{ usuario.nombre }}</div>
                    <div class="date">{{ usuario.cargo }}</div>
                  </div>
                </div>

                <table class="table" border="0" cellspacing="0" cellpadding="0">
                  <thead class="table-success">
                    <tr>
                      <th>{{ $t('cotizacion.table.number') }}</th>
                      <th>{{ $t('ui.codigo-c35510') }}</th>
                      <th>{{ $t('inventario.product') }}</th>
                      <th>{{ $t('configProducto.categoriaProducto.types.categoria') }}</th>
                      <th>{{ $t('configuracion.servicios.table.descripcion') }}</th>
                      <th>{{ $t('configProducto.unidadProducto.table.nombre') }}</th>
                      <th>{{ $t('ui.cant-ventas-651db0') }}</th>
                      <th>{{ $t('ui.extension-inventory-4c0f1a') }}</th>
                      <th>{{ $t('ui.rotacion-fb6a5f') }}</th>
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
          <q-btn :label="$t('ui.cerrar-4b0816')" color="secondary" v-close-popup />
          <q-btn :label="$t('ui.descargar-pdf-40863e')" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { html2pdf } from 'html2pdf.js'
import { withLightCapture } from 'src/utils/with-light-capture'
export default {
  setup() {
    const $q = useQuasar()
    const fechaInicio = ref('')
    const fechaFin = ref('')
    const datosOriginales = ref([])
    const datosFiltrados = ref([])
    const modalVistaPrevia = ref(false)
    const empresa = ref({})
    const usuario = ref({})

    const columnas = [
      { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
      { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
      { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left' },
      { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left' },
      { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
      { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left' },
      { name: 'cantidadventas', label: i18nT('ui.cant-ventas-651db0'), field: 'cantidadventas', align: 'right' },
      { name: 'cantidadIE', label: i18nT('ui.extension-inventory-4c0f1a'), field: 'cantidadIE', align: 'right' },
      { name: 'rotacion', label: i18nT('ui.rotacion-fb6a5f'), field: 'rotacion', align: 'right' },
    ]

    const pagination = {
      rowsPerPage: 10,
    }

    const fechasValidas = computed(() => {
      return (
        fechaInicio.value &&
        fechaFin.value &&
        new Date(fechaInicio.value) <= new Date(fechaFin.value)
      )
    })

    const fechaActualFormateada = computed(() => {
      return formatearFecha(new Date().toISOString().split('T')[0])
    })

    onMounted(() => {
      const usuarioData = JSON.parse(localStorage.getItem('usuario'))
      if (usuarioData) {
        usuario.value = usuarioData
        empresa.value = usuarioData.empresa
      }

      // Establecer fecha por defecto (hoy)
      const hoy = new Date().toISOString().split('T')[0]
      fechaInicio.value = hoy
      fechaFin.value = hoy
    })

    function formatearFecha(fecha) {
      return date.formatDate(fecha, 'DD/MM/YYYY')
    }

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
            message: i18nT('ui.la-fecha-de-inicio-no-puede-ser-mayor-que-la-fecha-d-32b79c'),
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
            message: i18nT('ui.ingrese-todas-las-fechas-validas-7cd759'),
          })
          return
        }

        const usuarioData = JSON.parse(localStorage.getItem('usuario'))
        const idusuario = usuarioData?.idusuario

        const response = await api.get(
          `api/reporteindicerotacionglobal/${idusuario}/${fechaInicio.value}/${fechaFin.value}`,
        )

        datosOriginales.value = response.data
        datosFiltrados.value = response.data.map((item, index) => ({
          ...item,
          numero: index + 1,
        }))

        $q.notify({
          type: 'positive',
          message: i18nT('ui.reporte-generado-con-exito-73ac5d'),
        })
      } catch (error) {
        console.error('Error al generar reporte:', error)
        $q.notify({
          type: 'negative',
          message: i18nT('ui.error-al-generar-el-reporte-01d807'),
        })
      }
    }

    function mostrarVistaPrevia() {
      if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
        $q.notify({
          type: 'info',
          message: i18nT('ui.no-se-genero-ningun-reporte-816b8f'),
        })
        return
      }
      modalVistaPrevia.value = true
    }

    async function descargarPDF() {
      const element = document.getElementById('reportePDF')
      const opt = {
        margin: 0.5,
        filename: `Reporte de Indice Rotacion Global ${fechaActualFormateada.value}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }

      await withLightCapture(element, () => html2pdf().set(opt).from(element).save())
    }

    return {
      fechaInicio,
      fechaFin,
      datosOriginales,
      datosFiltrados,
      modalVistaPrevia,
      empresa,
      usuario,
      columnas,
      pagination,
      fechasValidas,
      fechaActualFormateada,
      formatearFecha,
      calcularRotacion,
      validarFechas,
      generarReporte,
      mostrarVistaPrevia,
      descargarPDF,
    }
  },
}
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
  color: var(--cm-on-primary);
  border-bottom: 1px solid var(--cm-on-primary);
}

.table td {
  padding: 8px;
  background: var(--cm-surface);
  border-bottom: 1px solid var(--cm-border);
}

.table-hover tbody tr:hover td {
  background: var(--cm-surface-2);
}
</style>
