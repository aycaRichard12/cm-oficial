<template>
  <q-form @submit.prevent="onSubmit">
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4 q-pa-sm">
        <q-toggle
          v-model="localData.afectarTodosAlmacenes"
          label="Afectar Todos los Almacenes"
          size="md"
          color="primary"
          dense
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="producto">Descripción del producto*</label>
        <q-input v-model="localData.descripcion" id="producto" dense="" outlined="" disable />
      </div>
      <div class="col-12 col-md-4">
        <label for="preciosug">Actual precio sugerido</label>
        <q-input
          v-model="localData.precioActual"
          id="preciosug"
          disable
          dense
          outlined
          :suffix="divisa"
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="nuevoprecio">Nuevo precio sugerido*</label>
        <q-input
          v-model="localData.precio"
          id="nuevoprecio"
          type="number"
          :suffix="divisa"
          lazy-rules
          dense
          outlined
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
    </div>

    <q-card-actions class="flex justify-start">
      <q-btn label="Guardar" type="submit" color="primary" />
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  editing: Boolean,
  modalValue: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['submit', 'cancel'])
// Valores iniciales (puedes reemplazarlos dinámicamente cuando abras el modal)
const localData = ref({ ...props.modalValue })

watch(
  () => props.modalValue,
  (nuevoValor) => {
    localData.value = { ...nuevoValor }
  },
  { immediate: true, deep: true },
)
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>
