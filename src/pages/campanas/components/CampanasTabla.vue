<template>
  <q-card flat bordered>
    <q-table :rows="campanas" :columns="columns" row-key="id" :filter="busqueda" v-model:pagination="pagination" flat :rows-per-page-options="[10, 20, 50]" :grid="$q.screen.lt.md">
      <template v-slot:body-cell-nombre="props"><q-td :props="props"><div class="text-weight-medium">{{ props.row.nombre }}</div></q-td></template>
      <template v-slot:body-cell-porcentaje="props"><q-td :props="props"><q-badge color="orange" :label="`${props.row.porcentaje}% OFF`" /></q-td></template>
      <template v-slot:body-cell-estado="props"><q-td :props="props"><q-chip :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'" text-color="white" :icon="Number(props.row.estado) === 1 ? 'check_circle' : 'cancel'" clickable @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)">{{ Number(props.row.estado) === 1 ? 'Activa' : 'Inactiva' }}</q-chip></q-td></template>
      <template v-slot:body-cell-detalles="props"><q-td :props="props"><q-btn-group flat><q-btn flat dense color="primary" icon="category" @click="cargarcategoria(props.row.id, props.row.idalmacen)"><q-tooltip>Categorías</q-tooltip></q-btn><q-btn flat dense color="primary" icon="shopping_cart" @click="cargarPrecios(props.row.id)" :disable="!tieneCategorias(props.row.id)"><q-tooltip>{{ tieneCategorias(props.row.id) ? 'Productos' : 'Falta categoría' }}</q-tooltip><q-badge v-if="tieneCategorias(props.row.id)" color="green" floating rounded /></q-btn></q-btn-group></q-td></template>
      <template v-slot:body-cell-acciones="props"><q-td :props="props"><q-btn flat dense round color="primary" icon="edit" @click="editarCampana(props.row)" /><q-btn flat dense round color="negative" icon="delete" @click="eliminar(props.row.id)" /></q-td></template>
    </q-table>
  </q-card>
</template>
<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
defineProps({
  campanas: Array, busqueda: String,
  cambiarEstado: Function, cargarcategoria: Function, cargarPrecios: Function,
  tieneCategorias: Function, editarCampana: Function, eliminar: Function
})
const $q = useQuasar()
const pagination = ref({ rowsPerPage: 10 })
const columns = [
  { name: 'num', label: 'N°', field: 'numero', align: 'center' }, { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'fechainicio', label: 'Inicio', field: 'fechainicio', align: 'center' }, { name: 'fechafinal', label: 'Final', field: 'fechafinal', align: 'center' },
  { name: 'porcentaje', label: 'Descuento', field: row => `${row.porcentaje} %`, align: 'center' }, { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'detalles', label: 'Detalles', field: 'detalles', align: 'center' }, { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]
</script>
