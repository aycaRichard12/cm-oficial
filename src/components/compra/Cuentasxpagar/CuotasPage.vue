<template>
  <q-table
    :rows="allRows"
    :columns="columns"
    row-key="id_pago"
    :loading="loading"
    :rows-per-page-options="[10, 25, 50]"
    flat
    bordered
  >
    <!-- Slot para personalizar la celda de Estado -->
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-chip
          :color="Number(props.row.estado) === 1 ? 'green' : 'orange'"
          text-color="white"
          dense
          class="text-weight-bold"
        >
          {{ Number(props.row.estado) === 1 ? 'Concluido' : 'En Proceso' }}
        </q-chip>
      </q-td>
    </template>

    <!-- Slot para personalizar la celda de Acción -->
    <template v-slot:body-cell-accion="props">
      <q-td :props="props" v-if="Number(props.row.estado) === 2">
        <q-btn color="primary" label="Pagar" size="sm" @click="realizarPago(props.row)" />
      </q-td>
    </template>
    <template v-slot:no-data>
      <div class="full-width row flex-center text-primary q-gutter-sm text-body1">
        <span> No se encontraron resultados para los filtros seleccionados. </span>
      </div>
    </template>
  </q-table>
  <q-dialog v-model="mdpagarCueota">
    <q-card class="responsive-dialog">
      <q-card-section class="bg-primary text-white text-h6 flex justify-between">
        <div>Registrar Pago</div>
        <q-btn icon="close" dense flat rounded @click="mdpagarCueota = false" />
      </q-card-section>
      <q-card-section>
        <PagarCuotaPage :cuota="cuota" @registrado="ValidarResultado" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import PagarCuotaPage from './PagarCuotaPage.vue'
const props = defineProps({
  pago: Object,
})

// --- Estado y Notificaciones ---
const $q = useQuasar()
const loading = ref(false)
const mdpagarCueota = ref(false)
// --- Datos y Columnas de la Tabla ---
const allRows = ref([]) // Almacena todos los datos originales de la API
const cuota = ref({})
const columns = [
  { name: 'nro_cuota', label: 'N°', align: 'left', field: 'nro_cuota', sortable: true },
  {
    name: 'monto_cuota',
    label: 'Monto Cuota',
    align: 'left',
    field: 'monto_cuota',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  {
    name: 'fecha_vencimiento',
    label: 'Fecha Vencimiento',
    align: 'left',
    field: 'fecha_vencimiento',
    sortable: true,
  },
  {
    name: 'fecha_pago',
    label: 'Fecha Pago',
    align: 'center',
    field: 'fecha_pago',
    sortable: true,
  },
  {
    name: 'monto_pagado',
    label: 'Monto Pagado',
    align: 'left',
    field: 'monto_pagado',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },

  { name: 'estado', label: 'Estado', align: 'center', field: 'estado', sortable: true },
  { name: 'accion', label: 'Acción', align: 'center', field: 'accion' },
]
const emit = defineEmits(['actualizar'])
// --- Opciones para los Selects de Filtro ---

// --- Lógica de Carga de Datos ---
onMounted(() => {
  fetchData()
})

async function fetchData() {
  console.log(props.pago)
  loading.value = true
  const apiUrl = `obtenerCuotasPorPago/${props.pago.id_pago}`
  try {
    const response = await api.get(apiUrl)
    console.log(response.data)
    allRows.value = response.data
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error)
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'No se pudieron cargar los datos. Por favor, intente más tarde.',
      icon: 'report_problem',
    })
  } finally {
    loading.value = false
  }
}

// --- Lógica de Filtrado ---

// --- Acciones de la Tabla ---
function realizarPago(item) {
  cuota.value = item
  console.log('Realizando pago para:', item)
  $q.notify({
    color: 'positive',
    position: 'bottom',
    message: `Iniciando proceso de pago para la factura #${item.nrofactura} del proveedor ${item.proveedor}.`,
    icon: 'payment',
  })
  cerrarModalformulario()
}
const cerrarModalformulario = () => {
  mdpagarCueota.value = !mdpagarCueota.value
}
const ValidarResultado = (data) => {
  console.log(data)
  console.log(data)
  fetchData()
  cerrarModalformulario()
  emit('actualizar')
}
</script>

<style>
/* Estilos para asegurar que la página ocupe todo el espacio disponible */
.q-page {
  display: flex;
  flex-direction: column;
}
</style>
