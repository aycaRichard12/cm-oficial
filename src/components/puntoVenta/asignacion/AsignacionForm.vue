<template>
  <div>
    <q-slide-transition>
      <div class="form-wrapper">
        <!-- Card principal del formulario -->
        <div flat>
          <!-- Header del card -->
          <q-card-section class="bg-grey-1 q-pb-md">
            <div class="row items-center">
              <div class="col">
                <div class="text-h5 text-primary text-weight-medium q-mb-xs">
                  Asignar Punto de Venta
                </div>
                <div class="text-subtitle1 text-grey-7">
                  Usuario:
                  <span class="text-weight-medium text-dark" id="nombreUsuario">
                    {{ user.name }}
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" color="primary" text-color="white" class="shadow-2">
                  <q-icon name="store" size="24px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Formulario -->
          <q-card-section class="q-pt-xl q-pb-lg">
            <q-form @submit.prevent="handleSubmit" ref="myForm" class="q-gutter-y-xl">
              <!-- Campos del formulario -->
              <div class="row q-col-gutter-xl">
                <!-- Almacén -->
                <div class="col-12 col-md-6" id="almacenPuntoVenta">
                  <div class="field-container">
                    <div class="field-label q-mb-sm">
                      <span class="text-subtitle1 text-weight-medium">Almacén</span>
                      <q-chip dense size="sm" color="red" text-color="white" class="q-ml-xs">
                        Requerido
                      </q-chip>
                    </div>
                    <div class="field-hint q-mb-md text-grey-6">Seleccione el almacén asociado</div>
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
                      class="animated-select"
                      :loading="warehouses.length === 0"
                      behavior="menu"
                      dropdown-icon="expand_more"
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="inventory_2" color="primary" />
                      </template>
                      <template v-slot:append>
                        <q-icon v-if="warehouse" name="check_circle" color="positive" size="xs" />
                      </template>
                    </q-select>
                  </div>
                </div>

                <!-- Punto de Venta -->
                <div class="col-12 col-md-6" id="puntoVenta">
                  <div class="field-container">
                    <div class="field-label q-mb-sm">
                      <span class="text-subtitle1 text-weight-medium">Punto de Venta</span>
                      <q-chip dense size="sm" color="red" text-color="white" class="q-ml-xs">
                        Requerido
                      </q-chip>
                    </div>
                    <div class="field-hint q-mb-md text-grey-6">
                      Seleccione el punto de venta a asignar
                    </div>
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
                      class="animated-select"
                      :loading="pointsOfSale.length === 0"
                      :disable="!warehouse"
                      behavior="menu"
                      dropdown-icon="expand_more"
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="point_of_sale" color="primary" />
                      </template>
                      <template v-slot:append>
                        <q-icon v-if="pointOfSale" name="check_circle" color="positive" size="xs" />
                      </template>
                      <template v-slot:hint>
                        <div v-if="!warehouse" class="text-warning text-caption q-mt-xs">
                          Seleccione primero un almacén
                        </div>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>

              <!-- Sección de acciones -->
              <q-separator class="q-my-lg" />

              <div class="row justify-end">
                <div class="col-12 col-md-auto">
                  <div class="action-buttons">
                    <q-btn
                      type="submit"
                      color="primary"
                      label="Registrar Asignación"
                      id="registrarPuntoVenta"
                      icon="assignment_turned_in"
                      size="md"
                      class="q-px-xl q-py-sm shadow-3"
                      :disable="!warehouse || !pointOfSale"
                      :loading="submitting"
                    >
                      <template v-slot:loading>
                        <q-spinner-hourglass class="on-left" />
                        Procesando...
                      </template>
                    </q-btn>

                    <q-btn
                      flat
                      color="grey-6"
                      label="Cancelar"
                      @click="$emit('volver')"
                      class="q-ml-md"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </div>

        <!-- Información adicional -->
        <q-fade-transition>
          <div v-if="warehouse && pointOfSale" class="info-card q-mt-lg">
            <q-card flat class="bg-blue-1">
              <q-card-section class="q-py-sm">
                <div class="row items-center">
                  <q-icon name="info" color="info" size="sm" class="q-mr-sm" />
                  <div class="text-caption text-grey-8">
                    <strong>Previsualización:</strong> Se asignará el punto de venta seleccionado al
                    usuario {{ user.name }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-fade-transition>
      </div>
    </q-slide-transition>
  </div>
</template>

<style scoped>
.form-wrapper {
  animation: fadeIn 0.4s ease-out;
}

.form-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.field-container {
  position: relative;
  padding-bottom: 8px;
}

.field-label {
  display: flex;
  align-items: center;
}

.field-hint {
  font-size: 0.875rem;
  line-height: 1.4;
}

.animated-select :deep(.q-field__control) {
  transition: all 0.2s ease;
  border-radius: 8px;
  min-height: 56px;
}

.animated-select :deep(.q-field__control:hover) {
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.animated-select :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary);
  box-shadow: 0 2px 12px rgba(var(--q-primary-rgb), 0.15);
}

.animated-select :deep(.q-field__append) {
  transition: opacity 0.2s ease;
}

.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

#registrarPuntoVenta {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

#registrarPuntoVenta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--q-primary-rgb), 0.3) !important;
}

#registrarPuntoVenta:active:not(:disabled) {
  transform: translateY(0);
}

#btnVolverAsignacion:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(-2px);
}

#btnVolverAsignacion:active {
  transform: translateX(0);
}

.info-card {
  animation: slideUp 0.3s ease-out;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    border-radius: 8px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .q-btn {
    width: 100%;
    justify-content: center;
  }

  #registrarPuntoVenta {
    order: -1;
  }
}

@media (max-width: 599px) {
  .field-container {
    padding-bottom: 24px;
  }

  .q-card-section {
    padding: 20px 16px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .form-wrapper,
  .form-card,
  .animated-select :deep(.q-field__control),
  #registrarPuntoVenta,
  #btnVolverAsignacion,
  .info-card {
    transition: none !important;
    animation: none !important;
  }

  #registrarPuntoVenta:hover:not(:disabled) {
    transform: none !important;
  }

  #btnVolverAsignacion:hover {
    transform: none !important;
  }
}

/* Estados de focus para accesibilidad */
:deep(.q-field--focused) {
  outline: 2px solid rgba(var(--q-primary-rgb), 0.3);
  outline-offset: 2px;
}

#registrarPuntoVenta:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

#btnVolverAsignacion:focus-visible {
  outline: 2px solid var(--q-grey-6);
  outline-offset: 2px;
}
</style>
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
