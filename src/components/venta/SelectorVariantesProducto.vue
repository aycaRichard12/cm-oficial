<template>
  <q-card class="selector-variantes-producto">
    <!-- Estado de carga -->
    <q-card-section v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="q-mt-sm text-grey-7">Cargando información del producto...</p>
    </q-card-section>

    <!-- Error -->
    <q-card-section v-else-if="error" class="text-center q-pa-lg">
      <q-icon name="error" color="negative" size="3em" />
      <p class="text-negative q-mt-sm">{{ error }}</p>
    </q-card-section>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Información general del producto -->
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ producto.nombre }}</div>
        <div class="text-subtitle2"><strong>Código:</strong> {{ producto.codigo }}</div>
        <div class="text-body2 q-mt-xs">{{ producto.descripcion }}</div>
      </q-card-section>

      <q-separator />

      <!-- Vista de selección (antes de confirmar) -->
      <q-card-section v-if="!confirmado">
        <div class="text-subtitle1 q-mb-md">Selecciona las variantes y cantidades</div>

        <div class="row q-mb-md">
          <q-input
            v-model="filtro"
            dense
            outlined
            placeholder="Buscar por SKU o atributo..."
            class="full-width"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Tabla de variantes -->
        <q-table
          :rows="variantes"
          :columns="columnas"
          row-key="id_producto_variante"
          v-model:pagination="paginacion"
          :filter="filtro"
          :filter-method="metodoFiltro"
          flat
          bordered
          dense
        >
          <!-- Columna Checkbox -->
          <template v-slot:body-cell-seleccion="props">
            <q-td :props="props" class="text-center">
              <q-checkbox
                v-model="props.row.seleccionada"
                @update:model-value="onCheckboxChange(props.row)"
                :disable="props.row.stock <= 0 || props.row.deshabilitada"
              />
            </q-td>
          </template>

          <!-- Columna SKU -->
          <template v-slot:body-cell-sku="props">
            <q-td :props="props">
              <span class="text-weight-medium">{{ props.row.sku }}</span>
            </q-td>
          </template>

          <!-- Columna Stock -->
          <template v-slot:body-cell-stock="props">
            <q-td :props="props">
              <q-badge :color="props.row.stock > 0 ? 'positive' : 'negative'">
                {{ props.row.stock }}
              </q-badge>
            </q-td>
          </template>

          <!-- Columna Atributos -->
          <template v-slot:body-cell-atributos="props">
            <q-td :props="props">
              <div
                v-for="attr in props.row.atributos"
                :key="attr.id_Valor_Atributo || attr.id_valor_atributo"
                class="q-mb-xs"
              >
                <q-chip dense size="sm" class="q-mr-xs" color="grey-3" text-color="grey-8">
                  {{ attr.atributo || attr.nombre }}: {{ attr.valor }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <!-- Columna Cantidad -->
          <template v-slot:body-cell-cantidad="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.cantidad_seleccionada"
                type="number"
                outlined
                dense
                :disable="!props.row.seleccionada"
                :min="1"
                :max="props.row.stock"
                :rules="[
                  (val) => val > 0 || 'Mínimo 1',
                  (val) => val <= props.row.stock || `Máx. ${props.row.stock}`,
                ]"
                @update:model-value="onCantidadChange(props.row)"
                style="max-width: 100px"
              />
            </q-td>
          </template>
        </q-table>

        <!-- Botón confirmar -->
        <div class="row justify-end q-mt-lg">
          <q-btn
            label="Confirmar selección"
            color="primary"
            icon="check_circle"
            :disable="!haySeleccionValida"
            @click="confirmarSeleccion"
          />
        </div>
      </q-card-section>

      <!-- Vista resumen (después de confirmar) -->
      <q-card-section v-else>
        <div class="text-subtitle1 q-mb-md">Variantes seleccionadas</div>

        <q-list separator bordered>
          <q-item v-for="variante in seleccionConfirmada" :key="variante.id_producto_variante">
            <q-item-section>
              <q-item-label class="text-weight-medium">SKU: {{ variante.sku }}</q-item-label>
              <q-item-label caption>
                Cantidad: {{ variante.cantidad_seleccionada }}
                <span v-if="variante.stock !== undefined">| Stock: {{ variante.stock }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="check_circle" color="green" />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row justify-between items-center q-mt-lg">
          <q-btn
            label="Volver a editar"
            color="grey-8"
            flat
            icon="edit"
            @click="confirmado = false"
          />
          <div class="text-subtitle1">
            <span class="text-weight-bold">Total variantes:</span> {{ totalVariantes }} |
            <span class="text-weight-bold">Cantidad total:</span> {{ cantidadTotal }}
          </div>
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios' // Ajusta la ruta según tu proyecto
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ==================== PROPS ====================
const props = defineProps({
  idProducto: {
    type: [Number, String],
    required: true,
  },
  disabledVariants: {
    type: Array,
    default: null,
  },
})

// ==================== EMITS ====================
const emit = defineEmits(['confirmar'])

// ==================== ESTADO ====================
const loading = ref(true)
const error = ref(null)
const confirmado = ref(false)

const producto = ref({
  nombre: '',
  codigo: '',
  descripcion: '',
})

const variantes = ref([])

const filtro = ref('')
const paginacion = ref({
  sortBy: 'sku',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const metodoFiltro = (rows, terms) => {
  const searchTerm = (terms || '').toLowerCase()
  if (!searchTerm) return rows

  return rows.filter((row) => {
    // Buscar en SKU
    if (row.sku && row.sku.toLowerCase().includes(searchTerm)) {
      return true
    }
    // Buscar en atributos
    if (row.atributos && row.atributos.length) {
      const matchAttr = row.atributos.some((attr) => {
        const nombreAtributo = attr.atributo || attr.nombre || ''
        const valorAtributo = attr.valor || ''
        return (
          nombreAtributo.toLowerCase().includes(searchTerm) ||
          valorAtributo.toLowerCase().includes(searchTerm)
        )
      })
      if (matchAttr) return true
    }
    return false
  })
}

// Columnas para QTable
const columnas = [
  { name: 'seleccion', label: 'Seleccionar', align: 'center', field: 'seleccionada' },
  { name: 'sku', label: 'SKU', align: 'left', field: 'sku' },
  { name: 'stock', label: 'Stock', align: 'center', field: 'stock' },
  { name: 'atributos', label: 'Atributos', align: 'left', field: 'atributos' },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: 'cantidad_seleccionada' },
]

// ==================== COMPUTED ====================
const seleccionConfirmada = computed(() =>
  variantes.value.filter((v) => v.seleccionada && v.cantidad_seleccionada > 0),
)

const totalVariantes = computed(() => seleccionConfirmada.value.length)

const cantidadTotal = computed(() =>
  seleccionConfirmada.value.reduce((sum, v) => sum + (v.cantidad_seleccionada || 0), 0),
)

const haySeleccionValida = computed(() => {
  const seleccionadas = variantes.value.filter((v) => v.seleccionada)
  if (seleccionadas.length === 0) return false
  // Toda variante seleccionada debe tener cantidad válida (entre 1 y stock)
  return seleccionadas.every(
    (v) =>
      Number.isInteger(v.cantidad_seleccionada) &&
      v.cantidad_seleccionada > 0 &&
      v.cantidad_seleccionada <= v.stock,
  )
})

// ==================== MÉTODOS ====================
async function cargarDatos() {
  loading.value = true
  error.value = null

  if (!props.idProducto) {
    producto.value = { nombre: '', codigo: '', descripcion: '' }
    variantes.value = []
    loading.value = false
    return
  }

  try {
    // Ajusta la URL según tu endpoint real.
    // Se espera una respuesta con la estructura:
    // {
    //   producto: { nombre, codigo, descripcion },
    //   variantes: [
    //     { id_producto_variante, sku, stock, atributos: [{ nombre, valor }] }
    //   ]
    // }
    const response = await api.get(`obtenerProductoConAtributos/${props.idProducto}`)
    const data = response.data

    producto.value = {
      nombre: data.producto.nombre,
      codigo: data.producto.codigo,
      descripcion: data.producto.descripcion,
    }

    variantes.value = data.variantes.map((v) => ({
      id_producto_variante: v.id_producto_variante,
      sku: v.sku,
      stock: Number(v.cantidad),
      atributos: v.atributos || [],
      seleccionada: false,
      cantidad_seleccionada: 0,
      idstock_variante: v.idstock_variante || null,
    }))

    // Excluir variantes que ya están en el carrito (mismo producto + variante)
    // const carritoActual = JSON.parse(localStorage.getItem('carrito')) || { listaProductos: [] }
    // const idsVariantesUsadas = new Set(
    //   (carritoActual.listaProductos || [])
    //     .filter((p) => p.idproductovariante != null)
    //     .map((p) => Number(p.idproductovariante)),
    // )
    // variantes.value = variantes.value.map((v) => ({
    //   ...v,
    //   deshabilitada: idsVariantesUsadas.has(Number(v.id_producto_variante)),
    // }))

    let idsVariantesUsadas
    if (props.disabledVariants) {
      idsVariantesUsadas = new Set(props.disabledVariants.map((id) => Number(id)))
    } else {
      const carritoActual = JSON.parse(localStorage.getItem('carrito')) || { listaProductos: [] }
      idsVariantesUsadas = new Set(
        (carritoActual.listaProductos || [])
          .filter((p) => p.idproductovariante != null)
          .map((p) => Number(p.idproductovariante)),
      )
    }
    variantes.value = variantes.value.map((v) => ({
      ...v,
      deshabilitada: idsVariantesUsadas.has(Number(v.id_producto_variante)),
    }))
  } catch (err) {
    error.value = 'No se pudo cargar la información del producto.'
    console.error('[SelectorVariantesProducto]', err)
    $q.notify({
      type: 'negative',
      message: error.value,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function onCheckboxChange(variante) {
  if (!variante.seleccionada) {
    variante.cantidad_seleccionada = 0 // Limpiar cantidad al desmarcar
  }
}

function onCantidadChange(variante) {
  // Validación extra por si el input no captura las reglas
  if (variante.cantidad_seleccionada == null || isNaN(variante.cantidad_seleccionada)) {
    variante.cantidad_seleccionada = 0
  } else if (variante.cantidad_seleccionada < 1) {
    variante.cantidad_seleccionada = 1
  } else if (variante.cantidad_seleccionada > variante.stock) {
    variante.cantidad_seleccionada = variante.stock
  }
}

function confirmarSeleccion() {
  if (!haySeleccionValida.value) return

  confirmado.value = true

  const datos = obtenerSeleccion()
  emit('confirmar', datos)
}

// Método público para obtener la selección actual en formato JSON
function obtenerSeleccion() {
  return {
    totalVariantes: totalVariantes.value,
    cantidadTotal: cantidadTotal.value,
    variantes: seleccionConfirmada.value.map((v) => ({
      idVariante: v.id_producto_variante,
      sku: v.sku,
      cantidad: v.cantidad_seleccionada,
      stock: v.stock, // opcional
      idstock_variante: v.idstock_variante,
      atributos: (v.atributos || []).map((a) => ({
        atributo: a.nombre,
        valor: a.valor,
      })),
    })),
  }
}

// Método público para resetear el componente
function reset() {
  confirmado.value = false
  variantes.value.forEach((v) => {
    v.seleccionada = false
    v.cantidad_seleccionada = 0
  })
}

// Indica si el producto cargado tiene variantes (reactivo)
const tieneVariantes = computed(() => variantes.value.length > 0)

// Exponer métodos
defineExpose({ obtenerSeleccion, reset, tieneVariantes })

// ==================== LIFECYCLE ====================
onMounted(() => {
  cargarDatos()
})

// Recargar la información al cambiar el producto seleccionado
watch(
  () => props.idProducto,
  (nuevoId, idAnterior) => {
    if (nuevoId !== idAnterior) {
      reset()
      cargarDatos()
    }
  },
)
</script>

<style scoped>
.selector-variantes-producto {
  max-width: 100%;
  margin: auto;
}
</style>
