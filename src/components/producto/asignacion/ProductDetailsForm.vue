<template>
  <div>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col-md-4">
        <q-btn color="primary" icon="arrow_back" label="Volver" @click="$emit('back')" />
      </div>
      <div class="col-md-8">
        <h4>Detalles de los Productos</h4>
      </div>
    </div>

    <!-- Form -->
    <q-form @submit="handleSubmit">
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-md-4">
          <q-input
            v-model="localData.detalle"
            label="País de origen*"
            placeholder="Detalle origen"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <div class="col-md-4">
          <q-input
            v-model="localData.stockmin"
            label="Stock minimo*"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <div class="col-md-4">
          <q-input
            v-model="localData.stockmax"
            label="Stock maximo*"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-auto">
          <q-btn color="primary" label="Registrar" type="submit" />
        </div>
      </div>
    </q-form>
  </div>
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
