<!-- src/modules/quick-consult/components/cart/FloatingCartSummary.vue -->
<template>
  <transition
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown"
  >
    <div v-if="totalItems > 0" class="floating-cart-summary shadow-10" @click="openCart">
      <div class="row items-center no-wrap full-width q-px-md">
        <!-- Icono con Badge -->
        <div class="q-mr-md relative-position">
          <q-icon name="shopping_cart" size="2rem" color="white" />
          <q-badge color="red" floating rounded class="cart-badge">
            {{ totalItems }}
          </q-badge>
        </div>

        <!-- Información del resumen -->
        <div class="col column justify-center">
          <div class="text-white text-weight-bold text-subtitle1">
            {{ itemList.length }} productos | {{ totalItems }} unidades
          </div>
          <div class="text-white text-caption opacity-80">
            Total a pagar: <span class="text-weight-bolder text-white">{{ formattedTotal }}</span>
          </div>
        </div>

        <!-- Botón de apertura/flecha -->
        <q-btn flat round color="white" icon="expand_less" />
      </div>
      
      <!-- Safe area spacer for mobile -->
      <div class="safe-area-bottom" />
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuickConsultCartStore } from '../../stores/cartStore'
import { useQuickConsultUiStore } from '../../stores/uiStore'

const cartStore = useQuickConsultCartStore()
const uiStore = useQuickConsultUiStore()
const { totalItems, totalAmount, itemList } = storeToRefs(cartStore)

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(totalAmount.value)
})

const openCart = () => {
  uiStore.setCartSheetOpen(true)
}
</script>

<style scoped>
.floating-cart-summary {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  background: linear-gradient(135deg, #004d40 0%, #26a69a 100%);
  border-radius: 20px 20px 0 0;
  padding-top: 12px;
  cursor: pointer;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.cart-badge {
  padding: 4px 6px;
  font-size: 0.75rem;
  border: 2px solid #004d40;
}

.opacity-80 {
  opacity: 0.8;
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 16px);
  min-height: 12px;
}

/* Animaciones suaves */
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes slideOutDown {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(0, 100%, 0);
  }
}

.slideInUp {
  animation-name: slideInUp;
}

.slideOutDown {
  animation-name: slideOutDown;
}
</style>
