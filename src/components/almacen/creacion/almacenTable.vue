<template>
  <div class="almacenes-container q-pa-md">
    <!-- Cabecera con título y botones de acción -->
    <div class="section-header q-mb-lg">
      <div class="section-title">
        <q-icon name="warehouse" size="sm" class="q-mr-xs" />
        Gestión de Almacenes
      </div>
      <div class="action-buttons">
        <q-btn
          color="primary"
          @click="$emit('add')"
          class="modern-btn q-mr-sm"
          title="Registrar Almacén"
        >
          <q-icon name="add" size="xs" class="q-mr-xs" />
          <span>Nuevo</span>
        </q-btn>
        <q-btn
          color="info"
          outline
          @click="mostrarReporte"
          class="modern-btn"
          title="Vista previa PDF"
        >
          <q-icon name="picture_as_pdf" size="xs" class="q-mr-xs" />
          <span>Vista previa PDF</span>
        </q-btn>
      </div>
    </div>

    <!-- Tabla con estilos mejorados -->
    <q-card class="table-card">
      <BaseFilterableTable
        ref="tableRef"
        id="tablaAlmacenes"
        title="Almacenes"
        :rows="decoratedRows"
        :columns="columnas"
        :arrayHeaders="ArrayHeaders"
        row-key="id"
        :search="search"
        :row-class="rowClassFn"
        @edit-item="$emit('edit-item', $event)"
        @delete-item="$emit('delete-item', $event)"
        @toggle-status="$emit('toggle-status', $event)"
      >
        <!-- Columna nombre con badge de principal -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <q-badge
              v-if="Number(props.row.id) === almacenPrincipalId"
              color="negative"
              label="Principal"
              class="q-mr-sm text-uppercase"
            />
            <span
              :class="{
                ' text-weight-bold': Number(props.row.id) === almacenPrincipalId,
              }"
            >
              {{ props.row.nombre }}
            </span>
          </q-td>
        </template>

        <!-- Columna sucursal -->
        <template v-slot:body-cell-sucursal="props">
          <q-td :props="props">
            <span v-if="props.row.sucursalValor" class="text-primary text-weight-medium">
              {{ props.row.sucursalValor }}
            </span>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <!-- Columna estado con badges -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'"
              :label="Number(props.row.estado) === 1 ? 'Activo' : 'Inactivo'"
              outline
              class="q-px-sm q-py-xs"
            />
          </q-td>
        </template>

        <!-- Columna opciones con botones estilizados -->
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              icon="edit"
              color="primary"
              dense
              flat
              round
              class="q-mr-xs"
              @click="$emit('edit-item', props.row)"
              title="Editar"
            />
            <q-btn
              icon="delete"
              color="negative"
              dense
              flat
              round
              class="q-mr-xs"
              @click="$emit('delete-item', props.row)"
              title="Eliminar"
            />
            <q-btn
              :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
              dense
              flat
              round
              :color="Number(props.row.estado) === 1 ? 'positive' : 'grey'"
              @click="$emit('toggle-status', props.row)"
              title="Cambiar estado"
            />
          </q-td>
        </template>
      </BaseFilterableTable>
    </q-card>

    <!-- Modal PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="pdf-modal-card">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { PDFalmacenes } from 'src/utils/pdfReportGenerator'

const props = defineProps({
  rows: { type: Array, required: true, default: () => [] },
  filterMode: { type: String, default: 'client' },
})

defineEmits([
  'add',
  'edit-item',
  'delete-item',
  'toggle-status',
  'mostrarReporte',
  'column-filter-changed',
])

const pdfData = ref(null)
const mostrarModal = ref(false)
const search = ref('')
const tableRef = ref(null)

defineExpose({
  obtenerDatosFiltrados: () => tableRef.value?.obtenerDatosFiltrados() || [],
  obtenerColumnasVisibles: () => tableRef.value?.obtenerColumnasVisibles() || [],
})

const decoratedRows = computed(() => {
  return props.rows.map((row) => ({
    ...row,
    sucursalValor: row.sucursales?.length ? row.sucursales[0].nombre : '-',
  }))
})

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', dataType: 'text' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
  {
    name: 'direccion',
    label: 'Dirección',
    field: 'direccion',
    align: 'left',
    dataType: 'text',
    defaultVisible: false,
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left',
    dataType: 'text',
    defaultVisible: false,
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    dataType: 'text',
    defaultVisible: false,
  },
  {
    name: 'tipoalmacen',
    label: 'Tipo almacén',
    field: 'tipoalmacen',
    align: 'left',
    dataType: 'text',
  },
  { name: 'stockmin', label: 'Stock mín.', field: 'stockmin', dataType: 'number' },
  { name: 'stockmax', label: 'Stock máx.', field: 'stockmax', dataType: 'number' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursalValor', align: 'left', dataType: 'text' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', dataType: 'number' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const ArrayHeaders = [
  'codigo',
  'nombre',
  'direccion',
  'telefono',
  'email',
  'tipoalmacen',
  'stockmin',
  'stockmax',
  'sucursal',
  'estado',
]

const almacenPrincipalId = computed(() => {
  if (!props.rows.length) return null
  return Math.min(...props.rows.map((row) => Number(row.id)))
})

// Función que asigna clase a la fila si es el almacén principal
const rowClassFn = (row) => {
  if (Number(row.id) === almacenPrincipalId.value) {
    return 'row-principal'
  }
  return ''
}

function mostrarReporte() {
  const data = tableRef.value?.obtenerDatosFiltrados() || []
  const visibleColumns = tableRef.value?.obtenerColumnasVisibles() || []
  const doc = PDFalmacenes({ rows: data, visibleColumnsFromTable: visibleColumns })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>

<style lang="scss" scoped>
/* Contenedor principal */
.almacenes-container {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
}

/* Encabezado de sección */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #263238;
  display: flex;
  align-items: center;
  border-left: 4px solid var(--q-primary, #1976d2);
  padding-left: 12px;
  letter-spacing: -0.01em;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Tarjeta de la tabla */
.table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background: #fff;
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

/* Estilos para los botones modernos */
.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  padding: 6px 16px;
  transition: all 0.2s ease;
  &:active {
    transform: scale(0.96);
  }
}

/* Estilos para la tabla interna */
:deep(.q-table) {
  border-radius: 12px;
  th {
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
  }
  td {
    font-size: 0.9rem;
    color: #455a64;
  }
}

:deep(.q-badge) {
  border-radius: 4px;
  font-weight: 500;
}

/* Fila completa del almacén principal */
.row-principal {
  background: #ffebee !important; /* rojo muy claro */
  /* Opcional: texto rojo en toda la fila */
  /* color: #c62828; */
}

/* Efecto hover para la fila principal */
:deep(.q-table tbody tr.row-principal:hover) {
  background: #ffcdd2 !important;
}

/* Modal de PDF */
.pdf-modal-card {
  border-radius: 12px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 767px) {
  .almacenes-container {
    padding: 16px;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
