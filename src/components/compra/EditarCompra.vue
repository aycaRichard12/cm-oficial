<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <!-- Header Section -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6 cm-text">
            <q-icon name="edit_note" size="sm" class="q-mr-sm" />
            {{ $t('ui.editar-compra-7f9132') }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip color="primary" text-color="white" icon="shopping_cart">
            {{ $t('ui.modo-edicion-551680') }}
          </q-chip>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Form Section -->
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <!-- Nombre Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium cm-text q-mb-xs block">
              {{ $t('ui.nombre-de-la-compra-1e2160') }}
            </label>
            <q-input
              v-model="localData.nombre"
              :rules="requiredRule"
              dense
              outlined
              clearable
              :placeholder="$t('ui.ingrese-el-nombre-de-la-compra-757b1e')"
            >
              <template v-slot:prepend>
                <q-icon name="label" size="xs" />
              </template>
            </q-input>
          </div>

          <!-- Código Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium cm-text q-mb-xs block">
              {{ $t('ui.codigo-de-compra-64d5a8') }}
            </label>
            <q-input
              v-model="localData.codigo"
              :rules="requiredRule"
              dense
              outlined
              clearable
              :placeholder="$t('ui.ingrese-el-codigo-66c4a3')"
            >
              <template v-slot:prepend>
                <q-icon name="tag" size="xs" />
              </template>
            </q-input>
          </div>

          <!-- Proveedor Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium cm-text q-mb-xs block">
              {{ $t('ui.proveedor-b71a8c') }}
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
              :placeholder="$t('ui.seleccione-un-proveedor-ea0bb1')"
            >
              <template v-slot:prepend>
                <q-icon name="business" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Factura Field -->
          <div class="col-12 col-md-6">
            <label class="text-weight-medium cm-text q-mb-xs block">
              {{ $t('ui.numero-de-factura-4f1ab6') }}
            </label>
            <q-input
              v-model="localData.factura"
              dense
              outlined
              clearable
              :placeholder="$t('ui.ingrese-el-numero-de-factura-opcional-cd425f')"
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
            :label="$t('common.cancel')"
            icon="close"
            flat
            color="grey-7"
            @click="$emit('cancel')"
            no-caps
            class="q-px-lg"
          >
            <q-tooltip>{{ $t('ui.cancelar-y-cerrar-930819') }}</q-tooltip>
          </q-btn>
          <q-btn
            :label="$t('ui.guardar-cambios-7d2fd7')"
            icon="save"
            type="submit"
            color="primary"
            unelevated
            no-caps
            class="q-px-lg"
          >
            <q-tooltip>{{ $t('ui.guardar-los-cambios-realizados-8a72c0') }}</q-tooltip>
          </q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  proveedores: Array,
})
const requiredRule = (val) => !!val || i18nT('configProducto.estadoProducto.form.required')

const emit = defineEmits(['submit', 'cancel', 'recargarProveedores'])
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
