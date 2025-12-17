<template>
  <div class="titulo">Reporte de Pagos</div>

  <!-- Sección de Filtros -->

  <!-- Tabla de Datos -->
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
          :color="props.row.estado_pago === 1 ? 'green' : 'orange'"
          text-color="white"
          dense
          class="text-weight-bold"
        >
          {{ props.row.estado_pago === 1 ? 'Concluido' : 'En Proceso' }}
        </q-chip>
      </q-td>
    </template>
    <template v-slot:body-cell-comprobante_path="props">
      <q-td :props="props">
        <template v-if="/\.pdf$/i.test(props.row.comprobante_path)">
          <q-btn
            color="primary"
            icon="picture_as_pdf"
            label="Ver PDF"
            @click="abrirEnNuevaPestana(props.row.comprobante_path)"
          />
        </template>

        <template v-else>
          <q-img
            :src="props.row.comprobante_path"
            class="cursor-pointer"
            style="max-height: 100px"
            @click="onVerimagen(props.row.comprobante_path)"
          />
        </template>
      </q-td>
    </template>
    <!-- Slot para personalizar la celda de Acción -->
    <template v-slot:body-cell-accion="props">
      <q-td :props="props"> </q-td>
    </template>
    <template v-slot:no-data>
      <div class="full-width row flex-center text-primary q-gutter-sm text-body1">
        <span> No se encontraron resultados para los filtros seleccionados. </span>
      </div>
    </template>
  </q-table>
  <q-dialog v-model="mostrarImagen">
    <q-card class="responsive-dialog">
      <q-card-section>
        <q-img :src="imagenSeleccionada" style="width: 100%; height: auto" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
const mostrarImagen = ref(false)
const imagenSeleccionada = ref('')
const props = defineProps({
  pago: Object,
})

// --- Estado y Notificaciones ---
const $q = useQuasar()
const loading = ref(false)

// --- Datos y Columnas de la Tabla ---
const allRows = ref([]) // Almacena todos los datos originales de la API

const columns = [
  { name: 'fecha_pago', label: 'Fecha Pago', align: 'left', field: 'fecha_pago', sortable: true },
  {
    name: 'monto',
    label: 'Monto',
    align: 'left',
    field: 'monto',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  { name: 'referencia', label: 'Referencia', align: 'left', field: 'referencia', sortable: true },
  {
    name: 'observaciones',
    label: 'Observaciones',
    align: 'center',
    field: 'observaciones',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', align: 'left', field: 'estado', sortable: true },
  {
    name: 'comprobante_path',
    label: 'Vaucher',
    align: 'center',
    field: 'comprobante_path',
    sortable: true,
  },
]

// --- Opciones para los Selects de Filtro ---

// --- Lógica de Carga de Datos ---
onMounted(() => {
  fetchData()
})

async function fetchData() {
  console.log(props.pago)
  loading.value = true
  const apiUrl = `obtenerTransaccionesPorPago/${props.pago.id_pago}`
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
const abrirEnNuevaPestana = (ruta) => {
  window.open(ruta, '_blank')
}
const onVerimagen = (item) => {
  imagenSeleccionada.value = item
  mostrarImagen.value = true
}

// --- Acciones de la Tabla ---
</script>

<style>
/* Estilos para asegurar que la página ocupe todo el espacio disponible */
.q-page {
  display: flex;
  flex-direction: column;
}
</style>
