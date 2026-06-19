//src\modules\configurarsucursalSin\page\configSucursalSinPage.vue
<template>
  <q-page class="q-pa-md bg-fondo">
    <!-- Encabezado -->
    <div class="row items-center q-mb-lg">
      <q-icon name="store" size="2.5rem" color="primary" class="q-mr-md" />
      <div>
        <h1 class="text-h4 text-primary q-my-none">Configuración de Sucursales</h1>
        <p class="text-subtitle2 text-grey-8 q-mt-xs q-mb-none">
          Asigne sucursales Sin a una sucursal Empresa para centralizar operaciones.
        </p>
      </div>
    </div>

    <!-- Estadísticas -->
    <StatsCards
      :total-small="totalSmall"
      :total-big="totalBig"
      :total-assigned="totalAssigned"
      :loading="loading"
    />

    <!-- Filtros -->
    <FiltrosSucursal
      v-model:search="search"
      v-model:pais="filterPais"
      v-model:municipio="filterMunicipio"
      v-model:status="filterStatus"
      :paises="paisesList"
      :municipios="municipiosList"
    />

    <!-- Tabla -->
    <TablaSucursales
      :rows="filteredRows"
      :loading="loading"
      @asignar="openAsignarDialog"
      @quitar="confirmarQuitar"
    />

    <!-- Diálogo de asignación -->
    <AsignarDialog
      v-model="dialogAsignar"
      :small-sucursal="selectedSmall"
      :big-sucursales="bigSucursales"
      :token="token"
      @asignado="onAsignado"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatsCards from '../components/StatsCards.vue'
import FiltrosSucursal from '../components/FiltrosSucursal.vue'
import TablaSucursales from '../components/TablaSucursales.vue'
import AsignarDialog from '../components/AsignarDialog.vue'
import { useSucursales } from '../composables/useSucursales'
import { getToken } from 'src/composables/FuncionesG.js'
import { quitarCodigo } from '../services/sucursalService'
import { useQuasar } from 'quasar'

const $q = useQuasar()
// Token de autenticación (ajustar según implementación real)
const token = getToken()

console.log(token)

const { mergedSucursales, bigSucursales, loading, totalSmall, totalBig, totalAssigned, refetch } =
  useSucursales(token)

// Filtros
const search = ref('')
const filterPais = ref(null)
const filterMunicipio = ref(null)
const filterStatus = ref('all') // 'all', 'assigned', 'unassigned'

// Listas únicas para selects de filtro
const paisesList = computed(() => [
  ...new Set(mergedSucursales.value.map((s) => s.pais).filter(Boolean)),
])
const municipiosList = computed(() => [
  ...new Set(mergedSucursales.value.map((s) => s.municipio).filter(Boolean)),
])

// Aplicación de filtros
const filteredRows = computed(() =>
  mergedSucursales.value.filter((row) => {
    if (search.value && !row.nombre.toLowerCase().includes(search.value.toLowerCase())) return false
    if (filterPais.value && row.pais !== filterPais.value) return false
    if (filterMunicipio.value && row.municipio !== filterMunicipio.value) return false
    if (filterStatus.value === 'assigned' && !row.asignada) return false
    if (filterStatus.value === 'unassigned' && row.asignada) return false
    return true
  }),
)

// Diálogo de asignación
const dialogAsignar = ref(false)
const selectedSmall = ref(null)

const openAsignarDialog = (small) => {
  selectedSmall.value = small
  dialogAsignar.value = true
}

const onAsignado = () => {
  dialogAsignar.value = false
  refetch() // Actualiza la tabla tras asignar
}

const confirmarQuitar = async (sucursal) => {
  // Opcional: diálogo de confirmación con $q.dialog
  $q.dialog({
    title: 'Quitar asignación',
    message: `¿Seguro que deseas quitar el código de sucursal grande de ${sucursal.nombre}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await quitarCodigo(sucursal.idsucursalcontable)
      refetch()
      $q.notify({ type: 'positive', message: 'Código eliminado' })
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message })
    }
  })
}
onMounted(() => {
  refetch()
})
</script>

<style scoped>
/* Fondo corporativo */
.bg-fondo {
  background-color: #eeebe2; /* $fondo */
}
</style>
