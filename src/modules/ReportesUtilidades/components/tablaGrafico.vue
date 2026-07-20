<template>
  <q-card flat bordered class="erp-report-card shadow-2">
    <!-- Barra de herramientas superior: título + acciones -->
    <q-card-section class="q-pa-md">
      <div class="row items-center q-col-gutter-md">
        <!-- Título -->
        <div class="col-12 col-md"></div>
        <!-- Acciones -->
        <div class="col-12 col-md-auto">
          <div class="row q-gutter-sm justify-end">
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Descargar PDF"
              outline
              rounded
              @click="emit('descargar-p-d-f')"
            />
            <q-btn
              color="primary"
              icon="table_view"
              label="Descargar Excel"
              outline
              rounded
              @click="emit('descargar-excel')"
            />
            <q-btn
              color="primary"
              icon="close"
              label="cerrar"
              outline
              rounded
              @click="emit('cerrar')"
            />
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Tabla como protagonista -->
    <q-card-section class="q-pa-none">
      <BaseFilterableTable
        ref="refHijo"
        :rows="rows"
        :columns="columns"
        :row-key="rowKey"
        :arrayHeaders="ArrayHeaders"
        :sumColumns="summationHeaders"
        flat
        class="erp-table-fullwidth"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

// Corrección: uso correcto de defineEmits para la comunicación con el padre
const emit = defineEmits(['descargar-p-d-f', 'descargar-excel', 'cerrar'])

const refHijo = ref(null)

defineExpose({
  obtenerDatos: () => ejecutarDesdePadre(),
  getActiveFiltersReport,
})

function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()
  console.log(resultado)
  return resultado
}

defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  rowsPerPage: { type: Number, default: 15 },
})

const ArrayHeaders = [
  'periodo',
  'venta_bruta',
  'venta_neta',
  'costo_ventas',
  'utilidad',
  'margen_neta',
]

const summationHeaders = ['venta_bruta', 'venta_neta', 'total_vendido', 'costo_ventas', 'utilidad']
</script>

<style scoped>
/* Tarjeta principal con esquinas redondeadas y sombra sutil */
.erp-report-card {
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

/* Asegura que la tabla ocupe todo el ancho y tenga un padding interior */
.erp-table-fullwidth :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

/* Mejora la separación visual de la tabla respecto a los bordes */
.erp-report-card .q-card__section + .q-card__section {
  padding-top: 0;
}

/* En móvil, los botones se apilan verticalmente y centrados */
@media (max-width: 767px) {
  .row.q-col-gutter-md {
    flex-direction: column;
  }
  .row.q-gutter-sm {
    justify-content: center;
    width: 100%;
  }
}
</style>
