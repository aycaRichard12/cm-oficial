<template>
  <div class="row q-col-gutter-md q-mt-md">
    <!-- Tabla de Clientes Activos con Predicción -->
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            <q-icon name="check_circle" class="q-mr-sm" color="positive" />
            {{ $t('ui.clientes-activos-prediccion-de-proxima-compra-68b1c6') }}
          </div>
          <div class="text-caption text-grey-6">
            {{ $t('ui.clientes-que-compraron-en-los-ultimos-30-dias-59c21f') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="tablaClientesActivos"
            :columns="columnasActivos"
            row-key="id_cliente"
            :pagination="{ rowsPerPage: 10 }"
            flat
            bordered
            dense
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge :color="props.row.estadoColor" :label="props.row.estadoLabel" />
              </q-td>
            </template>
            <template v-slot:body-cell-prediccion="props">
              <q-td :props="props">
                <q-badge
                  v-if="props.row.proxima_compra_prediccion"
                  color="positive"
                  :label="`${props.row.proxima_compra_prediccion} ${$t('ui.en-n-dias-6f0a2b', { n: props.row.dias_hasta_proxima_compra })}`"
                >
                  <q-tooltip> {{ $t('ui.basado-en-promedio-de-intervalos-entre-compras-6193e7') }} </q-tooltip>
                </q-badge>
                <q-badge v-else color="grey-5" :label="$t('ui.requiere-2-compras-a3933a')">
                  <q-tooltip>
                    {{ $t('ui.se-necesitan-al-menos-2-compras-para-calcular-predic-aa4d6e') }}
                  </q-tooltip>
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-frecuencia_compra="props">
              <q-td :props="props">
                {{ props.row.frecuencia_compra.toFixed(3) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Tabla de Clientes Inactivos -->
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">
                <q-icon name="person_off" class="q-mr-sm" color="negative" />
                {{ $t('ui.clientes-inactivos-1c238a') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('ui.clientes-sin-compra-en-716b2a') }} {{ diasInactivosTabla }} {{ $t('ui.dias-o-mas-b54a7d') }}
              </div>
            </div>
            <div class="col-auto">
              <q-select
                :model-value="diasInactivosTabla"
                @update:model-value="$emit('update:diasInactivosTabla', $event)"
                :options="[30, 60, 90, 120, 180]"
                :label="$t('ui.dias-sin-compra-ed0f5d')"
                dense
                outlined
                style="min-width: 150px"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="tablaClientesInactivos"
            :columns="columnasInactivos"
            row-key="id_cliente"
            :pagination="{ rowsPerPage: 10 }"
            flat
            bordered
            dense
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge :color="props.row.estadoColor" :label="props.row.estadoLabel" />
              </q-td>
            </template>
            <template v-slot:body-cell-prediccion="props">
              <q-td :props="props">
                <q-badge
                  v-if="props.row.proxima_compra_prediccion"
                  color="positive"
                  :label="`${props.row.proxima_compra_prediccion} (${props.row.dias_hasta_proxima_compra}d)`"
                />
                <q-badge v-else color="grey-5" label="N/A" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
defineProps({
  tablaClientesActivos: Array,
  tablaClientesInactivos: Array,
  diasInactivosTabla: Number,
})

defineEmits(['update:diasInactivosTabla'])

const columnasInactivos = [
  { name: 'nombre', label: i18nT('ventas.client'), field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: i18nT('ui.telefono-99af37'), field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: i18nT('ui.ultima-compra-bceff9'),
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'dias_sin_compra',
    label: i18nT('ui.dias-sin-compra-2e95ee'),
    field: 'dias_sin_compra',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: i18nT('ui.total-compras-fb8375'),
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: i18nT('ui.proxima-compra-538044'),
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: false,
  },
]

const columnasActivos = [
  { name: 'nombre', label: i18nT('ventas.client'), field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: i18nT('ui.telefono-99af37'), field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: i18nT('ui.ultima-compra-bceff9'),
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: i18nT('ui.total-compras-fb8375'),
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  {
    name: 'frecuencia_compra',
    label: i18nT('ui.frecuencia-57f1dd'),
    field: 'frecuencia_compra',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: i18nT('ui.proxima-compra-estimada-03e8a2'),
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: true,
  },
]
</script>
