<template>
  <q-card>
    <q-form @submit.prevent="handleSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="tipoC">Tipo cliente*</label>
          <q-input
            v-model="localData.tipo"
            outlined
            dense
            id="tipoC"
            :rules="[(val) => !!val || 'Campo obligatorio']"
            class="q-mt-xs"
          />
        </div>

        <div class="col-12 col-md-6">
          <label for="desc">Descripción del tipo cliente*</label>
          <q-input
            v-model="localData.descripcion"
            outlined
            dense
            id="desc"
            :rules="[(val) => !!val || 'Campo obligatorio']"
            class="q-mt-xs"
          />
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
