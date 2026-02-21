<template>
  <div>
    <q-card flat class="q-mb-md">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="col-12 col-md-5">
          <div class="text-h6 text-primary text-weight-bold">
            <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
            Catálogo de Productos
          </div>
          <div class="text-caption text-grey-7">Administre sus productos y servicios</div>
        </div>
        <div class="col-12 col-md-7 row q-gutter-sm items-center justify-end q-mt-sm q-md-mt-none">
          <div id="buscarproducto" style="flex: 1; max-width: 300px">
            <q-input
              v-model="search"
              placeholder="Buscar en columnas..."
              dense
              outlined
              clearable
              debounce="300"
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div id="agregarproducto">
            <q-btn
              unelevated
              color="primary"
              @click="$emit('add')"
              icon="add"
              label="Agregar Producto"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <BaseFilterableTable
          id="tablaProductos"
          ref="reHijo"
          :rows="filteredRows"
          :columns="columns"
          :arrayHeaders="arrayHeaders"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template v-slot:top-right></template>

          <template v-slot:body-cell-imagen="props">
            <q-td :props="props" id="imagenproducto">
              <q-img
                :src="imagen + props.row.imagen"
                @click="abrirModal(props.row.imagen)"
                style="max-width: 100px; max-height: 100px; cursor: pointer"
                spinner-color="primary"
              >
                <template v-slot:error>
                  <div
                    class="column items-center justify-center bg-grey-3"
                    style="height: 100%; width: 100%"
                  >
                    <q-icon name="image_not_supported" size="md" color="grey-7" />
                  </div>
                </template>
              </q-img>
            </q-td>
          </template>
          <template v-slot:body-cell-productosin="props">
            <q-td :props="props">
              <div class="text-truncate" @click.stop v-if="props.row.productosin">
                {{ props.row.productosin?.descripcion }}

                <q-popup-proxy>
                  <q-card class="q-pa-sm" style="max-width: 300px; white-space: normal">
                    {{ props.row.productosin?.descripcion }}
                  </q-card>
                </q-popup-proxy>
              </div>
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
                flat
                id="editarproducto"
              />
              <q-btn
                icon="delete"
                color="negative"
                dense
                @click="$emit('delete-item', props.row)"
                flat
                id="eliminarproducto"
              />
              <!-- <q-btn color="blue" text-color="black" label="" dense="" /> -->
            </q-td>
          </template>
        </BaseFilterableTable>
      </q-card-section>
    </q-card>

    <q-dialog v-model="mostrarImagen">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Vista Previa de Imagen</div>
          <q-btn icon="close" flat dense round @click="mostrarImagen = false" />
        </q-card-section>
        <q-card-section>
          <q-img
            :src="imagen + imagenSeleccionada"
            style="max-width: 100%; max-height: 100%"
            spinner-color="primary"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { imagen } from 'src/boot/url'
import { getTipoFactura } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const tipoFactura = getTipoFactura(true)

const mostrarImagen = ref(false)
const imagenSeleccionada = ref(null)

const abrirModal = (img) => {
  imagenSeleccionada.value = img
  mostrarImagen.value = true
}
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'mostrarReporte'])

let columns = []
if (tipoFactura) {
  columns = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'right', dataType: 'number' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', dataType: 'date' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
    {
      name: 'descripcion',
      label: 'Descripción',
      field: 'descripcion',
      align: 'left',
      dataType: 'text',
    },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', dataType: 'text' },
    {
      name: 'subcategoria',
      label: 'Sub Categorías',
      field: 'subcategoria',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'codigobarras',
      label: 'Cod.Barra',
      field: 'codigobarras',
      align: 'right',
      dataType: 'text',
    },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text' },
    {
      name: 'estadoproducto',
      label: 'Estado',
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
    },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text' },
    {
      name: 'caracteristica',
      label: 'Otras caract.',
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'productosin',
      label: 'Producto SIN',
      field: 'productosin',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'codigonandina',
      label: 'CodigoNandina',
      field: 'codigonandina',
      align: 'left',
      dataType: 'text',
    },

    { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
  ]
} else {
  columns = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'right', dataType: 'number' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', dataType: 'date' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
    {
      name: 'descripcion',
      label: 'Descripción',
      field: 'descripcion',
      align: 'left',
      dataType: 'text',
    },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', dataType: 'text' },
    {
      name: 'subcategoria',
      label: 'Sub Categorías',
      field: 'subcategoria',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'codigobarras',
      label: 'Cod.Barra',
      field: 'codigobarras',
      align: 'right',
      dataType: 'text',
    },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text' },
    {
      name: 'estadoproducto',
      label: 'Estado',
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
    },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text' },
    {
      name: 'caracteristica',
      label: 'Otras caract.',
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
    },

    { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
  ]
}

const arrayHeaders = [
  'numero',
  'fecha',
  'codigo',
  'nombre',
  'descripcion',
  'categoria',
  'subcategoria',
  'codigobarras',
  'medida',
  'estadoproducto',
  'unidad',
  'caracteristica',
  'productosin',
  'codigonandina',
]

const search = ref('')

const filteredRows = computed(() => {
  if (!search.value) return props.rows
  const term = search.value.toLowerCase()
  return props.rows.filter((row) => {
    // Buscar el término en cualquier propiedad de la fila (sin importar qué columna sea)
    return Object.values(row).some((val) => val && String(val).toLowerCase().includes(term))
  })
})
</script>
<style>
.text-truncate {
  max-width: 200px; /* ajusta según tu tabla */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
