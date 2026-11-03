<template>
  <div>
    <!-- Título del formulario -->

    <q-form ref="form" @submit.prevent="onSubmit">
      <!-- Descripción del producto (solo lectura) -->
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="descripcion">{{ $t('ui.descripcion-del-producto-2d2cdb') }}</label>
          <q-input v-model="localData.descripcion" disable required dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="precioactual">{{ $t('ui.costo-unitario-actual-del-producto-257471') }}</label>
          <q-input v-model="localData.precioactual" disable required dense outlined>
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <label for="precio">{{ $t('ui.nuevo-costo-unitario-del-producto-29c7ba') }}</label>
          <q-input
            v-model="localData.precio"
            dense
            outlined
            type="number"
            :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
          >
            <template #append>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card-actions class="row flex justify-start">
        <q-btn :label="$t('common.save')" type="button" color="primary" @click="onSubmit" />
        <q-btn :label="$t('common.cancel')" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
    title: i18nT('ui.advertencia-c29238'),
    message:
      i18nT('ui.los-precios-de-venta-segun-categorias-de-precios-exi-a6fded'),
    persistent: true,
    ok: {
      label: i18nT('ui.aceptar-8f9f73'),
      color: 'primary',
    },
    cancel: true,
    cancelLabel: i18nT('common.cancel'),
    cancelColor: 'negative',
  }).onOk(async () => {
    const isValid = await form.value.validate()
    if (isValid) {
      emit('submit', localData.value)
    }
  })
}
</script>
