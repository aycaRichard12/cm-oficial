//src\components\producto\creacion\productoTable.vue
<template>
  <div>
    <q-card flat class="q-mb-md">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="col-12 col-md-4">
          <div class="text-h6 text-primary text-weight-bold">
            <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
            {{ $t('ui.catalogo-de-productos-490ce0') }}
          </div>
          <div class="text-caption text-grey-7">{{ $t('ui.administre-sus-productos-y-servicios-13ce98') }}</div>
        </div>
        <div class="col-12 col-md-8">
          <div class="row q-gutter-sm items-center justify-end q-mt-sm q-md-mt-none">
            <q-btn
              unelevated
              outline
              color="blue"
              @click="$emit('irconjunto')"
              icon="mdi-set-all"
              :label="$t('ui.conjunto-286eb2')"
            />
            <q-btn
              unelevated
              outline
              color="indigo"
              @click="exportarDatos"
              icon="mdi-file-excel"
              :label="$t('ui.descargar-excel-af6e96')"
            />
            <q-btn
              unelevated
              outline
              color="positive"
              @click="exportarFormato"
              icon="mdi-file-download-outline"
              :label="$t('ui.descargar-formato-8c0088')"
            />
            <q-btn
              unelevated
              outline
              color="secondary"
              @click="$refs.fileInput.click()"
              icon="mdi-file-upload-outline"
              :label="$t('ui.cargar-excel-84791b')"
              :loading="importing"
              :disable="importing"
            />
            <q-btn color="primary" @click="$emit('add')" class="btn-res" :title="$t('ui.registrar-producto-4df83c')">
              <q-icon name="add" class="icono" />
              <span class="texto"> <q-icon name="add" /> {{ $t('common.new') }} </span>
            </q-btn>
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".xlsx, .xls"
              @change="onFileSelected"
            />
            <q-btn
              v-if="selectedIds.size > 0"
              unelevated
              color="negative"
              icon="delete_sweep"
              :label="$t('ui.eliminar-seleccionados-f4a28a')"
              @click="eliminarSeleccionados"
            />
            <!-- Dentro de <q-card-section class="row items-center justify-between q-pb-none"> -->
            <q-checkbox
              v-model="selectAll"
              :label="$t('ui.seleccionar-todo-4c6fdc')"
              :indeterminate="selectedIds.size > 0 && selectedIds.length < filteredRows.length"
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
                icon="tune"
                color="secondary"
                dense
                class="q-mr-sm"
                @click="$emit('gestionar-variantes', props.row)"
                flat
                :title="$t('ui.gestionar-variantes-a83405')"
                id="variantesproducto"
              />
              <q-btn
                icon="delete"
                color="negative"
                dense
                @click="$emit('delete-item', props.row)"
                flat
                id="eliminarproducto"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-seleccionar="props">
            <q-td :props="props" auto-width>
              <q-checkbox
                :model-value="selectedIds.has(props.row.id)"
                @update:model-value="(val) => toggleSeleccion(props.row.id, val)"
                dense
              />
            </q-td>
          </template>
        </BaseFilterableTable>
      </q-card-section>
    </q-card>

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
import { ref, computed, watch } from 'vue'
import { imagen } from 'src/boot/url'
import { getTipoFactura } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import {
  exportarPlantillaProductos,
  importarProductosDesdeExcel,
  exportToXLSX_CatalogoProductos,
} from 'src/utils/XCLReportImport'
import { useQuasar } from 'quasar'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'

const selectedIds = ref(new Set())
const $q = useQuasar()
const fileInput = ref(null)
const reHijo = ref(null) // Template ref -> BaseFilterableTable

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
  importing: { type: Boolean, default: false },
})

let columns = []
if (tipoFactura) {
  columns = [
    { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'right', dataType: 'number' },
    {
      name: 'fecha',
      label: i18nT('cotizacion.table.date'),
      field: 'fecha',
      align: 'left',
      format: (val) => cambiarFormatoFecha(val),
      dataType: 'date',
    },
    { name: 'codigo', label: i18nT('ui.cod-fc240c'), field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left', dataType: 'text' },
    {
      name: 'descripcion',
      label: i18nT('configuracion.servicios.table.descripcion'),
      field: 'descripcion',
      align: 'left',
      dataType: 'text',
    },
    { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left', dataType: 'text' },
    {
      name: 'subcategoria',
      label: i18nT('configProducto.categoriaProducto.table.subcategoria'),
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
    {
      name: 'medida',
      label: i18nT('ui.medida-dea00a'),
      field: 'medida',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'estadoproducto',
      label: i18nT('cotizacion.table.status'),
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'unidad',
      label: i18nT('configProducto.unidadProducto.table.nombre'),
      field: 'unidad',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'caracteristica',
      label: i18nT('ui.otras-caract-e96743'),
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'productosin',
      label: i18nT('ui.producto-sin-2f0a27'),
      field: 'productosin',
      align: 'left',
      dataType: 'text',
      defaultVisible: false,
    },
    {
      name: 'codigonandina',
      label: i18nT('ui.codigonandina-9cf2cb'),
      field: 'codigonandina',
      align: 'left',
      dataType: 'text',
      defaultVisible: false,
    },

    { name: 'imagen', label: i18nT('ui.imagen-100f99'), field: 'imagen', align: 'center' },
    { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', sortable: false },
    {
      name: 'seleccionar',
      label: '',
      field: 'seleccionar',
      align: 'center',
      sortable: false,
      headerStyle: 'width: 50px',
    },
  ]
} else {
  columns = [
    { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'right', dataType: 'number' },
    {
      name: 'fecha',
      label: i18nT('cotizacion.table.date'),
      field: 'fecha',
      align: 'left',
      format: (val) => cambiarFormatoFecha(val),
      dataType: 'date',
    },
    { name: 'codigo', label: i18nT('ui.cod-fc240c'), field: 'codigo', align: 'left', dataType: 'text' },
    { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left', dataType: 'text' },
    {
      name: 'descripcion',
      label: i18nT('configuracion.servicios.table.descripcion'),
      field: 'descripcion',
      align: 'left',
      dataType: 'text',
    },
    { name: 'categoria', label: i18nT('configProducto.categoriaProducto.types.categoria'), field: 'categoria', align: 'left', dataType: 'text' },
    {
      name: 'subcategoria',
      label: i18nT('configProducto.categoriaProducto.table.subcategoria'),
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
    {
      name: 'medida',
      label: i18nT('ui.medida-dea00a'),
      field: 'medida',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'estadoproducto',
      label: i18nT('cotizacion.table.status'),
      field: 'estadoproducto',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'unidad',
      label: i18nT('configProducto.unidadProducto.table.nombre'),
      field: 'unidad',
      align: 'left',
      dataType: 'text',
    },
    {
      name: 'caracteristica',
      label: i18nT('ui.otras-caract-e96743'),
      field: 'caracteristica',
      align: 'left',
      dataType: 'text',
    },

    { name: 'imagen', label: i18nT('ui.imagen-100f99'), field: 'imagen', align: 'center' },
    { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', sortable: false },
    {
      name: 'seleccionar',
      label: '',
      field: 'seleccionar',
      align: 'center',
      sortable: false,
      headerStyle: 'width: 50px',
    },
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
  const rowsToExport = filteredRows.value
  if (!rowsToExport || rowsToExport.length === 0) {
    $q.notify({ type: 'warning', message: i18nT('ui.no-hay-datos-para-exportar-e911a2') })
    return
  }

  // Obtener nombres de columnas visibles desde el hijo (BaseFilterableTable).
  // Si el hijo aún no montó, devolvemos null y la utilidad exportará todo.
  const visibleColumns = reHijo.value?.obtenerColumnasVisibles?.() ?? null

  // Caso límite: el usuario desmarcó TODAS las columnas.
  // Distinguimos "no se consultó" (null) de "se consultó y quedó vacío" ([]).
  if (Array.isArray(visibleColumns) && visibleColumns.length === 0) {
    $q.notify({ type: 'warning', message: i18nT('ui.no-hay-columnas-visibles-para-exportar-c746cc') })
    return
  }

  console.log(
    '[productoTable] Exportando con columnas visibles:',
    visibleColumns ? visibleColumns.map((c) => c.name) : '(todas)',
  )

  exportToXLSX_CatalogoProductos(rowsToExport, visibleColumns)
}
const emit = defineEmits([
  'add',
  'edit-item',
  'delete-item',
  'toggle-status',
  'mostrarReporte',
  'importar',
  'delete-selected',
  'gestionar-variantes',
])

const toggleSeleccion = (id, checked) => {
  if (checked) {
    selectedIds.value.add(id)
  } else {
    selectedIds.value.delete(id)
  }
  // Forzar reactividad de Set (en Vue 3 no siempre es necesario, pero mejor)
  selectedIds.value = new Set(selectedIds.value)
}

const eliminarSeleccionados = () => {
  if (selectedIds.value.size === 0) return
  const ids = [...selectedIds.value]
  emit('delete-selected', ids)
  selectedIds.value = new Set() // limpiar selección
}

const selectAll = computed({
  get() {
    return (
      filteredRows.value.length > 0 &&
      filteredRows.value.every((row) => selectedIds.value.has(row.id))
    )
  },
  set(val) {
    if (val) {
      // Agregar todos los IDs visibles
      const ids = filteredRows.value.map((row) => row.id)
      selectedIds.value = new Set(ids)
    } else {
      selectedIds.value = new Set()
    }
  },
})
const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    $q.loading.show({ message: i18nT('ui.leyendo-archivo-excel-1d8d76') })
    const data = await importarProductosDesdeExcel(file)
    event.target.value = ''

    if (data && data.length > 0) {
      // Actualizar mensaje con la cantidad de productos
      const total = data.length
      $q.loading.show({
        message: `Importando ${total} producto${total !== 1 ? 's' : ''}...`,
      })
      // Emitir los datos; el padre debe poner importing=true (si no lo está) y luego false al finalizar
      emit('importar', data)
    } else {
      // Si no hay datos, ocultar loading y notificar
      $q.loading.hide()
      $q.notify({ type: 'warning', message: i18nT('ui.el-archivo-no-contiene-productos-validos-5e97db') })
    }
  } catch (error) {
    console.error('Error al importar:', error)
    $q.loading.hide()
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-procesar-el-archivo-excel-435a1a') })
  }
}
watch(
  () => props.rows,
  () => {
    selectedIds.value = new Set()
  },
)
watch(
  () => props.importing,
  (nuevo) => {
    if (!nuevo) {
      $q.loading.hide()
    }
  },
)
</script>
<style>
.text-truncate {
  max-width: 200px; /* ajusta según tu tabla */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
