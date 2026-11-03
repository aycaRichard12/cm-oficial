<template>
  <div class="q-pa-md">
    <!-- Pantallas medianas en adelante -->

    <!-- Pantallas pequeñas -->
    <div class="row flex justify-between">
      <q-btn color="primary" @click="$emit('atras')" class="btn-res" dense id="btnAtras">
        <q-icon name="arrow_back" class="icono" style="" />
        <span class="texto"> {{ $t('ui.volver-84a715') }}</span>
      </q-btn>

      <div class="title-p1">
        <div class="title">{{ $t('ui.productos-disponibles-2611d4') }}</div>
        <div></div>
      </div>

      <q-btn color="primary" @click="$emit('continuar')" class="btn-res" dense id="btnContinuar">
        <q-icon name="arrow_forward" class="icono" />
        <span class="texto">{{ $t('configuracion.clienteAlmacen.dialog.okButtonSuccess') }}</span>
      </q-btn>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-x-md flex justify-between" id="filtroProductos">
      <div class="col-12 col-md-4">
        <label for="almacen">{{ $t('inventario.warehouse') }}</label>
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
        <label for="buscar">{{ $t('common.search') }}</label>
        <q-input dense debounce="300" v-model="filter" id="buscar" outlined />
      </div>
    </div>

    <!-- Tabla de productos -->
    <q-table
      :title="$t('ui.productos-2d7e7d')"
      v-if="filtro"
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      virtual-scroll
      virtual-scroll-slice-ratio-after=""
      bordered
      :filter="filter"
    >
      <template v-slot:top-right> </template>
      <template v-slot:header-cell-seleccion="propsHeader">
        <q-th :props="propsHeader">
          <q-checkbox
            :model-value="isAllSelected"
            :indeterminate="isSomeSelected"
            @update:model-value="onToggleAll"
          />
          {{ propsHeader.col.label }}
        </q-th>
      </template>
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
          <q-checkbox v-model="seleccionados" :val="props.row.id" id="checkboxProductos" />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="mostrarImagen">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>{{ $t('ui.vista-previa-de-imagen-89419f') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch, computed } from 'vue'
import { imagen } from 'src/boot/url'
// Props
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

// Lógica para seleccionar todos
const isAllSelected = computed(() => {
  return props.rows.length > 0 && props.rows.every((row) => seleccionados.value.includes(row.id))
})

const isSomeSelected = computed(() => {
  return seleccionados.value.length > 0 && !isAllSelected.value
})

const onToggleAll = (val) => {
  if (val) {
    seleccionados.value = props.rows.map((row) => row.id)
  } else {
    seleccionados.value = []
  }
}

// Paginación

const columns = [
  { name: 'index', label: i18nT('cotizacion.table.number'), field: 'index', align: 'right' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left' },
  { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: i18nT('ui.sub-categoria-229e51'), field: 'subcategoria', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'codigo_barra', label: i18nT('ui.codigo-barra-427dc4'), field: 'codigo_barra', align: 'left' },
  { name: 'caracteristicas', label: i18nT('ui.caracteristicas-2d11e4'), field: 'caracteristicas', align: 'left' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'left' },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left' },
  { name: 'otras', label: i18nT('ui.otras-caracteristicas-c95475'), field: 'otras', align: 'left' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha', align: 'left' },
  { name: 'imagen', label: i18nT('ui.imagen-100f99'), field: 'imagen', align: 'center' },
  { name: 'seleccion', label: i18nT('configGeneral.divisas.table.options'), field: 'id' },
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
