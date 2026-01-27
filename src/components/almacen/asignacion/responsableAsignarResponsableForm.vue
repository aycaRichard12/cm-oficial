<template>
  <div>
    <div class="row q-mb-md">
      <div class="col-md-2">
        <q-btn
          color="primary"
          icon="arrow_back"
          label="Volver"
          size="sm"
          @click="$emit('volver')"
          id="volverListado"
        />
      </div>
    </div>
    <q-form @submit.prevent="handleSubmit">
      <div class="title-container">
        <div class="title">Asignación de Almacenes</div>
        <div class="subtitle" id="nombreResponsable">
          {{ `${responsableNombre.usuario.usuario} ${responsableNombre.usuario.nombre}` }}
        </div>
      </div>
      <q-card-section class="row q-col-gutter-x-md flex justify-center">
        <div class="col-12 col-md-auto flex items-center q-mb-lg">
          <label for="almacen" class="text-weight-medium">Almacenes por asignar:</label>
        </div>
        <div class="col-12 col-md-4" id="darleAlmacen">
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
            :rules="[(val) => !!val || 'Seleccione Almacen']"
          />
        </div>

        <div class="col-12 col-md-auto flex items-center q-pb-lg">
          <q-btn
            label="Asignar"
            type="submit"
            color="primary"
            id="asignarAlmacen"
            class="full-width"
          />
        </div>
      </q-card-section>
    </q-form>
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
<!-- $productoAlmacenId = $data['id'];
         $fecha= $data['fecha']; 
         $metodo= $data['metodo']; 
         $cantidad= $data['cantidad']; 
         $costoUnitario = $data['precio']; -->
