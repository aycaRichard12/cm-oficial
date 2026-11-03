<template>
  <BaseFilterableTable
    id="tablalistadocuentasporcobrar"
    ref="refHijo"
    :title="$t('ui.cuentas-por-cobrar-2aaedc')"
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
          <span id="btnregistrarcobrocuentasporcobrar">
            <q-btn
              v-if="privilegios[1] && [1, 3].includes(Number(props.row.estado))"
              icon="add_circle"
              color="primary"
              :id="'btn-' + props.row.id"
              @click="$emit('cargarFormulario', props.row)"
              :title="$t('ui.registrar-cobro-f33742')"
            />
          </span>
          <q-btn
            id="btnverdetallescobro"
            icon="list_alt"
            color="info"
            @click="$emit('mostrarDetalles', props.row)"
            :title="$t('ui.ver-listado-de-cobros-e5cf8e')"
          />
        </div>
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
// Fallback a [] cuando el usuario no tiene fila en state.permisos
const privilegios = obtenerPermisosPagina() ?? []
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
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
  {
    name: 'fecha',
    label: i18nT('ui.fecha-credito-e22d16'),
    field: 'fechaventa',
    align: 'center',
    dataType: 'date',
  },
  { name: 'cliente', label: i18nT('ui.razon-social-eb711d'), field: 'cliente', align: 'left', dataType: 'text' },
  {
    name: 'nombreComercial',
    label: i18nT('ui.nombre-comercial-55a6ae'),
    field: 'nombreComercial',
    align: 'left',
    dataType: 'text',
  },
  { name: 'factura', label: i18nT('ui.n-factura-5a62ff'), field: 'nfactura', align: 'center', dataType: 'number' },

  {
    name: 'vencimiento',
    label: i18nT('ui.vencimiento-43d44c'),
    field: 'fechalimite',
    align: 'center',
    dataType: 'date',
  },
  { name: 'cuotas', label: i18nT('ui.n-cuotas-9e3c8f'), field: 'ncuotas', align: 'center', dataType: 'number' },
  {
    name: 'cuotasProcesadas',
    label: i18nT('ui.cuotas-procesadas-a2220e'),
    field: 'cuotaspagas',
    align: 'center',
    dataType: 'number',
  },
  {
    name: 'ventatotal',
    label: i18nT('ui.total-venta-eaaafd'),
    field: 'ventatotal',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'totalcobrado',
    label: i18nT('ui.total-cobrado-c3a2cb'),
    field: 'totalcobrado',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'saldo',
    label: i18nT('ui.saldo-8b0fcd'),
    field: 'saldo',
    align: 'right',
    dataType: 'number',
  },
  { name: 'estadoLabel', label: i18nT('cotizacion.table.status'), field: 'estadoLabel', align: 'center', dataType: 'text' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
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
  'nombreComercial',
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
