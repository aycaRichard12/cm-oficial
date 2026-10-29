<template>
  <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
    <div class="col-12 col-md-auto">
      <div class="text-h5 text-primary text-weight-bold flex items-center">
        <q-icon name="label" size="md" class="q-mr-sm" />
        {{ $t('ui.asignar-categoria-c2be14') }}
      </div>
      <div class="text-subtitle2 cm-text-muted q-mt-xs">{{ $t('ui.administracion-de-asignar-categoria-829d80') }}</div>
    </div>
  </div>
  <!-- Encabezado de acciones -->
  <div class="row q-mt-lg q-gutter-md items-center">
    <!-- Columna: botones principales -->
    <div class="col-auto flex flex-col gap-3">
      <q-btn
        color="primary"
        class="btn-res"
        no-caps
        @click="$emit('add')"
        id="btn-categoria-precios"
        :title="$t('ui.asignar-catgoria-precio-ebca65')"
      >
        <q-icon name="add" class="icono" />
        <span class="texto"> <q-icon name="add" /> {{ $t('ui.nueva-asignacion-e3b420') }}</span>
      </q-btn>

      <q-btn
        color="secondary"
        class="btn-res"
        id="reportedecategoriasdeprecio"
        to="/reportedecategoriasdeprecio"
        icon="assessment"
        :label="$t('ui.reporte-categorias-08e57a')"
        no-caps
      />
    </div>

    <!-- Columna: filtro de almacén -->

    <!-- Columna: acción PDF -->
    <div class="col-auto">
      <q-btn
        color="info"
        outline
        class="btn-res"
        icon="picture_as_pdf"
        :label="$t('ui.vista-previa-pdf-9db3ed')"
        no-caps
        @click="imprimir"
        id="btn-imprimir-categoria"
      />
    </div>
  </div>

  <div class="row justify-between q-gutter-md q-mt-md q-mb-md">
    <!-- Filtro de almacén -->

    <div class="col-auto">
      <q-select
        v-model="filtroAlmacen"
        :options="almacenes"
        :label="$t('inventario.warehouse')"
        dense
        outlined
        map-options
        clearable
        class="min-w-[200px]"
        :hint="filtroAlmacen ? `Filtrando: ${filtroAlmacen.label}` : $t('ui.todos-los-almacenes-949f2c')"
        style="width: 220px"
      />
    </div>

    <!-- Buscador -->

    <div id="inputBuscarCategoriaPrecio">
      <q-input
        v-model="search"
        :label="$t('common.search')"
        dense
        outlined
        debounce="300"
        class="cm-surface min-w-[220px]"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <!-- Tabla -->
  <q-table
    flat
    :rows="filtradas"
    :filter="search"
    :columns="columnas"
    row-key="id"
    :pagination="{ rowsPerPage: 5 }"
    id="tableCategoriaPrecios"
  >
    <template v-slot:top-right> </template>
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="$t('common.active')" outline />
        <q-badge color="red" v-else :label="$t('common.inactive')" outline />
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
          id="btnEditarCategoriaPrecio"
        />
        <q-btn
          icon="delete"
          color="negative"
          dense
          @click="$emit('delete-item', props.row)"
          flat
          id="btnEliminarCategoriaPrecio"
        />
        <q-btn
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
          @click="$emit('toggle-status', props.row)"
          id="btnToggleEstadoCategoriaPrecio"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="mostrarModal" full-width full-height>
    <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, watch } from 'vue'

import { useCurrencyStore } from 'src/stores/currencyStore'
import { PDF_REPORTE_CATEGORIA_PRECIO_X_ALMACEN } from 'src/utils/pdfReportGenerator'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const filtroAlmacen = ref(null)
const pdfData = ref(null)
const mostrarModal = ref(false)
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
})
console.log('Props almacenes en tabla:', props.rows)
defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), align: 'right', field: 'numero', sortable: true },
  { name: 'nombre', label: i18nT('configProducto.categoriaProducto.types.categoria'), align: 'left', field: 'nombre' },
  { name: 'porcentaje', label: i18nT('ui.porcentaje-47bcdf'), align: 'right', field: 'porcentaje' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), align: 'center', field: 'estado' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), align: 'center' },
]
const filtradas = computed(() => {
  let rows = props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))

  // Solo filtrar si hay selección
  console.log(filtroAlmacen.value)
  if (filtroAlmacen.value !== null) {
    rows = rows.filter((categoria) => categoria.idalmacen == filtroAlmacen.value?.value)
  }

  // Filtro por búsqueda
  if (search.value) {
    const term = search.value.toLowerCase()
    rows = rows.filter((r) => r.nombre.toLowerCase().includes(term))
  }

  return rows
})
console.log(props.almacenes)
watch(
  () => props.almacenes,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      console.log(nuevosAlmacenes)
      filtroAlmacen.value = nuevosAlmacenes[0]
    }
  },
  { immediate: true },
)

const imprimir = () => {
  const doc = PDF_REPORTE_CATEGORIA_PRECIO_X_ALMACEN(filtradas.value, filtroAlmacen.value)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}

const search = ref('')
</script>
