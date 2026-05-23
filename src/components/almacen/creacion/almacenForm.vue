<template>
  <q-card class="modern-card">
    <q-form @submit.prevent="handleSubmit">
      <!-- Header con título visual -->
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-medium text-grey-9">Información del Almacén</div>
        <div class="text-caption text-grey-6 q-mt-xs">Complete los datos del almacén</div>
        <q-separator class="q-mt-md" />
      </q-card-section>

      <q-card-section class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <div class="field-label">Nombre del Almacén</div>
          <q-input
            v-model="localData.nombre"
            id="nombre"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un nombre']"
            class="modern-input"
            placeholder="Ej: Almacén Central"
          />
        </div>

        <div class="col-12 col-md-6">
          <div class="field-label">Dirección</div>
          <q-input
            v-model="localData.direccion"
            id="direccion"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese una direccion']"
            class="modern-input"
            placeholder="Calle, número, colonia"
          />
        </div>

        <div class="col-12 col-md-4">
          <div class="field-label">Teléfono / WhatsApp</div>
          <q-input
            v-model="localData.telefono"
            name="telefono"
            id="telefono"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un telefono o numero de WhatsApp']"
            class="modern-input"
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div class="col-12 col-md-4">
          <div class="field-label">Correo Electrónico</div>
          <q-input
            v-model="localData.email"
            name="email"
            id="email"
            type="email"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Ingrese un email']"
            class="modern-input"
            placeholder="almacen@empresa.com"
          />
        </div>

        <div class="col-12 col-md-4">
          <div class="field-label">Tipo de Almacén</div>
          <q-select
            v-model="localData.tipoalmacen"
            :options="tiposAlmacen"
            id="tipoalmacen"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione un tipo']"
            class="modern-select"
            placeholder="Seleccionar tipo"
          />
        </div>

        <div class="col-12 col-md-3">
          <div class="field-label">Sucursal</div>
          <q-select
            v-model="localData.sucursal"
            :options="sucursales"
            id="sucursal"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
            class="modern-select"
            placeholder="Seleccionar sucursal"
          />
        </div>

        <div class="col-12 col-md-3">
          <div class="field-label">Código Web</div>
          <q-input
            v-model="localData.codigo"
            id="sucursal"
            name="codigo"
            type="text"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un codigo para la web']"
            class="modern-input"
            placeholder="Código único"
          />
        </div>

        <div class="col-12 col-md-3">
          <div class="field-label">Stock Mínimo</div>
          <q-input
            v-model="localData.stockmin"
            id="stockmin"
            name="stockmin"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
            class="modern-input"
            placeholder="0"
          />
        </div>

        <div class="col-12 col-md-3">
          <div class="field-label">Stock Máximo</div>
          <q-input
            v-model="localData.stockmax"
            name="stockmax"
            id="stockmax"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
            class="modern-input"
            placeholder="0"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions class="flex justify-end q-gutter-sm q-pa-md">
        <q-btn
          label="Cancelar"
          flat
          color="grey-7"
          class="modern-btn-cancel"
          @click="$emit('cancel')"
        />
        <q-btn
          label="Guardar Almacén"
          type="submit"
          color="primary"
          class="modern-btn-save q-px-md"
          icon="save"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<style scoped>
.modern-card {
  border-radius: 16px !important;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

/* Estilos modernos para inputs */
.modern-input :deep(.q-field__control) {
  border-radius: 10px !important;
  transition: all 0.2s ease;
  background-color: #fafbfc;
}

.modern-input :deep(.q-field__control:hover) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.2);
}

.modern-input :deep(.q-field__control:focus-within) {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.modern-input :deep(.q-field__native) {
  font-size: 14px;
  padding: 8px 12px;
}

.modern-input :deep(.q-field__native::placeholder) {
  color: #9ca3af;
  font-size: 13px;
}

/* Estilos modernos para selects */
.modern-select :deep(.q-field__control) {
  border-radius: 10px !important;
  transition: all 0.2s ease;
  background-color: #fafbfc;
}

.modern-select :deep(.q-field__control:hover) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.2);
}

.modern-select :deep(.q-field__control:focus-within) {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.modern-select :deep(.q-field__native) {
  font-size: 14px;
}

/* Botón cancelar moderno */
.modern-btn-cancel {
  border-radius: 10px !important;
  padding: 6px 16px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  transition: all 0.2s ease;
}

.modern-btn-cancel:hover {
  background-color: #f3f4f6 !important;
  transform: translateY(-1px);
}

/* Botón guardar moderno */
.modern-btn-save {
  border-radius: 10px !important;
  padding: 6px 20px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modern-btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.25);
}

.modern-btn-save:active {
  transform: translateY(0);
}

/* Separador mejorado */
.q-separator {
  background: linear-gradient(to right, #e5e7eb, #d1d5db) !important;
  height: 1px !important;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .modern-card {
    border-radius: 12px !important;
  }

  .field-label {
    font-size: 12px;
  }

  .modern-btn-save,
  .modern-btn-cancel {
    padding: 4px 14px !important;
    font-size: 13px;
  }
}

/* Mejora de espaciado */
.q-gutter-md > .col,
.q-gutter-md > [class*='col-'] {
  padding: 0 8px;
}

/* Estilo para labels de inputs cuando están vacíos */
:deep(.q-field--error .q-field__control) {
  background-color: #fff5f5 !important;
}

:deep(.q-field--error .q-field__control:hover) {
  background-color: #ffffff !important;
}

/* Estilo para campos deshabilitados si los hubiera */
:deep(.q-field--disabled .q-field__control) {
  background-color: #f9fafb !important;
  opacity: 0.7;
}
</style>

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
