<template>
  <q-card-section>
    <q-form @submit.prevent class="q-mb-md">
      <div class="row q-col-gutter-md justify-center" id="filtrosCatalogo">
        <div class="col-12 col-md-4">
          <label for="almacen" class="text-weight-bold text-grey-8 q-mb-sm block">Almacén*</label>
          <q-select
            v-model="almacenSeleccionado"
            id="almacen"
            :options="almacenes"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            :loading="cargandoAlmacenes"
            @update:model-value="onAlmacenChange"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="categoria" class="text-weight-bold text-grey-8 q-mb-sm block">
            Categoría de precio*
          </label>
          <q-select
            v-model="categoriaSeleccionada"
            id="categoria"
            :options="categoriasPrecio"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            :loading="cargandoCategorias"
            :disable="!almacenSeleccionado"
            @update:model-value="cargarProductos"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="fecha" class="text-weight-bold text-grey-8 q-mb-sm block">Fecha</label>
          <q-input
            v-model="fecha"
            id="fecha"
            type="date"
            outlined
            dense
            :disable="!almacenSeleccionado"
          />
        </div>
      </div>

      <div class="row justify-center q-mt-lg q-gutter-sm">
        <q-btn
          color="secondary"
          label="Vista Previa"
          icon="visibility"
          :loading="cargandoProductos"
          :disable="!almacenSeleccionado || !categoriaSeleccionada"
          @click="cargarProductos"
        />
        <q-btn
          id="descargarCatalogo"
          color="primary"
          label="Descargar Catálogo"
          icon="picture_as_pdf"
          :loading="generando"
          :disable="!almacenSeleccionado || !categoriaSeleccionada || datosCatalogo.length === 0"
          @click="descargarCatalogo"
        />
      </div>
    </q-form>

    <q-table
      id="tablaVistaPreviaCatalogo"
      class="q-mt-md"
      :rows="datosCatalogo"
      :columns="columnasCatalogo"
      row-key="id"
      dense
      flat
      :loading="cargandoProductos"
      :pagination="{ rowsPerPage: 10 }"
      no-data-label="Seleccione almacén y categoría para ver la vista previa"
    >
      <template v-slot:body-cell-imagen="props">
        <q-td :props="props">
          <q-img
            v-if="props.row.imagen"
            :src="imagen + props.row.imagen"
            style="width: 40px; height: 40px"
            fit="contain"
            spinner-color="primary"
          >
            <template v-slot:error>
              <q-icon name="image_not_supported" size="sm" color="grey-7" />
            </template>
          </q-img>
          <q-icon v-else name="image_not_supported" size="sm" color="grey-7" />
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          {{ Number(props.row.estado) === 1 ? 'Activo' : 'Inactivo' }}
        </q-td>
      </template>

      <template v-slot:body-cell-precioSugerido="props">
        <q-td :props="props" class="text-right">
          {{ Number(props.row.precioSugerido || 0).toFixed(2) }}
        </q-td>
      </template>
    </q-table>
  </q-card-section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { imagen } from 'src/boot/url'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { CatalogoPdfService } from 'src/modules/pdf/services/CatalogoPdfService'

const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario?.[0]?.empresa?.idempresa
const idusuario = contenidousuario?.[0]?.idusuario
const divisaActiva = useCurrencyStore().simbolo

const almacenes = ref([])
const categoriasPrecio = ref([])
const almacenSeleccionado = ref(null)
const categoriaSeleccionada = ref(null)
const fecha = ref(obtenerFechaActualDato())

const datosCatalogo = ref([])
const cargandoAlmacenes = ref(false)
const cargandoCategorias = ref(false)
const cargandoProductos = ref(false)
const generando = ref(false)

const columnasCatalogo = [
  { name: 'imagen', label: 'Img', field: 'imagen', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: 'Subcategoría', field: 'subcategoria', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  {
    name: 'precioSugerido',
    label: 'Precio Sugerido',
    field: 'precioSugerido',
    align: 'right',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

async function cargarAlmacenes() {
  try {
    cargandoAlmacenes.value = true
    const { data } = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
    const lista = Array.isArray(data) ? data : []

    if (lista.length === 0) {
      almacenes.value = []
      $q.notify({ type: 'info', message: 'No hay almacenes asignados a su usuario' })
      return
    }

    almacenes.value = lista
      .filter((obj) => obj.idusuario == idusuario)
      .map((item) => ({ label: item.almacen, value: item.idalmacen }))

    if (almacenes.value.length > 0) {
      almacenSeleccionado.value = almacenes.value[0].value
      await cargarCategoriasPrecio()
      if (categoriasPrecio.value.length > 0) {
        categoriaSeleccionada.value = categoriasPrecio.value[0].value
        await cargarProductos()
      }
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  } finally {
    cargandoAlmacenes.value = false
  }
}

async function cargarCategoriasPrecio() {
  if (!almacenSeleccionado.value) {
    categoriasPrecio.value = []
    categoriaSeleccionada.value = null
    return
  }

  try {
    cargandoCategorias.value = true
    categoriasPrecio.value = []
    categoriaSeleccionada.value = null

    const { data } = await api.get(`listarCategoriaPrecioVenta/${idempresa}`)
    const lista = Array.isArray(data) ? data : []

    categoriasPrecio.value = lista
      .filter((item) => item.estado == 1 && item.idalmacen == almacenSeleccionado.value)
      .map((item) => ({ label: item.nombre, value: item.id }))

    if (categoriasPrecio.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay categorías de precio activas para este almacén',
      })
    }
  } catch (error) {
    console.error('Error al cargar categorías de precio:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar las categorías de precio' })
  } finally {
    cargandoCategorias.value = false
  }
}

function onAlmacenChange() {
  datosCatalogo.value = []
  cargarCategoriasPrecio()
}

async function cargarProductos() {
  if (!almacenSeleccionado.value || !categoriaSeleccionada.value) {
    datosCatalogo.value = []
    return
  }

  cargandoProductos.value = true
  try {
    const point = `reporteproductoalmacen/${almacenSeleccionado.value}/${idempresa}/${categoriaSeleccionada.value}/${fecha.value || ''}`
    const { data } = await api.get(point)

    if (!Array.isArray(data)) {
      datosCatalogo.value = []
      return
    }
    datosCatalogo.value = data
  } catch (error) {
    console.error('Error al cargar productos:', error)
    datosCatalogo.value = []
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  } finally {
    cargandoProductos.value = false
  }
}

async function descargarCatalogo() {
  if (!almacenSeleccionado.value || !categoriaSeleccionada.value) {
    $q.notify({ type: 'warning', message: 'Seleccione almacén y categoría de precio' })
    return
  }

  if (datosCatalogo.value.length === 0) {
    await cargarProductos()
    if (datosCatalogo.value.length === 0) {
      $q.notify({ type: 'info', message: 'No hay productos para exportar' })
      return
    }
  }

  generando.value = true
  try {
    const almacenNombre =
      almacenes.value.find((a) => a.value === almacenSeleccionado.value)?.label || 'Todos'

    const service = new CatalogoPdfService()
    const doc = await service.generate({
      productos: datosCatalogo.value,
      almacenNombre,
      divisaActiva,
    })

    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogo_${almacenSeleccionado.value}_${categoriaSeleccionada.value}_${fecha.value || 'actual'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Catálogo descargado correctamente' })
  } catch (error) {
    console.error('Error al generar el catálogo:', error)
    $q.notify({ type: 'negative', message: 'Error al generar el catálogo' })
  } finally {
    generando.value = false
  }
}

onMounted(cargarAlmacenes)
</script>

<style scoped></style>
