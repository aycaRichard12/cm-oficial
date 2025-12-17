<template>
  <q-form @submit="handleSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <label for="parametro">Parámetro*</label>
        <q-input
          v-model="localData.nombre"
          id="parametro"
          :rules="[(val) => !!val || 'Campo requerido']"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="valor">Valor*</label>
        <q-input
          v-model="localData.valor"
          id="valor"
          :rules="[(val) => !!val || 'Campo requerido']"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-4">
        <label for="color">Color*</label>
        <q-select
          v-model="localData.color"
          :options="colores"
          id="color"
          :rules="[(val) => !!val || 'Seleccione un color']"
          outlined
          dense
          map-options
          emit-value
          option-value="value"
          option-label="label"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon name="lens" :style="{ color: scope.opt.value }" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </q-card-section>

    <q-card-actions class="flex justify-start">
      <q-btn label="Guardar" type="submit" color="primary" />
      <q-btn label="Cancelar" flat color="negative" @click="emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modelValue: Object,
})
const colores = ref([
  { label: 'Rojo', value: '#FF0000' },
  { label: 'Verde', value: '#00FF00' },
  { label: 'Azul', value: '#0000FF' },
  { label: 'Amarillo', value: '#FFFF00' },
  { label: 'Naranja', value: '#FFA500' },
  { label: 'Morado', value: '#800080' },
  { label: 'Rosado', value: '#FFC0CB' },
  { label: 'Blanco', value: '#FFFFFF' },
  { label: 'Gris', value: '#808080' },
  { label: 'Marrón', value: '#8B4513' },
  { label: 'Celeste', value: '#87CEEB' },
])

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
