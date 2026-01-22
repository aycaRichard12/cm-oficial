<template>
  <q-card>
    <q-form @submit.prevent="handleSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <label for="nombre">Nombre:</label>
          <q-input
            v-model="localData.nombre"
            id="nombre"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un nombre']"
          />
        </div>

        <div class="col-12 col-md-6">
          <label for="direccion">Dirección:</label>
          <q-input
            v-model="localData.direccion"
            id="direccion"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese una direccion']"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="telefono">Teléfono:</label>
          <q-input
            v-model="localData.telefono"
            name="telefono"
            id="telefono"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un telefono o numero de WhatsApp']"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="emal">Email:</label>
          <q-input
            v-model="localData.email"
            name="email"
            id="email"
            type="email"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un email']"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="tipoalmacen">Tipo de Almacén:</label>
          <q-select
            v-model="localData.tipoalmacen"
            :options="tiposAlmacen"
            id="tipoalmacen"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione un tipo']"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="sucursal">Sucursal:</label>
          <q-select
            v-model="localData.sucursal"
            :options="sucursales"
            id="sucursal"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="codigo">Codigo para web:</label>
          <q-input
            v-model="localData.codigo"
            id="sucursal"
            name="codigo"
            type="text"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un codigo para la web']"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="stockmin">Stock Mínimo:</label>
          <q-input
            v-model="localData.stockmin"
            id="stockmin"
            name="stockmin"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="stockmax">Stock Máximo:</label>
          <q-input
            v-model="localData.stockmax"
            name="stockmax"
            id="stockmax"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
          />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
  tiposAlmacen: {
    type: Array,
    default: () => [],
  },
  sucursales: {
    type: Array,
    default: () => [],
  },
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
