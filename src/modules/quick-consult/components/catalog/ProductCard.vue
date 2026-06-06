<template>
  <div class="product-card q-pa-sm">
    <q-card class="my-card" flat bordered>
      <q-img
        :src="product.imagen || 'https://placehold.co/400x300?text=Sin+Imagen'"
        :alt="product.descripcion"
        lazy-load
        spinner-color="primary"
        ratio="16/9"
        class="product-image"
      >
        <template v-slot:placeholder>
          <q-skeleton height="100%" square />
        </template>
      </q-img>

      <q-card-section class="q-pt-sm">
        <div class="text-subtitle2 text-weight-bold ellipsis-2-lines">
          {{ product.descripcion }}
        </div>
        <div class="text-caption text-grey-6">
          {{ product.codigo }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row items-center justify-between">
          <div>
            <span class="text-h6 text-primary">{{ formattedPrice }}</span>
            <span v-if="product.precioOriginal" class="text-caption text-grey-6 q-ml-sm">
              <s>{{ formatPrice(product.precioOriginal) }}</s>
            </span>
          </div>
          <q-badge :color="stockColor" :label="stockText" rounded outline />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          :disable="product.stock <= 0"
          icon="add_shopping_cart"
          label="Agregar"
          color="primary"
          flat
          rounded
          @click.stop="emitAdd"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (p) => p.id && p.descripcion && p.precio !== undefined,
  },
})

console.log(props.product)

const emit = defineEmits(['add'])

// Formateo de moneda (CLP, USD, etc.)
const formatPrice = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value)
}

const formattedPrice = computed(() => formatPrice(props.product.precio))

const stockColor = computed(() => {
  if (props.product.stock > 0) return 'positive'
  if (props.product.stock === 0) return 'negative'
  return 'warning'
})

const stockText = computed(() => {
  if (props.product.stock > 0) return `Stock: ${props.product.stock}`
  if (props.product.stock === 0) return 'Sin stock'
  return 'Stock no disponible'
})

const emitAdd = () => {
  if (props.product.stock > 0) {
    emit('add', props.product)
  }
}
</script>

<style scoped>
.product-card {
  width: 100%;
  height: 100%;
}
.my-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.my-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-image {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
</style>
