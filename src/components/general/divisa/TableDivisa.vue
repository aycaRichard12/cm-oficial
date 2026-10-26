<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <q-btn
          color="primary"
          @click="$emit('add')"
          class="btn-res q-mt-lg"
          :title="t('configGeneral.divisas.table.addTitle')"
          id="add"
        >
          <q-icon name="add" class="icono" />
          <span class="texto"> <q-icon name="add" /> {{ t('common.new') }} </span>
        </q-btn>
      </div>
    </div>

    <q-table
      id="table"
      flat
      :rows="filtradas"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
      class="sticky-header-table"
      bordered
      :title="t('configGeneral.divisas.table.title')"
    >
      <template v-slot:body-cell-monedaSin="props" v-if="tipoFactura">
        <q-td :props="props">
          {{ props.row.monedasin?.descripcion }}
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="t('common.active')" outline />
          <q-badge color="red" v-else :label="t('common.inactive')" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td align="center">
          <q-btn
            id="edit"
            icon="edit"
            color="primary"
            dense
            flat
            @click="$emit('edit', props.row)"
            :title="t('common.edit')"
          />
          <q-btn
            id="delete"
            icon="delete"
            dense
            flat
            color="negative"
            @click="$emit('delete', props.row)"
            :title="t('common.delete')"
          />
          <q-btn
            :title="t('configGeneral.divisas.table.toggleStatus')"
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getTipoFactura } from 'src/composables/FuncionesG'
const tipoFactura = getTipoFactura(true)
const { t } = useI18n()
// Initialize the Pinia store

// Define component props
const props = defineProps({
  rows: Array,
})
console.log(props.rows)
// Reactive variable for search input

// Computed property for table columns, which dynamically includes/excludes 'monedaSin'
const columns = computed(() => {
  const dynamicColumns = [
    { name: 'nro', label: t('configGeneral.divisas.table.number'), align: 'right', field: 'nro' },
    { name: 'nombre', label: t('configGeneral.divisas.table.currency'), align: 'left', field: 'nombre' },
    { name: 'tipo', label: t('configGeneral.divisas.table.type'), align: 'left', field: 'tipo' },
  ]

  // Conditionally add the 'monedaSin' column if estadoFactura is true
  if (tipoFactura) {
    // Access the value of the reactive property
    dynamicColumns.push({
      name: 'monedaSin',
      label: t('configGeneral.divisas.table.sin'),
      align: 'left',
      field: 'monedaSin',
    })
  }

  // Add the remaining common columns
  dynamicColumns.push(
    { name: 'estado', label: t('configGeneral.divisas.table.status'), align: 'center' },
    { name: 'opciones', label: t('configGeneral.divisas.table.options'), align: 'center' },
  )

  return dynamicColumns
})

// Computed property for filtered rows based on search input
const filtradas = computed(() => {
  const base = props.rows || []
  console.log('Filtradas - base:', base)
  if (!base.length) return []
  // Add a 'numero' field for display purposes (N° column)
  return base.map((row, index) => ({
    ...row,
    nro: index + 1,
  }))
})
</script>

<style scoped>
.my-table {
  max-height: 500px;
  overflow: auto;
}
</style>
