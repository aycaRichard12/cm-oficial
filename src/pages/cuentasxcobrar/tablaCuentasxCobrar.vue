<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Cuentas por Cobrar"
    nombreColumnaTotales="cuotasProcesadas"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    dense
    bordered
    class="q-ma-sm"
  >
    <template #body-cell-opciones="props">
      <q-td :props="props">
        <div class="row justify-center items-center q-gutter-sm">
          <q-btn
            v-if="privilegios[1] && [1, 3].includes(Number(props.row.estado))"
            icon="add_circle"
            color="primary"
            :id="'btn-' + props.row.id"
            @click="$emit('cargarFormulario', props.row)"
            title="Registrar cobro"
          />
          <q-btn
            icon="list_alt"
            color="info"
            @click="$emit('mostrarDetalles', props.row)"
            title="Ver listado de cobros"
          />
        </div>
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
const privilegios = obtenerPermisosPagina()
console.log(privilegios)
const refHijo = ref(null)

// Propiedades recibidas del componente padre
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
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
defineEmits(['cargarFormulario', 'mostrarDetalles', 'column-filter-changed'])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)
const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'cliente', label: 'Razon Social', field: 'cliente', align: 'left', dataType: 'text' },
  { name: 'factura', label: 'N° Factura', field: 'nfactura', align: 'center', dataType: 'number' },
  {
    name: 'fecha',
    label: 'Fecha Crédito',
    field: 'fechaventa',
    align: 'center',
    dataType: 'date',
  },
  {
    name: 'vencimiento',
    label: 'Vencimiento',
    field: 'fechalimite',
    align: 'center',
    dataType: 'date',
  },
  { name: 'cuotas', label: 'N° Cuotas', field: 'ncuotas', align: 'center', dataType: 'number' },
  {
    name: 'cuotasProcesadas',
    label: 'Cuotas Procesadas',
    field: 'cuotaspagas',
    align: 'center',
    dataType: 'number',
  },
  {
    name: 'ventatotal',
    label: 'Total Venta',
    field: 'ventatotal',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'totalcobrado',
    label: 'Total Cobrado',
    field: 'totalcobrado',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'saldo',
    label: 'Saldo',
    field: 'saldo',
    align: 'right',
    dataType: 'number',
  },
  { name: 'estadoLabel', label: 'Estado', field: 'estadoLabel', align: 'center', dataType: 'text' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'cliente',
  'factura',
  'fecha',
  'vencimiento',
  'cuotas',
  'cuotasProcesadas',
  'ventatotal',
  'totalcobrado',
  'saldo',
  'estadoLabel',
]
const summationHeaders = ['ventatotal', 'totalcobrado', 'saldo']
</script>

<style scoped>
/*
  La prop 'row-class' añade la clase a la etiqueta <tr>.
  Usamos un selector descendente para aplicar el color al texto
  de todas las celdas (q-td) dentro de esa fila.
*/
.fila-venta-azul,
.fila-venta-azul .q-td {
  /* Color del texto azul */
  color: #1976d2 !important;
  /* Puedes añadir negrita si quieres que se destaque */
  /* font-weight: bold; */
}
</style>
