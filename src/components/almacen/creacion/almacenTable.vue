<template>
  <div class="q-pa-md">
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="Registrar Almacen"
        id="agregarAlmacen"
      >
        <q-icon name="add" class="icono" />
        <span class="texto" >Agregar</span>
      </q-btn>
      <q-btn color="info" outline @click="mostrarReporte" class="btn-res q-mt-lg">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto" id="vistaPreviaPDF">Vista previa PDF</span>
      </q-btn>
      <div id="buscarAlmacen">
        <label for="buscar" >Buscar...</label>
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
      </div>
    </div>

    <BaseFilterableTable
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

// Pre-procesar las filas para que los valores anidados sean campos de nivel superior
// Esto facilita el trabajo de BaseFilterableTable y ColumnFilter.
const decoratedRows = computed(() => {
  return props.rows.map((row) => ({
    ...row,
    // Aplanamos el valor de la sucursal
    sucursalValor: row.sucursales?.length ? row.sucursales[0].nombre : '-',
  }))
})

// Columnas con el nuevo prop 'dataType' y apuntando al campo aplanado
const columnas = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', dataType: 'text' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left', dataType: 'text' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', dataType: 'text' },
  { name: 'email', label: 'Email', field: 'email', align: 'left', dataType: 'text' },
  {
    name: 'tipoalmacen',
    label: 'Tipo almacén',
    field: 'tipoalmacen',
    align: 'left',
    dataType: 'text',
  },
  { name: 'stockmin', label: 'Stock min', field: 'stockmin', dataType: 'number' },
  { name: 'stockmax', label: 'Stock max', field: 'stockmax', dataType: 'number' },
  // Usar el campo aplanado para filtrado y orden
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
  'sucursal', // Apunta al campo aplanado 'sucursalValor'
  'estado',
]

function mostrarReporte() {
  // Nota: PDFalmacenes podría necesitar 'decoratedRows.value' en lugar de 'props.rows'
  const doc = PDFalmacenes({ rows: decoratedRows.value })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>
<style>
/* El estilo se mantiene en BaseFilterableTable para ser genérico */
</style>
