<template>
  <q-form @submit="submitForm" ref="formRef">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <label for="nombre">{{ t('configProducto.categoriaProducto.form.name') }}*</label>
        <q-input
          v-model="localData.nombre"
          id="nombre"
          dense
          outlined
          :rules="[(val) => !!val || t('configProducto.categoriaProducto.form.required')]"
        />
      </div>

      <div class="col-12 col-md-7">
        <label for="descripcion">{{ t('configProducto.categoriaProducto.form.description') }}*</label>
        <q-input
          v-model="localData.descripcion"
          id="descripcion"
          dense
          outlined
          :rules="[(val) => !!val || t('configProducto.categoriaProducto.form.required')]"
        />
      </div>

      <div class="col-12 col-md-4">
        <label for="tipo">{{ t('configProducto.categoriaProducto.form.type') }}*</label>
        <q-select
          v-model="localData.tipoCP"
          id="tipo"
          dense
          outlined
          :options="typeOptions"
          emit-value
          map-options
          :rules="[(val) => !!val || t('configProducto.categoriaProducto.form.required')]"
          @update:model-value="handleTypeChange"
        />
      </div>
      <div class="col-12 col-md-4" v-if="localData.tipoCP == 1">
        <label for="subcategoria">{{ t('configProducto.categoriaProducto.form.subcategoria') }}*</label>
        <q-select
          v-model="localData.idp"
          :options="props.parentCategories"
          id="subcategoria"
          emit-value
          map-options
          dense
          outlined
          :rules="[(val) => !!val || t('configProducto.categoriaProducto.form.required')]"
        />
      </div>
      <!-- Aseguramos que el tipoCP sea numérico para la comparación -->
      <!-- <div class="col-md-3">
            <q-select
              v-if="localData.tipoCP === '1'"
              v-model="localData.idpadreCP"
              label="Categoría padre*"
              :options="parentCategories"
              emit-value
              map-options
              :rules="Number(localData.tipoCP) === 1 ? [(val) => !!val || 'Campo requerido'] : []"
            />
          </div> -->
    </div>
    <q-card-actions class="flex justify-start">
      <q-btn :label="t('configProducto.categoriaProducto.form.save')" type="submit" color="primary" />
      <q-btn :label="t('configProducto.categoriaProducto.form.cancel')" flat color="negative" @click="$emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  currentItem: Object,
  parentCategories: Array, // Asegúrate de que esto tenga datos
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()
const typeOptions = [
  { value: 1, label: t('configProducto.categoriaProducto.types.subcategoria') },
  { value: 2, label: t('configProducto.categoriaProducto.types.categoria') },
]

// Inicializa con tipoCP = 2 (Categoría) para que el campo padre no aparezca al inicio
const localData = ref({
  nombre: '',
  descripcion: '',
  tipoCP: 2,
  idp: null,
})
console.log(props.parentCategories)
// Debería verse como: [{ value: 1, label: Nombre }, ...]
watch(
  () => props.modalValue,
  (newVal) => {
    if (newVal) {
      localData.value = {
        ...localData.value, // Mantén los valores por defecto
        ...newVal, // Sobrescribe con los nuevos valores
      }
    }
  },
  { immediate: true },
)

const formRef = ref(null)

function handleTypeChange(tipo) {
  // Si se cambia a "Categoría" (2), limpia el idpadreCP
  console.log(tipo)
  if (Number(tipo) === 2) {
    localData.value.idp = 0
  }
}

async function submitForm() {
  const valid = await formRef.value.validate()
  if (valid) {
    emit('submit', { ...localData.value })
  }
}
</script>
