<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)" @hide="resetearForm" @keydown.esc="$emit('update:modelValue', false)">
    <q-card style="width: 100%; max-width: 700px">
      <q-card-section class="bg-primary text-white text-h6"><q-icon name="category" class="q-mr-sm" />Categorías de Precio</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="registrarCategoria">
          <q-select :model-value="categoriaForm.idcategoriaprecio" @update:model-value="$emit('update-form', val)" :options="categoriasPrecioOptions" label="Seleccione categoría de precio" option-value="id" option-label="nombre" emit-value map-options outlined dense required><template v-slot:prepend><q-icon name="label" /></template></q-select>
          <div class="q-mt-md"><q-btn type="submit" unelevated color="primary" icon="add" label="Agregar Categoría" /></div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-subtitle2 text-grey-8 q-mb-md">Categorías Asignadas</div>
        <q-table :rows="categoriasCampana" :columns="columns" row-key="id" flat bordered :rows-per-page-options="[5, 10]" :grid="$q.screen.lt.md">
          <template v-slot:body-cell-tipo="props"><q-td :props="props"><q-chip color="primary" text-color="white" icon="label">{{ props.row.tipo }}</q-chip></q-td></template>
          <template v-slot:body-cell-opciones="props"><q-td :props="props"><q-btn flat dense round color="negative" icon="delete" @click="eliminarCategoriaCampana(props.row.id)" /></q-td></template>
          <!-- Grid Mode Customization -->
          <template v-slot:item="props">
            <div class="q-pa-xs col-12 col-sm-6">
              <q-card bordered flat class="full-height flex column">
                <q-card-section class="q-pb-none col-grow text-center">
                  <q-chip color="primary" text-color="white" icon="label">{{ props.row.tipo }}</q-chip>
                </q-card-section>
                <q-card-section class="row items-center justify-center q-pt-sm">
                  <q-btn flat dense round color="negative" icon="delete" @click="eliminarCategoriaCampana(props.row.id)" />
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right"><q-btn flat label="Cerrar" color="primary" v-close-popup /></q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from 'quasar'
defineProps({
  modelValue: Boolean, categoriaForm: Object, categoriasPrecioOptions: Array,
  categoriasCampana: Array, registrarCategoria: Function, eliminarCategoriaCampana: Function, resetearForm: Function
})
defineEmits(['update:modelValue', 'update-form'])
const $q = useQuasar()
const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'tipo', label: 'Categoria', field: 'tipo', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' }
]
</script>
