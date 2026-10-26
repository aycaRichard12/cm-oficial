<!-- components/FormLeyenda.vue -->
<template>
  <q-form @submit.prevent="onSubmit">
    <q-card style="min-width: 350px">
      <q-card-section>
        <label for="leyenda">{{ t('configGeneral.leyenda.form.label') }}</label>
        <q-input
          v-model="localData.texto"
          id="leyenda"
          dense
          outlined
          autofocus
          @keyup.enter="prompt = false"
          :rules="[(val) => !!val || t('common.required')]"
        />
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn :label="t('common.save')" type="submit" color="primary" />
        <q-btn :label="t('common.cancel')" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Object,
  isEditing: Boolean,
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
function onSubmit() {
  emit('submit', localData.value)
}
</script>
