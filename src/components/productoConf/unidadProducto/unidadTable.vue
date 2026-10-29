<template>
  <div class="flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      class="btn-res q-mt-lg"
        :title="t('configProducto.unidadProducto.table.addTitle')"
        id="add"
      >
        <q-icon name="add" class="icono" />
        <span class="texto"> <q-icon name="add" /> {{ t('common.new') }} </span>
      </q-btn>
    <!-- <div class="col flex items-center justify-end">
      <q-input v-model="search" placeholder="Buscar" dense outlined class="q-ml-md">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div> -->
    <div id="buscarUnidadMedidaProducto">
        <label for="buscar">{{ t('common.search') }}</label>
      <q-input
        v-model="search"
        id="buscar"
        dense
        outlined
        debounce="300"
        class="q-mb-md"
        style="background-color: var(--cm-surface)"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

    <q-table
      :title="t('configProducto.unidadProducto.table.title')"
      :rows="ordenados"
      :columns="columns"
      row-key="id"
      :filter="search"
      id="tablaUnidadMedidaProducto"
    >
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="t('common.active')" outline />
        <q-badge color="red" v-else :label="t('common.inactive')" outline />
      </q-td>
    </template>

    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          icon="edit"
          color="primary"
          dense
          class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            :title="t('common.edit')"
          flat
          id="editarUnidadMedidaProducto"
        />
        <q-btn
          icon="delete"
          color="negative"
          dense
            @click="$emit('delete-item', props.row)"
            :title="t('common.delete')"
          flat
          id="eliminarUnidadMedidaProducto"
        />
        <q-btn
          :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
          dense
          flat
          :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            :title="t('configProducto.unidadProducto.table.toggleStatus')"
          id="cambiarEstadoUnidadMedidaProducto"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const { t } = useI18n()

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columns = computed(() => [
  {
    name: 'numero',
    label: t('configProducto.unidadProducto.table.number'),
    field: 'numero',
    align: 'center',
    id: 'numeroUnidadMedidaProducto',
  },
  {
    name: 'nombre',
    label: t('configProducto.unidadProducto.table.nombre'),
    field: 'nombre',
    align: 'left',
    id: 'nombreUnidadMedidaProducto',
  },
  {
    name: 'descripcion',
    label: t('configProducto.unidadProducto.table.descripcion'),
    field: 'descripcion',
    align: 'left',
    id: 'descripcionUnidadMedidaProducto',
  },
  {
    name: 'estado',
    label: t('configProducto.unidadProducto.table.estado'),
    field: 'estado',
    align: 'center',
    id: 'estadoUnidadMedidaProducto',
  },
  {
    name: 'opciones',
    label: t('configProducto.unidadProducto.table.opciones'),
    field: 'opciones',
    align: 'center',
    id: 'opcionesUnidadMedidaProducto',
  },
])
const ordenados = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)
const search = ref('')
</script>

<style scoped>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
