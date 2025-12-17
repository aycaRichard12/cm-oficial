<template>
  <q-page class="q-ma-lg">
    <div class="q-mt-md">
      <div class="options-header q-mt-md">
        <q-btn
          color="primary"
          size="sm"
          label="Volver"
          @click="handleContinue"
          icon="arrow_back"
          class="back-button"
          unelevated
          style="z-index: 10000; position: relative"
        />
      </div>

      <div class="options-grid">
        <q-card
          v-for="opcion in opciones"
          :key="opcion.codigo"
          class="option-card"
          @click="$emit('seleccionar', opcion.codigo)"
          hoverable
        >
          <q-card-section class="card-content">
            <q-icon
              :name="opcion.icono || 'account_balance'"
              :color="opcion.color || 'primary'"
              size="48px"
            />
            <div class="text-h6 q-mt-md">{{ opcion.nombre }}</div>
            <div class="text-caption q-mt-sm text-grey-7" v-if="opcion.descripcion">
              {{ opcion.descripcion }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="center" class="card-actions">
            <q-btn
              label="Seleccionar"
              color="primary"
              outline
              class="action-button"
              icon-right="arrow_forward"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
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
    color: 'green',
  },
  {
    codigo: 'facturaCMEX',
    nombre: 'FACTURA COMERCIAL DE EXPORTACIÓN',
    descripcion: 'Documentación para comercio exterior',
    icono: 'flight_takeoff',
    color: 'orange',
  },
  {
    codigo: 'facturaABYM',
    nombre: 'FACTURA DE ALQUILER',
    descripcion: 'Para arrendamiento de bienes inmuebles',
    icono: 'home_work',
    color: 'purple',
  },
]
</script>

<style scoped>
.options-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.options-header {
  margin-bottom: 24px;
}

.back-button {
  font-weight: 500;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.option-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
}

.card-actions {
  padding: 12px;
}

.action-button {
  transition: all 0.2s ease;
}

.option-card:hover .action-button {
  background-color: var(--q-primary);
  color: white;
}

@media (max-width: 600px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
