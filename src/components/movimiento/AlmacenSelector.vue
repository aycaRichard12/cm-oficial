<template>
  <q-select
    v-model="localSelected"
    :options="options"
    label="Seleccione un Almacén"
    map-options
    dense
    outlined
    clearable
    options-dense
    behavior="menu"
    @update:model-value="handleChange"
    :loading="loading"
  >
    <template v-slot:prepend>
      <q-icon name="store" color="primary" />
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-icon name="store" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useMovementStore } from 'src/stores/movement-store'
import { useAlmacenStore } from 'src/composables/movimiento/useAlmacenStore'

// ?
const movementStore = useMovementStore()
const { selectedAlmacen, setSelectedAlmacen } = useAlmacenStore()

// Props
const props = defineProps({
  // Si necesitas pasar opciones específicas
  customOptions: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['change', 'update:modelValue'])

// Reactive state
const localSelected = ref(null)

// Computar opciones desde el store de movimientos
const options = computed(() => {
  if (props.customOptions.length > 0) {
    return props.customOptions
  }
  return movementStore.originStores
})

const loading = computed(() => movementStore.isLoadingOriginStores)

// Observar cambios en el store global de seleccion
watch(
  selectedAlmacen,
  (newValue) => {
    localSelected.value = newValue
    emit('update:modelValue', newValue)
  },
  { immediate: true },
)

// Cargar almacenes si no están cargados
const loadAlmacenes = async () => {
  if (props.customOptions.length > 0) return

  // Si ya están cargados, no recargar obligatoriamente, pero validar si están vacíos
  if (movementStore.originStores.length === 0) {
    await movementStore.fetchOriginStores()
  }
}

// Manejar cambio de valor
const handleChange = (value) => {
  // Actualizar store global
  setSelectedAlmacen(value)

  // Emitir evento
  emit('change', value)
}

onMounted(() => {
  loadAlmacenes()
})
</script>
