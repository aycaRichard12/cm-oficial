
<template>
  <div id="contenedor-formulario" class="col-md-12 text-start">
    <q-dialog v-model="modelValue">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">{{ titulo }}</div>
          <q-btn color="white" icon="close" @click="$emit('update:modelValue', false)" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form @submit="$emit('submit')">
            <InventarioExteriorFormFields 
                :form-data="formData"
                :almacen-options="almacenOptions"
                @update:formData="$emit('update:formData', $event)"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import InventarioExteriorFormFields from './InventarioExteriorFormFields.vue'
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  formData: Object,
  almacenOptions: Array
})

const emit = defineEmits(['update:modelValue', 'submit', 'update:formData'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
