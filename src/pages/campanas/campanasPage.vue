<template>
  <q-page padding>
    <!-- Header con título y botón de acción -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center q-pb-none">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary">
            <q-icon name="campaign" size="sm" class="q-mr-sm" />
            Gestión de Campañas
          </div>
          <div class="text-caption text-grey-7">Administre campañas promocionales y descuentos</div>
        </div>
        <div class="col-auto" id="nuevaCampana">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Campaña"
            @click="abrirNuevaCampana"
            size="md"
          />
        </div>
      </q-card-section>

      <!-- Filtros -->
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4" id="filtroAlmacen">
            <q-select
              v-model="idalmacenfiltro"
              :options="almacenesOptions"
              option-value="idalmacen"
              option-label="almacen"
              label="Filtrar por almacén"
              outlined
              dense
              emit-value
              map-options
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4" id="filtroBusqueda">
            <q-input v-model="busqueda" label="Buscar campaña..." outlined dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de campañas -->
    <q-card flat bordered>
      <q-table
        :rows="campanasFiltradas"
        :columns="columns"
        row-key="id"
        :filter="busqueda"
        v-model:pagination="pagination"
        flat
        :rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-porcentaje="props">
          <q-td :props="props">
            <q-badge color="orange" :label="`${props.row.porcentaje}% OFF`" />
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props" id="estadoCampana">
            <q-chip
              :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'"
              text-color="white"
              :icon="Number(props.row.estado) === 1 ? 'check_circle' : 'cancel'"
              clickable
              @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
            >
              {{ Number(props.row.estado) === 1 ? 'Activa' : 'Inactiva' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-detalles="props">
          <q-td :props="props">
            <q-btn-group flat>
              <q-btn
                id="btnCategoria"
                flat
                dense
                color="primary"
                icon="category"
                @click="cargarcategoria(props.row.id, props.row.idalmacen)"
              >
                <q-tooltip>Gestionar Categorías</q-tooltip>
              </q-btn>
              <q-btn
                id="btnProductos"
                flat
                dense
                color="primary"
                icon="shopping_cart"
                @click="cargarPrecios(props.row.id)"
                :disable="!tieneCategorias(props.row.id)"
              >
                <q-tooltip>
                  {{ tieneCategorias(props.row.id) ? 'Gestionar Productos' : 'Agregue categorías primero' }}
                </q-tooltip>
                <q-badge v-if="tieneCategorias(props.row.id)" color="green" floating rounded />
              </q-btn>
            </q-btn-group>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
                id="btnEditar"
                flat
                dense
                round
                color="primary"
                icon="edit"
                @click="editarCampana(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
                id="btnEliminar"
              flat
              dense
              round
              color="negative"
              icon="delete"
              @click="eliminar(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo de formulario -->
    <q-dialog v-model="formularioActivo" @hide="resetearFormulario" @keydown.esc="formularioActivo = false">
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="campaign" class="q-mr-sm" />
            {{ formData.id ? 'Editar Campaña' : 'Nueva Campaña' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="registrarCampana">
            <div class="row q-col-gutter-md">
              <div class="col-12 row items-center">
                <div class="col">
                  <q-input
                    v-model="formData.campana"
                    label="Nombre de la campaña *"
                    outlined
                    dense
                    required
                  >
                    <template v-slot:prepend>
                      <q-icon name="label" />
                    </template>
                  </q-input>
                </div>
                <div class="col-auto q-ml-sm">
                  <q-checkbox v-model="formData.estadoActivo" label="Activar" color="primary" />
                </div>
              </div>

              <div class="col-6">
                <q-input
                  v-model="formData.fechai"
                  label="Fecha de inicio *"
                  type="date"
                  outlined
                  dense
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-input
                  v-model="formData.fechaf"
                  label="Fecha final *"
                  type="date"
                  outlined
                  dense
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-input
                  v-model="formData.porcentaje"
                  label="Porcentaje de descuento *"
                  type="number"
                  suffix="%"
                  outlined
                  dense
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="percent" />
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-select
                  v-model="formData.idalmacen"
                  :options="almacenesOptions"
                  option-value="idalmacen"
                  option-label="almacen"
                  label="Almacén *"
                  outlined
                  dense
                  emit-value
                  map-options
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="store" />
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-mt-md q-gutter-sm justify-end">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn type="submit" unelevated color="primary" icon="save" label="Guardar" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para categorías de precios -->
    <q-dialog v-model="dialogoCategorias" persistent @hide="resetearCategoriaForm" @keydown.esc="dialogoCategorias = false">
      <q-card style="min-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="category" class="q-mr-sm" />
            Categorías de Precio
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="registrarCategoria">
            <q-select
              v-model="categoriaForm.idcategoriaprecio"
              :options="categoriasPrecioOptions"
              label="Seleccione categoría de precio"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              dense
              required
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
            </q-select>

            <div class="q-mt-md">
              <q-btn type="submit" unelevated color="primary" icon="add" label="Agregar Categoría" />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 text-grey-8 q-mb-md">Categorías Asignadas</div>
          <q-table
            :rows="categoriasCampana"
            :columns="columnsCategorias"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[5, 10]"
          >
            <template v-slot:body-cell-tipo="props">
              <q-td :props="props">
                <q-chip color="primary" text-color="white" icon="label">
                  {{ props.row.tipo }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click="eliminarCategoriaCampana(props.row.id)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para precios de campaña -->
    <q-dialog v-model="dialogoPrecios" persistent @hide="cancelarEdicionPrecio" @keydown.esc="dialogoPrecios = false">
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="shopping_cart" class="q-mr-sm" />
            {{ precioForm.id_detalle_campanas ? 'Editar Precio de Producto' : 'Productos en Campaña' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-banner v-if="precioForm.id_detalle_campanas" class="bg-info text-white q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="edit" />
            </template>
            Editando precio del producto
          </q-banner>

          <q-form @submit="registrarPrecioCampaña">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="precioForm.idcategoriacampaña"
                  :options="categoriasCampana"
                  option-value="id"
                  option-label="tipo"
                  emit-value
                  map-options
                  label="Categoría *"
                  outlined
                  dense
                  required
                  :readonly="!!precioForm.id_detalle_campanas"
                  @update:model-value="onCategoriaCampañaSeleccionada"
                >
                  <template v-slot:prepend>
                    <q-icon name="category" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <!-- Select for new products -->
                <q-select
                  v-if="!precioForm.id_detalle_campanas"
                  v-model="productoSeleccionado"
                  :options="productosNoAsignadosOptions"
                  option-value="id"
                  option-label="descripcion"
                  label="Producto *"
                  use-input
                  input-debounce="300"
                  @filter="filtrarProductos"
                  @update:model-value="alSeleccionarProducto"
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerido']"
                  :disable="!precioForm.idcategoriacampaña"
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.descripcion || scope.opt.producto }}</q-item-label>
                        <q-item-label caption>Código: {{ scope.opt.codigo }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    {{ scope.opt.descripcion || scope.opt.producto }}
                  </template>
                </q-select>

                <!-- Input when editing -->
                <q-input
                  v-else
                  v-model="precioForm.producto"
                  label="Producto *"
                  outlined
                  dense
                  required
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="precioForm.precio"
                  label="Precio de campaña *"
                  type="number"
                  step="0.01"
                  outlined
                  dense
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-mt-md q-gutter-sm">
              <q-btn
                type="submit"
                unelevated
                color="primary"
                :icon="precioForm.id_detalle_campanas ? 'save' : 'add'"
                :label="precioForm.id_detalle_campanas ? 'Actualizar' : 'Agregar'"
              />
              <q-btn
                v-if="precioForm.id_detalle_campanas"
                flat
                label="Cancelar Edición"
                color="grey-7"
                @click="cancelarEdicionPrecio"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="text-subtitle2 text-grey-8">Productos con Precio de Campaña</div>
            </div>
            <div class="col-auto">
              <q-select
                v-model="filtroPrecioCampania"
                :options="categoriasCampanaPrecioOptions"
                label="Filtrar por categoría"
                option-value="id"
                option-label="tipo"
                emit-value
                map-options
                outlined
                dense
                clearable
                style="min-width: 200px"
                @update:model-value="filtrarPrecios"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" />
                </template>
              </q-select>
            </div>
          </div>

          <q-table
            :rows="preciosCampanaFiltrados"
            :columns="columnsPrecios"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[5, 10, 20]"
          >
            <template v-slot:body-cell-codigo="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.codigo }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-precio="props">
              <q-td :props="props">
                <q-badge color="green" :label="`Bs ${props.row.precio}`" />
              </q-td>
            </template>

            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="edit"
                  @click="editarPrecioCampana(props.row)"
                  class="q-mr-sm"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click="eliminarPrecioCampana(props.row.id)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch.js'
import { URL_APICM } from 'src/composables/services'
import { api } from 'src/boot/axios'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const $q = useQuasar()
const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero')) || []
const idempresa = contenidousuario[0]?.empresa?.idempresa
const idusuario = contenidousuario[0]?.idusuario

// Estados reactivos UI Globales y Formularios
// const cargandoPrincipal = ref(false)
// const cargandoGuardar = ref(false)
// const cargandoGuardarCategoria = ref(false)
const cargandoGuardarPrecio = ref(false)

const formularioActivo = ref(false)
const idalmacenfiltro = ref(null)
const busqueda = ref('')
const filtroPrecioCampania = ref(null)
const dialogoCategorias = ref(false)
const dialogoPrecios = ref(false)
const pagination = ref({
  rowsPerPage: 10,
})

// Datos del formulario
const formData = ref({
  ver: 'registrarcampana',
  idusuario: idusuario,
  idalmacen: null,
  fechai: '',
  fechaf: '',
  campana: '',
  porcentaje: '',
  estadoActivo: true
})

const productoSeleccionado = ref(null)
const productosAlmacen = ref([])
const productosNoAsignados = ref([])
const productosNoAsignadosOptions = ref([])

const categoriaForm = ref({
  ver: 'registrocategoriacampaña',
  idcampaña: '',
  // almacen: '',
  idempresa: idempresa,
  idcategoriaprecio: null,
})

const precioForm = ref({
  idcampaña: '',
  producto: '',
  precio: '',
  id_detalle_campanas: null,
  idproducto: null,
  idproductoalmacen: null,
  idcategoriacampaña: null,
})

// Datos de la API
const campanas = ref([])
const almacenes = ref([])
const categoriasPrecio = ref([])
const categoriasCampana = ref([])
const preciosCampana = ref([])

// Columnas de las tablas
const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'fechainicio', label: 'Fecha Inicio', field: 'fechainicio', align: 'center' },
  { name: 'fechafinal', label: 'Fecha Final', field: 'fechafinal', align: 'center' },
  {
    name: 'porcentaje',
    label: 'Descuento',
    field: (row) => `${row.porcentaje} %`,
    align: 'center',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'detalles', label: 'Detalles', field: 'detalles', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const columnsCategorias = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'tipo', label: 'Categoria', field: 'tipo', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const columnsPrecios = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

// Opciones computadas
const almacenesOptions = computed(() => {
  return almacenes.value.map((almacen) => ({
    idalmacen: almacen.idalmacen,
    almacen: almacen.almacen,
  }))
})

const categoriasPrecioOptions = computed(() => {
  return categoriasPrecio.value.filter((cat) => cat.idalmacen == categoriaForm.value.almacen)
})

const categoriasCampanaPrecioOptions = computed(() => {
  return categoriasCampana.value
})

 const preciosCampanaFiltrados = computed(() => {
 if (filtroPrecioCampania.value === null || filtroPrecioCampania.value === '') {

    return preciosCampana.value.map((item, index) => ({
      ...item,
      numero: index + 1,
    }))
  }
  return preciosCampana.value
    .filter((item) => String(item.idcategoriaprecio) === String(filtroPrecioCampania.value) || String(item.idcategoriacampaña) === String(filtroPrecioCampania.value))
    .map((item, index) => ({
      ...item,
      numero: index + 1,
    }))
})

const campanasFiltradas = computed(() => {
  let filtered = campanas.value

  const almacen = idalmacenfiltro.value
  if (almacen) {
    if (almacen.idalmacen) {
      filtered = filtered.filter((camp) => String(camp.idalmacen) === String(almacen.idalmacen))
    } else {
      filtered = filtered.filter((camp) => String(camp.idalmacen) === String(almacen))
    }
  }

  return filtered.map((item, index) => ({
    ...item,
    numero: index + 1,
  }))
})

// Métodos
const abrirNuevaCampana = () => {
  resetearFormulario()
  formularioActivo.value = true
}

const obtenerFechaActual = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  let mm = today.getMonth() + 1
  let dd = today.getDate()

  if (dd < 10) dd = '0' + dd
  if (mm < 10) mm = '0' + mm

  return `${yyyy}-${mm}-${dd}`
}

const listarAlmacenes = async () => {
  try {
    const endpoint = `listaResponsableAlmacen/${idempresa}`
    const res = await api.get(endpoint)
    const resultado = res.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar almacenes',
      })
    } else {
      almacenes.value = resultado.filter((u) => u.idusuario == idusuario)
      idalmacenfiltro.value = almacenes.value[0]
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar almacenes',
    })
  }
}

const listarCampanas = async () => {
  try {
    const endpoint = `campanas/${idempresa}`
    const res = await api.get(endpoint)
    const resultado = res.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar campañas',
      })
    } else {
      campanas.value = resultado
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar campañas',
    })
  }
}

const listarCategoriasPrecio = async () => {
  try {
    const endpoint = `${URL_APICM}api/listaCategoriaPrecio/${idempresa}`
    const resultado = await peticionGET(endpoint)
    categoriasPrecio.value = resultado
  } catch (error) {
    console.error(error)
  }
}

const listarProductosAlmacen = async () => {
  try {
    const response = await api.get(`listaProductoAlmacen/${idempresa}`)
    if (response.data && Array.isArray(response.data)) {
      productosAlmacen.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar productos:', error)
  }
}

const registrarCampana = async () => {
  try {
    const form = objectToFormData(formData.value)
    // Determine if we're editing or creating based on formData.id
    const ver = formData.value.id ? 'editarcampaña' : 'registrarcampana'
    form.append('ver', ver)
    form.append('idusuario', idusuario)
    form.append('idempresa', idempresa)
    form.append('estado', formData.value.estadoActivo ? '1' : '2')

    const response = await api.post('', form)
    console.log(response)
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message:
          data.mensaje ||
          (formData.value.id ? 'Campaña actualizada con éxito' : 'Campaña registrada con éxito'),
      })
      await listarCampanas()
      formularioActivo.value = false
      resetearFormulario()
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al procesar campaña',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al procesar campaña',
    })
  }
}

const editarCampana = async (campana) => {
  try {
    const endpoint = `${URL_APICM}api/verificarExistenciacampana/${campana.id}`
    const resultado = await peticionGET(endpoint)

    if (resultado.estado === 'exito') {
      formData.value = {
        ...formData.value,
        id: resultado.datos.id,
        ver: 'editarcampaña',
        idalmacen: resultado.datos.idalmacen,
        fechai: resultado.datos.fechai,
        fechaf: resultado.datos.fechaf,
        campana: resultado.datos.nombre,
        porcentaje: resultado.datos.porcentaje,
        estadoActivo: Number(resultado.datos.estado) === 1,
      }
      // Open the form dialog
      formularioActivo.value = true
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al cargar la campaña',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la campaña',
    })
  }
}

const eliminar = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta campaña?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarcampana/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await listarCampanas()
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar campaña',
      })
    }
  })
}

const cambiarEstado = async (id, estado) => {
  try {
    const endpoint = `${URL_APICM}api/actualizarEstadocampana/${id}/${estado}`
    const resultado = await peticionGET(endpoint)

    if (resultado.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje,
      })
      await listarCampanas()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje,
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado',
    })
  }
}

const resetearFormulario = () => {
  formData.value.id = null
  formData.value.ver = 'registrarcampana'
  formData.value.idalmacen = null
  formData.value.fechai = obtenerFechaActual()
  formData.value.fechaf = obtenerFechaActual()
  formData.value.campana = ''
  formData.value.porcentaje = ''
  formData.value.estadoActivo = true
}

const resetearCategoriaForm = () => {
  categoriaForm.value.idcategoriaprecio = null
}

const cargarcategoria = async (idCampana, idAlmacen) => {
  try {
    categoriaForm.value.idcampaña = idCampana
    categoriaForm.value.almacen = idAlmacen

    const endpoint1 = `${URL_APICM}api/listaCategoriaPrecio/${idempresa}`
    const endpoint2 = `${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`

    const [resultado1, resultado2] = await Promise.all([
      peticionGET(endpoint1),
      peticionGET(endpoint2),
    ])

    categoriasPrecio.value = resultado1
    categoriasCampana.value = resultado2.map((item, index) => ({
      ...item,
      numero: index + 1,
    }))

    // Update tracking set
    if (resultado2 && resultado2.length > 0) {
      campanasConCategorias.value.add(idCampana)
    } else {
      campanasConCategorias.value.delete(idCampana)
    }

    dialogoCategorias.value = true
  } catch (error) {
    console.error(error)
  }
}

const registrarCategoria = async () => {
  // <input type="hidden" v-model="categoriaForm.ver" value="registrocategoriacampaña" />
  //           <input type="hidden" v-model="categoriaForm.idcampaña" />
  //           <input type="hidden" v-model="categoriaForm.almacen" />
  //           <input type="hidden" v-model="categoriaForm.idempresa" />
  try {
    //const form = document.getElementById('categoriacampañaform')
    const form = objectToFormData(categoriaForm.value)
    form.append('ver', 'registrocategoriacampaña')
    form.append('idusuario', idusuario)
    form.append('idempresa', idempresa)
    const response = await api.post('', form)
    console.log(response)
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje || 'Categoría registrada con éxito',
      })
      await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar categoría',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar categoría',
    })
  }
}

const eliminarCategoriaCampana = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta categoría?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarcategoriapreciocampaña/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar categoría',
      })
    }
  })
}

const cargarPrecios = async (idCampana) => {
  try {
    precioForm.value.idcampaña = idCampana
    productoSeleccionado.value = null
    precioForm.value.idcategoriacampaña = null
    productosNoAsignados.value = []
    productosNoAsignadosOptions.value = []

    const endpoint1 = `${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`
    const endpoint2 = `${URL_APICM}api/listapreciocampaña/${idCampana}`

    const [resultado1, resultado2] = await Promise.all([
      peticionGET(endpoint1),
      peticionGET(endpoint2),
    ])

    categoriasCampana.value = resultado1
    console.log('categoriasCampana', categoriasCampana.value)
    preciosCampana.value = resultado2
    console.log('preciosCampana', preciosCampana.value)

    dialogoPrecios.value = true
  } catch (error) {
    console.error(error)
  }
}

const onCategoriaCampañaSeleccionada = (idCatCampaña) => {
  productoSeleccionado.value = null
  precioForm.value.idproductoalmacen = null
  precioForm.value.idproducto = null
  precioForm.value.producto = ''

  if (!idCatCampaña) {
    productosNoAsignados.value = []
    productosNoAsignadosOptions.value = []
    return
  }

  const campanaActual = campanas.value.find(c => String(c.id) === String(precioForm.value.idcampaña))
  const idAlmacenCampana = campanaActual?.idalmacen || idalmacenfiltro.value?.idalmacen || idalmacenfiltro.value

  const productosDeEsteAlmacen = productosAlmacen.value.filter(p => String(p.idalmacen) === String(idAlmacenCampana))
  
  const asignados = preciosCampana.value.filter(p => String(p.idcategoriacampaña) === String(idCatCampaña))
  const idsAsignados = asignados.map(p => String(p.idproductoalmacen || p.idproducto))

  productosNoAsignados.value = productosDeEsteAlmacen.filter(p => !idsAsignados.includes(String(p.id)))
  productosNoAsignadosOptions.value = productosNoAsignados.value
}

const registrarPrecioCampaña = async () => {
  try {
    cargandoGuardarPrecio.value = true
    const payload = {
      ver: 'editarPreciocampana',
      idproducto: precioForm.value.idproducto,
      idproductoalmacen: precioForm.value.idproductoalmacen,
      precio: precioForm.value.precio,
      idcategoriacampaña: precioForm.value.idcategoriacampaña,
    }
    
    if (precioForm.value.id_detalle_campanas) {
      payload.id_detalle_campanas = precioForm.value.id_detalle_campanas
    }
    
    const response = await api.post('', payload)
    const data = response.data

    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message:
          data.mensaje ||
          (precioForm.value.id_detalle_campanas
            ? 'Precio actualizado con éxito'
            : 'Precio registrado con éxito'),
      })
      const idCampanaActual = precioForm.value.idcampaña
      cancelarEdicionPrecio()
      precioForm.value.idcampaña = idCampanaActual
      await cargarPrecios(idCampanaActual)
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al procesar precio',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar precio',
    })
  } finally {
    cargandoGuardarPrecio.value = false
  }
}

const eliminarPrecioCampana = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este precio?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarpreciocampana/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await cargarPrecios(precioForm.value.idcampaña)
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar precio',
      })
    }
  })
}

const editarPrecioCampana = (precio) => {
  // Load the price data into the form for editing
  precioForm.value.id_detalle_campanas = precio.id
  precioForm.value.idproducto = precio.idproducto
  precioForm.value.idproductoalmacen = precio.idproductoalmacen
  precioForm.value.producto = precio.descripcion || precio.producto
  precioForm.value.precio = precio.precio
  precioForm.value.idcategoriacampaña = precio.idcategoriacampaña
}

const cancelarEdicionPrecio = () => {
  // Reset the form to add mode
  productoSeleccionado.value = null
  precioForm.value.id_detalle_campanas = null
  precioForm.value.idproducto = null
  precioForm.value.idproductoalmacen = null
  precioForm.value.producto = ''
  precioForm.value.precio = ''
  precioForm.value.idcategoriacampaña = null
  productosNoAsignados.value = []
  productosNoAsignadosOptions.value = []
}

const filtrarProductos = (val, update) => {
  if (val === '') {
    update(() => {
      productosNoAsignadosOptions.value = productosNoAsignados.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    productosNoAsignadosOptions.value = productosNoAsignados.value.filter((v) => {
      const desc = v.descripcion || v.producto || ''
      const cod = v.codigo || ''
      return desc.toLowerCase().indexOf(needle) > -1 || cod.toLowerCase().indexOf(needle) > -1
    })
  })
}

const alSeleccionarProducto = (val) => {
  if (val) {
    precioForm.value.idproductoalmacen = val.id || null
    precioForm.value.idproducto = val.idproducto || null
    precioForm.value.producto = val.descripcion || val.producto || ''
  } else {
    precioForm.value.idproductoalmacen = null
    precioForm.value.idproducto = null
    precioForm.value.producto = ''
  }
}

const filtrarPrecios = () => {
  // La lógica de filtrado ya está en la propiedad computada preciosCampanaFiltrados
}

// Check if a campaign has categories
const tieneCategorias = (idCampana) => {
  // This will be checked when the button is rendered
  // We'll need to track which campaigns have categories
  return campanasConCategorias.value.has(idCampana)
}

// Track campaigns that have categories
const campanasConCategorias = ref(new Set())

// Update the set when categories are loaded or added
const actualizarCampanasConCategorias = async () => {
  try {
    const promises = campanas.value.map(async (campana) => {
      const endpoint = `${URL_APICM}api/listacategoriapreciocampaña/${campana.id}`
      const resultado = await peticionGET(endpoint)
      if (resultado && resultado.length > 0) {
        campanasConCategorias.value.add(campana.id)
      }
    })
    await Promise.all(promises)
  } catch (error) {
    console.error('Error al verificar categorías:', error)
  }
}

// Inicialización
onMounted(async () => {
  formData.value.fechai = obtenerFechaActual()
  formData.value.fechaf = obtenerFechaActual()
  await listarAlmacenes()
  await listarCampanas()
  await listarProductosAlmacen()
  await listarCategoriasPrecio()
  await actualizarCampanasConCategorias()
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
