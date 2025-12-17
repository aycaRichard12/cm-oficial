<!-- components/FormLeyenda.vue -->
<template>
  <q-form @submit.prevent="onSubmit">
    <q-card style="min-width: 350px">
      <q-card-section>
        <label for="leyenda">Leyenda *</label>
        <q-input
          v-model="localData.texto"
          id="leyenda"
          dense
          outlined
          autofocus
          @keyup.enter="prompt = false"
          :rules="[(val) => !!val || 'Requerido']"
        />
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  modelValue: Object,
  isEditing: Boolean,
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
function onSubmit() {
  emit('submit', localData.value)
}
</script>
