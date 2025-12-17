<template>
  <div class="row q-col-gutter-x-md flex justify-between">
    <div class="col-12 col-md-3">
      <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
        <q-icon name="add" class="icono" />
        <span class="texto"> Agregar</span>
      </q-btn>
    </div>

    <div class="col-12 col-md-3">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtroTipoAlmacen"
        :options="tiposAlmacen"
        id="almacen"
        emit-value
        map-options
        dense
        outlined
        clearable
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="buscar">Buscar...</label>
      <q-input
        v-model="search"
        id="buscar"
        dense
        outlined
        debounce="300"
        class="q-mb-md"
        style="background-color: white"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <BaseFilterableTable
    title="Puntos Ventas"
    :rows="props.rows"
    :columns="columns"
    :arrayHeaders="ArrayHeaders"
    row-key="id"
    :filter="search"
    flat
    bordered
    @edit-item="$emit('edit-item', $event)"
    @delete-item="$emit('delete-item', $event)"
    @toggle-status="$emit('toggle-status', $event)"
  >
    <template v-slot:top-right> </template>
    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          v-if="tipoFactura"
          icon="check"
          color="primary"
          flat=""
          @click="abrirModal(props.row)"
        />

        <q-btn
          icon="edit"
          color="primary"
          dense
          class="q-mr-sm"
          @click="$emit('edit-item', props.row)"
          flat
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat />
      </q-td>
    </template>
  </BaseFilterableTable>
  <modalPuntoVentaFacturacion
    v-model:showModal="mostrarModal"
    :dato="datoSeleccionado"
    :codigosucursal="codigoSucursal"
    @onSuccess="listarDatos"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { getTipoFactura } from 'src/composables/FuncionesG'
import modalPuntoVentaFacturacion from './modalPuntoVentaFacturacion.vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()
console.log(getTipoFactura(true))
const tipoFactura = getTipoFactura(true)
console.log(tipoFactura)

const mostrarModal = ref(false)
const datoSeleccionado = ref([])
const codigoSucursal = ref(null)

async function abrirModal(dato) {
  console.log(dato)

  datoSeleccionado.value = dato
  codigoSucursal.value = await verificarSucursalFactura(dato.almacen.id)
  console.log(codigoSucursal.value)
  mostrarModal.value = true
}
async function verificarSucursalFactura(id) {
  const endpoint = `listaResponsableAlmacen/${idempresa}`

  try {
    const response = await api.get(endpoint)
    console.log(response)

    const resultado = response.data
    console.log(resultado)
    if (resultado[0] == 'error') {
      console.error(resultado.error)
      return null
    }

    const use = resultado.filter((u) => u.idusuario == idusuario && u.idalmacen == id)
    return use[0].sucursales[0].codigosin || 0
  } catch (error) {
    console.error(error)
    return null
  }
}

const filtroTipoAlmacen = ref(null)

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  tiposAlmacen: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits([
  'add',
  'edit-item',
  'delete-item',
  'toggle-status',
  'onSeleccionarTipo',
  'column-filter-changed',
])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'nombre', label: 'Punto de venta', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const ArrayHeaders = ['numero', 'nombre', 'descripcion', 'tipo']

const search = ref('')
watch(
  () => props.tiposAlmacen,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroTipoAlmacen.value) {
      filtroTipoAlmacen.value = nuevosAlmacenes[0].value
    }
  },
  { immediate: true },
)
watch(filtroTipoAlmacen, (val) => {
  emit('onSeleccionarTipo', val)
})
</script>
