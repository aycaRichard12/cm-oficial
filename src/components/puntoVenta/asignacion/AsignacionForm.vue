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
          id="btnVolverAsignacion"
        />
      </div>
    </div>

    <q-form @submit.prevent="handleSubmit" ref="myForm">
      <div class="title-container">
        <div class="title">Asignación de puntos de venta</div>
        <div class="subtitle" id="nombreUsuario">{{ user.name }}</div>
      </div>
      <q-card-section class="row q-col-gutter-x-md justify-center">
        <div class="col-12 col-md-4" id="almacenPuntoVenta">
          <label for="almacen">Almacén*</label>
          <q-select
            v-model="warehouse"
            :options="warehouses"
            outlined
            dense
            emit-value
            map-options
            id="almacen"
            option-value="id"
            option-label="name"
            @update:model-value="$emit('load', warehouse)"
          />
        </div>

        <div class="col-12 col-md-4" id="puntoVenta">
          <label for="puntoventa">Punto de venta*</label>
          <q-select
            v-model="pointOfSale"
            :options="pointsOfSale"
            id="puntoventa"
            outlined
            dense
            emit-value
            map-options
            option-value="id"
            option-label="name"
          />
        </div>
      </q-card-section>
      <q-card-section class="flex justify-center">
        <q-btn type="submit" color="primary" label="Registrar" id="registrarPuntoVenta" />
      </q-card-section>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const warehouse = ref(null)
const pointOfSale = ref(null)
const myForm = ref(null)
defineProps(['user', 'warehouses', 'pointsOfSale'])

const emit = defineEmits(['submit', 'volver', 'load'])

const resetForm = () => {
  warehouse.value = null
  pointOfSale.value = null
}
const handleSubmit = () => {
  emit('submit', { warehouse: warehouse.value, pointOfSale: pointOfSale.value })
  resetForm()
}
</script>
