<template>
  <q-form @submit="handleSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-3">
        <label for="parametro">{{ t('configProducto.parametroObsolescencia.form.name') }}*</label>
        <q-input
          v-model="localData.nombre"
          id="parametro"
          :rules="[(val) => !!val || t('configProducto.parametroObsolescencia.form.required')]"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <label for="descripcion">{{ t('configProducto.parametroObsolescencia.form.description') }}</label>
        <q-input
          v-model="localData.descripcion"
          id="descripcion"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <label for="valor">{{ t('configProducto.parametroObsolescencia.form.valor') }}*</label>
        <q-input
          v-model="localData.valor"
          id="valor"
          :rules="[(val) => !!val || t('configProducto.parametroObsolescencia.form.required')]"
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <label for="color">{{ t('configProducto.parametroObsolescencia.form.color') }}*</label>
        <q-select
          v-model="localData.color"
          :options="colores"
          id="color"
          :rules="[(val) => !!val || t('configProducto.parametroObsolescencia.form.requiredColor')]"
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
      <q-btn :label="t('configProducto.parametroObsolescencia.form.save')" type="submit" color="primary" />
      <q-btn :label="t('configProducto.parametroObsolescencia.form.cancel')" flat color="negative" @click="emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editing: Boolean,
  modelValue: Object,
})

const { t } = useI18n()

const colorDefs = [
  { key: 'rojo', value: '#FF0000' },
  { key: 'verde', value: '#00FF00' },
  { key: 'azul', value: '#0000FF' },
  { key: 'amarillo', value: '#FFFF00' },
  { key: 'naranja', value: '#FFA500' },
  { key: 'morado', value: '#800080' },
  { key: 'rosado', value: '#FFC0CB' },
  { key: 'blanco', value: '#FFFFFF' }, // theme-allow
  { key: 'gris', value: '#808080' },
  { key: 'marron', value: '#8B4513' },
  { key: 'celeste', value: '#87CEEB' },
]

const colores = computed(() =>
  colorDefs.map((c) => ({
    label: t(`configProducto.parametroObsolescencia.colores.${c.key}`),
    value: c.value,
  })),
)

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
