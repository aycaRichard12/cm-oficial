<template>
  <div>
    <!-- Título del formulario -->

    <q-form ref="form" @submit.prevent="onSubmit">
      <!-- Descripción del producto (solo lectura) -->
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="descripcion">Descripción del producto*</label>
          <q-input v-model="localData.descripcion" disable required dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="precioactual">Costo unitario actual del producto*</label>
          <q-input v-model="localData.precioactual" disable required dense outlined>
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <label for="precio">Nuevo costo unitario del producto*</label>
          <q-input
            v-model="localData.precio"
            dense
            outlined
            type="number"
            :rules="[(val) => !!val || 'Campo requerido']"
          >
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card-actions class="row flex justify-start">
        <q-btn label="Guardar" type="button" color="primary" @click="onSubmit" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
const emit = defineEmits(['submit', 'cancel'])
const $q = useQuasar()
const form = ref(null) // Referencia al formulario para validación manual

const props = defineProps({
  editing: Boolean,
  modalValue: {
    type: Object,
    required: true,
  },
})
// Valores iniciales (puedes reemplazarlos dinámicamente cuando abras el modal)
const localData = ref({ ...props.modalValue })

watch(
  () => props.modalValue,
  (nuevoValor) => {
    localData.value = { ...nuevoValor }
  },
  { immediate: true, deep: true },
)

const onSubmit = async () => {
  $q.dialog({
    title: 'Advertencia',
    message:
      'Los precios de venta según Categorías de Precios existentes serán actualizados automáticamente.',
    persistent: true,
    ok: {
      label: 'Aceptar',
      color: 'primary',
    },
    cancel: true,
    cancelLabel: 'Cancelar',
    cancelColor: 'negative',
  }).onOk(async () => {
    const isValid = await form.value.validate()
    if (isValid) {
      emit('submit', localData.value)
    }
  })
}
</script>
