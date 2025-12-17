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
          v-model="localData.categoria"
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
          v-model="localData.subcategoria"
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
        <q-input v-model="localData.otraCaracteristica" id="otraC" dense outlined />
      </div>
      <div class="col-12 col-md-4">
        <label for="imagen">Imagen del producto</label>
        <q-file v-model="localData.imagen" id="imagen" dense label="Click Para Cargar" outlined />
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-x-md flex justify-end">
        <!-- Mostrar imagen actual -->
        <div v-if="typeof localData.imagen === 'string'" class="">
          <q-img
            :src="localData.imagen"
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
})

const emit = defineEmits(['submit', 'cancel'])

const localData = ref({ ...props.modelValue })

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
