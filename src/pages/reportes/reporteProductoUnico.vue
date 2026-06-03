<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header & Dashboard Summary Card -->
    <q-card flat bordered class="q-mb-md bg-white text-dark shadow-2 rounded-borders">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div class="row items-center justify-between q-mb-md q-ml-sm">
          <div class="col-12 col-md-auto">
            <div class="text-h5 text-primary text-weight-bold flex items-center">
              <q-icon name="qr_code_2" size="md" class="q-mr-sm" />
              Productos Únicos
            </div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs">
              Gestiona y rastrea el inventario único por número de serie y almacén.
            </div>
          </div>
        </div>

        <!-- Filters Area -->
        <div class="row q-gutter-sm col-12 col-md-auto items-center">
          <!-- Warehouse Selector -->
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Almacén / Tienda"
            class="min-width-select col-12 col-sm-5 col-md-auto"
            style="min-width: 220px"
          >
            <template v-slot:prepend>
              <q-icon name="storefront" color="primary" />
            </template>
          </q-select>

          <!-- Search Bar -->
          <q-input
            v-model="filterText"
            outlined
            dense
            placeholder="Buscar por nombre, código, serie..."
            class="col-12 col-sm-6 col-md-auto"
            style="min-width: 280px"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table Container -->
    <q-card flat bordered class="shadow-2 rounded-borders bg-white">
      <!-- Loading Skeleton State -->
      <div v-if="productoUnicos === null" class="q-pa-md">
        <q-item class="q-mb-md">
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="text" width="60%" />
          </q-item-section>
        </q-item>
        <q-skeleton type="rect" height="250px" />
      </div>

      <!-- Main Data Table -->
      <q-table
        v-else
        title="Productos Únicos"
        :rows="productosFiltrados"
        :columns="columns"
        row-key="idproducto_unico"
        :pagination="initialPagination"
        flat
        binary-state-sort
        no-data-label="No se encontraron productos disponibles"
        class="unique-products-table"
        grid-header
        :grid="$q.screen.xs"
      >
        <!-- Custom row rendering for desktop grid performance -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-row">
            <q-td key="index" :props="props" class="text-weight-medium">
              {{ props.row.index }}
            </q-td>
            <q-td key="descripcion" :props="props">
              <div class="row items-center no-wrap">
                <q-avatar rounded size="40px" class="bg-grey-2 q-mr-sm" v-if="props.row.imagen">
                  <img :src="props.row.imagen" alt="Producto" />
                </q-avatar>
                <q-avatar
                  rounded
                  size="40px"
                  class="bg-blue-1 text-primary q-mr-sm"
                  icon="inventory_2"
                  v-else
                />
                <div>
                  <div class="text-weight-bold text-dark text-body2">
                    {{ props.row.descripcion }}
                  </div>
                  <div
                    class="text-caption text-grey-6 text-italic ellipsis"
                    style="max-width: 250px"
                  >
                    {{ props.row.caracteristicas || 'Sin descripción adicional' }}
                  </div>
                </div>
              </div>
            </q-td>
            <q-td key="codigo" :props="props">
              <q-chip
                size="sm"
                outline
                square
                color="secondary"
                text-color="secondary"
                class="text-weight-bold"
              >
                {{ props.row.codigo }}
              </q-chip>
              <div class="text-caption text-grey-6 q-mt-xs" v-if="props.row.cod_barras">
                <q-icon name="line_weight" size="xs" /> {{ props.row.cod_barras }}
              </div>
            </q-td>
            <q-td key="serie" :props="props">
              <q-badge color="purple-1" text-color="purple-9" class="q-pa-xs text-weight-bold">
                <q-icon name="qr_code" size="14px" class="q-mr-xs" />
                {{ props.row.serie }}
              </q-badge>
            </q-td>
            <q-td key="nombre_almacen" :props="props">
              <span class="text-weight-medium"
                ><q-icon name="place" color="grey-7" /> {{ props.row.nombre_almacen }}</span
              >
            </q-td>
            <q-td key="precio" :props="props" class="text-weight-bold text-subtitle2 text-right">
              {{ formatCurrency(props.row.precio) }}
            </q-td>
            <q-td key="estado" :props="props" class="text-center">
              <q-badge
                :color="
                  props.row.estado === 'Disponible' || props.row.estado === 1
                    ? 'positive'
                    : 'warning'
                "
                rounded
                class="q-px-sm q-py-xs"
              >
                {{
                  props.row.estado === 1 || props.row.estado === 'Disponible'
                    ? 'Disponible'
                    : props.row.estado
                }}
              </q-badge>
            </q-td>
          </q-tr>
        </template>

        <!-- Dynamic Grid View Cards for Mobile devices -->
        <template v-slot:item="props">
          <div class="q-pa-xs col-12 col-sm-6 font-xs">
            <q-card flat bordered class="q-pa-sm bg-white">
              <q-card-section class="q-pa-xs">
                <div class="row justify-between items-start no-wrap q-mb-sm">
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold text-dark">
                      {{ props.row.descripcion }}
                    </div>
                    <div class="text-caption text-grey-6">{{ props.row.codigo }}</div>
                  </div>
                  <q-badge
                    :color="
                      props.row.estado === 'Disponible' || props.row.estado === 1
                        ? 'positive'
                        : 'warning'
                    "
                  >
                    {{
                      props.row.estado === 1 || props.row.estado === 'Disponible'
                        ? 'Disponible'
                        : props.row.estado
                    }}
                  </q-badge>
                </div>

                <q-separator dashed class="q-my-sm" />

                <div class="row q-col-gutter-xs text-caption">
                  <div class="col-6 text-grey-7">S/N Serie:</div>
                  <div class="col-6 text-right text-weight-medium text-purple-9">
                    {{ props.row.serie }}
                  </div>

                  <div class="col-6 text-grey-7">Almacén:</div>
                  <div class="col-6 text-right text-weight-medium text-dark">
                    {{ props.row.nombre_almacen }}
                  </div>

                  <div class="col-6 text-grey-7 items-center align-center">Precio:</div>
                  <div class="col-6 text-right text-weight-bold text-primary text-body2">
                    {{ formatCurrency(props.row.precio) }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>

        <!-- Beautiful Empty State template if filtering leads to no results -->
        <template v-slot:no-data="">
          <div class="full-width row flex-center text-grey-6 q-gutter-sm q-py-xl">
            <q-icon size="4em" name="find_in_page" color="grey-4" />
            <div class="text-center col-12">
              <div class="text-h6 text-grey-7 text-weight-light">
                No pudimos encontrar coincidencias
              </div>
              <div class="text-caption text-grey-5">
                Prueba cambiando los términos de búsqueda o seleccionando otro almacén.
              </div>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, computed } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const idEmpresa = idempresa_md5()
const idUsuario = idusuario_md5()
const almacenesOptions = ref([])
const productoUnicos = ref(null)
const almacenSeleccionado = ref(null)

// NEW UX STATE VARIABLES (Preserves existing variables below seamlessly)
const filterText = ref('')
const initialPagination = ref({
  sortBy: 'index',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

// Columns Definitions tailored for a SaaS Look & Feel
const columns = [
  { name: 'index', label: 'N°', field: 'index', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Producto / Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'codigo', label: 'Código / SKU', field: 'codigo', align: 'left', sortable: true },
  { name: 'serie', label: 'Nº Serie', field: 'serie', align: 'left', sortable: true },
  {
    name: 'nombre_almacen',
    label: 'Almacén',
    field: 'nombre_almacen',
    align: 'left',
    sortable: true,
  },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
]

// Dynamic, Reactive filtering handling both warehouse selection and real-time global text matching
const productosFiltrados = computed(() => {
  if (!productoUnicos.value) return []

  return productoUnicos.value.filter((item) => {
    // 1. Filter by Warehouse
    // Match if "Todos Los Almacenes" (value 0) is chosen, or if the item matches the selection precisely
    const matchesAlmacen =
      !almacenSeleccionado.value ||
      almacenSeleccionado.value === 0 ||
      Number(item.id_almacen) === Number(almacenSeleccionado.value)

    // 2. Filter by Search Query (Name, Code, Category/Characteristics, Description)
    if (!matchesAlmacen) return false
    if (!filterText.value) return true

    const query = filterText.value.toLowerCase().trim()

    return (
      (item.descripcion && item.descripcion.toLowerCase().includes(query)) ||
      (item.codigo && item.codigo.toLowerCase().includes(query)) ||
      (item.cod_barras && item.cod_barras.toLowerCase().includes(query)) ||
      (item.caracteristicas && item.caracteristicas.toLowerCase().includes(query)) ||
      (item.serie && item.serie.toLowerCase().includes(query)) ||
      (item.nombre_almacen && item.nombre_almacen.toLowerCase().includes(query))
    )
  })
})

// Helper utility to make price columns elegantly readable
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0.00'
  return new Intl.NumberFormat('es-419', { style: 'currency', currency: 'USD' }).format(val)
}

const cargarAlmacenes = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idEmpresa}`)

    // 1. Filtramos y mapeamos primero
    const almacenesFiltrados = response.data
      .filter((a) => a.idusuario === idUsuario)
      .map((a) => ({
        label: a.almacen,
        value: Number(a.idalmacen), // Aseguramos que sea número si es necesario
      }))

    // 2. Aplicamos la lógica condicional
    if (almacenesFiltrados.length > 1) {
      // Si hay más de uno, agregamos "Todos" al inicio
      almacenesOptions.value = [{ label: 'Todos Los Almacenes', value: 0 }, ...almacenesFiltrados]
    } else {
      // Si hay uno o ninguno, usamos solo los filtrados
      almacenesOptions.value = almacenesFiltrados
    }

    // 3. Selección automática del primer valor disponible
    if (almacenesOptions.value.length > 0) {
      almacenSeleccionado.value = almacenesOptions.value[0].value
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los almacenes',
    })
  }
}

const obtenerProductoUnicos = async () => {
  try {
    const enpoint = `getProductosUnicos/${idEmpresa}/${idUsuario}/${almacenSeleccionado.value || null}`
    console.log(enpoint)
    const response = await api.get(enpoint)
    const data = response.data
    console.log('Respuesta de productos únicos:', response.data)
    if (data.estado === 'ok') {
      productoUnicos.value = data.data.map((item, index) => ({
        index: index + 1,
        id_productos_almacen: item.id_productos_almacen,
        descripcion: item.descripcion,
        cod_barras: item.cod_barras,
        caracteristicas: item.caracteristicas,
        codigo: item.codigo,
        idproducto_unico: item.idproducto_unico,
        serie: item.serie,
        fecha_registro: item.fecha_registro,
        nombre_almacen: item.nombre_almacen,
        nombre_unidad: item.nombre_unidad,
        id_almacen: item.id_almacen,
        nombre_medida: item.nombre_medida,
        imagen: item.imagen,
        precio: item.precio,
        estado: item.estado,
      }))

      $q.notify({
        type: 'positive',
        message: `Se cargaron ${productoUnicos.value.length} productos únicos`,
      })
    } else {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron productos únicos para el usuario y almacén seleccionados',
      })
      productoUnicos.value = []
    }
  } catch (error) {
    console.error('Error al obtener productos únicos:', error)
  }
}

onMounted(async () => {
  await obtenerProductoUnicos()
  await cargarAlmacenes()
})
</script>

<style scoped>
.hover-row {
  transition: background-color 0.2s ease;
}
.hover-row:hover {
  background-color: #f5f7fa !important;
}
</style>
