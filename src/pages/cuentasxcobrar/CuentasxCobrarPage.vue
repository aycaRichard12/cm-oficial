<template>
  <q-page class="q-pa-md">
    <!-- Vista principal -->
    <div v-if="vistaActiva === 'principal'">
      <!-- Filtros superiores -->
      <div class="row q-col-gutter-x-md q-mb-md">
        <!-- Filtro Almacén: se oculta si el usuario solo tiene 1 almacén asignado -->
        <div
          v-if="opcionesAlmacenes.length > 1"
          class="col-12 col-md-3"
          id="filtroalmacencuentasporcobrar"
        >
          <label for="almacen">Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="opcionesAlmacenes"
            id="almacen"
            dense
            outlined
            style="min-width: 200px"
            map-options
            class="q-mr-sm"
          />
        </div>

        <!-- Si solo tiene 1 almacén, mostramos etiqueta informativa -->
        <div v-else-if="opcionesAlmacenes.length === 1" class="col-12 col-md-3">
          <label>Almacén</label>
          <q-input
            :model-value="opcionesAlmacenes[0].label"
            dense
            outlined
            readonly
            class="q-mr-sm"
          />
        </div>

        <div class="col-12 col-md-3" id="filtroestadocuentasporcobrar">
          <label for="estado">Tipo</label>
          <q-select
            v-model="filtroEstado"
            :options="opcionesTipo"
            id="estado"
            dense
            outlined
            map-options
            clearable
          />
        </div>
      </div>

      <!-- Tabla principal -->
      <tablaCuentasxCobrar
        ref="refHijo"
        :rows="datosFiltrados"
        @cargar-formulario="cargarFormulario"
        @mostrar-detalles="mostrarDetalles"
      />
    </div>

    <!-- Formulario de registro de cobro -->
    <q-dialog v-model="mostrarForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">Registrar Cobro</div>
          <q-btn icon="close" flat round dense @click="cerrarFormulario" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="() => registrarCobro(cargarDatos)">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label for="cliente">Cliente</label>
                <q-input v-model="formulario.cliente" id="cliente" dense outlined readonly />
              </div>
              <div class="col-12 col-md-6">
                <label for="fecharegistrocobro">Fecha</label>
                <q-input
                  v-model="formulario.fecha"
                  id="fecharegistrocobro"
                  dense
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="Sucursal">Sucursal</label>
                <q-input v-model="formulario.sucursal" id="Sucursal" dense outlined readonly />
              </div>
              <div class="col-12 col-md-6">
                <label for="nrocobrosregistrocobro">N° Cobros</label>
                <q-input
                  v-model="formulario.numeroCobros"
                  id="nrocobrosregistrocobro"
                  dense
                  outlined
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= formulario.cuotasPendientes ||
                      'No puede ser mayor a cuotas pendientes',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularTotales"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="total">Total venta</label>
                <q-input v-model="formulario.deudaTotal" id="total" dense outlined readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="totalacobrarregistrocobro">Total a Cobrar</label>
                <q-input
                  v-model="formulario.totalCobro"
                  id="totalacobrarregistrocobro"
                  dense
                  outlined
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= parseFloat(formulario.saldoPendiente) || 'No puede ser mayor al saldo',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularNumeroCobros"
                >
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="saldo">Saldo</label>
                <q-input v-model="formulario.saldoPendiente" id="saldo" dense outlined readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="saldoporcobrar">Saldo por Cobrar</label>
                <q-input
                  v-model="formulario.saldoPorCobrar"
                  id="saldoporcobrar"
                  dense
                  outlined
                  readonly
                >
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="pendiente">Cuotas pendientes</label>
                <q-input
                  v-model="formulario.cuotasPendientes"
                  id="pendiente"
                  dense
                  outlined
                  readonly
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="comprobanteregistrocobro">Comprobante</label>
                <q-file
                  v-model="formulario.comprobante"
                  id="comprobanteregistrocobro"
                  dense
                  outlined
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="convertirImagen"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="cuota">Cuota individual</label>
                <q-input v-model="formulario.valorCuota" id="cuota" dense outlined readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="q-mt-md text-center">
              <q-btn
                id="btnregistrarcobroformulario"
                label="Registrar"
                type="submit"
                color="primary"
              />
              <q-btn
                label="Cancelar"
                color="negative"
                flat
                @click="cerrarFormulario"
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Vista de detalles de cobros -->
    <div v-if="vistaActiva === 'detalles'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <q-btn
            id="btnvolverdetallescobro"
            label="Volver"
            icon="arrow_back"
            color="primary"
            @click="vistaActiva = 'principal'"
          />
        </div>
        <div class="col text-center">
          <div class="text-h6">Detalle de Cobros Realizados</div>
        </div>
        <div class="col"></div>
      </div>

      <q-table
        id="tabladetallescobro"
        :rows="detallesCobros"
        :columns="columnasDetalles"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:body-cell-comprobante="props">
          <q-td :props="props">
            <q-img
              :src="props.value"
              style="width: 50px; height: 50px; cursor: pointer"
              @click="mostrarImagen(props.value)"
            />
          </q-td>
        </template>
      </q-table>

      <div class="row q-mt-md">
        <div class="col-8"></div>
        <div class="col-4">
          <q-markup-table flat bordered>
            <tbody>
              <tr>
                <td class="text-right">Total Venta</td>
                <td>{{ formatoMoneda(detalleSeleccionado.totalVenta) }}</td>
              </tr>
              <tr>
                <td class="text-right">Total Cobrado</td>
                <td>{{ formatoMoneda(totalCobrado) }}</td>
              </tr>
              <tr>
                <td class="text-right">Saldo</td>
                <td>{{ formatoMoneda(detalleSeleccionado.saldo) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <!-- Diálogo de imagen de comprobante -->
    <q-dialog v-model="mostrarDialogoImagen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Comprobante de Cobro</div>
        </q-card-section>
        <q-card-section class="text-center">
          <q-img :src="imagenSeleccionada" style="max-width: 600px; max-height: 600px" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { decimas, redondear } from 'src/composables/FuncionesG'
import emitter from 'src/event-bus'
import tablaCuentasxCobrar from './tablaCuentasxCobrar.vue'
import { useCuentasxCobrar } from './composables/useCuentasxCobrar'

// ─── Composable (SRP: toda la lógica vive aquí) ──────────────────────────────
const {
  vistaActiva,
  mostrarForm,
  mostrarDialogoImagen,
  imagenSeleccionada,
  divisa,
  opcionesAlmacenes,
  filtroAlmacen,
  filtroEstado,
  opcionesTipo,
  datosFiltrados,
  detallesCobros,
  detalleSeleccionado,
  totalCobrado,
  formulario,
  cargarAlmacenesAutorizados,
  cargarDatos,
  cargarFormulario,
  calcularTotales,
  calcularNumeroCobros,
  convertirImagen,
  registrarCobro,
  cerrarFormulario,
  mostrarDetalles,
  mostrarImagen,
  formatoMoneda,
} = useCuentasxCobrar()

// ─── Ref de la tabla hija ────────────────────────────────────────────────────
const refHijo = ref(null)

// ─── Columnas de la vista de detalles ────────────────────────────────────────
const columnasDetalles = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecha', label: 'Fecha de cobro', field: 'fecha', align: 'center' },
  {
    name: 'cuotas',
    label: 'N° cobros',
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
  {
    name: 'monto',
    label: 'Total cobro',
    field: 'monto',
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val))),
  },
]

// ─── Teclado ─────────────────────────────────────────────────────────────────
function handleKeydown(e) {
  if (e.key === 'Escape') cerrarFormulario()
}

// ─── Ciclo de vida ───────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  // Primero cargamos los almacenes autorizados, luego los datos
  // (los datos se filtran por los almacenes autorizados)
  await cargarAlmacenesAutorizados()
  await cargarDatos()

  emitter.on('realizar-pago', (notification) => {
    const btn = document.getElementById(`btn-${notification.id}`)
    if (btn) btn.click()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
