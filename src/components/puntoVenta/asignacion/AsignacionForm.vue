<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-pb-md">
      <div class="col">
        <div class="text-h6 text-primary text-weight-bold">Asignar Punto de Venta</div>
        <div class="text-subtitle2 text-grey-8">
          Usuario: <span class="text-weight-bold">{{ user.name }}</span>
        </div>
      </div>
      <div class="col-auto">
        <q-avatar size="md" color="primary" text-color="white" icon="store" />
      </div>
    </div>

    <q-separator />

    <!-- Formulario -->
    <q-form @submit.prevent="handleSubmit" ref="myForm" class="q-pt-md">
      <div class="row q-col-gutter-md">
        <!-- Almacén -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-xs text-grey-9">Almacén</div>
          <q-select
            v-model="warehouse"
            :options="warehouses"
            outlined
            dense
            id="almacen"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            @update:model-value="$emit('load', warehouse)"
            :loading="warehouses.length === 0"
            :rules="[val => !!val || 'Seleccione un almacén']"
          >
            <template v-slot:prepend>
              <q-icon name="inventory_2" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Punto de Venta -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-xs text-grey-9">Punto de Venta</div>
          <q-select
            v-model="pointOfSale"
            :options="pointsOfSale"
            outlined
            dense
            id="puntoventa"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :disable="!warehouse"
            :rules="[val => !!val || 'Seleccione un punto de venta']"
          >
            <template v-slot:prepend>
              <q-icon name="point_of_sale" color="primary" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Previsualización -->
      <q-banner v-if="warehouse && pointOfSale" dense class="bg-blue-1 text-grey-9 rounded-borders q-mt-md">
        <template v-slot:avatar>
          <q-icon name="info" color="info" />
        </template>
        Asignando acceso al punto de venta seleccionado para <strong>{{ user.name }}</strong>.
      </q-banner>

      <!-- Botones -->
      <div class="row justify-end q-mt-lg q-gutter-x-sm">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="$emit('volver')"
          v-close-popup
        />
        <q-btn
          type="submit"
          color="primary"
          label="Guardar Asignación"
          icon="check"
          unelevated
          :loading="submitting"
          :disable="!warehouse || !pointOfSale"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps(['user', 'warehouses', 'pointsOfSale', 'submitting'])
const emit = defineEmits(['submit', 'volver', 'load'])

const warehouse = ref(null)
const pointOfSale = ref(null)
const myForm = ref(null)

const resetForm = () => {
  warehouse.value = null
  pointOfSale.value = null
}

const handleSubmit = () => {
  if (warehouse.value && pointOfSale.value) {
    emit('submit', { warehouse: warehouse.value, pointOfSale: pointOfSale.value })
  }
}

defineExpose({ resetForm })
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
