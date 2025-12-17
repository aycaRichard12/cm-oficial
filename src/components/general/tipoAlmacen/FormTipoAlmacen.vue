<template>
  <q-card>
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="nombre"> Nombre</label>
          <q-input
            v-model="localData.nombre"
            outlined
            dense
            id="nombre"
            :rules="[(val) => !!val || 'Requerido']"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="description">Descripción</label>
          <q-input v-model="localData.descripcion" outlined dense id="description" type="text" />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </q-card>
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
