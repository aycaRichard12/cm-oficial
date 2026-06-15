<template>
  <div class="product-card-container bg-fondo">
    <q-card class="product-card" flat bordered>
      <!-- Imagen del producto con zoom, skeleton y placeholder de marca -->
      <div class="image-wrapper">
        <q-img
          v-if="product.imagen"
          :src="imagen + product.imagen"
          :ratio="4 / 3"
          class="product-image"
          spinner-color="primary"
        >
          <template v-slot:loading>
            <q-skeleton class="image-skeleton" />
          </template>
          <template v-slot:error>
            <div class="image-placeholder">
              <div class="placeholder-content">
                <q-icon name="inventory_2" size="3rem" />
                <span class="placeholder-text">Sin imagen</span>
              </div>
            </div>
          </template>
        </q-img>
        <div v-else class="image-placeholder">
          <div class="placeholder-content">
            <q-icon name="inventory_2" size="3rem" />
            <span class="placeholder-text">Sin imagen</span>
          </div>
        </div>
      </div>

      <!-- Información principal -->
      <q-card-section class="info-section">
        <div class="product-name ellipsis-2-lines" :title="product.descripcion">
          {{ product.descripcion }}
        </div>
        <div class="product-code">{{ product.codigo }}</div>
        <div v-if="product.categoria" class="product-category">
          <q-icon name="category" size="xs" class="q-mr-xs" />
          {{ product.categoria }}
        </div>
      </q-card-section>

      <!-- Precio y stock -->
      <q-card-section class="price-stock-section">
        <div class="price-block">
          <span class="price-value">{{ formattedPrice }}</span>
          <span v-if="product.precioOriginal" class="original-price">
            <s>{{ formatPrice(product.precioOriginal) }}</s>
          </span>
        </div>
        <q-chip
          :color="stockColor"
          text-color="white"
          size="sm"
          class="stock-chip"
          :label="stockText"
        />
      </q-card-section>

      <!-- Acción principal (conservando el evento original) -->
      <q-card-actions class="action-section">
        <q-btn
          class="add-to-cart-btn"
          unelevated
          :disable="Number(product.stock) <= 0"
          icon="shopping_cart"
          :label="Number(product.stock) <= 0 ? 'Sin stock' : 'Agregar al carrito'"
          no-caps
          @click.stop="emitAdd"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { imagen } from 'src/boot/url'

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
  if (Number(props.product.stock) > 0) return 'positive'
  if (Number(props.product.stock) === 0) return 'negative'
  return 'warning'
})

const stockText = computed(() => {
  if (props.product.stock > 0) return `Stock: ${props.product.stock}`
  if (props.product.stock === 0) return 'Sin stock'
  return 'Stock no disponible'
})

const emitAdd = () => {
  if (Number(props.product.stock) > 0) {
    emit('add', props.product)
  }
}
</script>

<style scoped>
/* Contenedor externo para alturas uniformes */
.product-card-container {
  height: 100%;
  padding: 8px;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 77, 64, 0.08);
  box-shadow: 0 2px 12px rgba(0, 77, 64, 0.06);
  transition:
    transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.25s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 77, 64, 0.12);
}

/* Contenedor de imagen con ratio fijo y efecto zoom */
.image-wrapper {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 77, 64, 0.08);
}

.product-image {
  transition: transform 0.4s ease;
  will-change: transform;
}

.product-card:hover .product-image {
  transform: scale(1.06);
}

.image-skeleton {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

/* Placeholder corporativo cuando no hay imagen */
.image-placeholder {
  aspect-ratio: 4 / 3;
  width: 100%;
  background: linear-gradient(135deg, #004d40 0%, #26a69a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Decoración de fondo sutil */
.image-placeholder::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.image-placeholder::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -15%;
  width: 120px;
  height: 120px;
  background: rgba(238, 235, 226, 0.15);
  border-radius: 50%;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #eeebe2;
  z-index: 1;
}

.placeholder-content i {
  opacity: 0.9;
}

.placeholder-text {
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 500;
  color: rgba(238, 235, 226, 0.8);
}

/* Información del producto */
.info-section {
  padding: 12px 14px 4px 14px;
  flex-grow: 1;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  color: #004d40;
  line-height: 1.3;
  margin-bottom: 4px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.product-code {
  font-size: 0.78rem;
  color: #757575;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.product-category {
  font-size: 0.75rem;
  color: #26a69a;
  display: flex;
  align-items: center;
  margin-top: 2px;
  font-weight: 500;
}

/* Precio y stock */
.price-stock-section {
  padding: 6px 14px 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #26a69a;
  line-height: 1;
}

.original-price {
  font-size: 0.8rem;
  color: #9e9e9e;
}

.stock-chip {
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
}

/* Botón de acción full-width */
.action-section {
  padding: 8px 14px 14px 14px;
}

.add-to-cart-btn {
  width: 100%;
  background-color: #004d40 !important;
  color: white !important;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 10px 0;
  transition:
    background-color 0.25s ease,
    transform 0.15s ease;
  letter-spacing: 0.3px;
}

.add-to-cart-btn:hover {
  background-color: #26a69a !important;
}

.add-to-cart-btn:active {
  transform: scale(0.97);
}

.add-to-cart-btn:disabled {
  background-color: #bdbdbd !important;
  color: #757575 !important;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 480px) {
  .product-name {
    font-size: 0.9rem;
  }
  .price-value {
    font-size: 1.2rem;
  }
  .add-to-cart-btn {
    font-size: 0.82rem;
    padding: 8px 0;
  }
}
</style>
