<template>
  <div>
    <q-card flat class="q-mb-md">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="col-12 col-md-4">
          <div class="text-h6 text-primary text-weight-bold">
            <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
            Catálogo de Productos
          </div>
          <div class="text-caption text-grey-7">Administre sus productos y servicios</div>
        </div>
        <div class="col-12 col-md-8">
          <div class="row q-gutter-sm items-center justify-end q-mt-sm q-md-mt-none">
            <q-input
              v-model="search"
              placeholder="Buscar..."
              dense
              outlined
              clearable
              debounce="300"
              bg-color="white"
              style="min-width: 200px"
              class="q-mr-sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              unelevated
              outline
              color="indigo"
              @click="exportarDatos"
              icon="file_download"
              label="Descargar Catálogo"
            />
            <q-btn
              unelevated
              outline
              color="positive"
              @click="exportarFormato"
              icon="download"
              label="Descargar Formato"
            />
            <q-btn
              unelevated
              outline
              color="secondary"
              @click="$refs.fileInput.click()"
              icon="upload"
              label="Cargar Excel"
            />
            <q-btn
              unelevated
              color="primary"
              @click="$emit('add')"
              icon="add"
              label="Agregar Producto"
            />
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".xlsx, .xls"
              @change="onFileSelected"
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
import { exportarPlantillaProductos, importarProductosDesdeExcel, exportToXLSX_CatalogoProductos } from 'src/utils/XCLReportImport'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const fileInput = ref(null)

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
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text', defaultVisible: false },
    {
      name: 'estadoproducto',
      label: 'Estado',
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
    },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text', defaultVisible: false },
    {
      name: 'caracteristica',
      label: 'Otras caract.',
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
    },
    {
      name: 'productosin',
      label: 'Producto SIN',
      field: 'productosin',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
    },
    {
      name: 'codigonandina',
      label: 'CodigoNandina',
      field: 'codigonandina',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
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
    { name: 'medida', label: 'Caract.', field: 'medida', align: 'left', dataType: 'text', defaultVisible: false },
    {
      name: 'estadoproducto',
      label: 'Estado',
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
    },
    { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left', dataType: 'text', defaultVisible: false },
    {
      name: 'caracteristica',
      label: 'Otras caract.',
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
      defaultVisible: false
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

const exportarFormato = () => {
  exportarPlantillaProductos()
}

const exportarDatos = () => {
  if (props.rows.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay datos para exportar' })
    return
  }
  exportToXLSX_CatalogoProductos(props.rows)
}

const emit = defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'mostrarReporte', 'importar'])

const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    $q.loading.show({ message: 'Procesando archivo Excel...' })
    const data = await importarProductosDesdeExcel(file)
    if (data && data.length > 0) {
      emit('importar', data)
    }
    // Limpiar input
    event.target.value = ''
  } catch (error) {
    console.error('Error al importar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al procesar el archivo Excel',
    })
  } finally {
    $q.loading.hide()
  }
}
</script>
<style>
.text-truncate {
  max-width: 200px; /* ajusta según tu tabla */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
