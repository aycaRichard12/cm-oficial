<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-6">
        <label for="unidad">{{ t('configProducto.unidadProducto.form.name') }}*</label>
        <q-input
          v-model="localData.nombre"
          id="unidad"
          outlined
          dense
          :rules="[(val) => !!val || t('configProducto.unidadProducto.form.required')]"
        />
      </div>
      <div class="col-12 col-md-6">
        <label for="descripcion">{{ t('configProducto.unidadProducto.form.description') }}*</label>
        <q-input
          v-model="localData.descripcion"
          id="descripcion"
          outlined
          dense
          :rules="[(val) => !!val || t('configProducto.unidadProducto.form.required')]"
        />
      </div>
    </q-card-section>

    <q-card-actions class="flex justify-start">
      <q-btn :label="t('configProducto.unidadProducto.form.save')" type="submit" color="primary" />
      <q-btn :label="t('configProducto.unidadProducto.form.cancel')" flat color="negative" @click="$emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editing: Boolean,
  modelValue: Object,
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

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
