<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card>
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="nombre">{{ t('configProducto.estadoProducto.form.name') }}*</label>

          <q-input
            v-model="localData.nombre"
            id="nombre"
            outlined
            dense
            :rules="[(val) => !!val || t('configProducto.estadoProducto.form.required')]"
            name="nombre"
            autocomplete="off"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="descripcion">{{ t('configProducto.estadoProducto.form.description') }}*</label>

          <q-input
            v-model="localData.descripcion"
            label=""
            outlined
            dense
            :rules="[(val) => !!val || t('configProducto.estadoProducto.form.required')]"
            name="descripcion"
            autocomplete="off"
          />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
      <q-btn :label="t('configProducto.estadoProducto.form.save')" type="submit" color="primary" />
      <q-btn :label="t('configProducto.estadoProducto.form.cancel')" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  isEditing: Boolean,
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
