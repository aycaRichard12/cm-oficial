
<template>
  <q-dialog v-model="modelValue">
    <q-card class="responsive-dialog">
      <q-card-section class="bg-primary text-white text-h6 flex justify-between">
        <div>Detalle de Inventario Externo</div>
        <q-btn icon="close" @click="$emit('close')" flat round dense />
      </q-card-section>
      <q-card-section>
        <q-form @submit="$emit('submit')" v-if="permisoInventarioExterno">
          <div class="row q-col-gutter-x-md">
            <!-- Hidden inputs -->
            <div class="col-md-12" style="display: none">
              <q-input
                type="hidden"
                name="ver"
                id="verDINV"
                v-model="localDetalleFormData.ver"
                required
              />
            </div>
            <div class="col-md-12" style="display: none">
              <q-input
                type="hidden"
                name="idinventarioexterno"
                id="idinvexternoDINV"
                v-model="localDetalleFormData.idinventarioexterno"
                required
              />
            </div>
            <div class="col-md-12" style="display: none">
              <q-input
                type="hidden"
                name="idproductoalmacen"
                id="idproductoalmacenDINV"
                v-model="localDetalleFormData.idproductoalmacen"
                required
              />
            </div>
            <div class="col-md-12" style="display: none">
              <q-input type="hidden" name="id" id="idDINV" v-model="localDetalleFormData.id" />
            </div>

            <!-- Fields -->
            <div class="col-12 col-md-6">
              <label for="producto">Producto*</label>
              <q-select
                v-model="localDetalleFormData.productos"
                id="producto"
                outlined
                dense
                use-input
                map-options
                option-label="label"
                option-value="value"
                :options="filteredProductosOptions"
                @filter="onFilterProductos"
                @update:model-value="onSelectProductOption"
                :loading="loadingProductos"
                debounce="300"
                clearable
                hint="Escriba para buscar productos"
                :error="!localDetalleFormData.productos && loadingProductos === false && !!localDetalleFormData.id"
                prepend-inner-icon="shopping_cart"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay resultados para su búsqueda
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-3">
              <label for="cantidad">Cantidad</label>
              <q-input
                type="number"
                id="cantidad"
                dense
                outlined
                v-model="localDetalleFormData.cantidad"
                required
                :disable="localDetalleFormData.estado === 1"
              />
            </div>

            <div class="col-12 col-md-3">
              <label for="fecha">Fecha</label>
              <q-input
                dense
                outlined
                type="date"
                name="fecha"
                v-model="localDetalleFormData.fecha"
                id="fecha"
                required
                :disable="localDetalleFormData.estado === 1"
              />
            </div>
          </div>
          <div class="row justify-end" v-if="localDetalleFormData.estado !== 1">
            <q-btn
              label="Cancelar"
              type="reset"
              color="negative"
              @click="$emit('reset')"
            />
            <q-btn label="Añadir" type="submit" color="primary" />
          </div>
        </q-form>

        <InventarioExteriorDetalleTable
            :rows="detalleInventario"
            :columns="detalleColumns"
            :estado="localDetalleFormData.estado"
            :editar="editar"
            :eliminar="eliminar"
            @edit="(id) => $emit('editDetail', id)"
            @delete="(id) => $emit('deleteDetail', id)"
        />

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import InventarioExteriorDetalleTable from './InventarioExteriorDetalleTable.vue'
import { usePermisosUsuario } from 'src/composables/inventarioExterior/usePermisosUsuario'

const props = defineProps({
  modelValue: Boolean,
  detalleFormData: Object,
  detalleInventario: Array,
  detalleColumns: Array,
  filteredProductosOptions: Array,
  loadingProductos: Boolean,
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})

const emit = defineEmits([
    'update:modelValue',
    'update:detalleFormData',
    'close', 
    'submit', 
    'reset', 
    'filterProductos', 
    'selectProductOption',
    'editDetail',
    'deleteDetail'
])

const localDetalleFormData = ref({ ...props.detalleFormData })

// Usar el composable
const { permisoInventarioExterno, verificarPermisoUsuario } = usePermisosUsuario()

watch(() => props.detalleFormData, (newVal) => {
  Object.assign(localDetalleFormData.value, newVal)
}, { deep: true })

watch(localDetalleFormData, (newVal) => {
    // Sync back to parent if needed, or parent updates prop on edit?
    // Parent logic uses `detalleFormData` object.
    // We can emit update.
   emit('update:detalleFormData', newVal)
}, { deep: true })



const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const onFilterProductos = (val, update) => emit('filterProductos', val, update)
const onSelectProductOption = (val) => emit('selectProductOption', val)

onMounted(() => {
  verificarPermisoUsuario()
})
</script>
