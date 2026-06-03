<template>
  <q-card class="alerts-card" flat>
    <q-card-section class="alerts-header bg-primary text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 q-my-none">
          <q-icon name="notifications_active" class="q-mr-md" />
          Alertas Inteligentes
        </div>
        <q-badge
          v-if="!sinAlertas"
          :label="criticos.length + bajos.length + agotados.length"
          color="red"
        />
        <q-badge v-else label="OK" color="green" />
      </div>
    </q-card-section>
    <q-card-section class="q-pa-none">
      <q-list separator>
        <!-- Crítico -->
        <q-item v-for="item in criticos" :key="item.codigo" class="alert-item alert-critico">
          <q-item-section avatar>
            <q-icon name="error_outline" color="red" size="28px" />
          </q-item-section>
          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold">{{ item.nombre }}</q-item-label>
            <q-item-label caption>Código: {{ item.codigo }} | Stock: {{ item.stock }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="red" label="Crítico" class="badge-alert" />
          </q-item-section>
        </q-item>

        <!-- Bajo -->
        <q-item v-for="item in bajos" :key="item.codigo" class="alert-item alert-bajo">
          <q-item-section avatar>
            <q-icon name="warning_outline" color="orange" size="28px" />
          </q-item-section>
          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold">{{ item.nombre }}</q-item-label>
            <q-item-label caption>Código: {{ item.codigo }} | Stock: {{ item.stock }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="orange" label="Bajo" class="badge-alert" />
          </q-item-section>
        </q-item>

        <!-- Agotados -->
        <q-item v-for="item in agotados" :key="item.codigo" class="alert-item alert-agotado">
          <q-item-section avatar>
            <q-icon name="inventory_2" color="dark" size="28px" />
          </q-item-section>
          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold">{{ item.nombre }}</q-item-label>
            <q-item-label caption>Código: {{ item.codigo }} | Stock: 0</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="dark" label="Agotado" class="badge-alert" />
          </q-item-section>
        </q-item>

        <!-- Sin Alertas -->
        <q-item v-if="sinAlertas" class="q-py-lg">
          <q-item-section class="text-center">
            <div class="text-center q-gutter-md">
              <q-icon name="check_circle" size="64px" color="green" />
              <div class="text-subtitle2 text-weight-medium">No hay alertas activas</div>
              <div class="text-caption text-grey">
                Todos los productos tienen niveles de stock adecuados
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStock } from '../composables/useStock'

const { alertasCriticas, alertasBajas, productosAgotadosLista } = useStock()
const criticos = computed(() => alertasCriticas.value)
const bajos = computed(() => alertasBajas.value)
const agotados = computed(() => productosAgotadosLista.value)
const sinAlertas = computed(
  () => criticos.value.length === 0 && bajos.value.length === 0 && agotados.value.length === 0,
)
</script>

<style scoped>
.alerts-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e0e0;
}

.alerts-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #1565c0;
}

.alert-item {
  padding: 16px 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.alert-item:hover {
  background-color: #f5f7fa;
}

.alert-critico {
  border-left-color: #ef5350;
  background-color: rgba(239, 83, 80, 0.05);
}

.alert-bajo {
  border-left-color: #fb8c00;
  background-color: rgba(251, 140, 0, 0.05);
}

.alert-agotado {
  border-left-color: #424242;
  background-color: rgba(66, 66, 66, 0.05);
}

.badge-alert {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}
</style>
