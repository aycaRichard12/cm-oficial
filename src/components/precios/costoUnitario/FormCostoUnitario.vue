<template>
  <div>
    <!-- Título del formulario -->

    <q-form @submit.prevent="onSubmit">
      <!-- Descripción del producto (solo lectura) -->
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="descripcion">Descripción del producto*</label>
          <q-input v-model="localData.descripcion" disable required dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="precioactual">Costo unitario actual del producto*</label>
          <q-input v-model="localData.precioactual" disable required dense outlined>
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <label for="precio">Nuevo costo unitario del producto*</label>
          <q-input
            v-model="localData.precio"
            dense
            outlined
            type="number"
            :rules="[(val) => !!val || 'Campo requerido']"
          >
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card-actions class="row flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </div>
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
