<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Reporte Productos Vendidos"
    nombreColumnaTotales="estado"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm shadow-2 rounded-borders"
  >
    <!-- Columna: Tipo (Estado) -->
    <template v-slot:body-cell-tipoDocumento="props">
      <q-td :props="props" class="text-center">
        {{ props.row.tipoDocumento || 'Desconocido' }}
      </q-td>
    </template>
    <template v-slot:body-cell-descripcion="props">
      <q-td :props="props" class="text-center">
        {{ props.row.descripcion }}
        <span v-if="props.row.descripcionAdicional">
          <br />
          <small class="text-weight-bold">{{ props.row.descripcionAdicional }}</small>
        </span>
      </q-td>
    </template>

    <!-- Columna: Estado de Cobro -->

    <template v-slot:body-cell-total_sumatorias="props">
      <q-td :props="props" class="text-right text-weight-bold">
        {{ formatCurrency(props.row.total_sumatorias) }}
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const refHijo = ref(null)

// Propiedades recibidas del componente padre
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
//console.log('Props recibidas en TableReporteCotizacion:', props.rows)
defineExpose({ obtenerDatos: () => ejecutarDesdePadre(), getActiveFiltersReport })

function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()

  console.log('Resultado recibido del hijo:', resultado)
  return resultado
}

// Eventos que serán emitidos al componente padre
defineEmits(['facturarVenta', 'generarComprobantePDF', 'column-filter-changed'])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)
const columnas = [
  { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'right',
    field: 'fecha',
    dataType: 'date',
    soportable: true,
  },
  {
    name: 'nrofactura',
    label: 'N° Doc.',
    align: 'right',
    field: 'nrofactura',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipoDocumento',
    label: 'Tipo de Venta',
    align: 'left',
    field: 'tipoDocumento',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigo',
    label: 'Código Producto',
    align: 'left',
    field: 'codigo',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'codigobarra',
    label: 'Código Barras',
    align: 'right',
    field: 'codigobarra',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción de Producto',
    align: 'left',
    field: 'descripcion',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'preciounitario',
    label: 'Precio Unitario',
    align: 'right',
    field: 'preciounitario',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'right',
    field: 'cantidad',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'importe',
    label: 'Importe',
    align: 'right',
    field: 'importe',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'descuento',
    label: 'Dscto.',
    align: 'right',
    field: 'descuento',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'totalventa',
    label: 'Venta Total',
    align: 'right',
    field: 'totalventa',
    dataType: 'number',
    sortable: true,
  },
  {
    name: 'tipopago',
    label: 'Tipo Pago',
    align: 'left',
    field: 'tipopago',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'idusuario',
    label: 'Nombre de Usuario',
    align: 'left',
    field: 'idusuario',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'sucursalc',
    label: 'Sucursal del Cliente',
    align: 'left',
    field: 'sucursalc',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'almacen',
    label: 'Almacén Empresa',
    align: 'left',
    field: 'almacen',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'cliente',
    label: 'Razón Social Empresa',
    align: 'left',
    field: 'cliente',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipodocumento',
    label: 'Tipo Documento',
    align: 'left',
    field: 'tipodocumento',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nrodoc',
    label: 'Nro. Doc. Tributario',
    align: 'right',
    field: 'nrodoc',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    align: 'left',
    field: 'nombrecomercial',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'unidad',
    label: 'Unidad',
    align: 'left',
    field: 'unidad',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'categoria',
    label: 'Categoría',
    align: 'left',
    field: 'categoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'subcategoria',
    label: 'Sub Categoría',
    align: 'left',
    field: 'subcategoria',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'canal',
    label: 'Canal',
    align: 'left',
    field: 'canal',
    dataType: 'text',
    sortable: true,
  },
  {
    name: 'tipoprecio',
    label: 'Tipo de Precio',
    align: 'left',
    field: 'tipoprecio',
    dataType: 'text',
    sortable: true,
  },
]

// estado de cobro
// 1: 'Activo',
//   2: 'Finalizado',
//   3: 'Atrasado',
//   4: 'Anulado',

function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha',
  'nrofactura',
  'tipoDocumento',
  'codigo',
  'codigobarra',
  'descripcion',
]

const summationHeaders = ['cantidad', 'importe', 'descuento', 'totalventa']
</script>
