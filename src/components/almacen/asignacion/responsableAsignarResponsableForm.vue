<template>
  <div class="">
    <!-- Botón volver -->
    <div class="row q-mb-md">
      <q-btn
        color="primary"
        flat
        icon="arrow_back"
        label="Volver"
        size="sm"
        @click="$emit('volver')"
        id="volverListado"
      />
    </div>

    <!-- Card principal -->
    <q-card flat bordered class="form-card">
      <!-- Header -->
      <q-card-section class="bg-grey-1">
        <div class="text-h6 text-weight-bold">Asignación de Almacenes</div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs" id="nombreResponsable">
          {{ `${responsableNombre.usuario.usuario} ${responsableNombre.usuario.nombre}` }}
        </div>
      </q-card-section>

      <q-separator />

      <!-- Formulario -->
      <q-card-section>
        <q-form @submit.prevent="handleSubmit">
          <div class="row q-col-gutter-md">
            <!-- Columna izquierda -->
            <div class="col-12 col-md-5">
              <label for="almacen">Almacén a asignar</label>
              <q-select
                v-model="localData.almacen"
                :options="almacenes"
                outlined
                dense
                required
                option-value="value"
                option-label="label"
                emit-value
                map-options
                id="almacen"
                :rules="[(val) => !!val || 'Seleccione un almacén']"
              />
            </div>
          </div>

          <!-- Acciones -->
          <div class="row q-mt-lg">
            <div class="col-12 col-md-5">
              <q-btn
                label="Asignar Almacén"
                type="submit"
                color="primary"
                icon="check"
                class="full-width"
                id="asignarAlmacen"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  responsableId: Number,
  responsableNombre: Object,
  modelValue: Object,
  almacenes: {
    type: Array,
    default: () => [],
  },
})

console.log(props.responsableNombre.usuario)
const localData = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)
const emit = defineEmits(['submit', 'cancel'])

const handleSubmit = () => {
  emit('submit', localData.value)
}
</script>
<style scoped>
.form-card {
  max-width: 900px;
}

.text-h6 {
  letter-spacing: 0.3px;
}
</style>
