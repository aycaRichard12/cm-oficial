<template>
  <q-card>
    <q-form @submit.prevent="handleSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="canal">Nombre del canal de venta*</label>
          <q-input
            v-model="localData.canal"
            id="canal"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="descripcion">Descripción del canal de venta*</label>
          <q-input
            v-model="localData.descripcion"
            id="descripcion"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="emit('cancel')" />
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
