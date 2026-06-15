<template>
  <q-card class="product-list-card" flat bordered>
    <!-- CABECERA -->
    <q-card-section class="q-pa-md">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-weight-medium text-primary">
            <q-icon name="inventory_2" class="q-mr-sm" />
            Lista de productos
          </div>
          <div class="text-caption text-grey-7">
            Visualización optimizada con desplazamiento virtual
          </div>
        </div>
        <div class="col-auto">
          <q-badge
            :label="`${products.length} productos`"
            color="primary"
            rounded
            class="q-px-md q-py-sm text-body2"
            style="font-weight: 500"
          >
            <q-tooltip class="bg-accent"> Total de productos cargados </q-tooltip>
          </q-badge>
        </div>
      </div>
    </q-card-section>

    <q-separator :color="$q.dark.isActive ? 'grey-8' : 'secondary'" />

    <!-- LISTA DE PRODUCTOS (VIRTUAL SCROLL) -->
    <q-card-section class="q-pa-none product-list-section">
      <!-- Estado vacío (mejora visual sin lógica adicional) -->
      <div v-if="!products.length" class="empty-state">
        <q-card flat class="empty-card">
          <q-card-section class="column items-center q-pa-xl">
            <q-icon name="category" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay productos</div>
            <div class="text-caption text-grey-5">
              Agrega productos desde el módulo de inventario
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Virtual Scroll (solo si hay productos) -->
      <div v-else class="product-list bg-fondo">
        <q-virtual-scroll
          :items="productRows"
          :virtual-scroll-item-size="itemHeight"
          :virtual-scroll-slice-size="buffer"
          class="virtual-scroll-container"
          @virtual-scroll="onScroll"
        >
          <template v-slot="{ item: row, index }">
            <div :key="`row-${index}`" class="row q-col-gutter-md q-px-md q-py-sm no-wrap">
              <div
                v-for="product in row"
                :key="product.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
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
    </q-card-section>
  </q-card>
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

// --- LÓGICA NO MODIFICADA ---
const itemsPerRow = computed(() => {
  if ($q.screen.lt.sm) return 1
  if ($q.screen.lt.md) return 2
  if ($q.screen.lt.lg) return 3
  return 4
})

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
// --- FIN LÓGICA NO MODIFICADA ---
</script>

<style scoped>
/* ===== CONTENEDOR PRINCIPAL ===== */
.product-list-card {
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: 16px;
  transition: box-shadow 0.2s ease-in-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-list-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

/* ===== SECCIÓN DE LISTA (ocupa todo el espacio restante) ===== */
.product-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* importante para que el scroll funcione */
}

/* ===== ESTADO VACÍO ===== */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-card {
  background-color: transparent;
  box-shadow: none;
  text-align: center;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 24px;
  max-width: 400px;
  width: 100%;
}

/* ===== CONTENEDOR DEL VIRTUAL SCROLL ===== */
.product-list {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.virtual-scroll-container {
  height: 100%;
  width: 100%;
  background-color: #fafcff;
  /* Scrollbar personalizado (moderno) */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== FILAS (para mantener el layout grid con virtual scroll) ===== */
.no-wrap {
  flex-wrap: nowrap !important;
}

@media (max-width: 599px) {
  .no-wrap {
    flex-wrap: wrap !important;
  }
}

/* Mejora de espaciado entre tarjetas en móvil */
@media (max-width: 599px) {
  .q-col-gutter-md {
    margin: -8px;
  }
  .q-col-gutter-md > div {
    padding: 8px;
  }
}

/* Ajuste de padding en la cabecera para pantallas pequeñas */
@media (max-width: 599px) {
  .q-pa-md {
    padding: 12px;
  }
  .text-h6 {
    font-size: 1.1rem;
  }
  .q-badge {
    font-size: 0.75rem;
  }
}
</style>
