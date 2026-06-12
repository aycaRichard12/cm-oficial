<!-- src/modules/quick-consult/components/cart/CartBottomSheet.vue -->
<template>
  <q-dialog v-model="isOpen" position="bottom" full-width class="cart-bottom-sheet">
    <q-card class="column no-wrap cart-card">
      <!-- Header -->
      <q-toolbar class="bg-primary text-white sticky-header">
        <q-btn flat round dense icon="shopping_cart" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Mi Carrito ({{ cartStore.totalItems }} unidades)
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <!-- Lista de Productos -->
      <q-card-section class="col scroll q-pa-none">
        <q-list v-if="cartStore.itemList.length > 0" separator>
          <q-item v-for="item in cartStore.itemList" :key="item.product.id" class="q-py-md">
            <!-- Imagen -->
            <q-item-section avatar>
              <q-img
                :src="item.product.imagen ? imagenUrl + item.product.imagen : ''"
                style="width: 60px; height: 60px; border-radius: 8px"
                class="bg-grey-2"
                spinner-color="primary"
              >
                <template v-slot:error>
                  <div class="full-height full-width flex flex-center bg-grey-3 text-grey-7">
                    <q-icon name="inventory_2" size="sm" />
                  </div>
                </template>
              </q-img>
            </q-item-section>

            <!-- Info Principal -->
            <q-item-section>
              <q-item-label class="text-weight-bold text-primary ellipsis-2-lines">
                {{ item.product.descripcion }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                Precio unitario: {{ formatPrice(item.product.precio) }}
              </q-item-label>
              <q-item-label class="text-weight-bolder text-teal q-mt-xs">
                Subtotal: {{ formatPrice(item.product.precio * item.quantity) }}
              </q-item-label>
            </q-item-section>

            <!-- Acciones y Stepper -->
            <q-item-section side class="column items-end justify-between q-gutter-y-sm">
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmRemove(item)"
              />

              <div class="stepper-container row items-center no-wrap">
                <q-btn
                  dense
                  flat
                  round
                  color="primary"
                  icon="remove"
                  class="stepper-btn"
                  @click="decrement(item)"
                />
                <div class="quantity-text text-weight-bold q-px-sm">
                  {{ item.quantity }}
                </div>
                <q-btn
                  dense
                  flat
                  round
                  color="primary"
                  icon="add"
                  class="stepper-btn"
                  @click="increment(item)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Estado Vacío -->
        <div v-else class="column items-center justify-center q-pa-xl text-grey-6">
          <q-icon name="shopping_cart_checkout" size="4rem" />
          <div class="text-h6 q-mt-md">Tu carrito está vacío</div>
          <p class="text-center">¡Agrega algunos productos para comenzar!</p>
          <q-btn
            label="Explorar productos"
            color="primary"
            v-close-popup
            class="q-mt-md"
            rounded
            outline
          />
        </div>
      </q-card-section>

      <!-- Footer Resumen -->
      <q-separator />
      <q-card-section v-if="cartStore.itemList.length > 0" class="bg-grey-1 q-pa-md">
        <div class="row justify-between items-center q-mb-xs">
          <div class="text-grey-7">Subtotal:</div>
          <div class="text-subtitle2">{{ formatPrice(cartStore.totalAmount) }}</div>
        </div>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-weight-bold text-subtitle1">Total General:</div>
          <div class="text-weight-bolder text-h6 text-primary">
            {{ formatPrice(cartStore.totalAmount) }}
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-btn
              flat
              color="negative"
              label="Vaciar"
              icon="delete_sweep"
              class="full-width"
              @click="confirmClearCart"
              no-caps
            />
          </div>
          <div class="col-8">
            <q-btn
              color="primary"
              label="Cerrar y continuar"
              v-close-popup
              class="full-width text-weight-bold"
              size="lg"
              rounded
              no-caps
              @click="proceedToSale"
            />
          </div>
        </div>
        <div class="safe-area-bottom" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useQuickConsultCartStore } from '../../stores/cartStore'
import { useQuickConsultUiStore } from '../../stores/uiStore'
import { imagen as imagenUrl } from 'src/boot/url'
import { useRouter } from 'vue-router'
const router = useRouter()

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

const proceedToSale = async () => {
  try {
    // Obtener items en formato carritoVenta
    const items = cartStore.getItemsForSale()
    console.log('Items para venta:', items)
    if (items.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay productos en el carrito' })
      return
    }

    // Crear estructura de datos para localStorage (similar a carritoVenta)
    const saleCart = {
      listaProductos: items,
      listaProductosFactura: items.map((item) => ({
        idproductoalmacen: item.idproductoalmacen,
        cantidad: item.cantidad,
        id: item.id,
        almacen: item.almacen,
        codigo: item.codigo,
        codigobarra: item.codigobarra,
        producto: item.producto,
        descripcion: item.descripcion,
        detalle: item.detalle,
        unidad: item.unidad,
        caracteristica: item.caracteristica,
        stockminimo: item.stockminimo,
        stock: item.stock,
        fecha: item.fecha,
        idalmacen: item.idalmacen,
        estado: item.estado,
        medida: item.medida,
        categoria: item.categoria,
        idproducto: item.idproducto,
        estadoproducto: item.estadoproducto,
        stockmaximo: item.stockmaximo,
        imagen: item.imagen,
        idstock: item.idstock,
        idcategoriaprecio: item.idcategoriaprecio,
        tipo: item.tipo,
        precio: item.precio,
        codigosin: item.codigosin,
        actividadsin: item.actividadsin,
        unidadsin: item.unidadsin,
        codigonandina: item.codigonandina,
        precioOriginal: item.precioOriginal,
        tienePrecioCampana: item.tienePrecioCampana,
        despachado: item.despachado,
      })),
      listaFactura: {},
      subtotal: cartStore.totalAmount,
      descuento: 0,
      ventatotal: cartStore.totalAmount,
      nropagos: 0,
      valorpagos: 0,
      idcampana: 0,
    }

    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(saleCart))

    // Opcional: limpiar el carrito rápido (para no tener datos duplicados)
    cartStore.clearCart()

    // Navegar al componente de venta (ajustar ruta según tu proyecto)
    // En proceedToSale, después de guardar el carrito
    router.push('/registrarventaoculto?preserveCart=true')

    $q.notify({ type: 'positive', message: 'Carrito transferido a venta' })
  } catch (error) {
    console.error('Error al transferir carrito:', error)
    $q.notify({ type: 'negative', message: 'Error al procesar la venta' })
  }
}
</script>

<style scoped>
.cart-card {
  height: 80vh;
  max-height: 80vh;
  border-radius: 24px 24px 0 0 !important;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.stepper-container {
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 2px;
}

.stepper-btn {
  width: 36px;
  height: 36px;
}

.quantity-text {
  min-width: 30px;
  text-align: center;
  font-size: 1rem;
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0px);
}

.text-teal {
  color: #00897b;
}

/* Transiciones táctiles */
.q-item {
  transition: background-color 0.2s;
}
.q-item:active {
  background-color: #f5f5f5;
}
</style>
