<template>
  <q-page class="q-pa-md">
    <!-- Vista principal -->
    <div v-if="vistaActiva === 'principal'">
      <FiltrosCxC
        v-model:filtroAlmacen="filtroAlmacen"
        v-model:filtroEstado="filtroEstado"
        :opcionesAlmacenes="opcionesAlmacenes"
        :opcionesTipo="opcionesTipo"
      />

      <tablaCuentasxCobrar
        ref="refHijo"
        :rows="datosFiltrados"
        @cargar-formulario="cargarFormulario"
        @mostrar-detalles="mostrarDetalles"
      />
    </div>

    <!-- Vista de detalles -->
    <DetallesCobrosView
      v-else-if="vistaActiva === 'detalles'"
      :rows="detallesCobros"
      :total-cobrado="totalCobrado"
      :divisa="divisa"
      :detalle-seleccionado="detalleSeleccionado"
      :formato-moneda="formatoMoneda"
      @back="vistaActiva = 'principal'"
      @ver-comprobante="mostrarImagen"
    />

    <!-- Diálogo Registrar Cobro -->
    <RegistrarCobroDialog
      v-model="mostrarForm"
      v-model:formulario="formulario"
      :divisa="divisa"
      :is-compressing="isCompressing"
      @close="cerrarFormulario"
      @submit="() => registrarCobro(cargarDatos)"
      @handle-archivo="convertirImagen"
      @calcular-totales="calcularTotales"
      @calcular-numero-cobros="calcularNumeroCobros"
    />

    <!-- Visor de Comprobante -->
    <ComprobanteViewerDialog
      v-model="mostrarDialogoImagen"
      :imagen-seleccionada="imagenSeleccionada"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import emitter from 'src/event-bus'

// Composable
import { useCuentasxCobrar } from './composables/useCuentasxCobrar'

// Componentes extraídos (SOLID - SRP)
import FiltrosCxC from './components/FiltrosCxC.vue'
import tablaCuentasxCobrar from './tablaCuentasxCobrar.vue'
import DetallesCobrosView from './components/DetallesCobrosView.vue'
import RegistrarCobroDialog from './components/RegistrarCobroDialog.vue'
import ComprobanteViewerDialog from './components/ComprobanteViewerDialog.vue'

const {
  vistaActiva,
  mostrarForm,
  mostrarDialogoImagen,
  imagenSeleccionada,
  divisa,
  opcionesAlmacenes,
  filtroAlmacen,
  filtroEstado,
  opcionesTipo,
  datosFiltrados,
  detallesCobros,
  detalleSeleccionado,
  totalCobrado,
  formulario,
  cargarAlmacenesAutorizados,
  cargarDatos,
  cargarFormulario,
  calcularTotales,
  calcularNumeroCobros,
  convertirImagen,
  registrarCobro,
  cerrarFormulario,
  mostrarDetalles,
  mostrarImagen,
  formatoMoneda,
  isCompressing,
} = useCuentasxCobrar()

// Ref tabla hija (para acceso externo si es necesario)
const refHijo = ref(null)

// ─── Teclado ─────────────────────────────────────────────────────────────────
function handleKeydown(e) {
  if (e.key === 'Escape') cerrarFormulario()
}

// ─── Ciclo de vida ───────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await cargarAlmacenesAutorizados()
  await cargarDatos()
  
  emitter.on('realizar-pago', (notification) => {
    const btn = document.getElementById(`btn-${notification.id}`)
    if (btn) btn.click()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
