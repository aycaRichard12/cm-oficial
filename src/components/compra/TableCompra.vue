<template>
  <q-page>
    <div>
      <!-- Botones principales -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-4 q-mt-lg flex flex-col gap-4">
          <!-- Botón de nueva compra -->
          <q-btn
            color="primary"
            class="btn-res"
            id="btnNuevaCompra"
            @click="$emit('add')"
            icon="add"
            label="Nueva Compra"
            no-caps
          />

          <!-- Botón de reporte -->
          <!-- <q-btn
            color="secondary"
            class="btn-res"
            id="btnReporteStockIndividual"
            to="/reportestockdeproductosindividual"
            icon="assessment"
            label="Rep. Stock Producto Individual"
            no-caps
          /> -->
        </div>

        <div class="col-2 q-mt-lg flex justify-end">
          <q-btn color="info" @click="imprimirReporte" class="btn-res" outline>
            <q-icon name="picture_as_pdf" class="icono" />
            <span class="texto">Vista Previa PDF</span>
          </q-btn>
        </div>

        <!-- Filtro de almacén -->
      </div>
      <div class="row q-col-gutter-x-md flex justify-between q-mb-md">
        <div class="col-12 col-md-4">
          <label for="almacen">Seleccione un Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="almacenes"
            id="almacen"
            clearable
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="buscar">Buscar...</label>
          <q-input dense debounce="300" v-model="busqueda" id="buscar" outlined>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Tabla -->
      <q-table
        title="Compras"
        :rows="processedRows"
        :columns="columnas"
        row-key="id"
        :filter="busqueda"
        dense
      >
        <template v-slot:top-right> </template>
        <template v-slot:body-cell-autorizacion="props">
          <q-td :props="props">
            <q-badge
              color="green"
              v-if="Number(props.row.autorizacion) === 1"
              label="Autorizado"
              outline
            />
            <q-badge color="red" v-else label="No Autorizado" outline />
          </q-td>
        </template>
        <template v-slot:body-cell-tipocompra="props">
          <q-td :props="props">
            {{ Number(props.row.tipocompra) === 2 ? 'Contado' : 'A crédito' }}
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            <q-btn
              title="Añadir Carrito "
              icon="shopping_cart"
              color="primary"
              dense
              flat
              @click="$emit('detalleCompra', props.row)"
            />
            <q-btn
              v-if="Number(props.row.tipocompra) === 1 && Number(props.row.estado) === 1"
              title="Generar Plan de Pagos"
              icon="payment"
              color="blue"
              flat=""
              @click="FormularioCredito(props.row)"
              label=""
            />
          </q-td>
        </template>

        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <div v-if="Number(props.row.autorizacion) === 2">
              <q-btn icon="edit" color="primary" dense flat @click="$emit('edit', props.row)" />
              <q-btn
                icon="delete"
                color="negative"
                dense
                flat
                @click="$emit('delete', props.row)"
              />
              <!-- <q-btn
                icon="toggle_off"
                dense
                flat
                color="grey"
                @click="$emit('toggle-status', props.row)"
              /> -->
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
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
    <q-dialog v-model="credito">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">Registrar Datos para Credito</div>
          <q-btn icon="close" dense flat round @click="credito = false" />
        </q-card-section>
        <q-card-section>
          <pagos-credito :compra="compra" @cerrar="closeModalCredito"></pagos-credito>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { decimas, redondear } from 'src/composables/FuncionesG'
import pagosCredito from './pagosCredito.vue'
import { useQuasar } from 'quasar'
import { showDialog } from 'src/utils/dialogs'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_REPORTE_COMPRAS } from 'src/utils/pdfReportGenerator'
const divisaActiva = useCurrencyStore()
const $q = useQuasar()
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
  almacenSeleccionado: {
    type: Object,
    default: null,
  },
})
console.log(props.almacenSeleccionado)
const pdfData = ref(null)
const busqueda = ref('')
const filtroAlmacen = ref(null)
const mostrarModal = ref(false)
const credito = ref(false)
const compra = ref({})
const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: 'numero' },
  { name: 'fecha', label: 'Fecha', align: 'right', field: 'fecha' },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'left' },
  { name: 'lote', label: 'Nombre lote', field: 'lote', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'nfactura', label: 'N° Factura', align: 'right', field: 'nfactura' },
  { name: 'tipocompra', label: 'Tipo compra', field: 'tipocompra', align: 'center' },
  {
    name: 'total',
    label: 'Total compra',
    align: 'right',
    field: (row) => {
      const valor = parseFloat(row.total)

      if (isNaN(valor)) return '0.00' // evita NaN

      return decimas(redondear(valor)) + ' ' + divisaActiva.simbolo
    },
  },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const emit = defineEmits([
  'add',
  'repDesglosado',
  'repCompras',
  'edit',
  'delete',
  'actualizarTablaPrincipal',
])

const filteredCompra = computed(() => {
  if (!filtroAlmacen.value) {
    return props.rows // ← muestra todos si no hay filtro
  }
  return props.rows.filter((compra) => compra.idalmacen == filtroAlmacen.value.value)
})

const processedRows = computed(() => {
  console.log(filteredCompra.value)
  return filteredCompra.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

watch(
  () => props.almacenSeleccionado,
  (nuevoAlmacen) => {
    filtroAlmacen.value = nuevoAlmacen
  },
  { immediate: true },
)

async function FormularioCredito(c) {
  //const response = await
  if (Number(c.autorizacion) == 1) {
    console.log(c)
    compra.value = c
    credito.value = true
  } else {
    // Dialog con iconos correctos

    const result = await showDialog(
      $q,
      'W',
      'Advertencia: La compra está en espera de autorización. Debe validarse antes de proceder.',
    )
    console.log('Warning dialog result:', result)
  }
}
function closeModalCredito() {
  credito.value = false
  emit('actualizarTablaPrincipal')
}
function imprimirReporte() {
  const doc = PDF_REPORTE_COMPRAS(filteredCompra, filtroAlmacen)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
