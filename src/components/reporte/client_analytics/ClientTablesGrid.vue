<template>
  <div class="row q-col-gutter-md q-mt-md">
    <!-- Tabla de Clientes Activos con Predicción -->
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            <q-icon name="check_circle" class="q-mr-sm" color="positive" />
            Clientes Activos - Predicción de Próxima Compra
          </div>
          <div class="text-caption text-grey-6">
            Clientes que compraron en los últimos 30 días
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
                  :label="`${props.row.proxima_compra_prediccion} (en ${props.row.dias_hasta_proxima_compra} días)`"
                >
                  <q-tooltip> Basado en promedio de intervalos entre compras </q-tooltip>
                </q-badge>
                <q-badge v-else color="grey-5" label="Requiere 2+ compras">
                  <q-tooltip>
                    Se necesitan al menos 2 compras para calcular predicción
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
                Clientes Inactivos
              </div>
              <div class="text-caption text-grey-6">
                Clientes sin compra en {{ diasInactivosTabla }} días o más
              </div>
            </div>
            <div class="col-auto">
              <q-select
                :model-value="diasInactivosTabla"
                @update:model-value="$emit('update:diasInactivosTabla', $event)"
                :options="[30, 60, 90, 120, 180]"
                label="Días sin compra"
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
defineProps({
  tablaClientesActivos: Array,
  tablaClientesInactivos: Array,
  diasInactivosTabla: Number,
})

defineEmits(['update:diasInactivosTabla'])

const columnasInactivos = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: 'Última Compra',
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'dias_sin_compra',
    label: 'Días sin Compra',
    field: 'dias_sin_compra',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: 'Total Compras',
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: 'Próxima Compra',
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: false,
  },
]

const columnasActivos = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: 'Última Compra',
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: 'Total Compras',
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  {
    name: 'frecuencia_compra',
    label: 'Frecuencia',
    field: 'frecuencia_compra',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: 'Próxima Compra Estimada',
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: true,
  },
]
</script>
