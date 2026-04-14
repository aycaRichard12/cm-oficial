<template>
  <div v-if="isUnique && productId">
    <div class="row items-center justify-between q-mb-sm">
      <div class="column">
        <div
          class="text-subtitle2 flex items-center"
          :class="selectionComplete ? 'text-positive' : 'text-primary'"
        >
          Seleccionados: {{ internalSelection.length }} / {{ cantidadRequerida }}
        </div>
      </div>

      <q-icon
        :name="selectionComplete ? 'check_circle' : 'pending'"
        :color="selectionComplete ? 'positive' : 'orange'"
        size="24px"
      />
    </div>

    <q-select
      v-model="internalSelection"
      :options="codigosApi"
      :loading="loading"
      option-value="id"
      option-label="serie"
      multiple
      use-chips
      outlined
      dense
      bg-color="white"
      placeholder="Seleccione los códigos..."
      @update:model-value="handleUpdate"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey text-caption italic">
            {{ loading ? 'Sincronizando inventario...' : 'No se encontraron seriales disponibles' }}
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected-item="scope">
        <q-chip
          removable
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="white"
          text-color="primary"
          style="border: 1px solid #e0e0e0"
        >
          {{ scope.opt.serie }}
        </q-chip>
      </template>
    </q-select>

    <div v-if="internalSelection.length !== cantidadRequerida" class="row items-center q-mt-xs">
      <q-icon
        :name="internalSelection.length > cantidadRequerida ? 'warning' : 'info'"
        :color="internalSelection.length > cantidadRequerida ? 'negative' : 'orange-9'"
        size="14px"
        class="q-mr-xs"
      />
      <span
        class="text-caption font-weight-medium"
        :class="internalSelection.length > cantidadRequerida ? 'text-negative' : 'text-orange-9'"
      >
        {{
          internalSelection.length > cantidadRequerida
            ? `Exceso: remueva ${internalSelection.length - cantidadRequerida}`
            : `Faltan: ${cantidadRequerida - internalSelection.length}`
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

// Ahora internalSelection guardará objetos: [{id: 1, serie: 'ABC'}, ...]
const internalSelection = ref([])
const codigosApi = ref([])
const loading = ref(false)

const selectionComplete = computed(() => {
  return internalSelection.value.length === props.cantidadRequerida
})

const fetchCodigos = async (id) => {
  if (!id) return
  loading.value = true
  try {
    const response = await api.get(`getProductosUnicosDisponibles/${id}`)
    // Mantenemos la estructura de objetos
    console.log('Respuesta de códigos únicos:', response.data.data) // Para depuración
    codigosApi.value = response.data.data.map((item) => ({
      id: item.id,
      serie: item.serie,
      id_productos_almacen: item.id_productos_almacen, // Si necesitas esta info para algo más adelante
    }))
  } catch (error) {
    console.error('Error al obtener series:', error)
    codigosApi.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.productId,
  async (newId) => {
    internalSelection.value = []
    codigosApi.value = []
    if (props.isUnique && newId) await fetchCodigos(newId)
  },
  { immediate: true },
)

const handleUpdate = (val) => {
  // 'val' ahora es un array de objetos gracias a que quitamos emit-value
  // Ejemplo: [{id: 1, serie: 'ABC'}, {id: 2, serie: 'DEF'}]
  emit('update:selection', val)
}
</script>
