<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <h5 class="text-left q-mt-none q-mb-md">Editar compra</h5>
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input v-model="localData.nombre" label="Nombre*" :rules="requiredRule" />
          </div>

          <div class="col-md-3">
            <q-input v-model="localData.codigo" label="Código*" :rules="requiredRule" />
          </div>

          <div class="col-md-3">
            <q-select
              v-model="localData.proveedor"
              :options="props.proveedores"
              label="Proveedor*"
              emit-value
              map-options
              :rules="requiredRule"
            />
          </div>

          <div class="col-md-3">
            <q-input v-model="localData.factura" label="Nro Factura" />
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  proveedores: Array,
})
const requiredRule = (val) => !!val || 'Campo requerido'

const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })

const onSubmit = () => {
  emit('submit', localData.value)
}

watch(
  () => props.modalValue,
  (newVal) => {
    localData.value = { ...newVal }
  },
)
</script>
