<template>
  <div class="row flex justify-between">
    <div class="row q-col-gutter-x-md" id="agregarproducto">
      <div class="col-12 col-md-6">
        <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
          <q-icon name="add" class="icono" />
          <span class="texto">Agregar</span>
        </q-btn>
      </div>
    </div>

    <div id="buscarproducto">
      <label for="buscar"> Buscar...</label>
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
      id="tablaProductos"

    ref="reHijo"
    title="Listado de Productos"
    :rows="props.rows"
    :columns="columns"
    :arrayHeaders="arrayHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm"
  >
    <template v-slot:top-right> </template>

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
    <template v-slot:body-cell-productosin="props" >
      <q-td :props="props">
        <div class="text-truncate" @click.stop>
          {{ props.row.productosin.descripcion }}

          <q-popup-proxy>
            <q-card class="q-pa-sm" style="max-width: 300px; white-space: normal">
              {{ props.row.productosin.descripcion }}
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
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat id="eliminarproducto" />
        <!-- <q-btn color="blue" text-color="black" label="" dense="" /> -->
      </q-td>
    </template>
  </BaseFilterableTable>

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
</template>

<script setup>
import { ref } from 'vue'
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
})
defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'mostrarReporte'])

let columns = []
if (tipoFactura) {
  columns = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'right', dataType: 'number' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', dataType: 'date' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
    { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', dataType: 'text' },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', dataType: 'text' },
    { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left', dataType: 'text' },
    { name: 'codigobarras', label: 'Cod.Barra', field: 'codigobarras', align: 'right', dataType: 'text' },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text' },
    { name: 'estadoproducto', label: 'Estado', field: 'estadoproducto', align: 'left', dataType: 'text' },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text' },
    { name: 'caracteristica', label: 'Otras caract.', field: 'caracteristica', align: 'left', dataType: 'text' },
    { name: 'productosin', label: 'Producto SIN', field: 'productosin', align: 'left', dataType: 'text' },
    { name: 'codigonandina', label: 'CodigoNandina', field: 'codigonandina', align: 'left', dataType: 'text' },

    { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
  ]
} else {
  columns = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'right', dataType: 'number' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', dataType: 'date' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', dataType: 'text' },
    { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', dataType: 'text' },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', dataType: 'text' },
    { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left', dataType: 'text' },
    { name: 'codigobarras', label: 'Cod.Barra', field: 'codigobarras', align: 'right', dataType: 'text' },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text' },
    { name: 'estadoproducto', label: 'Estado', field: 'estadoproducto', align: 'left', dataType: 'text' },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text' },
    { name: 'caracteristica', label: 'Otras caract.', field: 'caracteristica', align: 'left', dataType: 'text' },

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
</script>
<style>
.text-truncate {
  max-width: 200px; /* ajusta según tu tabla */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
