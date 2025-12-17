<template>
  <div class="row flex justify-between">
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-6">
        <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
          <q-icon name="add" class="icono" />
          <span class="texto">Agregar</span>
        </q-btn>
      </div>
    </div>

    <div>
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
  <q-table
    title="Listado de Productos"
    :rows="ordenados"
    :columns="columns"
    row-key="id"
    flat
    bordered
    :filter="search"
  >
    <template v-slot:top-right> </template>

    <template v-slot:body-cell-imagen="props">
      <q-td :props="props">
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
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat />
        <!-- <q-btn color="blue" text-color="black" label="" dense="" /> -->
      </q-td>
    </template>
  </q-table>

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
import { ref, computed } from 'vue'
import { imagen } from 'src/boot/url'
import { getTipoFactura } from 'src/composables/FuncionesG'
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
    { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
    { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
    { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left' },
    { name: 'codigobarras', label: 'Cod.Barra', field: 'codigobarras', align: 'right' },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left' },
    { name: 'estadoproducto', label: 'Estado', field: 'estadoproducto', align: 'left' },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
    { name: 'caracteristica', label: 'Otras caract.', field: 'caracteristica', align: 'left' },
    { name: 'productosin', label: 'Producto SIN', field: 'productosin', align: 'left' },
    { name: 'codigonandina', label: 'CodigoNandina', field: 'codigonandina', align: 'left' },

    { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
  ]
} else {
  columns = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
    { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
    { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
    { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left' },
    { name: 'codigobarras', label: 'Cod.Barra', field: 'codigobarras', align: 'right' },
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left' },
    { name: 'estadoproducto', label: 'Estado', field: 'estadoproducto', align: 'left' },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
    { name: 'caracteristica', label: 'Otras caract.', field: 'caracteristica', align: 'left' },

    { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
  ]
}

const ordenados = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)

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
