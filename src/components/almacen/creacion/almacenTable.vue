<template>
  <div class="q-pa-md">
    <div class="flex justify-between q-mb-md">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="Registrar Almacen"
        id="agregarAlmacen"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">Nuevo</span>
      </q-btn>
      <q-btn color="info" outline @click="mostrarReporte" class="btn-res q-mt-lg">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto" id="vistaPreviaPDF">Vista previa PDF</span>
      </q-btn>
      <!-- <div id="buscarAlmacen">
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="search"
          id="buscar"
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: white"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div> -->
    </div>

    <BaseFilterableTable
      ref="tableRef"
      id="tablaAlmacenes"
      title="Almacenes"
      :rows="decoratedRows"
      :columns="columnas"
      :arrayHeaders="ArrayHeaders"
      row-key="id"
      :search="search"
      @edit-item="$emit('edit-item', $event)"
      @delete-item="$emit('delete-item', $event)"
      @toggle-status="$emit('toggle-status', $event)"
    >
      <template v-slot:body-cell-sucursal="props">
        <q-td :props="props">
          <span v-if="props.row.sucursalValor" class="text-primary text-weight-medium">
            {{ props.row.sucursalValor }}
          </span>
          <span v-else>-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="primary"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            title="Editar"
            flat
            id="editarAlmacen"
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            title="Eliminar"
            flat
            id="eliminarAlmacen"
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            title="Cambiar de Estadato"
            id="cambiarEstadoAlmacen"
          />
        </q-td>
      </template>
    </BaseFilterableTable>

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
  </div>
</template>

<script setup>
/**
 * Componente de gestión de almacenes con tabla filtrable y generación de reportes PDF
 * Extiende BaseFilterableTable para funcionalidades de filtrado, ordenamiento y exportación
 * @module components/AlmacenesTable
 */

// ==================== DEPENDENCIAS ====================
import { ref, computed } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { PDFalmacenes } from 'src/utils/pdfReportGenerator'

// ==================== PROPS ====================
/**
 * Propiedades del componente
 * @property {Array} rows - Datos de almacenes a mostrar (requerido)
 * @property {String} filterMode - Modo de filtrado: 'client' (cliente) o 'server' (servidor)
 */
const props = defineProps({
  rows: { type: Array, required: true, default: () => [] },
  filterMode: { type: String, default: 'client' },
})

// ==================== EVENTOS ====================
/**
 * Eventos emitidos por el componente
 * @event add - Solicita agregar un nuevo almacén
 * @event edit-item - Solicita editar un almacén existente
 * @event delete-item - Solicita eliminar un almacén
 * @event toggle-status - Solicita cambiar el estado (activo/inactivo) de un almacén
 * @event mostrarReporte - Solicita mostrar reporte (alternativa al método interno)
 * @event column-filter-changed - Notifica cambios en filtros de columnas
 */
defineEmits([
  'add',
  'edit-item',
  'delete-item',
  'toggle-status',
  'mostrarReporte',
  'column-filter-changed',
])

// ==================== ESTADO REACTIVO ====================
const pdfData = ref(null) // Almacena el PDF generado como data URL
const mostrarModal = ref(false) // Controla visibilidad del modal de vista previa PDF
const search = ref('') // Término de búsqueda global (pasado a tabla base)
const tableRef = ref(null) // Referencia al componente BaseFilterableTable

// ==================== API PÚBLICA (EXPOSE) ====================
/**
 * Expone métodos para que componentes padres puedan acceder a datos filtrados y columnas
 * Útil para generación de reportes externos o exportación de datos
 */
defineExpose({
  // Obtiene los datos actualmente filtrados en la tabla
  obtenerDatosFiltrados: () => tableRef.value?.obtenerDatosFiltrados() || [],
  // Obtiene las columnas visibles según configuración del usuario
  obtenerColumnasVisibles: () => tableRef.value?.obtenerColumnasVisibles() || [],
})

// ==================== DATOS PROCESADOS (COMPUTED) ====================
/**
 * Preprocesa las filas para aplanar propiedades anidadas
 * Esto permite que BaseFilterableTable y ColumnFilter funcionen con campos simples
 * Convierte la primera sucursal en un campo 'sucursalValor' de nivel superior
 */
const decoratedRows = computed(() => {
  return props.rows.map((row) => ({
    ...row,
    // Toma el nombre de la primera sucursal si existe, si no muestra '-'
    sucursalValor: row.sucursales?.length ? row.sucursales[0].nombre : '-',
  }))
})

// ==================== CONFIGURACIÓN DE COLUMNAS ====================
/**
 * Definición de columnas para la tabla filtrable
 * dataType: tipo de datos para filtros específicos (text, number)
 * defaultVisible: algunas columnas ocultas por defecto para mejorar UX
 */
const columnas = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', dataType: 'text' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
  {
    name: 'direccion',
    label: 'Dirección',
    field: 'direccion',
    align: 'left',
    dataType: 'text',
    defaultVisible: false, // Oculto por defecto, el usuario puede mostrarlo
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
  { name: 'stockmin', label: 'Stock min', field: 'stockmin', dataType: 'number' },
  { name: 'stockmax', label: 'Stock max', field: 'stockmax', dataType: 'number' },
  // Campo 'sucursal' utiliza el valor aplanado 'sucursalValor' para filtrado y orden
  { name: 'sucursal', label: 'Sucursal', field: 'sucursalValor', align: 'left', dataType: 'text' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', dataType: 'number' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

/**
 * Lista de nombres de columnas que se incluirán en reportes y exportaciones
 * Coincide con los campos relevantes para el negocio
 */
const ArrayHeaders = [
  'codigo',
  'nombre',
  'direccion',
  'telefono',
  'email',
  'tipoalmacen',
  'stockmin',
  'stockmax',
  'sucursal', // Apunta al campo aplanado 'sucursalValor'
  'estado',
]

// ==================== MÉTODOS PÚBLICOS ====================
/**
 * Genera un reporte PDF con los datos actualmente filtrados y las columnas visibles
 * Obtiene datos y configuración de la tabla base, genera PDF y muestra modal de vista previa
 */
function mostrarReporte() {
  // Obtiene los registros después de aplicar filtros (búsqueda y columnas)
  const data = tableRef.value?.obtenerDatosFiltrados() || []
  // Obtiene qué columnas están visibles en la UI actualmente
  const visibleColumns = tableRef.value?.obtenerColumnasVisibles() || []
  // Genera el documento PDF usando el generador especializado para almacenes
  const doc = PDFalmacenes({ rows: data, visibleColumnsFromTable: visibleColumns })
  // Convierte el PDF a data URL para incrustar en un iframe o visualizador
  pdfData.value = doc.output('dataurlstring')
  // Muestra el modal de previsualización
  mostrarModal.value = true
}
</script>
<style>

</style>
