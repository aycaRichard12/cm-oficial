<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <!-- Header Section -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6 text-grey-8">
            <q-icon name="edit_note" size="sm" class="q-mr-sm" />
            Editar Compra
          </div>
        </div>
        <div class="col-auto">
          <q-chip color="primary" text-color="white" icon="shopping_cart">
            Modo Edición
          </q-chip>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Form Section -->
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <!-- Nombre Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium text-grey-8 q-mb-xs block">
              Nombre de la Compra*
            </label>
            <q-input
              v-model="localData.nombre"
              :rules="requiredRule"
              dense
              outlined
              clearable
              placeholder="Ingrese el nombre de la compra"
            >
              <template v-slot:prepend>
                <q-icon name="label" size="xs" />
              </template>
            </q-input>
          </div>

          <!-- Código Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium text-grey-8 q-mb-xs block">
              Código de Compra*
            </label>
            <q-input
              v-model="localData.codigo"
              :rules="requiredRule"
              dense
              outlined
              clearable
              placeholder="Ingrese el código"
            >
              <template v-slot:prepend>
                <q-icon name="tag" size="xs" />
              </template>
            </q-input>
          </div>

          <!-- Proveedor Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium text-grey-8 q-mb-xs block">
              Proveedor*
            </label>
            <q-select
              v-model="localData.proveedor"
              :options="props.proveedores"
              emit-value
              map-options
              :rules="requiredRule"
              dense
              outlined
              clearable
              placeholder="Seleccione un proveedor"
            >
              <template v-slot:prepend>
                <q-icon name="business" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Factura Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium text-grey-8 q-mb-xs block">
              Número de Factura
            </label>
            <q-input
              v-model="localData.factura"
              dense
              outlined
              clearable
              placeholder="Ingrese el número de factura (opcional)"
            >
              <template v-slot:prepend>
                <q-icon name="receipt" size="xs" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Action Buttons -->
        <q-separator class="q-my-md" />
        
        <div class="row justify-end q-gutter-sm">
          <q-btn
            label="Cancelar"
            icon="close"
            flat
            color="grey-7"
            @click="$emit('cancel')"
            no-caps
            class="q-px-lg"
          >
            <q-tooltip>Cancelar y cerrar</q-tooltip>
          </q-btn>
          <q-btn
            label="Guardar Cambios"
            icon="save"
            type="submit"
            color="primary"
            unelevated
            no-caps
            class="q-px-lg"
          >
            <q-tooltip>Guardar los cambios realizados</q-tooltip>
          </q-btn>
        </div>
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
