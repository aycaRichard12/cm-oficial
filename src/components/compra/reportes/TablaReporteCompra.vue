<template>
  <q-page>
    <div>
      <!-- Botones principales (exportar/imprimir) -->
      <CompraAcciones @exportar-excel="exportarexcel" @imprimirReporte="imprimirReporte" />

      <!-- Tabla de compras -->
      <BaseFilterableTable
        id="tabla"
        ref="refHijo"
        title="Compras"
        :rows="processedRows"
        :columns="columns"
        :arrayHeaders="arrayHeaders"
        :sumColumns="sumColumns"
        nombreColumnaTotales="tipocompra"
        row-key="id"
        :filter="busqueda"
        flat
        dense
      >
        <!-- Columna personalizada: autorización -->

        <!-- Columna personalizada: acciones -->

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="picture_as_pdf"
              @click="$emit('detallePdf', props.row)"
            >
              <q-tooltip>Ver Detalle en PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </BaseFilterableTable>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CompraAcciones from './CompraAcciones.vue'
import { PDFReporteCompras } from 'src/utils/pdfs/reporteCompras/reporte.js'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

// Stores & composables

// Referencias
const refHijo = ref(null)
const busqueda = ref('')

// Props
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  divisa: {
    type: String,
    default: 'USD',
  },
  fechaIncio: {
    type: String,
    default: '',
  },
  fechaFin: {
    type: String,
    default: '',
  },
  // Almacén necesario para el reporte de compras
})

// Emits
defineEmits(['detallePdf'])

// Columnas de la tabla (se podrían mover a un archivo aparte para mayor limpieza)
const columns = [
  {
    name: 'num',
    label: 'N°',
    field: 'num',
    align: 'center',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    dataType: 'date',
  },
  {
    name: 'codigo',
    label: 'Codigo',
    field: 'codigo',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'nombrelote',
    label: 'Nombre Lote',
    field: 'nombrelote',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'total',
    label: `Importe Compra (${props.divisa})`,
    field: 'total',
    align: 'right',
    dataType: 'text',
  },
  {
    name: 'autorizacionTexto',
    label: 'Autorización',
    field: 'autorizacionTexto',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: 'Factura',
    field: 'nfactura',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'almacen',
    label: 'Almacén',
    field: 'almacen',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'left',
  },
]

// Cabeceras para exportar (solo los campos relevantes)
const arrayHeaders = columns
  .filter((col) => !['num', 'acciones'].includes(col.name))
  .map((col) => col.name)

// Columnas que se suman en el pie de la tabla
const sumColumns = ['total']

// Datos procesados: añade número de fila automático
const processedRows = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    num: index + 1,
  })),
)

// Función para exportar a Excel (mantenida localmente, o se podría emitir al padre)
const exportarexcel = () => {
  // Se podría implementar usando tableRef o emitiendo al padre
  // Por ahora asumimos que CompraAcciones ya tiene lógica interna o emite
  console.warn('Exportar Excel no implementado aún')
}

// Función para imprimir reporte de compras
const imprimirReporte = async () => {
  try {
    const resultado = refHijo.value.obtenerDatosFiltrados()
    const { doc, mobileBlobUrl } = await PDFReporteCompras(
      resultado,
      props.divisa,
      props.fechaIncio,
      props.fechaFin,
    )

    // Abrir en ventana nueva (escritorio)
    doc.output('dataurlnewwindow')

    // Opcional: si es móvil y quieres redirigir al blob
    if (mobileBlobUrl) {
      window.location.href = mobileBlobUrl
    }
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    // Notificar al usuario, por ejemplo con un snackbar o toast
  }
}

// Inicialización
onMounted(async () => {})
</script>
