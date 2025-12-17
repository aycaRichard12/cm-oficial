<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <div class="">
      <label for="nombrecategoria">Nombre de la Categoría *</label>
      <q-input
        v-model="formData.nombre_categoria"
        id="nombrecategoria"
        outlined
        dense
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'El nombre es obligatorio',
          (val) => (val && val.length <= 100) || 'Máximo 100 caracteres',
        ]"
      />
    </div>
    <div>
      <label for="porcentaje">Porcentaje de Aplicación (%) *</label>
      <q-input
        v-model.number="formData.porcentaje"
        id="porcentaje"
        type="number"
        min="0"
        max="100"
        lazy-rules
        outlined
        dense
        :rules="[
          (val) => val != null || 'El porcentaje es obligatorio',
          (val) => (val >= 0 && val <= 100) || 'Debe ser un valor entre 0 y 100',
        ]"
      />
    </div>

    <div class="row justify-end q-gutter-sm">
      <q-btn
        label="Cancelar"
        type="button"
        color="negative"
        flat
        @click="$emit('cancel')"
        :disable="isSubmitting"
      />
      <q-btn
        :label="mode === 'crear' ? 'Crear Categoría' : 'Guardar Cambios'"
        type="submit"
        color="primary"
        :loading="isSubmitting"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

// --- Definición de Props ---
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      nombre_categoria: '',
      porcentaje: 0,
    }),
  },
  mode: {
    type: String, // 'crear' o 'editar'
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

console.log('Props recibidos en CategoriasPrecioForm:', props.initialData)
// --- Definición de Emits ---
const emit = defineEmits(['submit-form', 'cancel'])

// --- Estado del Formulario ---
const defaultFormData = {
  nombre_categoria: '',
  porcentaje: 0,
}

const formData = ref({ ...defaultFormData })

// Inicializar/Resetear el formulario basado en el modo y datos iniciales
const initializeForm = (data) => {
  if (props.mode === 'editar' && data) {
    formData.value = {
      nombre_categoria: data.nombre_categoria,
      porcentaje: data.porcentaje,
    }
  } else {
    formData.value = { ...defaultFormData }
  }
}

// Observa el prop initialData o mode para resetear/cargar datos
watch(
  () => [props.initialData, props.mode],
  ([newData]) => {
    initializeForm(newData)
  },
  { immediate: true },
)

// --- Lógica del Formulario ---
const onSubmit = () => {
  // El validador de q-form ya se encarga de que las reglas pasen.
  emit('submit-form', formData.value)
}
</script>
