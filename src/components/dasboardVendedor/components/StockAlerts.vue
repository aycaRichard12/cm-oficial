<template>
  <q-card class="alerts-card" flat>
    <q-card-section class="alerts-header bg-primary text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 q-my-none">
          <q-icon name="notifications_active" class="q-mr-md" />
          Alertas Inteligentes
        </div>
        <q-badge v-if="!sinAlertas" :label="totalAlertas" color="red" />
        <q-badge v-else label="OK" color="green" />
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <!-- Lista paginada -->
      <q-list separator v-if="!sinAlertas">
        <q-item
          v-for="alerta in alertasPaginadas"
          :key="alerta.codigo"
          class="alert-item"
          :class="{
            'alert-critico': alerta.tipo === 'critico',
            'alert-bajo': alerta.tipo === 'bajo',
            'alert-agotado': alerta.tipo === 'agotado',
          }"
        >
          <q-item-section avatar>
            <q-icon
              :name="
                alerta.tipo === 'critico'
                  ? 'error_outline'
                  : alerta.tipo === 'bajo'
                    ? 'warning_outline'
                    : 'inventory_2'
              "
              :color="
                alerta.tipo === 'critico' ? 'red' : alerta.tipo === 'bajo' ? 'orange' : 'dark'
              "
              size="28px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold">{{ alerta.nombre }}</q-item-label>
            <q-item-label caption>
              Código: {{ alerta.codigo }} | Stock: {{ alerta.stock }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="
                alerta.tipo === 'critico' ? 'red' : alerta.tipo === 'bajo' ? 'orange' : 'dark'
              "
              :label="
                alerta.tipo === 'critico' ? 'Crítico' : alerta.tipo === 'bajo' ? 'Bajo' : 'Agotado'
              "
              class="badge-alert"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Mensaje sin alertas -->
      <q-list v-else>
        <q-item class="q-py-lg">
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

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="flex justify-center q-py-md">
        <q-pagination
          v-model="paginaActual"
          :max="totalPaginas"
          :max-pages="6"
          direction-links
          color="primary"
          active-color="primary"
          flat
          boundary-links
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStock } from '../composables/useStock'

const { alertasCriticas, alertasBajas, productosAgotadosLista } = useStock()

// Unificar todas las alertas con un tipo para identificarlas
const alertasUnificadas = computed(() => {
  const criticas = alertasCriticas.value.map((a) => ({ ...a, tipo: 'critico' }))
  const bajas = alertasBajas.value.map((a) => ({ ...a, tipo: 'bajo' }))
  const agotadas = productosAgotadosLista.value.map((a) => ({ ...a, tipo: 'agotado', stock: 0 }))

  // Orden: críticos primero, después bajos, después agotados (opcional)
  return [...criticas, ...bajas, ...agotadas]
})

const totalAlertas = computed(() => alertasUnificadas.value.length)
const sinAlertas = computed(() => totalAlertas.value === 0)

// Paginación
const paginaActual = ref(1)
const itemsPorPagina = 5 // Ajustá este valor según prefieras

const totalPaginas = computed(() => Math.ceil(totalAlertas.value / itemsPorPagina) || 1)

const alertasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  return alertasUnificadas.value.slice(inicio, inicio + itemsPorPagina)
})

// Reiniciar página si cambia la cantidad total (ej. al filtrar)
// Opcional: si querés que al cambiar los datos vuelva a la página 1
import { watch } from 'vue'
watch(totalAlertas, () => {
  if (paginaActual.value > totalPaginas.value) {
    paginaActual.value = 1
  }
})
</script>

<style scoped>
/* Tus estilos se mantienen igual, solo se aplican dinámicamente */
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
