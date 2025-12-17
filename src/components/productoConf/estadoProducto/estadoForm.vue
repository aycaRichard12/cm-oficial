<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card>
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="nombre">Estado del producto*</label>

          <q-input
            v-model="localData.nombre"
            id="nombre"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
            name="nombre"
            autocomplete="off"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="descripcion">Descripción*</label>

          <q-input
            v-model="localData.descripcion"
            label=""
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
            name="descripcion"
            autocomplete="off"
          />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditing: Boolean,
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
