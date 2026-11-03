<template>
  <q-card class="table-card" flat>
    <q-card-section class="table-header">
      <div class="row items-center q-col-gutter-md">
        <!-- Título e Icono -->
        <div class="col-12 col-md-auto row items-center">
          <q-icon name="table_chart" color="primary" size="28px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-primary">{{ $t('ui.listado-de-inventario-1e4e32') }}</div>
        </div>

        <q-space class="gt-sm" />

        <!-- Buscador -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            dense
            outlined
            v-model="busqueda"
            :placeholder="$t('ui.buscar-por-producto-o-codigo-1787e0')"
            class="cm-surface"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <!-- Filtro Categoría -->
        <div class="col-12 col-sm-4 col-md-3">
          <q-select
            dense
            outlined
            clearable
            v-model="categoriaFiltro"
            :options="categoriasUnicas"
            :label="$t('ui.filtrar-por-categoria-03b32f')"
            class="cm-surface"
          >
            <template v-slot:prepend>
              <q-icon name="filter_alt" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Botones de Acción -->
        <div class="col-auto ml-auto">
          <div class="row q-gutter-xs no-wrap">
            <q-btn
              round
              icon="file_download"
              @click="exportarExcel"
              color="positive"
              flat
              size="md"
            >
              <q-tooltip>{{ $t('ui.exportar-a-excel-1569c7') }}</q-tooltip>
            </q-btn>
            <q-btn round icon="picture_as_pdf" @click="exportarPDF" color="negative" flat size="md">
              <q-tooltip>{{ $t('ui.exportar-a-pdf-f6b614') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-table
      :rows="datosFiltrados"
      :columns="columnas"
      row-key="id"
      :loading="store.loading"
      virtual-scroll
      :rows-per-page-options="[20, 50, 100, 0]"
      :pagination="{ rowsPerPage: 20 }"
      class="inventory-table"
      flat
      bordered
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="colorEstado(props.row.estado)" class="estado-badge">
            {{ props.row.estado }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-valorInventario="props">
        <q-td :props="props">{{ props.row.valorInventario }}</q-td>
      </template>
      <template v-slot:body-cell-precioSugerido="props">
        <q-td :props="props">{{ props.row.precioSugerido }}</q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import { useStockStore } from '../store/stockStore'
//import { useCurrencyStore } from 'src/stores/currencyStore'
//import { exportToExcel, exportToPDF } from 'src/utils/exportUtils'

const store = useStockStore()
//const currencyStore = useCurrencyStore()
const busqueda = ref('')
const categoriaFiltro = ref(null)

const categoriasUnicas = computed(() => {
  const cats = store.productos.map((p) => p.categoria).filter(Boolean)
  return [...new Set(cats)]
})

const datosFiltrados = computed(() => {
  let datos = store.productos
  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    datos = datos.filter(
      (p) => p.producto.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term),
    )
  }
  if (categoriaFiltro.value) {
    datos = datos.filter((p) => p.categoria === categoriaFiltro.value)
  }
  return datos
})

const columnas = [
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: i18nT('ui.descripcion-producto-f0f040'),
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },

  { name: 'stock', label: i18nT('ui.stock-actual-93d773'), field: 'stock', align: 'right', sortable: true },
  { name: 'stockminimo', label: i18nT('ui.stock-minimo-e10ddd'), field: 'stockminimo', align: 'right' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'precioSugerido', label: i18nT('ui.precio-sugerido-dbaa32'), field: 'precioSugerido', align: 'right' },
  { name: 'valorInventario', label: i18nT('ui.valor-inventario-5bcd56'), field: 'valorInventario', align: 'right' },
  {
    name: 'ultimaActualizacion',
    label: i18nT('ui.ultima-actualizacion-26e09a'),
    field: 'ultimaActualizacion',
    align: 'center',
  },
]

function colorEstado(estado) {
  const map = { Disponible: 'green', Bajo: 'orange', Crítico: 'red', Agotado: 'dark' }
  return map[estado] || 'grey'
}

function exportarExcel() {
  //exportToExcel(datosFiltrados.value, columnas, 'Inventario')
}

function exportarPDF() {
  //exportToPDF(datosFiltrados.value, columnas, 'Reporte_Inventario')
}
</script>

<style scoped>
.table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--cm-border);
}

.table-header {
  background: var(--cm-surface-2);
  padding: 16px 20px;
  border-bottom: 2px solid var(--cm-border);
}

.table-header .text-h6 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--cm-text);
}

.search-input {
  min-width: 200px;
}

.category-select {
  min-width: 150px;
}

.export-btn {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 12px;
}

.inventory-table :deep(.q-table__card) {
  box-shadow: none;
  border: none;
}

.inventory-table :deep(.q-table__grid-content) {
  background: var(--cm-surface);
}

.inventory-table :deep(tr:hover) {
  background-color: var(--cm-surface-2);
}

.estado-badge {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 6px 8px;
}
</style>
