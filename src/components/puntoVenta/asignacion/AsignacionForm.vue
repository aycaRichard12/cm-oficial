<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-pb-md">
      <div class="col">
        <div class="text-h6 text-primary text-weight-bold">{{ $t('ui.asignar-punto-de-venta-5b3562') }}</div>
        <div class="text-subtitle2 cm-text">
          {{ $t('ui.usuario-5a75b0') }} <span class="text-weight-bold">{{ user.name }}</span>
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
          <div class="text-subtitle2 q-mb-xs cm-text">{{ $t('inventario.warehouse') }}</div>
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
            :rules="[val => !!val || $t('ui.seleccione-un-almacen-27ab34')]"
          >
            <template v-slot:prepend>
              <q-icon name="inventory_2" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Punto de Venta -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-xs cm-text">{{ $t('ui.punto-de-venta-ee4115') }}</div>
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
            :rules="[val => !!val || $t('ui.seleccione-un-punto-de-venta-fb4cf3')]"
          >
            <template v-slot:prepend>
              <q-icon name="point_of_sale" color="primary" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Previsualización -->
      <q-banner v-if="warehouse && pointOfSale" dense class="cm-surface-2 cm-text rounded-borders q-mt-md">
        <template v-slot:avatar>
          <q-icon name="info" color="info" />
        </template>
        {{ $t('ui.asignando-acceso-al-punto-de-venta-seleccionado-para-8f146d') }} <strong>{{ user.name }}</strong>.
      </q-banner>

      <!-- Botones -->
      <div class="row justify-end q-mt-lg q-gutter-x-sm">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="$emit('volver')"
          v-close-popup
        />
        <q-btn
          type="submit"
          color="primary"
          :label="$t('ui.guardar-asignacion-fdaca0')"
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
