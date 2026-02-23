<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)" @hide="cancelarEdicion" @keydown.esc="$emit('update:modelValue', false)">
    <q-card style="width: 100%; max-width: 900px">
      <q-card-section class="bg-primary text-white text-h6"><q-icon name="shopping_cart" class="q-mr-sm" />{{ precioForm.id_detalle_campanas ? 'Editar Precio' : 'Productos' }}</q-card-section>
      <q-separator />
      <q-card-section>
        <q-banner v-if="precioForm.id_detalle_campanas" class="bg-info text-white q-mb-md" rounded><q-icon name="edit" />Editando precio</q-banner>
        <q-form @submit="registrarPrecio"><div class="row q-col-gutter-md">
            <div class="col-12 col-md-4"><q-select :model-value="precioForm.idcategoriacampaña" @update:model-value="val => { $emit('update-form', 'idcategoriacampaña', val); onCategoria(val) }" :options="categoriasCampana" option-value="id" option-label="tipo" emit-value map-options label="Categoría *" outlined dense required :readonly="!!precioForm.id_detalle_campanas"><template v-slot:prepend><q-icon name="category" /></template></q-select></div>
            <div class="col-12 col-md-4">
              <q-select v-if="!precioForm.id_detalle_campanas" :model-value="productoSeleccionado" @update:model-value="$emit('update:productoSeleccionado', $event)" :options="productosNoAsignadosOptions" option-value="id" option-label="descripcion" label="Producto *" use-input input-debounce="300" @filter="filtrarProductos" outlined dense :rules="[val => !!val || 'Requerido']" :disable="!precioForm.idcategoriacampaña"><template v-slot:prepend><q-icon name="inventory_2" /></template><template v-slot:option="scope"><q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.descripcion || scope.opt.producto }}</q-item-label><q-item-label caption>Cod: {{ scope.opt.codigo }}</q-item-label></q-item-section></q-item></template><template v-slot:selected-item="scope">{{ scope.opt.descripcion || scope.opt.producto }}</template></q-select>
              <q-input v-else :model-value="precioForm.producto" label="Producto *" outlined dense required readonly><template v-slot:prepend><q-icon name="inventory_2" /></template></q-input>
            </div>
            <div class="col-12 col-md-4"><q-input :model-value="precioForm.precio" @update:model-value="val => $emit('update-form', 'precio', val)" label="Precio *" type="number" step="0.01" outlined dense required><template v-slot:prepend><q-icon name="attach_money" /></template></q-input></div>
          </div>
          <div class="row q-mt-md q-gutter-sm">
            <q-btn type="submit" unelevated color="primary" :icon="precioForm.id_detalle_campanas ? 'save' : 'add'" :label="precioForm.id_detalle_campanas ? 'Actualizar' : 'Agregar'" />
            <q-btn v-if="precioForm.id_detalle_campanas" flat label="Cancelar" color="grey-7" @click="cancelarEdicion" />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row items-center q-mb-md q-col-gutter-sm">
          <div class="col-12 col-sm"><div class="text-subtitle2 text-grey-8">Productos Asignados</div></div>
          <div class="col-12 col-sm-auto"><q-select :model-value="filtroPrecio" @update:model-value="$emit('update:filtroPrecio', $event)" :options="categoriasOpciones" label="Filtrar categoría" option-value="id" option-label="tipo" emit-value map-options outlined dense clearable style="min-width: 200px" /></div>
        </div>
        <q-table :rows="preciosFiltrados" :columns="cols" row-key="id" flat bordered :rows-per-page-options="[5, 10, 20]" :grid="$q.screen.lt.md">
          <template v-slot:body-cell-precio="props"><q-td :props="props"><q-badge color="green" :label="`Bs ${props.row.precio}`" /></q-td></template>
          <template v-slot:body-cell-opciones="props"><q-td :props="props"><q-btn flat dense round color="primary" icon="edit" @click="editarPrecio(props.row)" /><q-btn flat dense round color="negative" icon="delete" @click="eliminarPrecio(props.row.id)" /></q-td></template>
        </q-table>
      </q-card-section>
      <q-separator /><q-card-actions align="right"><q-btn flat label="Cerrar" color="primary" v-close-popup /></q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from 'quasar'
defineProps({
  modelValue: Boolean, precioForm: Object, categoriasCampana: Array, productosNoAsignadosOptions: Array,
  preciosFiltrados: Array, productoSeleccionado: Object, categoriasOpciones: Array, filtroPrecio: [String, Number],
  registrarPrecio: Function, cancelarEdicion: Function, onCategoria: Function, filtrarProductos: Function,
  editarPrecio: Function, eliminarPrecio: Function
})
defineEmits(['update:modelValue', 'update:filtroPrecio', 'update:productoSeleccionado', 'update-form'])
const $q = useQuasar()
const cols = [
  { name: 'num', label: 'N°', field: 'numero', align: 'right' }, { name: 'cod', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'desc', label: 'Descripción', field: 'descripcion', align: 'left' }, { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' }
]
</script>
