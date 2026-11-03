<template>
  <div>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col-md-4">
        <q-btn color="primary" icon="arrow_back" :label="$t('ui.volver-84a715')" @click="$emit('back')" />
      </div>
      <div class="col-md-8">
        <h4>{{ $t('ui.detalles-de-los-productos-09bce7') }}</h4>
      </div>
    </div>

    <!-- Form -->
    <q-form @submit="handleSubmit">
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-md-4">
          <q-input
            v-model="localData.detalle"
            :label="$t('ui.pais-de-origen-b469f8')"
            :placeholder="$t('ui.detalle-origen-6aeb42')"
            outlined
            dense
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>

        <div class="col-md-4">
          <q-input
            v-model="localData.stockmin"
            :label="$t('ui.stock-minimo-e2ac0b')"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>

        <div class="col-md-4">
          <q-input
            v-model="localData.stockmax"
            :label="$t('ui.stock-maximo-eb00e9')"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          />
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-auto">
          <q-btn color="primary" :label="$t('ui.registrar-caacc6')" type="submit" />
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
