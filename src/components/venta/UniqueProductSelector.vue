<template>
  <div
    v-if="isUnique && productId"
    class="serial-selector q-pa-md"
    style="
      border-radius: 12px;
      border: 1px solid rgba(0, 77, 64, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    "
  >
    <!-- Encabezado con progreso -->
    <div class="row items-center justify-between q-mb-sm">
      <div
        class="text-subtitle2 flex items-center"
        :class="selectionComplete ? 'text-positive' : 'text-primary'"
      >
        <q-icon
          :name="selectionComplete ? 'check_circle' : 'qr_code_scanner'"
          class="q-mr-xs"
          size="20px"
        />
        {{ selectionComplete ? 'Selección completa' : 'Seriales requeridos' }}
      </div>
      <q-badge
        :color="selectionComplete ? 'positive' : 'warning'"
        rounded
        class="text-body2 q-px-sm q-py-xs"
      >
        {{ internalSelection.length }} / {{ cantidadRequerida }}
      </q-badge>
    </div>

    <!-- Select con búsqueda integrada -->
    <q-select
      v-model="internalSelection"
      :options="filteredOptions"
      :loading="loading"
      option-value="id"
      option-label="serie"
      multiple
      use-chips
      use-input
      outlined
      dense
      bg-color="white"
      placeholder="Buscar por número de serie..."
      input-debounce="0"
      @filter="onFilter"
      @update:model-value="handleUpdate"
      class="q-mb-sm"
      color="primary"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="primary" />
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey-7 text-caption italic">
            {{ loading ? 'Sincronizando inventario…' : 'Sin coincidencias' }}
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected-item="scope">
        <q-chip
          removable
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="secondary"
          text-color="white"
          class="text-weight-medium"
        >
          {{ scope.opt.serie }}
        </q-chip>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" class="q-py-sm">
          <q-item-section>
            <q-item-label class="text-body2">{{ scope.opt.serie }}</q-item-label>
            <q-item-label caption v-if="scope.opt.id_productos_almacen">
              Almacén {{ scope.opt.id_productos_almacen }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Alerta de diferencia de cantidad -->
    <div v-if="internalSelection.length !== cantidadRequerida" class="row items-center q-mt-xs">
      <q-icon
        :name="internalSelection.length > cantidadRequerida ? 'error' : 'info'"
        :color="internalSelection.length > cantidadRequerida ? 'negative' : 'warning'"
        size="16px"
        class="q-mr-xs"
      />
      <span
        class="text-caption font-weight-medium"
        :class="internalSelection.length > cantidadRequerida ? 'text-negative' : 'text-warning'"
      >
        {{
          internalSelection.length > cantidadRequerida
            ? `Exceso: elimine ${internalSelection.length - cantidadRequerida}`
            : `Faltan ${cantidadRequerida - internalSelection.length} serial${
                cantidadRequerida - internalSelection.length > 1 ? 'es' : ''
              }`
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { api } from 'src/boot/axios'

const props = defineProps({
  productId: [Number, String],
  isUnique: Boolean,
  cantidadRequerida: Number,
})

const emit = defineEmits(['update:selection'])

const internalSelection = ref([])
const allOptions = ref([]) // lista completa de seriales
const filteredOptions = ref([]) // opciones que muestra el select
const loading = ref(false)

const selectionComplete = computed(() => internalSelection.value.length === props.cantidadRequerida)

// Obtener seriales disponibles desde la API
const fetchSeries = async (id) => {
  if (!id) return
  loading.value = true
  try {
    const { data } = await api.get(`getProductosUnicosDisponibles/${id}`)
    const raw = Array.isArray(data.data) ? data.data : []
    allOptions.value = raw.map((item) => ({
      id: item.id,
      serie: item.serie,
      id_productos_almacen: item.id_productos_almacen,
    }))
    filteredOptions.value = [...allOptions.value]
  } catch (error) {
    console.error('Error al obtener seriales:', error)
    allOptions.value = []
    filteredOptions.value = []
  } finally {
    loading.value = false
  }
}

// Filtrar mientras se escribe en el select
const onFilter = (val, update) => {
  update(() => {
    const needle = val?.toLowerCase() || ''
    filteredOptions.value = allOptions.value.filter((opt) =>
      opt.serie.toLowerCase().includes(needle),
    )
  })
}

// Resetear cuando cambia el producto
watch(
  () => props.productId,
  (newId) => {
    internalSelection.value = []
    allOptions.value = []
    filteredOptions.value = []
    if (props.isUnique && newId) {
      fetchSeries(newId)
    }
  },
  { immediate: true },
)

const handleUpdate = (val) => {
  // val es un arreglo de objetos (id, serie, …)
  emit('update:selection', val)
}
</script>

<style scoped>
.serial-selector {
  transition: all 0.2s ease;
}
</style>
