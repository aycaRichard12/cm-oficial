<template>
  <div class="flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      class="btn-res q-mt-lg"
      :title="t('configProducto.parametroObsolescencia.table.title')"
      id="agregarParametro"
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
    <div id="buscarParametro">
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
    id="tablaParametro"
    :rows="processedRows"
    :columns="columns"
    row-key="id"
    :filter="search"
    :pagination="pagination"
    flat
    bordered
    :title="t('configProducto.parametroObsolescencia.table.title')"
  >
    <template v-slot:body-cell-color="props">
      <q-td :props="props">
        <q-badge :style="`background-color: ${props.row.color}; width: 100%; height: 24px;`" />
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
          :title="t('common.edit')"
          flat
          id="editarParametro"
        />
        <q-btn
          icon="delete"
          color="negative"
          dense
          @click="$emit('delete-item', props.row)"
          :title="t('common.delete')"
          flat
          id="eliminarParametro"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item'])

const { t } = useI18n()

const nombreColores = {
  '#FF0000': 'Rojo',
  '#00FF00': 'Verde',
  '#0000FF': 'Azul',
  '#FFFF00': 'Amarillo',
  '#FFA500': 'Naranja',
  '#800080': 'Morado',
  '#FFC0CB': 'Rosado',
  '#FFFFFF': 'Blanco', // theme-allow
  '#808080': 'Gris',
  '#8B4513': 'Marrón',
  '#87CEEB': 'Celeste',
}

const columns = computed(() => [
  {
    name: 'numero',
    label: t('configProducto.parametroObsolescencia.table.number'),
    field: (row) => row.numero,
    align: 'center',
  },
  {
    name: 'nombre',
    label: t('configProducto.parametroObsolescencia.table.nombre'),
    field: 'nombre',
    align: 'left',
  },
  {
    name: 'descripcion',
    label: t('configProducto.parametroObsolescencia.table.descripcion'),
    field: 'descripcion',
    align: 'left',
  },
  {
    name: 'valor',
    label: t('configProducto.parametroObsolescencia.table.valor'),
    field: 'valor',
    align: 'center',
  },
  // {
  //   name: 'colorNombre',
  //   label: Nombre color,
  //   field: 'colorNombre',
  //   align: 'left',
  // },
  {
    name: 'color',
    label: t('configProducto.parametroObsolescencia.table.color'),
    field: 'color',
    align: 'center',
  },
  {
    name: 'opciones',
    label: t('configProducto.parametroObsolescencia.table.opciones'),
    field: 'opciones',
    align: 'center',
  },
])

const search = ref('')
const pagination = ref({
  rowsPerPage: 10,
})

const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
    colorNombre: nombreColores[row.color] || i18nT('ui.desconocido-452c8a'),
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
