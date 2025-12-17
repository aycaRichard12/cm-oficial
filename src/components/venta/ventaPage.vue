<template>
  <q-page padding>
    <carritoVenta
      ref="carritoVentaRef"
      v-show="!showCart"
      :key="carritoKey"
      @volver="toggleComponents"
      @reiniciar="forzarReinicioCarrito"
    />
    <component
      v-show="showCart"
      :is="componenteSeleccionado"
      @seleccionar="mostrarComponente"
      @volver="componenteActual = 'tipo_doc'"
      @continuar="toggleComponents"
      @venta-registrada="resetearVenta"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import carritoVenta from './carritoVenta.vue'
import { useCurrencyStore } from 'src/stores/currencyStore'
const carritoKey = ref(0)

const forzarReinicioCarrito = () => {
  carritoKey.value++ // ⚠️ Esto reinicia el componente `carritoVenta`
}
const currencyStore = useCurrencyStore()
const carritoVentaRef = ref(null)
// Opcional: cargar al iniciar si no está cargado
if (!currencyStore.divisa && !currencyStore.loading) {
  currencyStore.cargarDivisaActiva()
}
// Diccionario de componentes

const componentes = {
  tipo_doc: defineAsyncComponent(() => import('./typeDoc.vue')),
  preforma: defineAsyncComponent(() => import('./preformaC.vue')),
  facturaCV: defineAsyncComponent(() => import('./facturaCV.vue')),
  facturaCMEX: defineAsyncComponent(() => import('./facturaCMEX.vue')),
  facturaABYM: defineAsyncComponent(() => import('./facturaABYM.vue')),
}

const componenteActual = ref('tipo_doc')

// Componente que se va a mostrar actualmente
const componenteSeleccionado = computed(() => componentes[componenteActual.value])

const mostrarComponente = (codigo) => {
  componenteActual.value = codigo
}
const showCart = ref(false)

// Lógica para alternar entre componentes
const toggleComponents = () => {
  showCart.value = !showCart.value
}
const resetearVenta = () => {
  componenteActual.value = 'tipo_doc'
  showCart.value = false
  carritoVentaRef.value?.limpiarCarrito()

  // Opcional: también puedes limpiar otros estados si tienes un store
  // por ejemplo: carritoStore.limpiarCarrito()
}
</script>
