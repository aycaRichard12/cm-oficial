<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Reporte ventas"
    nombreColumnaTotales="canal"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm"
  >
    <!-- Slot para chips de autorización -->
    <template v-slot:body-cell-autorizado="props">
      <q-td :props="props">
        <q-chip :color="getAuthorizationColor(props.row.autorizado)" text-color="white" dense>
          {{ getAuthorizationText(props.row.autorizado) }}
        </q-chip>
      </q-td>
    </template>
    <template #body-cell-actions="props">
      <q-td align="center">
        <q-btn
          id="btnverdetalle"
          size="sm"
          icon="picture_as_pdf"
          color="primary"
          flat
          @click="$emit('viewPdf', props.row.id_cierre)"
        />
        <q-btn
          id="autorizar"
          size="sm"
          icon="toggle_off"
          flat
          color="grey"
          @click="$emit('autorizarCierreCaja', props.row)"
        />
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
defineEmits(['viewPdf', 'autorizarCierreCaja'])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)

const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'left' },
  {
    name: 'fecha_inicio',
    label: 'Fecha Inicio',
    align: 'left',
    field: 'fecha_inicio',
    dataType: 'date',
  },
  {
    name: 'fecha_fin',
    label: 'Fecha Fin',
    align: 'left',
    field: 'fecha_fin',
    dateType: 'date',
  },
  {
    name: 'observacion',
    label: 'Observación',
    align: 'left',
    field: 'observacion',
    dateType: 'text',
  },
  {
    name: 'punto_venta',
    label: 'Punto de Venta',
    align: 'left',
    field: 'punto_venta',
    dateType: 'text',
  },

  {
    name: 'creado_en',
    label: 'Fecha de Creación',
    align: 'left',
    field: 'creado_en',
    dateType: 'date',
  },

  { name: 'autorizado', label: 'Autorizado', align: 'left', field: 'autorizado', dateType: 'text' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]
const getAuthorizationColor = (status) => {
  switch (status) {
    case 0:
      return 'orange' // Pendiente
    case 1:
      return 'green' // Autorizado
    case 2:
      return 'red' // Rechazado
    default:
      return 'grey'
  }
}

// Función para obtener el texto del chip de autorización
const getAuthorizationText = (status) => {
  switch (status) {
    case 0:
      return 'Pendiente'
    case 1:
      return 'Autorizado'
    case 2:
      return 'Rechazado'
    default:
      return 'Desconocido'
  }
}
// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'fecha_inicio',
  'fecha_fin',
  'observacion',
  'punto_venta',
  'creado_en',
  'autorizado',
]
const summationHeaders = []
</script>
