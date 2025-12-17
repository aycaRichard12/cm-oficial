<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-6">
        <label for="unidad">Unidad del producto*</label>
        <q-input
          v-model="localData.nombre"
          id="unidad"
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
      <div class="col-12 col-md-6">
        <label for="descripcion">Descripción*</label>
        <q-input
          v-model="localData.descripcion"
          id="descripcion"
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
        />
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
  editing: Boolean,
  modelValue: Object,
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
