<template>
  <div class="q-pa-md">
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        id="agregarCanalDeVenta"
        :title="t('configuracion.canalesDeVenta.table.addTitle')"
      >
        <q-icon name="add" class="icono" />
        <span class="texto"> <q-icon name="add" /> {{ t('common.new') }} </span>
      </q-btn>

      <div id="buscarCanalDeVenta">
        <label for="buscar">{{ t('common.search') }}</label>
        <q-input
          v-model="search"
          id="buscar"
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          :placeholder="t('common.search')"
          style="background-color: var(--cm-surface)"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      id="tablaCanalDeVenta"
      :rows="processedRows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      :filter="search"
      class="sticky-table"
      :title="t('configuracion.canalesDeVenta.table.title')"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" :label="t('common.active')" outline />
          <q-badge color="red" v-else :label="t('common.inactive')" outline />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn
            icon="edit"
            color="primary"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            flat
            :title="t('configuracion.canalesDeVenta.table.edit')"
            id="editarCanalDeVenta"
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            flat
            :title="t('configuracion.canalesDeVenta.table.delete')"
            id="eliminarCanalDeVenta"
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            :title="t('configuracion.canalesDeVenta.table.toggleStatus')"
            id="cambiarEstadoCanalDeVenta"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columns = computed(() => [
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'canal', label: t('configuracion.canalesDeVenta.table.canal'), field: 'canal', align: 'left' },
  { name: 'descripcion', label: t('configuracion.canalesDeVenta.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'estado', label: t('configuracion.canalesDeVenta.table.estado'), field: 'estado', align: 'center' },
  { name: 'opciones', label: t('configuracion.canalesDeVenta.table.opciones'), align: 'center' },
])

const search = ref('')

const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
</script>

<style scoped>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
