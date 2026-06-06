<template>
  <div class="product-list">
    <q-virtual-scroll
      :items="productRows"
      :virtual-scroll-item-size="itemHeight"
      :virtual-scroll-slice-size="buffer"
      class="virtual-scroll-container"
      @virtual-scroll="onScroll"
    >
      <template v-slot="{ item: row, index }">
        <div :key="`row-${index}`" class="row q-col-gutter-sm q-px-sm q-py-xs no-wrap">
          <div v-for="product in row" :key="product.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <ProductCard :product="product" @add="handleAdd" />
          </div>
          <!-- Espaciadores para mantener el ancho de columna en la última fila -->
          <div
            v-for="n in itemsPerRow - row.length"
            :key="`spacer-${n}`"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          />
        </div>
      </template>
    </q-virtual-scroll>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import ProductCard from './ProductCard.vue'

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => [],
  },
  // Altura estimada de una FILA (no de un item individual)
  itemHeight: {
    type: Number,
    default: 340,
  },
  buffer: {
    type: Number,
    default: 10,
  },
})

const $q = useQuasar()
const emit = defineEmits(['add'])

// Determinar cuántos items hay por fila según el ancho de pantalla
const itemsPerRow = computed(() => {
  if ($q.screen.lt.sm) return 1
  if ($q.screen.lt.md) return 2
  if ($q.screen.lt.lg) return 3
  return 4
})

// Agrupar productos en filas para que QVirtualScroll funcione correctamente en grid
const productRows = computed(() => {
  const rows = []
  for (let i = 0; i < props.products.length; i += itemsPerRow.value) {
    rows.push(props.products.slice(i, i + itemsPerRow.value))
  }
  return rows
})

const scrollPosition = ref(0)

const onScroll = ({ to }) => {
  scrollPosition.value = to
}

const handleAdd = (product) => {
  emit('add', product)
}
</script>

<style scoped>
.product-list {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.virtual-scroll-container {
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
}
/* Forzamos que la fila no se rompa para que el virtual scroll calcule bien la altura */
.no-wrap {
  flex-wrap: nowrap !important;
}
@media (max-width: 599px) {
  .no-wrap {
    flex-wrap: wrap !important;
  }
}
</style>
