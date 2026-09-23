<template>
  <div>
    <!-- Tabla real -->
    <q-table
      v-if="!loading"
      :rows="rows"
      :columns="columns"
      row-key="idsucursalcontable"
      flat
      bordered
      sticky-header
      class="my-sticky-table"
    >
      <!-- Estado visual -->
      <template #body-cell-estado="props">
        <q-td :props="props">
          <EstadoBadge :asignada="props.row.asignada" />
        </q-td>
      </template>

      <!-- Acciones -->
      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn flat dense color="primary" icon="link" @click="$emit('asignar', props.row)">
            <q-tooltip>
              {{ props.row.asignada ? 'Cambiar sucursal Sin' : 'Asignar a sucursal Sin' }}
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.asignada"
            flat
            round
            color="negative"
            icon="link_off"
            @click="$emit('quitar', props.row)"
            :loading="props.row.quitting"
            :disable="props.row.quitting"
          >
            <q-tooltip>Quitar asignación</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Estado vacío -->
      <template #no-data>
        <div class="full-width row flex-center q-pa-lg text-grey-7">
          <q-icon name="info" size="2rem" class="q-mr-sm" />
          <div class="text-subtitle1">No se encontraron sucursales con los filtros actuales</div>
        </div>
      </template>
    </q-table>

    <!-- Skeleton loader -->
    <div v-else>
      <q-card flat bordered>
        <q-card-section>
          <div v-for="i in 5" :key="i" class="row q-col-gutter-sm q-mb-sm">
            <div class="col-3"><q-skeleton type="text" /></div>
            <div class="col-2"><q-skeleton type="text" /></div>
            <div class="col-2"><q-skeleton type="text" /></div>
            <div class="col-2"><q-skeleton type="text" /></div>
            <div class="col-3"><q-skeleton type="text" /></div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import EstadoBadge from './EstadoBadge.vue'

defineProps({
  rows: Array,
  loading: Boolean,
})

defineEmits(['asignar', 'quitar'])

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'pais', label: 'País', field: 'pais', align: 'left', sortable: true },
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'left', sortable: true },
  { name: 'codigosucursal', label: 'Código Sucursal', field: 'codigosucursal', align: 'left' },
  {
    name: 'sucursalGrande',
    label: 'Sucursal Sin Asignada',
    field: (row) =>
      row.sucursalGrande
        ? `${row.sucursalGrande.codigoSucursal} - ${row.sucursalGrande.municipio} - ${row.sucursalGrande.pais}`
        : '—',
    align: 'left',
  },
  { name: 'estado', label: 'Estado', field: 'asignada', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', sortable: false },
]
</script>

<style scoped>
.my-sticky-table {
  max-height: 65vh;
}
</style>
