<template>
  <div class="q-pa-md">
    <!-- Pantallas medianas en adelante -->

    <!-- Pantallas pequeñas -->
    <div class="row flex justify-between">
      <q-btn color="primary" @click="$emit('atras')" class="btn-res" dense>
        <q-icon name="arrow_back" class="icono" style="" />
        <span class="texto"> Volver</span>
      </q-btn>

      <div class="title-p1">
        <div class="title">Productos Disponibles:</div>
        <div></div>
      </div>

      <q-btn color="primary" @click="$emit('continuar')" class="btn-res" dense>
        <q-icon name="arrow_forward" class="icono" />
        <span class="texto">Continuar</span>
      </q-btn>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-x-md flex justify-between">
      <div class="col-12 col-md-4">
        <label for="almacen">Almacén</label>
        <q-select
          v-model="filtro"
          :options="opciones"
          id="almacen"
          dense
          outlined
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-12 col-md-2">
        <label for="buscar">Buscar...</label>
        <q-input dense debounce="300" v-model="filter" id="buscar" outlined />
      </div>
    </div>

    <!-- Tabla de productos -->
    <q-table
      title="productos"
      v-if="filtro"
      :rows="rows"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      flat
      bordered
      virtual-scroll
      :filter="filter"
      class="my-sticky-header-table q-mt-md"
    >
      <template v-slot:top-right> </template>
      <template #body-cell-imagen="props">
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
      <template #body-cell-seleccion="props">
        <q-td :props="props">
          <q-checkbox v-model="seleccionados" :val="props.row.id" />
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { imagen } from 'src/boot/url'
// Props
const mostrarImagen = ref(false)
const imagenSeleccionada = ref(null)

const abrirModal = (img) => {
  imagenSeleccionada.value = img
  mostrarImagen.value = true
}
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  opciones: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['atras', 'continuar', 'onSeleccion_almacen', 'productosSeleccionados'])

const filtro = ref(null) // almacén seleccionado
const filter = ref('') // texto del buscador
const seleccionados = ref([])

// Paginación
const pagination = ref({
  rowsPerPage: 10,
})

const columns = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'right' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'categoria', label: 'Categoría', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub categoría', field: 'subcategoria' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion' },
  { name: 'codigo_barra', label: 'Código barra', field: 'codigo_barra' },
  { name: 'caracteristicas', label: 'Características', field: 'caracteristicas' },
  { name: 'estado', label: 'Estado', field: 'estado' },
  { name: 'unidad', label: 'Unidad', field: 'unidad' },
  { name: 'otras', label: 'Otras características', field: 'otras' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'right' },
  { name: 'imagen', label: 'Imagen', field: 'imagen' },
  { name: 'seleccion', label: 'Opciones', field: 'id' },
]

// Emitir selección de almacén
watch(filtro, (val) => {
  emit('onSeleccion_almacen', val)
})
watch(seleccionados, (ids) => {
  const datos = ids.map((id) => ({
    idproducto: String(id), // convertir a string si es necesario
    idalmacen: String(filtro.value), // también convertir si es necesario
  }))
  emit('productosSeleccionados', datos)
})
</script>

<style scoped>
.my-sticky-header-table {
  max-height: 600px;
  overflow-y: auto;
}
</style>
