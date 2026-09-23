<!-- src/modules/quick-consult/components/cart/CartBottomSheet.vue -->
<template>
  <q-dialog
    v-model="isOpen"
    position="bottom"
    class="cart-bottom-sheet"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column no-wrap cart-card premium-card">
      <!-- ============================================================ -->
      <!-- HEADER · Deep elevation + refined typography                -->
      <!-- ============================================================ -->
      <q-toolbar class="bg-primary-gradient text-white sticky-header premium-header">
        <div class="header-icon-wrapper">
          <q-icon name="shopping_bag" size="22px" class="header-cart-icon" />
        </div>
        <q-toolbar-title class="header-title-group">
          <span class="header-title-text">Mi Carrito</span>
          <q-badge
            floating
            color="secondary"
            class="cart-badge-premium"
            :label="cartStore.totalItems"
          />
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup class="close-btn-premium" size="sm" />
      </q-toolbar>

      <!-- ============================================================ -->
      <!-- PRODUCT LIST · Multi-layer cards + refined stepper          -->
      <!-- ============================================================ -->
      <q-card-section class="col scroll q-pa-none product-list-area">
        <transition-group
          v-if="cartStore.itemList.length > 0"
          name="cart-item"
          tag="div"
          class="product-group-container"
        >
          <div
            v-for="(item, index) in cartStore.itemList"
            :key="item.product.id"
            class="product-card-wrapper"
            :style="{ '--stagger-index': index }"
          >
            <q-item class="q-pa-sm product-card-inner">
              <!-- Imagen con badge integrado -->
              <q-item-section avatar class="image-col">
                <div class="image-frame">
                  <q-img
                    :src="item.product.imagen ? imagenUrl + item.product.imagen : ''"
                    class="product-thumb"
                    spinner-color="primary"
                    ratio="1"
                  >
                    <template v-slot:error>
                      <div
                        class="full-height full-width flex flex-center bg-grey-2 text-grey-5 image-fallback"
                      >
                        <q-icon name="inventory_2" size="24px" />
                      </div>
                    </template>
                  </q-img>
                  <div class="qty-chip">
                    <span class="qty-chip-text">{{ item.quantity }}</span>
                  </div>
                </div>
              </q-item-section>

              <!-- Información del producto -->
              <q-item-section class="info-col">
                <q-item-label class="product-title">
                  {{ item.product.descripcion }}
                </q-item-label>
                <q-item-label caption class="unit-price-label">
                  {{ formatPrice(item.product.precio) }} c/u
                </q-item-label>
                <q-item-label class="subtotal-highlight">
                  {{ formatPrice(item.product.precio * item.quantity) }}
                </q-item-label>
              </q-item-section>

              <!-- Acciones + Stepper -->
              <q-item-section side class="actions-col">
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete_outline"
                  size="xs"
                  class="remove-btn-premium"
                  @click="confirmRemove(item)"
                />
                <div class="stepper-pill">
                  <button
                    class="stepper-btn"
                    aria-label="Reducir cantidad"
                    @click="decrement(item)"
                  >
                    <q-icon name="remove" size="16px" />
                  </button>
                  <span class="stepper-value">{{ item.quantity }}</span>
                  <button
                    class="stepper-btn"
                    aria-label="Aumentar cantidad"
                    @click="increment(item)"
                  >
                    <q-icon name="add" size="16px" />
                  </button>
                </div>
              </q-item-section>
            </q-item>
            <!-- Separador entre productos -->
            <div class="card-separator" />
          </div>
        </transition-group>

        <!-- ============================================================ -->
        <!-- EMPTY STATE · Animated illustration + refined CTA           -->
        <!-- ============================================================ -->
        <div v-else class="empty-state-premium column items-center justify-center q-pa-xl">
          <div class="empty-illustration">
            <q-icon name="shopping_cart_checkout" size="4rem" class="empty-icon-animated" />
            <div class="empty-glow" />
          </div>
          <h2 class="empty-heading">Tu carrito está vacío</h2>
          <p class="empty-description">
            Agrega productos desde el catálogo y construye tu orden de venta.
          </p>
          <q-btn
            label="Explorar catálogo"
            color="primary"
            v-close-popup
            class="empty-cta-btn"
            rounded
            unelevated
            size="md"
          />
        </div>
      </q-card-section>

      <!-- ============================================================ -->
      <!-- FOOTER · Glassmorphism + hierarchical totals + actions       -->
      <!-- ============================================================ -->
      <div v-if="cartStore.itemList.length > 0" class="footer-wrapper">
        <div class="footer-gradient-bar" />
        <q-card-section class="bg-glass-premium q-pa-md footer-inner">
          <!-- Totales -->
          <div class="totals-block-premium">
            <div class="total-row subtotal-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value subtotal-value">
                {{ formatPrice(cartStore.totalAmount) }}
              </span>
            </div>
            <div class="total-row grand-total-row">
              <span class="total-label grand-label">Total</span>
              <span class="total-value grand-value">
                {{ formatPrice(cartStore.totalAmount) }}
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="actions-grid">
            <q-btn
              flat
              color="negative"
              label="Vaciar"
              icon="delete_sweep"
              class="clear-btn-premium"
              @click="confirmClearCart"
              no-caps
              size="md"
            />
            <q-btn-dropdown
              color="primary-action"
              label="Procesar venta"
              class="process-btn-premium"
              size="md"
              rounded
              no-caps
              unelevated
              split
              @click="proceedTo('sale')"
              dropdown-icon="expand_less"
            >
              <q-list class="dropdown-menu-premium">
                <q-item clickable v-close-popup @click="proceedTo('sale')" class="dropdown-option">
                  <q-item-section avatar>
                    <q-icon name="point_of_sale" color="primary" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="dropdown-label">Enviar a Venta</q-item-label>
                    <q-item-label caption>Pago inmediato</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" size="xs" />
                  </q-item-section>
                </q-item>
                <q-separator spaced="4px" />
                <q-item
                  clickable
                  v-close-popup
                  @click="proceedTo('quotation')"
                  class="dropdown-option"
                >
                  <q-item-section avatar>
                    <q-icon name="request_quote" color="secondary" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="dropdown-label">Enviar a Cotización</q-item-label>
                    <q-item-label caption>Guardar para aprobar</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" size="xs" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <!-- Safe area -->
          <div class="safe-area-spacer" />
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
// ============================================================
// LÓGICA DEL COMPONENTE - NO MODIFICADA EN ABSOLUTO
// ============================================================
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useQuickConsultCartStore } from '../../stores/cartStore'
import { useQuickConsultUiStore } from '../../stores/uiStore'
import { imagen as imagenUrl } from 'src/boot/url'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  warehouse: {
    type: Object,
    default: null,
  },
  category: {
    type: Object,
    default: null,
  },
})

const $q = useQuasar()
const cartStore = useQuickConsultCartStore()
const uiStore = useQuickConsultUiStore()

const isOpen = computed({
  get: () => uiStore.isCartSheetOpen,
  set: (val) => uiStore.setCartSheetOpen(val),
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value)
}

const increment = (item) => {
  cartStore.updateQuantity(item.product.id, item.quantity + 1)
}

const decrement = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.product.id, item.quantity - 1)
  } else {
    confirmRemove(item)
  }
}

const confirmRemove = (item) => {
  $q.dialog({
    title: 'Eliminar producto',
    message: `¿Deseas quitar "${item.product.descripcion}" del carrito?`,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar',
      flat: true,
    },
  }).onOk(() => {
    cartStore.removeProduct(item.product.id)
  })
}

const confirmClearCart = () => {
  $q.dialog({
    title: 'Vaciar carrito',
    message: '¿Estás seguro de que deseas eliminar todos los productos del carrito?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Sí, vaciar todo',
      flat: true,
    },
  }).onOk(() => {
    cartStore.clearCart()
    uiStore.setCartSheetOpen(false)
  })
}

const proceedTo = async (destination) => {
  try {
    // Obtener items en formato carritoVenta
    const items = cartStore.getItemsForSale()
    console.log(`Items para ${destination}:`, items)
    if (items.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay productos en el carrito' })
      return
    }

    // Crear estructura de datos para localStorage
    const saleCart = {
      listaProductos: items,
      listaProductosFactura: items.map((item) => ({
        codigoProducto: item.codigo,
        codigoActividadSin: item.actividadsin,
        codigoProductoSin: item.codigosin,
        descripcion: item.descripcion,
        unidadMedida: item.unidadsin,
        precioUnitario: item.precio,
        subTotal: (Number(item.cantidad) * Number(item.precio)).toFixed(2),
        cantidad: item.cantidad,
        numeroSerie: '',
        montoDescuento: 0,
        numeroImei: '',
        codigoNandina: item.codigonandina,
      })),
      listaFactura: {},
      subtotal: cartStore.totalAmount.toFixed(2),
      descuento: 0,
      ventatotal: cartStore.totalAmount.toFixed(2),
      nropagos: 0,
      valorpagos: 0,
      idcampana: 0,
      // Información adicional para la transferencia
      almacen: props.warehouse,
      categoria: props.category,
      destination: destination,
    }

    // Guardar en localStorage con la nueva llave
    localStorage.setItem('quickConsult', JSON.stringify(saleCart))

    // Limpiar el carrito rápido (para no tener datos duplicados)
    cartStore.clearCart()

    // Navegar según el destino
    if (destination === 'sale') {
      router.push('/registrarventaoculto')
    } else {
      router.push('/registrarcotizacionoculto')
    }

    $q.notify({
      type: 'positive',
      message: `Carrito transferido a ${destination === 'sale' ? 'venta' : 'cotización'}`,
    })
  } catch (error) {
    console.error(`Error al transferir carrito a ${destination}:`, error)
    $q.notify({ type: 'negative', message: 'Error al procesar la transferencia' })
  }
}
</script>

<style scoped>
/* ============================================================ */
/* ESTILOS PREMIUM · UI 2026 · Material Design 3 + Apple HIG    */
/* ============================================================ */

/* ---------- BASE: Diálogo y tarjeta ---------- */
.premium-card {
  height: 82vh;
  max-height: 82vh;
  border-radius: 28px 28px 0 0 !important;
  background: #fafbfc;
  box-shadow:
    0 -12px 40px rgba(0, 0, 0, 0.08),
    0 -4px 16px rgba(0, 77, 64, 0.06),
    0 -1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* ---------- HEADER · Deep elevation ---------- */
.bg-primary-gradient {
  background: linear-gradient(160deg, #004d40 0%, #00695c 60%, #00796b 100%);
}

.premium-header {
  padding: 8px 12px;
  min-height: 56px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.header-cart-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.cart-badge-premium {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 14px;
  background: #26a69a;
  box-shadow:
    0 2px 8px rgba(38, 166, 154, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  letter-spacing: 0.3px;
}

.close-btn-premium {
  opacity: 0.85;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.close-btn-premium:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(90deg);
}

/* ---------- ÁREA DE LISTA ---------- */
.product-list-area {
  background: #f8f9fb;
}

.product-group-container {
  padding: 10px 0;
}

/* ---------- CARD DE PRODUCTO ---------- */
.product-card-wrapper {
  margin: 4px 14px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 3px 10px rgba(0, 0, 0, 0.03);
  transition:
    box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: cardFadeIn 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: calc(var(--stagger-index, 0) * 60ms);
}

.product-card-wrapper:hover {
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 77, 64, 0.08);
  transform: translateY(-1px);
  border-color: rgba(0, 77, 64, 0.08);
}

.product-card-inner {
  padding: 10px 6px;
  min-height: 0;
}

/* Separador entre cards */
.card-separator {
  height: 1px;
  margin: 0 16px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.05) 20%,
    rgba(0, 0, 0, 0.05) 80%,
    transparent 100%
  );
}

/* ---------- IMAGEN ---------- */
.image-col {
  padding-right: 2px;
}

.image-frame {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border: 2px solid #ffffff;
  transition: box-shadow 0.25s;
}

.product-card-wrapper:hover .image-frame {
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.08);
}

.product-thumb {
  width: 100%;
  height: 100%;
}

.image-fallback {
  border-radius: 14px;
}

/* Chip de cantidad sobre imagen */
.qty-chip {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #1e293b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.qty-chip-text {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  line-height: 1;
}

/* ---------- INFORMACIÓN ---------- */
.info-col {
  padding-left: 12px;
  justify-content: center;
}

.product-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  margin-bottom: 2px;
  letter-spacing: -0.1px;
}

.unit-price-label {
  color: #64748b;
  font-size: 0.78rem;
  margin-bottom: 2px;
}

.subtotal-highlight {
  font-weight: 700;
  font-size: 0.95rem;
  color: #00796b;
  letter-spacing: -0.2px;
}

/* ---------- ACCIONES ---------- */
.actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  min-width: 72px;
}

.remove-btn-premium {
  opacity: 0.5;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.remove-btn-premium:hover {
  opacity: 1;
  background: rgba(229, 57, 53, 0.1);
  transform: scale(1.15);
}

/* ---------- STEPPER PILL ---------- */
.stepper-pill {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f1f5f9;
  border-radius: 20px;
  padding: 2px;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

.stepper-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  color: #004d40;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 0;
  line-height: 1;
}
.stepper-btn:hover {
  background: #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 77, 64, 0.15);
}
.stepper-btn:active {
  transform: scale(0.92);
  background: #cbd5e1;
}

.stepper-value {
  min-width: 32px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  user-select: none;
  letter-spacing: -0.1px;
}

/* ---------- TRANSICIONES DE LISTA ---------- */
@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cart-item-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.cart-item-leave-active {
  transition: all 0.28s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.95);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

/* ---------- ESTADO VACÍO ---------- */
.empty-state-premium {
  padding: 64px 24px;
  animation: emptyFadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes emptyFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-illustration {
  position: relative;
  margin-bottom: 16px;
}

.empty-icon-animated {
  color: #004d40;
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

.empty-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 77, 64, 0.08) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: -1;
}

.empty-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
  letter-spacing: -0.2px;
}

.empty-description {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  margin: 0 0 20px;
  max-width: 260px;
  line-height: 1.5;
}

.empty-cta-btn {
  box-shadow:
    0 4px 14px rgba(0, 77, 64, 0.25),
    0 2px 6px rgba(0, 77, 64, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
  letter-spacing: 0.1px;
}
.empty-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(0, 77, 64, 0.3),
    0 4px 12px rgba(0, 77, 64, 0.2);
}

/* ---------- FOOTER ---------- */
.footer-wrapper {
  border-top: none;
}

.footer-gradient-bar {
  height: 3px;
  background: linear-gradient(90deg, #004d40 0%, #26a69a 40%, #9c27b0 70%, #26a69a 100%);
  opacity: 0.75;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.bg-glass-premium {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
}

.footer-inner {
  padding-bottom: 0;
}

/* Totales */
.totals-block-premium {
  margin-bottom: 14px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.subtotal-row {
  margin-bottom: 6px;
}

.total-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.subtotal-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}

.grand-total-row {
  border-top: 2px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 4px;
}

.grand-label {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
}

.grand-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #004d40;
  letter-spacing: -0.4px;
}

/* Grid de acciones */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 2.2fr;
  gap: 10px;
  align-items: center;
}

/* Botón Vaciar */
.clear-btn-premium {
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.1px;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid transparent;
}
.clear-btn-premium:hover {
  background: rgba(229, 57, 53, 0.06);
  border-color: rgba(229, 57, 53, 0.15);
}

/* Botón Procesar */
.primary-action {
  background: linear-gradient(145deg, #004d40 0%, #00695c 100%) !important;
  color: #ffffff !important;
}

.process-btn-premium {
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.2px;
  background: linear-gradient(
    145deg,
    #004d40 0%,
    #00695c 100%
  ) !important; /* Aseguramos el gradiente */
  color: #ffffff !important;
  box-shadow:
    0 4px 16px rgba(0, 77, 64, 0.3),
    0 2px 8px rgba(0, 77, 64, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.process-btn-premium:hover {
  box-shadow:
    0 8px 28px rgba(0, 77, 64, 0.4),
    0 4px 14px rgba(0, 77, 64, 0.25);
  transform: translateY(-2px);
}
.process-btn-premium:active {
  transform: scale(0.97);
}

/* Dropdown */
.dropdown-menu-premium {
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 4px;
}

.dropdown-option {
  border-radius: 10px;
  transition: background 0.2s;
  margin: 2px 0;
}
.dropdown-option:hover {
  background: #f1f5f9;
}

.dropdown-label {
  font-weight: 600;
  font-size: 0.88rem;
  color: #1e293b;
}

/* Safe area */
.safe-area-spacer {
  height: env(safe-area-inset-bottom, 14px);
  min-height: 14px;
}

/* ---------- RESPONSIVE ---------- */
@media (min-width: 600px) and (max-width: 899px) {
  .premium-card {
    height: 78vh;
    max-height: 78vh;
    border-radius: 26px 26px 0 0 !important;
  }
  .product-card-wrapper {
    margin: 5px 20px;
  }
  .actions-grid {
    grid-template-columns: 1fr 2fr;
    gap: 12px;
  }
}

@media (min-width: 900px) {
  .cart-bottom-sheet .premium-card {
    max-width: 520px;
    margin: 0 auto;
    border-radius: 30px 30px 0 0 !important;
    height: 84vh;
    max-height: 84vh;
    box-shadow:
      0 -16px 48px rgba(0, 0, 0, 0.1),
      0 -6px 20px rgba(0, 77, 64, 0.06);
  }
  .product-card-wrapper {
    margin: 6px 22px;
  }
  .actions-grid {
    grid-template-columns: 1fr 2.5fr;
    gap: 14px;
  }
  .grand-value {
    font-size: 1.4rem;
  }
}

@media (min-width: 1400px) {
  .cart-bottom-sheet .premium-card {
    max-width: 560px;
  }
}
</style>
