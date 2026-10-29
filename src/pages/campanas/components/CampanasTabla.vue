<template>
  <q-card flat bordered>
    <q-table :rows="campanas" :columns="columns" row-key="id" :filter="busqueda" v-model:pagination="pagination" flat :rows-per-page-options="[10, 20, 50]" :grid="$q.screen.lt.md">
      <template v-slot:body-cell-nombre="props"><q-td :props="props"><div class="text-weight-medium">{{ props.row.nombre }}</div></q-td></template>
      <template v-slot:body-cell-porcentaje="props"><q-td :props="props"><q-badge color="orange" :label="`${props.row.porcentaje}% OFF`" /></q-td></template>
      <template v-slot:body-cell-estado="props"><q-td :props="props"><q-chip id="estadoCampana" :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'" text-color="white" :icon="Number(props.row.estado) === 1 ? 'check_circle' : 'cancel'" clickable @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)">{{ Number(props.row.estado) === 1 ? $t('ui.activa-ec42b1') : $t('ui.inactiva-8f223e') }}</q-chip></q-td></template>
      <template v-slot:body-cell-detalles="props"><q-td :props="props"><q-btn-group flat><q-btn id="btnCategoria" flat dense color="primary" icon="category" @click="cargarcategoria(props.row.id, props.row.idalmacen)"><q-tooltip>{{ $t('configProducto.categoriaProducto.table.title') }}</q-tooltip></q-btn><q-btn id="btnProductos" flat dense color="primary" icon="shopping_cart" @click="cargarPrecios(props.row.id)" :disable="!tieneCategorias(props.row.id)"><q-tooltip>{{ tieneCategorias(props.row.id) ? $t('ui.productos-14e2a6') : $t('ui.falta-categoria-fb945b') }}</q-tooltip><q-badge v-if="tieneCategorias(props.row.id)" color="green" floating rounded /></q-btn></q-btn-group></q-td></template>
      <template v-slot:body-cell-acciones="props"><q-td :props="props"><q-btn id="btnEditar" flat dense round color="primary" icon="edit" @click="editarCampana(props.row)" /><q-btn id="btnEliminar" flat dense round color="negative" icon="delete" @click="eliminar(props.row.id)" /></q-td></template>
      <!-- Grid Mode Customization -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-12 col-sm-6 col-md-4">
          <q-card bordered flat class="full-height flex column">
            <q-card-section class="q-pb-none">
              <div class="row justify-between items-center">
                <div class="text-subtitle1 text-weight-bold text-primary">{{ props.row.nombre }}</div>
                <q-chip size="sm" :color="Number(props.row.estado) === 1 ? 'positive' : 'negative'" text-color="white" :icon="Number(props.row.estado) === 1 ? 'check_circle' : 'cancel'" clickable @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)">{{ Number(props.row.estado) === 1 ? $t('ui.activa-ec42b1') : $t('ui.inactiva-8f223e') }}</q-chip>
              </div>
              <div class="text-caption cm-text-muted q-mt-sm">
                <div><q-icon name="event" class="q-mr-xs"/>{{ props.row.fechainicio }} a {{ props.row.fechafinal }}</div>
              </div>
            </q-card-section>
            
            <q-card-section class="col-grow">
              <div class="row items-center justify-between">
                <span class="text-weight-medium">{{ $t('ui.descuento-74bd7c') }}</span>
                <q-badge color="orange" :label="`${props.row.porcentaje}% OFF`" />
              </div>
            </q-card-section>

            <q-card-actions align="between" class="bg-grey-1">
              <q-btn-group flat>
                <q-btn flat round color="primary" icon="category" @click="cargarcategoria(props.row.id, props.row.idalmacen)" />
                <q-btn flat round color="primary" icon="shopping_cart" @click="cargarPrecios(props.row.id)" :disable="!tieneCategorias(props.row.id)">
                  <q-badge v-if="tieneCategorias(props.row.id)" color="green" floating rounded />
                </q-btn>
              </q-btn-group>
              <div>
                <q-btn flat round color="primary" icon="edit" @click="editarCampana(props.row)" />
                <q-btn flat round color="negative" icon="delete" @click="eliminar(props.row.id)" />
              </div>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-card>
</template>
<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'num', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' }, { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'left' },
  { name: 'fechainicio', label: i18nT('ui.inicio-4f70d8'), field: 'fechainicio', align: 'center' }, { name: 'fechafinal', label: i18nT('ui.final-672b22'), field: 'fechafinal', align: 'center' },
  { name: 'porcentaje', label: i18nT('ventas.discount'), field: row => `${row.porcentaje} %`, align: 'center' }, { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'detalles', label: i18nT('ui.detalles-b1bb8e'), field: 'detalles', align: 'center' }, { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' }
]
</script>
