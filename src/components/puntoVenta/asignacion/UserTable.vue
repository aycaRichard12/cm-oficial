<template>
<div class="row items-center justify-between q-col-gutter-md q-mb-md">

  <!-- Título -->
  <div class="col-12 col-md-auto">
    <div class="text-h5 text-weight-bold text-primary">
      {{ $t('ui.asignacion-de-responsables-a47d11') }}
    </div>
    <div class="text-subtitle2 text-grey-7">
      {{ $t('ui.seleccione-un-usuario-para-gestionar-sus-puntos-de-v-b9614c') }}
    </div>
  </div>

  <!-- Buscador -->
  <div class="col-12 col-md-3">
    <q-input
      v-model="filter"
      dense
      outlined
      debounce="300"
      :placeholder="$t('ui.buscar-usuario-ae7459')"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
  </div>

</div>

  <q-table
    id="tableUsuarios"
    bordered
    :title="$t('ui.usuarios-cc13c6')"
    :rows="processedRows"
    :columns="columnas"
    :filter="filter"
    row-key="id"
  >
    <template v-slot:body-cell-opciones="props">
      <q-td class="text-center">
        <q-btn
          color="primary"
          icon="add"
          round
          size="sm"
          @click="asignarPuntoVenta(props.row)"
          :title="$t('ui.asignar-puntos-de-venta-cd53c4')"
          id="agregarPuntosVenta"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
const props = defineProps({
  users: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const filter = ref('')

const columnas = [
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'usuario', label: i18nT('auth.user'), field: 'usuario', align: 'left' },
  { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left' },
  { name: 'apellido', label: i18nT('ui.apellido-45b89a'), field: 'apellido', align: 'left' },
  { name: 'cargo', label: i18nT('ui.cargo-6c98e8'), field: 'cargo', align: 'left' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
]
const processedRows = computed(() => {
  return props.users.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
const emit = defineEmits(['asignar'])

function asignarPuntoVenta(usuario) {
  emit('asignar', usuario)
}
</script>
