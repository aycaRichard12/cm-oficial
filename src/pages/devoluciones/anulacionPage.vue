<template>
  <q-page class="q-pa-md">
    <!-- Contenedor principal con tabs -->
    <q-tabs v-model="tab" align="left" class="text-primary">
      <q-tab name="validas" label="Válidas" />
      <q-tab name="anuladas" label="Anuladas" />
      <q-tab name="devueltas" label="Devueltas" />
      <q-tab v-if="showDevolucionDetail" name="detalleDevolucion" label="Detalle Devolución" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- Panel de ventas válidas -->
      <q-tab-panel name="validas">
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3">
            <label for="almacen">Almacén</label>
            <q-select
              v-model="filtroAlmacen"
              :options="almacenesOptions"
              id="almacen"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <label for="tipoventa">Tipo de venta</label>
            <q-select
              v-model="filtroTipo"
              :options="tiposVentaOptions"
              id="tipoventa"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              class="col"
            />
          </div>

          <div class="col-12 col-md-6 flex justify-end">
            <div class="col-6 col-md-4">
              <label for="buscar">Buscar...</label>
              <q-input v-model="busquedaValidas" id="buscar" dense outlined clearable>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>

                <template v-slot:after>
                  <q-select
                    v-model="columnaBusquedaValidas"
                    :options="columnasBusquedaValidas"
                    label="Columna"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    dense
                    style="min-width: 120px"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <q-table
          title="Ventas Validas"
          :rows="ventasValidasFiltradas"
          :columns="columnasValidas"
          row-key="id"
          :filter="busquedaValidas"
          :filter-method="filtrarValidas"
          :loading="cargando"
          flat
          dense
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-select
                v-model="props.row.accionSeleccionada"
                :options="
                  Number(props.row.tipoventa) == 0 ? opcionesAccionSimple : opcionesAccionCompleta
                "
                label="Acción"
                dense
                emit-value
                map-options
                @update:model-value="handleAccion(props.row)"
                style="min-width: 150px"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-ver="props">
            <q-td :props="props">
              <div>
                <q-btn
                  icon="picture_as_pdf"
                  color="negative"
                  dense
                  round
                  flat
                  title="Generar Comprobante PDF"
                  @click="generarComprobantePDF(props.row)"
                />
                <q-btn
                  v-if="Number(props.row.tipoventa > 0)"
                  icon="receipt_long"
                  dense
                  rounded=""
                  flat=""
                  color="blue"
                  title="Ver Factura"
                  @click="verFactura(props.row.shortlink)"
                />
                <q-btn
                  v-if="Number(props.row.tipoventa > 0)"
                  icon="policy"
                  dense=""
                  rounded=""
                  flat=""
                  color="warning"
                  title="Ver Factura Siat"
                  @click="verFacturaSIAT(props.row.urlsin)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Panel de ventas anuladas -->
      <q-tab-panel name="anuladas">
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3">
            <label for="almacen">Almacén</label>
            <q-select
              v-model="filtroAlmacen"
              :options="almacenesOptions"
              id="almacen"
              outlined
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              class="col"
            />
          </div>
          <div class="col-12 col-md-3">
            <label for="tipoventa">Tipo de venta</label>
            <q-select
              v-model="filtroTipo"
              :options="tiposVentaOptions"
              id="tipoventa"
              outlined
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              class="col"
            />
          </div>

          <div class="col-12 col-md-6 flex justify-end">
            <div class="col-12 col-md-4">
              <label for="buscar">Buscar...</label>
              <q-input v-model="busquedaAnuladas" id="buscar" dense outlined clearable>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>

                <template v-slot:after>
                  <q-select
                    v-model="columnaBusquedaAnuladas"
                    :options="columnasBusquedaAnuladas"
                    label="Columna"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    dense
                    style="min-width: 120px"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <q-table
          title="Ventas Anuladas"
          :rows="ventasAnuladasFiltradas"
          :columns="columnasAnuladas"
          row-key="id"
          :filter="busquedaAnuladas"
          :filter-method="filtrarAnuladas"
          :loading="cargando"
          dense
          flat
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-select
                v-model="props.row.accionSeleccionada"
                :options="props.row.tipoventa === 0 ? [] : opcionesEstadoFactura"
                label="Acción"
                dense
                emit-value
                map-options
                @update:model-value="handleAccion(props.row)"
                style="min-width: 150px"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-ver="props">
            <q-td :props="props">
              <div class="q-gutter-xs">
                <template v-if="Number(props.row.tipoventa) <= 0">
                  <q-btn
                    icon="picture_as_pdf"
                    color="negative"
                    dense
                    round
                    flat
                    title="Generar Comprobante PDF"
                    @click="generarComprobantePDF(props.row)"
                  />
                </template>

                <template v-else>
                  <q-btn
                    icon="picture_as_pdf"
                    color="negative"
                    dense
                    round
                    flat
                    title="Generar Comprobante PDF"
                    @click="generarComprobantePDF(props.row)"
                  />
                  <q-btn
                    icon="receipt_long"
                    dense
                    rounded=""
                    flat=""
                    color="blue"
                    title="Ver Factura"
                    @click="verFactura(props.row.shortlink)"
                  />
                  <q-btn
                    icon="policy"
                    dense=""
                    rounded=""
                    flat=""
                    color="warning"
                    title="Ver Factura Siat"
                    @click="verFacturaSIAT(props.row.urlsin)"
                  />
                </template>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Panel de ventas devueltas -->
      <q-tab-panel name="devueltas">
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3">
            <label for="almacen">Almacén</label>
            <q-select
              v-model="filtroAlmacen"
              :options="almacenesOptions"
              id="almacen"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              class="col"
            />
          </div>
          <div class="col-12 col-md-3">
            <label for="tipoventa">Tipo de venta</label>
            <q-select
              v-model="filtroTipo"
              :options="tiposVentaOptions"
              id="tipoventa"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              class="col"
            />
          </div>

          <div class="col-12 col-md-6 flex justify-end">
            <div class="col-12 col-md-6">
              <label for="buscar">Buscar...</label>
              <q-input v-model="busquedaDevueltas" id="buscar" dense outlined clearable>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>

                <template v-slot:after>
                  <q-select
                    v-model="columnaBusquedaDevueltas"
                    :options="columnasBusquedaDevueltas"
                    label="Columna"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    dense
                    style="min-width: 120px"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <q-table
          title="Devoluciones"
          :rows="ventasDevueltasFiltradas"
          :columns="columnasDevueltas"
          row-key="id"
          :filter="busquedaDevueltas"
          :filter-method="filtrarDevueltas"
          :loading="cargando"
          :pagination="pagination"
          flat
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-select
                v-model="props.row.accionSeleccionada"
                :options="props.row.tipoventa === 0 ? [] : opcionesEstadoFactura"
                label="Acción"
                dense
                emit-value
                map-options
                @update:model-value="handleAccion(props.row)"
                style="min-width: 150px"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-ver="props">
            <q-td :props="props">
              <div class="q-gutter-xs">
                <q-btn
                  v-if="Number(props.row.tipoventa) <= 0"
                  icon="picture_as_pdf"
                  color="negative"
                  dense
                  round
                  flat
                  title="Generar Comprobante PDF"
                  @click="generarComprobantePDF(props.row)"
                />
                <template v-else>
                  <q-btn
                    icon="receipt_long"
                    dense
                    rounded=""
                    flat=""
                    color="blue"
                    title="Ver Factura"
                    @click="verFactura(props.row.shortlink)"
                  />
                  <q-btn
                    icon="policy"
                    dense=""
                    rounded=""
                    flat=""
                    color="warning"
                    title="Ver Factura Siat"
                    @click="verFacturaSIAT(props.row.urlsin)"
                  />
                </template>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Panel de detalle de devolución -->
      <q-tab-panel name="detalleDevolucion">
        <div class="q-mb-md">
          <q-btn
            icon="arrow_back"
            label="Volver"
            color="primary"
            @click="tab = 'devueltas'"
            class="q-mb-md"
          />

          <h4 class="text-h6 q-mb-md">Detalle de devolución</h4>

          <q-form @submit="actualizarDetalleDev">
            <div class="row q-col-gutter-md">
              <q-input
                v-model="formDetalleDev.producto"
                label="Producto"
                outlined
                dense
                disable
                class="col-12 col-md-4"
              />

              <q-input
                v-model="formDetalleDev.cantidadTotal"
                label="Cant. Venta"
                outlined
                dense
                disable
                class="col-12 col-md-2"
              />

              <q-input
                v-model="formDetalleDev.cantidadDevuelta"
                label="Cant. Devuelta*"
                outlined
                dense
                type="number"
                :rules="[(val) => val >= 0 || 'Debe ser un número positivo']"
                class="col-12 col-md-2"
              />

              <q-select
                v-model="formDetalleDev.perdida"
                :options="opcionesPerdida"
                label="Pérdida*"
                outlined
                dense
                emit-value
                map-options
                class="col-12 col-md-2"
              />

              <q-input
                v-model="formDetalleDev.cantidadPerdida"
                label="Cant. Pérdida*"
                outlined
                dense
                type="number"
                :rules="[(val) => val >= 0 || 'Debe ser un número positivo']"
                :disable="formDetalleDev.perdida === 2"
                class="col-12 col-md-2"
              />

              <input type="hidden" v-model="formDetalleDev.idDevolucion" />
              <input type="hidden" v-model="formDetalleDev.idDetalle" />
              <input type="hidden" v-model="formDetalleDev.cantidadPerdidaHidden" />

              <div class="col-12">
                <div class="row q-gutter-sm">
                  <q-btn label="Actualizar" type="submit" color="primary" />

                  <q-btn label="Borrar" type="reset" color="primary" flat />

                  <q-space />

                  <q-btn
                    label="Cancelar Devolución"
                    color="negative"
                    @click="eliminarDevolucion(formDetalleDev.idDevolucion)"
                  />

                  <q-btn
                    label="Confirmar Devolución"
                    color="positive"
                    @click="confirmarAutorizarDevolucion(formDetalleDev.idDevolucion)"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </div>

        <q-table
          title="Devoluciones"
          :rows="detallesDevolucion"
          :columns="columnasDetalleDevolucion"
          row-key="id"
          :loading="cargandoDetalle"
          flat
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                icon="edit"
                color="info"
                dense
                round
                @click="editarDetalleDevolucion(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Modal para ver estado de factura -->
    <q-dialog v-model="modalEstadoFactura">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Estado de Factura</div>
        </q-card-section>

        <q-card-section>
          {{ estadoFactura }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para motivo de anulación -->
    <q-dialog v-model="modalMotivoAnulacion" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Motivo de Anulación</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="motivoAnulacionSeleccionado"
            :options="opcionesMotivoAnulacion"
            label="Seleccione un motivo"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="cancelarAnulacion" />
          <q-btn flat label="Confirmar" color="primary" @click="confirmarAnulacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para motivo de devolución -->
    <q-dialog v-model="modalMotivoDevolucion" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Motivo de Devolución</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="motivoDevolucion"
            label="Describa el motivo"
            outlined
            dense
            type="textarea"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="cancelarDevolucion" />
          <q-btn
            flat
            label="Confirmar"
            color="primary"
            @click="
              confirmarDevolucion(motivoDevolucion, ventaADevolver, idusuario, tipo_devolucion)
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para comprobante PDF -->
    <q-dialog v-model="modalComprobantePDF" full-width>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="modalComprobantePDF = false" />
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
    <RegistrarNotaCreditoDebito
      v-if="isVisibleNota"
      :venta="ventaSeleccionada"
      :key="formularioNota"
      @reiniciar="forzarReinicioCarrito"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesG'
import { PDFdetalleVentaInicio } from 'src/utils/pdfReportGenerator'
import RegistrarNotaCreditoDebito from 'src/pages/NotasCreditoDebito/RegistrarNotaCreditoDebito.vue'
import { generarPdfCotizacion } from 'src/utils/pdfReportGenerator'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { getTipoFactura, getToken } from 'src/composables/FuncionesG'
const tipoFactura = getTipoFactura()
const token = getToken()

const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()

// Estado de la aplicación
const tab = ref('validas')
const showDevolucionDetail = ref(false)
const cargando = ref(false)
const cargandoDetalle = ref(false)
//NOTA CREDITO DEBITO
const isVisibleNota = ref(false)
const ventaSeleccionada = ref(null)
const formularioNota = ref(0)
const forzarReinicioCarrito = () => {
  ventaSeleccionada.value = null
  isVisibleNota.value = false // Esto reinicia el componente
}
function abrirModal(venta) {
  console.log(venta)
  formularioNota.value++
  ventaSeleccionada.value = null // ⚠️ Esto reinicia el componente `carritoVenta`
  isVisibleNota.value = true
  ventaSeleccionada.value = venta
}
// Filtros
const filtroAlmacen = ref(0)
const filtroTipo = ref(0)

// Búsquedas
const busquedaValidas = ref('')
const busquedaAnuladas = ref('')
const busquedaDevueltas = ref('')
const columnaBusquedaValidas = ref(0)
const columnaBusquedaAnuladas = ref(0)
const columnaBusquedaDevueltas = ref(0)

// Datos
const ventasValidas = ref([])
const ventasAnuladas = ref([])
const ventasDevueltas = ref([])
const detallesDevolucion = ref([])
const almacenesOptions = ref([])
const tiposVentaOptions = ref([])

// Modales y estados relacionados
const modalEstadoFactura = ref(false)
const estadoFactura = ref('')
const modalMotivoAnulacion = ref(false)
const motivoAnulacionSeleccionado = ref(null)
const ventaAAnular = ref(null)
const cotizacionAAnular = ref(null)
const modalMotivoDevolucion = ref(false)
const motivoDevolucion = ref('')
const ventaADevolver = ref(null)
const pdfData = ref(null)
const modalComprobantePDF = ref(false)
const tipo_devolucion = ref(null)
//DetalleVenta
const detalleVenta = ref([])

// Formulario de detalle de devolución
const formDetalleDev = ref({
  idDevolucion: '',
  idDetalle: '',
  producto: '',
  cantidadTotal: 0,
  cantidadDevuelta: 0,
  perdida: 1,
  cantidadPerdida: 0,
  cantidadPerdidaHidden: 0,
})

// Opciones para selects
const opcionesAccionSimple = ref([
  { label: 'Seleccione', value: '' },
  { label: 'Anulación', value: 1 },
  { label: 'Devolución', value: 2 },
])

const opcionesAccionCompleta = ref([
  { label: 'Seleccione', value: '' },
  { label: 'Anulación', value: 1 },
  { label: 'Devolución', value: 2 },
  { label: 'Ver estado', value: 3 },
])

const opcionesEstadoFactura = ref([
  { label: 'Seleccione', value: '' },

  { label: 'Ver estado', value: 3 },
])

const opcionesMotivoAnulacion = ref([
  { value: 1, label: 'Factura mal emitida' },
  { value: 2, label: 'Nota de crédito/débito mal emitida' },
  { value: 3, label: 'Datos de emisión incorrectos' },
  { value: 4, label: 'Factura o nota de crédito/débito devuelta' },
])

const opcionesPerdida = ref([
  { value: 1, label: 'Si' },
  { value: 2, label: 'No' },
])

// Columnas para las tablas
const columnasValidas = ref([
  { name: 'numero', label: 'N°', field: 'numero', align: 'center', sortable: true },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left', sortable: true },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left', sortable: true },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left', sortable: true },
  { name: 'tipopago', label: 'Tipo pago', field: 'tipopago', align: 'left', sortable: true },
  { name: 'canal', label: 'Canal', field: 'canal', align: 'left', sortable: true },
  { name: 'nfactura', label: 'Nro. factura', field: 'nfactura', align: 'center', sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right', sortable: true },
  { name: 'descuento', label: 'Dscto', field: 'descuento', align: 'right', sortable: true },
  { name: 'montototal', label: 'Monto', field: 'montototal', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
])

const columnasAnuladas = ref([
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecharegistro', label: 'Fecha anulación', field: 'fecharegistro', align: 'center' },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left' },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  { name: 'nfactura', label: 'Nro. factura', field: 'nfactura', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
])

const columnasDevueltas = ref([
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  {
    name: 'fechadevolucion',
    label: 'Fecha devolución',
    field: 'fechadevolucion',
    align: 'center',
  },
  { name: 'fechaventa', label: 'Fecha', field: 'fechaventa', align: 'center' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left' },
  { name: 'tipov', label: 'Tipo venta', field: 'tipov', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  { name: 'nfactura', label: 'Nro. factura', field: 'nfactura', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' },
])

const columnasDetalleDevolucion = ref([
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'cantidad', label: 'Cant. devuelta', field: 'cantidad', align: 'right' },
  {
    name: 'perdida',
    label: 'Pérdida',
    field: (row) => (row.perdida === 1 ? 'Si' : 'No'),
    align: 'center',
  },
  { name: 'cantidadperdida', label: 'Cant. pérdida', field: 'cantidadperdida', align: 'right' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
])

// Opciones de búsqueda
const columnasBusquedaValidas = ref([
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Almacén' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Tipo pago' },
  { value: 7, label: 'Canal' },
  { value: 8, label: 'Nro. factura' },
  { value: 9, label: 'Total' },
  { value: 10, label: 'Dscto' },
  { value: 11, label: 'Monto' },
  { value: 12, label: 'Estado' },
])

const columnasBusquedaAnuladas = ref([
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Fecha anulación' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Motivo' },
  { value: 7, label: 'Nro. factura' },
])

const columnasBusquedaDevueltas = ref([
  { value: 0, label: 'Todas' },
  { value: 1, label: 'Fecha devolución' },
  { value: 2, label: 'Fecha' },
  { value: 3, label: 'Cliente' },
  { value: 4, label: 'Sucursal' },
  { value: 5, label: 'Tipo venta' },
  { value: 6, label: 'Motivo' },
  { value: 7, label: 'Nro. factura' },
])

// Paginación
const pagination = ref({
  rowsPerPage: 20,
})
// const campanasFiltradas = computed(() => {
//   let filtered = campanas.value

//   if (idalmacenfiltro.value) {
//     filtered = filtered.filter((camp) => camp.idalmacen == idalmacenfiltro.value)
//   } else {
//     return []
//   }

//   return filtered.map((item, index) => ({
//     ...item,
//     numero: index + 1,
//   }))
// })
// Computed properties
const ventasValidasFiltradas = computed(() => {
  if (filtroAlmacen.value) {
    return ventasValidas.value
      .filter((v) => filtroAlmacen.value === 0 || v.idalmacen == filtroAlmacen.value)
      .filter((v) => v.tipoventa == filtroTipo.value)
  } else {
    return []
  }
})

const ventasAnuladasFiltradas = computed(() => {
  console.log(filtroTipo.value)

  if (filtroAlmacen.value) {
    return ventasAnuladas.value
      .filter((v) => Number(v.idalmacen) == filtroAlmacen.value)
      .filter((v) => Number(v.tipoventa) == filtroTipo.value)
  } else {
    return []
  }
})

const ventasDevueltasFiltradas = computed(() => {
  console.log(filtroTipo.value)
  if (filtroAlmacen.value) {
    return ventasDevueltas.value
      .filter((v) => v.idalmacen == filtroAlmacen.value)
      .filter((v) => v.tipoventa == filtroTipo.value)
  } else {
    return []
  }
})

// Métodos
const cargarDatosIniciales = async () => {
  cargando.value = true

  try {
    // Obtener datos del usuario

    if (!idempresa) {
      throw new Error('No se pudo obtener la empresa del usuario')
    }

    // Cargar almacenes
    const almacenesResponse = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOptions.value = [
      { value: 0, label: 'Seleccione un Almacén' },
      ...almacenesResponse.data
        .filter((u) => u.idusuario == idusuario)
        .map((key) => ({ value: key.idalmacen, label: key.almacen })),
    ]

    // Cargar tipos de venta
    if (token) {
      const enpoint = `listaLeyendaSIN/tiposector/${token}/${tipoFactura}`
      const tiposResponse = await api.get(enpoint)
      const codigosPermitidos = [0, 1, 2, 3]
      console.log(tiposResponse.data)
      const datosFiltrados = filtrarYEliminarDuplicados(
        [...tiposResponse.data.data],
        codigosPermitidos,
      )
      console.log(datosFiltrados)
      tiposVentaOptions.value = [
        { value: 0, label: 'comprobante de venta' },
        { value: -1, label: 'cotizacion de venta' },
        ...datosFiltrados.map((key) => ({
          value: key.codigoDocumentSector,
          label: key.documentoSector.toLowerCase(),
        })),
      ]
    } else {
      tiposVentaOptions.value = [
        { value: 0, label: 'comprobante de venta' },
        { value: -1, label: 'cotizacion de venta' },
      ]
    }

    // Cargar ventas
    await Promise.all([listarDatos(), listarDatosANU(), listarDatosDEV()])
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos iniciales',
    })
  } finally {
    cargando.value = false
  }
}

const listarDatos = async () => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idempresa = usuario?.empresa?.idempresa

    const response = await api.get(`listaVentas/${idempresa}`)
    console.log(response)
    if (response.data.estado === 'error') {
      throw new Error(response.data.error)
    }

    const tipoventa = {
      1: 'Factura Compra-Venta',
      0: 'S/Factura',
      2: 'Factura Alquileres',
      24: 'NOTA DE CRÉDITO-DÉBITO',
      3: 'Factura Comercial',
    }

    const estado = {
      1: 'completado',
      2: 'anulada',
      3: 'devuelta',
    }

    ventasValidas.value = response.data
      .filter((u) => u.estado != 2 && u.estado != 3)
      .map((key, index) => {
        const total = parseFloat(key.montototal) + parseFloat(key.descuento)

        return {
          ...key,
          numero: index + 1,
          tipov: tipoventa[key.tipoventa],
          estado: estado[key.estado],
          total: total,
          acciones: '',
          accionSeleccionada: '',
        }
      })
  } catch (error) {
    console.error('Error al listar ventas válidas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar ventas válidas',
    })
  }
}

const listarDatosANU = async () => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idempresa = usuario?.empresa?.idempresa

    const response = await api.get(`listadoanulaciones/${idempresa}`)
    console.log(response)

    if (response.data.estado === 'error') {
      throw new Error(response.data.error)
    }

    const tipoventa = {
      1: 'Factura Compra-Venta',
      0: 'S/Factura',
      2: 'Factura Alquileres',
      24: 'NOTA DE CRÉDITO-DÉBITO',
      3: 'Factura Comercial',
    }

    const motivosanulacion = {
      1: 'FACTURA MAL EMITIDA',
      2: 'NOTA DE CREDITO-DEBITO MAL EMITIDA',
      3: 'DATOS DE EMISION INCORRECTOS',
      4: 'FACTURA O NOTA DE CREDITO-DEBITO DEVUELTA',
    }

    ventasAnuladas.value = response.data.map((key, index) => {
      const mot = isNaN(key.motivo) ? key.motivo : motivosanulacion[key.motivo]

      return {
        ...key,
        numero: index + 1,
        tipov: tipoventa[key.tipoventa],
        motivo: mot,
        acciones: '',
        accionSeleccionada: '',
      }
    })
  } catch (error) {
    console.error('Error al listar ventas anuladas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar ventas anuladas',
    })
  }
}

const listarDatosDEV = async () => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idempresa = usuario?.empresa?.idempresa

    const response = await api.get(`listadevolucion/${idempresa}`)
    console.log(response)

    if (response.data.estado === 'error') {
      throw new Error(response.data.error)
    }

    const tipoventa = {
      1: 'Factura Compra-Venta',
      0: 'S/Factura',
      2: 'Factura Alquileres',
      24: 'NOTA DE CRÉDITO-DÉBITO',
      3: 'Factura Comercial',
    }

    ventasDevueltas.value = response.data.map((key, index) => {
      return {
        ...key,
        numero: index + 1,
        tipov: tipoventa[key.tipoventa],
        acciones: '',
        accionSeleccionada: '',
      }
    })
  } catch (error) {
    console.error('Error al listar ventas devueltas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar ventas devueltas',
    })
  }
}

const filtrarValidas = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''
  const col = cols[columnaBusquedaValidas.value]

  if (!lowerTerms || columnaBusquedaValidas.value === 0) {
    return rows
  }

  return rows.filter((row) => {
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const filtrarAnuladas = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''
  const col = cols[columnaBusquedaAnuladas.value]

  if (!lowerTerms || columnaBusquedaAnuladas.value === 0) {
    return rows
  }

  return rows.filter((row) => {
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const filtrarDevueltas = (rows, terms, cols, cellValue) => {
  const lowerTerms = terms ? terms.toLowerCase() : ''
  const col = cols[columnaBusquedaDevueltas.value]

  if (!lowerTerms || columnaBusquedaDevueltas.value === 0) {
    return rows
  }

  return rows.filter((row) => {
    const val = cellValue(col, row)?.toString().toLowerCase() || ''
    return val.includes(lowerTerms)
  })
}

const filtrarYEliminarDuplicados = (datos, codigosPermitidos) => {
  const codigosVistos = new Set()
  return datos.filter((item) => {
    if (
      codigosPermitidos.includes(item.codigoDocumentSector) &&
      !codigosVistos.has(item.codigoDocumentSector)
    ) {
      codigosVistos.add(item.codigoDocumentSector)
      return true
    }
    return false
  })
}

const handleAccion = (row) => {
  console.log(row)
  const value = row.accionSeleccionada
  const dataValue = row.id
  const TipoVenta = Number(row.tipoventa)
  const idventa = Number(row.idventa)
  const tipo = row.tipo
  // Resetear la selección después de manejar la acción
  setTimeout(() => {
    row.accionSeleccionada = ''
  }, 0)
  console.log(value)
  console.log(dataValue)
  console.log(TipoVenta)
  if (value == 1) {
    if (TipoVenta == -1) {
      anularCotizacion(dataValue)
    } else {
      anularVentas(dataValue)
    }
  } else if (value == 2) {
    console.log('Devolución')
    console.log(TipoVenta)
    console.log(dataValue)
    if (TipoVenta == 0) {
      devolucion(dataValue, 'VE')
    } else if (TipoVenta == 1) {
      const rowVenta = {
        idventa: row.id,
        ...row,
      }
      abrirModal(rowVenta)
    } else if (TipoVenta == -1) {
      devolucion(dataValue, 'COT')
    }
  } else if (value == 3) {
    if (TipoVenta == -1) {
      if (tipo == 'cotizacion') {
        estadoCotizacion(dataValue)
      } else {
        estadoCotizacion(idventa)
      }
    } else {
      estadofactura(row.cuf)
    }
  }
}

const anularVentas = (id) => {
  ventaAAnular.value = id
  cotizacionAAnular.value = null

  modalMotivoAnulacion.value = true
}
const anularCotizacion = (id) => {
  cotizacionAAnular.value = id
  ventaAAnular.value = null

  modalMotivoAnulacion.value = true
}
const confirmarAnulacion = async () => {
  if (!motivoAnulacionSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un motivo de anulación',
    })
    return
  }

  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idusuario = usuario?.idusuario
    const token = usuario?.factura?.access_token
    const tipo = usuario?.factura?.tipo

    $q.loading.show({
      message: 'Anulando venta...',
    })
    let response = null
    console.log(ventaAAnular.value)
    console.log(cotizacionAAnular.value)
    console.log(tipo)
    console.log(token)

    if (ventaAAnular.value == null) {
      const endpoint = `anularCotizacion/${cotizacionAAnular.value}/${motivoAnulacionSeleccionado.value}/${idusuario}`
      response = await api.get(`${endpoint}`)
    } else if (cotizacionAAnular.value == null) {
      const endpoint = `cambiarestadoventa/${ventaAAnular.value}/2/${motivoAnulacionSeleccionado.value}/${idusuario}/${token}/${tipo}`
      response = await api.get(`${endpoint}`)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: 'Venta anulada correctamente',
      })

      // Recargar datos
      await Promise.all([listarDatos(), listarDatosANU()])
    } else {
      throw new Error(response.data.error || 'Error al anular la venta')
    }
  } catch (error) {
    console.error('Error al anular venta:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al anular la venta',
    })
  } finally {
    $q.loading.hide()
    modalMotivoAnulacion.value = false
    motivoAnulacionSeleccionado.value = null
    ventaAAnular.value = null
  }
}

const cancelarAnulacion = () => {
  modalMotivoAnulacion.value = false
  motivoAnulacionSeleccionado.value = null
  ventaAAnular.value = null
}

const estadofactura = async (cuf) => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const token = usuario?.factura?.access_token
    const tipo = usuario?.factura?.tipo

    $q.loading.show({
      message: 'Validando estado de factura...',
    })

    const response = await api.get(`estadofactura/${cuf}/${token}/${tipo}`)
    console.log(response)
    if (response.data.status === 'success') {
      estadoFactura.value = response.data.data.estado
      modalEstadoFactura.value = true
    } else {
      throw new Error(response.data.error || 'Error al verificar estado')
    }
  } catch (error) {
    console.error('Error al verificar estado de factura:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al verificar estado de factura',
    })
  } finally {
    $q.loading.hide()
  }
}
const estadoCotizacion = async (idcotizacion) => {
  try {
    $q.loading.show({
      message: 'Validando estado ...',
    })

    const response = await api.get(`estadoCotizacion/${idcotizacion}`)
    console.log(response)
    if (response.data.status === 'success') {
      estadoFactura.value = response.data.data.condicion
      modalEstadoFactura.value = true
    } else {
      throw new Error(response.data.error || 'Error al verificar condicion')
    }
  } catch (error) {
    console.error('Error al verificar condicion de factura:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al verificar condicion de factura',
    })
  } finally {
    $q.loading.hide()
  }
}

const devolucion = async (id, codigo) => {
  console.log(id)
  console.log(codigo)
  try {
    const response = await api.get(`verificardevolucion/${id}/${codigo}`)
    console.log(response.data)

    if (response.data.estado === 100) {
      if (response.data.codigo === 1) {
        // Ya existe una devolución en proceso
        $q.notify({
          type: 'info',
          message: 'Su registro de devolución se inició. Debe concluir con los pasos siguientes...',
        })

        // Mostrar detalle de devolución
        showDevolucionDetail.value = true
        tab.value = 'detalleDevolucion'
        formDetalleDev.value.idDevolucion = response.data.id
        await listarDatosDetalleDevolucion(response.data.id)
      } else {
        // Crear nueva devolución
        tipo_devolucion.value = codigo
        ventaADevolver.value = id
        modalMotivoDevolucion.value = true
      }
    } else {
      throw new Error(response.data.error || 'Error al verificar devolución')
    }
  } catch (error) {
    console.error('Error al procesar devolución:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al procesar devolución',
    })
  }
}

const confirmarDevolucion = async (motivo, venta, idusuario, tipo) => {
  console.log(motivo)
  if (!motivo) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese un motivo de devolución',
    })
    return
  }

  try {
    $q.loading.show({
      message: 'Registrando devolución...',
    })

    const formData = new FormData()
    formData.append('ver', 'registroDevolucion')
    formData.append('idventa', venta)
    formData.append('motivo', motivo)
    formData.append('idusuario', idusuario)
    formData.append('tipo_dev', tipo)

    for (let [k, v] of formData.entries()) {
      console.log(`${k}: ${v}`)
    }

    const response = await api.post('', formData)
    console.log(response)
    if (response.data.estado === 100) {
      $q.notify({
        type: 'positive',
        message: 'Devolución registrada correctamente',
      })

      // Mostrar detalle de devolución
      showDevolucionDetail.value = true
      tab.value = 'detalleDevolucion'
      formDetalleDev.value.idDevolucion = response.data.id
      await listarDatosDetalleDevolucion(response.data.id)
    } else {
      throw new Error(response.data.error || 'Error al registrar devolución')
    }
  } catch (error) {
    console.error('Error al registrar devolución:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar devolución',
    })
  } finally {
    $q.loading.hide()
    modalMotivoDevolucion.value = false
    motivoDevolucion.value = ''
    ventaADevolver.value = null
  }
}

const cancelarDevolucion = () => {
  modalMotivoDevolucion.value = false
  motivoDevolucion.value = ''
  ventaADevolver.value = null
}

const listarDatosDetalleDevolucion = async (id) => {
  console.log(id)
  cargandoDetalle.value = true

  try {
    const response = await api.get(`listadetalledevolicion/${id}`)
    console.log(response.data)
    if (response.data.estado === 'error') {
      throw new Error(response.data.error)
    }

    detallesDevolucion.value = response.data.map((key, index) => ({
      ...key,
      numero: index + 1,
    }))
  } catch (error) {
    console.error('Error al listar detalle de devolución:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle de devolución',
    })
  } finally {
    cargandoDetalle.value = false
  }
}

const editarDetalleDevolucion = async (row) => {
  try {
    const response = await api.get(`verificarExistenciaDetalledevolucion/${row.id}`)

    if (response.data.estado === 'exito') {
      formDetalleDev.value = {
        idDevolucion: formDetalleDev.value.idDevolucion,
        idDetalle: response.data.datos.id,
        producto: response.data.datos.descripcion,
        cantidadTotal:
          parseInt(response.data.datos.cantidad) + parseInt(response.data.datos.cantidadperdida),
        cantidadDevuelta: response.data.datos.cantidad,
        perdida: response.data.datos.perdida,
        cantidadPerdida: response.data.datos.cantidadperdida,
        cantidadPerdidaHidden: response.data.datos.cantidadperdida,
      }
    }
  } catch (error) {
    console.error('Error al cargar detalle para edición:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle para edición',
    })
  }
}

const actualizarDetalleDev = async () => {
  try {
    $q.loading.show({
      message: 'Actualizando detalle...',
    })

    const formData = new FormData()
    formData.append('ver', 'actualizarDetalleDev')
    formData.append('id', formDetalleDev.value.idDetalle)
    formData.append('cantidad', formDetalleDev.value.cantidadDevuelta)
    formData.append('perdida', formDetalleDev.value.perdida)
    formData.append('cantidadperdida', formDetalleDev.value.cantidadPerdida)

    const response = await api.post('', formData)

    if (response.data.estado === 100) {
      $q.notify({
        type: 'positive',
        message: 'Detalle actualizado correctamente',
      })

      // Limpiar formulario y recargar datos
      formDetalleDev.value = {
        idDevolucion: formDetalleDev.value.idDevolucion,
        idDetalle: '',
        producto: '',
        cantidadTotal: 0,
        cantidadDevuelta: 0,
        perdida: 1,
        cantidadPerdida: 0,
        cantidadPerdidaHidden: 0,
      }

      await listarDatosDetalleDevolucion(formDetalleDev.value.idDevolucion)
    } else {
      throw new Error(response.data.error || 'Error al actualizar detalle')
    }
  } catch (error) {
    console.error('Error al actualizar detalle:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar detalle',
    })
  } finally {
    $q.loading.hide()
  }
}

const eliminarDevolucion = (id) => {
  $q.dialog({
    title: '¿Está seguro?',
    message: 'No podrá recuperar este registro',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show({
        message: 'Eliminando devolución...',
      })

      const response = await api.get(`eliminarDevolucion/${id}`)

      if (response.data.estado === 100) {
        $q.notify({
          type: 'positive',
          message: 'Devolución eliminada con éxito',
        })

        // Volver a la vista principal
        showDevolucionDetail.value = false
        tab.value = 'devueltas'

        // Recargar datos
        await listarDatosDEV()
      } else {
        throw new Error(response.data.error || 'Error al eliminar devolución')
      }
    } catch (error) {
      console.error('Error al eliminar devolución:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar devolución',
      })
    } finally {
      $q.loading.hide()
    }
  })
}

const confirmarAutorizarDevolucion = (id) => {
  $q.dialog({
    title: '¿Está seguro?',
    message: 'Al aceptar el stock de productos se actualizará',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    autorizarDevolucion(id)
  })
}

const autorizarDevolucion = async (id) => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idusuario =
      usuario?.idusuario +
      $q.loading.show({
        message: 'Autorizando devolución...',
      })

    const response = await api.get(`autorizarDevolucion/${id}/1/${idusuario}`)
    console.log(response.data)
    console.log(response)

    if (response.data.estado === 100) {
      $q.notify({
        type: 'positive',
        message: 'Devolución registrada con éxito',
      })

      // Volver a la vista principal
      showDevolucionDetail.value = false
      tab.value = 'devueltas'

      // Recargar datos
      await Promise.all([listarDatos(), listarDatosDEV()])
    } else {
      throw new Error(response.data.error || 'Error al autorizar devolución')
    }
  } catch (error) {
    console.error('Error al autorizar devolución:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al autorizar devolución',
    })
  } finally {
    $q.loading.hide()
  }
}

const generarComprobantePDF = async (row) => {
  console.log(row)
  let id

  if (Number(row.tipoventa) === -1) {
    id = row.tipo === 'cotizacion' ? row.id : row.idventa
  } else {
    id = row.id
  }

  try {
    $q.loading.show({ message: 'Generando comprobante...' })

    const endpoint =
      Number(row.tipoventa) === -1
        ? `detallesCotizacion/${id}/${idempresa}`
        : `detallesVenta/${id}/${idempresa}`

    console.log(endpoint)
    const response = await api.get(endpoint)
    console.log(response)
    const data = response.data

    // Validar respuesta de API
    if (!Array.isArray(data) || data[0] === 'error') {
      const errorMsg = data.error || 'Respuesta inválida del servidor.'
      throw new Error(errorMsg)
    }

    let doc
    if (Number(row.tipoventa) === -1) {
      // 🧾 Generar PDF para COTIZACIÓN
      doc = generarPdfCotizacion(data)
    } else {
      // 🧾 Generar PDF para VENTA
      detalleVenta.value = data
      doc = await PDFdetalleVentaInicio(detalleVenta)
    }

    // Mostrar PDF en modal
    pdfData.value = doc.output('dataurlstring')
    modalComprobantePDF.value = true
  } catch (error) {
    console.error('Error al generar comprobante:', error)
    $q.notify({
      type: 'negative',
      message: `Error al generar comprobante: ${error.message}`,
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

const verFactura = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const verFacturaSIAT = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Funciones de formato

// Watchers
watch(filtroAlmacen, () => {
  listarDatos()
  listarDatosANU()
  listarDatosDEV()
})

watch(filtroTipo, () => {
  listarDatos()
  listarDatosANU()
  listarDatosDEV()
})

// Cargar datos al montar el componente detallesVenta
onMounted(() => {
  cargarDatosIniciales()
})
</script>

<style scoped>
/* Estilos específicos para el componente */
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

.invoice .invoice-to .to {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .invoice-details {
  text-align: right;
}

.invoice .invoice-details .invoice-id {
  margin-top: 0;
  color: #3989c6;
}

.invoice main {
  padding-bottom: 50px;
}

.invoice main .thanks {
  margin-top: -100px;
  font-size: 40px;
  margin-bottom: 50px;
}

.invoice main .notices {
  padding-left: 6px;
  border-left: 6px solid #3989c6;
}

.invoice main .notices .notice {
  font-size: 1.2em;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 15px;
  background: #eee;
  border-bottom: 1px solid #fff;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 16px;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}

.invoice table .total {
  text-align: right;
  font-size: 1.2em;
}

.invoice table .classtd {
  text-align: right;
  font-size: 1.2em;
  background: #fff;
  border-bottom: 0px;
}

.invoice table .no {
  color: #fff;
  font-size: 1.6em;
  background: #3989c6;
}

.invoice table .desc {
  text-align: left;
}

.invoice table .unit {
  background: #ddd;
}

.invoice table .total {
  background: #3989c6;
  color: #fff;
}

.invoice table td.classtd {
  border-bottom: none;
}

.invoice table tbody tr:last-child td {
  border: none;
}

.invoice table tfoot td {
  background: 0 0;
  border-bottom: none;
  white-space: nowrap;
  text-align: right;
  padding: 10px 20px;
  font-size: 1.2em;
  border-top: 1px solid #aaa;
}

.invoice table tfoot tr:first-child td {
  border-top: none;
}

.invoice table tfoot tr:last-child td {
  color: #3989c6;
  font-size: 1.4em;
  border-top: 1px solid #3989c6;
}

.invoice table tfoot tr td:first-child {
  border: none;
}

.invoice footer {
  width: 100%;
  text-align: center;
  color: #777;
  border-top: 1px solid #aaa;
  padding: 8px 0;
}

@media print {
  .invoice {
    font-size: 11px !important;
    overflow: hidden !important;
  }
  .invoice footer {
    position: absolute;
    bottom: 10px;
    page-break-after: always;
  }
  .invoice > div:last-child {
    page-break-before: always;
  }
}
</style>
