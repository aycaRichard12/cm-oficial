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
              {{ props.row.asignada ? $t('ui.cambiar-sucursal-sin-13207c') : $t('ui.asignar-a-sucursal-sin-f23e54') }}
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
            <q-tooltip>{{ $t('ui.quitar-asignacion-9c7938') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Estado vacío -->
      <template #no-data>
        <div class="full-width row flex-center q-pa-lg text-grey-7">
          <q-icon name="info" size="2rem" class="q-mr-sm" />
          <div class="text-subtitle1">{{ $t('ui.no-se-encontraron-sucursales-con-los-filtros-actuale-baac2d') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
import EstadoBadge from './EstadoBadge.vue'

defineProps({
  rows: Array,
  loading: Boolean,
})

defineEmits(['asignar', 'quitar'])

const columns = [
  { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left', sortable: true },
  { name: 'pais', label: i18nT('ui.pais-0c664f'), field: 'pais', align: 'left', sortable: true },
  { name: 'municipio', label: i18nT('ui.municipio-9e8609'), field: 'municipio', align: 'left', sortable: true },
  { name: 'codigosucursal', label: i18nT('ui.codigo-sucursal-5ffc6b'), field: 'codigosucursal', align: 'left' },
  {
    name: 'sucursalGrande',
    label: i18nT('ui.sucursal-sin-asignada-344fff'),
    field: (row) =>
      row.sucursalGrande
        ? `${row.sucursalGrande.codigoSucursal} - ${row.sucursalGrande.municipio} - ${row.sucursalGrande.pais}`
        : '—',
    align: 'left',
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'asignada', align: 'center', sortable: true },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center', sortable: false },
]
</script>

<style scoped>
.my-sticky-table {
  max-height: 65vh;
}
</style>
