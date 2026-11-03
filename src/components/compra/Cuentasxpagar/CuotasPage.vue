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
          {{ Number(props.row.estado) === 1 ? $t('ui.concluido-123dfa') : $t('ui.en-proceso-875ad4') }}
        </q-chip>
      </q-td>
    </template>

    <!-- Slot para personalizar la celda de Acción -->
    <template v-slot:body-cell-accion="props">
      <q-td :props="props" v-if="Number(props.row.estado) === 2">
        <q-btn color="primary" :label="$t('ui.pagar-2faf5e')" size="sm" @click="realizarPago(props.row)" />
      </q-td>
    </template>
    <template v-slot:no-data>
      <div class="full-width row flex-center text-primary q-gutter-sm text-body1">
        <span> {{ $t('ui.no-se-encontraron-resultados-para-los-filtros-selecc-512c0a') }} </span>
      </div>
    </template>
  </q-table>
  <q-dialog v-model="mdpagarCueota">
    <q-card class="responsive-dialog">
      <q-card-section class="bg-primary text-white text-h6 flex justify-between">
        <div>{{ $t('ui.registrar-pago-e6ce75') }}</div>
        <q-btn icon="close" dense flat rounded @click="mdpagarCueota = false" />
      </q-card-section>
      <q-card-section>
        <PagarCuotaPage :cuota="cuota" @registrado="ValidarResultado" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'nro_cuota', label: i18nT('cotizacion.table.number'), align: 'left', field: 'nro_cuota', sortable: true },
  {
    name: 'monto_cuota',
    label: i18nT('ui.monto-cuota-53ed49'),
    align: 'left',
    field: 'monto_cuota',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  {
    name: 'fecha_vencimiento',
    label: i18nT('ui.fecha-vencimiento-821fd4'),
    align: 'left',
    field: 'fecha_vencimiento',
    sortable: true,
  },
  {
    name: 'fecha_pago',
    label: i18nT('ui.fecha-pago-716ad0'),
    align: 'center',
    field: 'fecha_pago',
    sortable: true,
  },
  {
    name: 'monto_pagado',
    label: i18nT('ui.monto-pagado-1f8b4b'),
    align: 'left',
    field: 'monto_pagado',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },

  { name: 'estado', label: i18nT('cotizacion.table.status'), align: 'center', field: 'estado', sortable: true },
  { name: 'accion', label: i18nT('ui.accion-d7927a'), align: 'center', field: 'accion' },
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
      message: i18nT('ui.no-se-pudieron-cargar-los-datos-por-favor-intente-ma-e60bf9'),
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

defineExpose({ fetchData })
</script>

<style>
/* Estilos para asegurar que la página ocupe todo el espacio disponible */
.q-page {
  display: flex;
  flex-direction: column;
}
</style>
