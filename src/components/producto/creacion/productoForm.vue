<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <label for="codigo">Cod. Producto*</label>
        <q-input v-model="localData.codigo" dense outlined />
      </div>
      <div class="col-12 col-md-4">
        <label for="producto">Nombre del Producto*</label>
        <q-input v-model="localData.nombre" dense outlined="" />
      </div>
      <div class="col-12 col-md-4">
        <label for="descripcion">Descripción*</label>
        <q-input v-model="localData.descripcion" dense outlined />
      </div>
      <div class="col-12 col-md-4">
        <label for="codigoBarras">Cod. de Barras</label>
        <q-input v-model="localData.codigobarras" dense outlined="" id="codigoBarras" />
      </div>
      <div class="col-12 col-md-4">
        <label for="categoria">Categorías*</label>
        <q-select
          v-model="localData.subcategoria"
          :options="categorias"
          dense
          outlined
          emit-value
          map-options
          @update:model-value="
            (val) => {
              console.log('Categoría seleccionada:', val)
              console.log(localData)
              emit('categoria-changed', val)
            }
          "
        />
      </div>
      <div class="col-12 col-md-4" v-if="subcategorias.length > 0">
        <label for="subcategoria">Sub Categorías*</label>
        <q-select
          v-model="localData.categoria"
          :options="subcategorias"
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="estado">Estados del Producto*</label>
        <q-select
          v-model="localData.estadoproductos"
          :options="estados"
          dense
          outlined
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-4">
        <label for="unidades">Unidad*</label>
        <q-select
          v-model="localData.unidad"
          :options="unidades"
          dense
          outlined
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-4">
        <label for="medida">Característica*</label>
        <q-select
          v-model="localData.medida"
          :options="medidas"
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="otraC">Otras.Caract.</label>
        <q-input v-model="localData.caracteristica" id="otraC" dense outlined />
      </div>
      <div class="col-12 col-md-8" v-if="tipoFactura">
        <label for="codigosin">Producto SIN</label>
        <q-select
          v-model="localData.codigosin"
          :options="FilterProductoSIN"
          id="codigosin"
          clearable
          dense
          outlined
          emit-value
          map-options
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          @filter="filterFn"
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
      <div class="col-12 col-md-4" v-if="tipoFactura">
        <label for="unidadsin">Unidad SIN</label>
        <q-select
          v-model="localData.unidadsin"
          :options="FilterUnidadSIN"
          dense
          id="unidadsin"
          clearable
          outlined
          emit-value
          map-options
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          @filter="filterUnidadFn"
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
      <div class="col-12 col-md-4" v-if="tipoFactura">
        <label for="codnan">Código Nandina</label>
        <q-input v-model="localData.codigoNandina" id="codnan" dense outlined />
      </div>
      <div class="col-12 col-md-5">
        <label for="imagen" class="text-bold text-primary">Subir Imagen</label>
        <q-file
          v-model="localData.imagen"
          id="imagen"
          outlined
          dense
          use-chips
          accept="image/*"
          label="Click para seleccionar archivo"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" color="primary" size="md" />
          </template>
        </q-file>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-x-md flex justify-end">
        <!-- Mostrar imagen actual -->
        <div v-if="typeof localData.imagen === 'string'" class="">
          <q-img
            :src="localData.vista"
            style="max-height: 60px; border-radius: 8px; margin-top: auto"
            :alt="`Imagen actual`"
          />
          <div class="text-caption text-grey">
            Imagen actual: {{ localData.imagen.split('/').pop() }}
          </div>
        </div>
      </div>
    </q-card-section>
    <q-card-actions class="flex justify-start">
      <q-btn label="Guardar" type="submit" color="primary" />
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { TipoFactura } from 'src/composables/FuncionesGenerales'

const tipoFactura = TipoFactura()
console.log('Tipo de factura en productoForm.vue:', tipoFactura)
const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
  categorias: {
    type: Array,
    default: () => [],
  },
  estados: {
    type: Array,
    default: () => [],
  },
  subcategorias: {
    type: Array,
    default: () => [],
  },
  unidades: {
    type: Array,
    default: () => [],
  },
  medidas: {
    type: Array,
    default: () => [],
  },
  productoSIN: {
    type: Array,
    default: () => [],
  },
  unidadSIN: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit', 'cancel'])
const FilterProductoSIN = ref([...props.productoSIN])
const FilterUnidadSIN = ref([...props.unidadSIN])
const localData = ref({ ...props.modelValue })
function filterFn(val, update) {
  console.log(val)
  if (val === '') {
    update(() => {
      FilterProductoSIN.value = [...props.productoSIN]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    FilterProductoSIN.value = props.productoSIN.filter((v) =>
      v.label.toLowerCase().includes(needle),
    )
  })
}
function filterUnidadFn(val, update) {
  console.log(val)
  if (val === '') {
    update(() => {
      FilterUnidadSIN.value = [...props.unidadSIN]
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    FilterUnidadSIN.value = props.unidadSIN.filter((v) => v.label.toLowerCase().includes(needle))
  })
}
console.log(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)

const handleSubmit = () => {
  emit('submit', localData.value)
}
</script>
