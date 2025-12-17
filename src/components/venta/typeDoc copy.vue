<template>
  <q-layout view="lHh Lpr lff" class="bg-white">
    <q-page-container>
      <q-page class="q-pa-lg q-gutter-y-xl">
        <!-- Header Section -->
        <div class="row items-center q-mb-xl">
          <div class="col-auto">
            <q-btn
              flat
              dense
              @click="handleContinue"
              icon="arrow_back"
              label="Volver"
              class="text-primary-dark"
              no-caps
            />
          </div>
          <div class="col">
            <div class="text-h4 text-weight-bold text-primary-dark">
              Seleccionar Tipo de Documento
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Elija el tipo de documento que desea generar
            </div>
          </div>
        </div>

        <!-- Document Options Grid -->
        <div class="options-grid">
          <q-card
            v-for="opcion in opciones"
            :key="opcion.codigo"
            class="option-card"
            @click="$emit('seleccionar', opcion.codigo)"
            flat
            bordered
          >
            <q-card-section class="card-content">
              <div class="icon-container">
                <q-icon :name="opcion.icono || 'description'" :color="opcion.color" size="48px" />
              </div>
              <div class="text-h6 text-weight-bold text-primary-dark q-mt-lg">
                {{ opcion.nombre }}
              </div>
              <div class="text-caption text-grey-7 q-mt-sm" v-if="opcion.descripcion">
                {{ opcion.descripcion }}
              </div>
            </q-card-section>

            <q-separator class="separator" />

            <q-card-actions align="center" class="card-actions">
              <q-btn
                label="Seleccionar"
                class="action-button"
                icon-right="arrow_forward"
                unelevated
                no-caps
              />
            </q-card-actions>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['continuar', 'seleccionar'])

const handleContinue = () => {
  emit('continuar')
}

const opciones = [
  {
    codigo: 'preforma',
    nombre: 'VENTA PROFORMA',
    descripcion: 'Documento previo a la factura formal',
    icono: 'description',
    color: 'complementary',
  },
  {
    codigo: 'facturaCV',
    nombre: 'FACTURA COMPRA-VENTA',
    descripcion: 'Para transacciones comerciales locales',
    icono: 'receipt',
    color: 'primary-dark',
  },
  {
    codigo: 'facturaCMEX',
    nombre: 'FACTURA COMERCIAL DE EXPORTACIÓN',
    descripcion: 'Documentación para comercio exterior',
    icono: 'flight_takeoff',
    color: 'accent-warm',
  },
  {
    codigo: 'facturaABYM',
    nombre: 'FACTURA DE ALQUILER',
    descripcion: 'Para arrendamiento de bienes inmuebles',
    icono: 'home_work',
    color: 'primary-gradient-end',
  },
]
</script>

<style scoped lang="scss">
// Color Variables
$primary-dark: #004d40;
$gradient-start: #219286;
$gradient-end: #044e49;
$accent-warm: #ffc107;
$complementary: #26a69a;
$white: #ffffff;
$light-grey: #f5f5f5;

// Typography
$font-primary: 'Roboto', sans-serif;
$font-secondary: 'Open Sans', sans-serif;

// Base Styles
body {
  font-family: $font-primary;
  color: $primary-dark;
}

// Layout Components
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 24px;
}

.option-card {
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba($primary-dark, 0.1);
  background: $white;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba($primary-dark, 0.08);
    border-color: rgba($primary-dark, 0.2);

    .action-button {
      background: linear-gradient(to right, $gradient-start, $gradient-end);
    }
  }
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;

  .icon-container {
    padding: 16px;
    border-radius: 50%;
    background: rgba($complementary, 0.1);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
}

.separator {
  background: rgba($primary-dark, 0.05);
}

.card-actions {
  padding: 16px;
  background: $light-grey;
}

.action-button {
  background: $primary-dark;
  color: $white;
  width: 100%;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba($primary-dark, 0.2);
  }
}

// Responsive Adjustments
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .card-content {
    padding: 24px 16px;
  }
}
</style>

<style lang="scss">
// Global Quasar Overrides
.q-layout,
.q-page-container,
.q-card,
.q-btn {
  font-family: 'Roboto', 'Open Sans', sans-serif;
}

.text-primary-dark {
  color: #004d40;
}

.text-accent-warm {
  color: #ffc107;
}

.text-complementary {
  color: #26a69a;
}

.bg-white {
  background-color: #ffffff;
}
</style>
