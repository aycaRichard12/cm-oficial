<template>
  <q-card class="config-card">
    <!-- Header con mejor presentación -->
    <q-card-section class="bg-primary text-white q-pa-md">
      <div class="row items-center">
        <q-icon name="settings" size="24px" class="q-mr-md" />
        <div>
          <div class="text-h6">Configuración de Producto Único</div>
          <div class="text-subtitle2 text-primary-light">Control de gestión de productos</div>
        </div>
      </div>
    </q-card-section>

    <!-- Contenido principal con mejor estructura -->
    <q-card-section class="q-pa-lg">
      <!-- Header de configuración -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <div class="text-h6 text-weight-medium q-mb-xs">Modo Producto Único</div>
          <div class="text-body2 text-grey-7">
            {{
              config.productounico
                ? '✓ Cada producto tendrá un identificador único e irrepetible'
                : '✓ Gestión por lotes: productos agrupados sin identificador individual'
            }}
          </div>
        </div>

        <div class="col-auto">
          <div class="text-caption text-grey-6 q-mb-xs text-center">
            {{ config.productounico ? 'Activo' : 'Inactivo' }}
          </div>
          <q-toggle
            v-model="config.productounico"
            :color="config.productounico ? 'primary' : 'grey-7'"
            :icon="config.productounico ? 'toggle_on' : 'toggle_off'"
            size="xl"
            :disable="loading"
            class="toggle-custom"
            @update:model-value="toggleProductoUnico"
          >
            <q-tooltip :delay="500">
              <div class="text-center">
                <div class="text-weight-bold q-mb-xs">
                  {{ config.productounico ? 'Desactivar' : 'Activar' }} modo producto único
                </div>
                <div class="text-caption">
                  {{
                    config.productounico
                      ? 'Los productos se manejarán individualmente'
                      : 'Los productos se agruparán por lotes'
                  }}
                </div>
              </div>
            </q-tooltip>
          </q-toggle>
        </div>
      </div>

      <!-- Separador elegante -->
      <q-separator class="q-mb-lg" />

      <!-- Estado visual mejorado -->
      <div class="row justify-center">
        <div class="col-12 col-md-8">
          <q-card
            flat
            :class="['status-card', config.productounico ? 'status-active' : 'status-inactive']"
            bordered
          >
            <q-card-section class="q-pa-md text-center">
              <div class="row items-center justify-center q-gutter-sm">
                <q-icon :name="config.productounico ? 'verified_user' : 'inventory'" size="32px" />
                <div>
                  <div class="text-subtitle1 text-weight-bold">
                    {{
                      config.productounico
                        ? 'Modo Producto Único Activado'
                        : 'Modo Gestión por Lotes Activado'
                    }}
                  </div>
                  <div class="text-caption q-mt-xs">
                    {{
                      config.productounico
                        ? 'Cada producto tiene su propio identificador para trazabilidad completa'
                        : 'Productos agrupados para una gestión más eficiente por lotes'
                    }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Loading overlay mejorado -->
    <q-inner-loading :showing="loading" color="primary" class="rounded-borders">
      <div class="flex column items-center">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-caption q-mt-sm text-grey-7">Actualizando configuración...</div>
      </div>
    </q-inner-loading>
  </q-card>

  <!-- Notificaciones con mejor diseño -->
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 320px; max-width: 400px">
      <q-card-section
        :class="dialogType === 'error' ? 'bg-negative' : 'bg-positive'"
        class="text-white q-pa-md"
      >
        <div class="row items-center no-wrap">
          <q-icon
            :name="dialogType === 'error' ? 'error_outline' : 'check_circle_outline'"
            size="28px"
            class="q-mr-md"
          />
          <div>
            <div class="text-h6 q-mb-xs">{{ dialogTitle }}</div>
            <div class="text-subtitle2 text-white text-weight-regular">
              {{ dialogType === 'error' ? 'Error en la operación' : 'Operación exitosa' }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg q-pb-md">
        <div class="text-body1 text-grey-8" v-html="dialogMessage"></div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="dialogType === 'error' ? 'Entendido' : 'Continuar'"
          :color="dialogType === 'error' ? 'negative' : 'positive'"
          v-close-popup
          class="q-px-md"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'

// Props
const props = defineProps({
  md5: {
    type: String,
    required: true,
  },
})
const { config, loading, showDialog, dialogType, dialogTitle, dialogMessage, toggleProductoUnico } =
  useProductoConfig(props.md5)
</script>

<style scoped>
.config-card {
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-toggle {
  transform: scale(1.2);
}
</style>
<style scoped>
.config-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.config-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.text-primary-light {
  opacity: 0.9;
  font-weight: 400;
}

/* Estilos personalizados para el toggle */
.toggle-custom {
  transition: transform 0.2s ease;
}

.toggle-custom:hover {
  transform: scale(1.05);
}

/* Estilos para las tarjetas de estado */
.status-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.status-active {
  border-left: 4px solid #4caf50;
  background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
}

.status-inactive {
  border-left: 4px solid #ff9800;
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

/* Animación para el loading overlay */
.q-inner-loading {
  backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

/* Mejoras responsive */
@media (max-width: 600px) {
  .config-card {
    margin: 0 16px;
  }

  .status-card .row {
    flex-direction: column;
    text-align: center;
  }

  .q-mb-lg {
    margin-bottom: 24px;
  }
}

/* Mejoras de accesibilidad */
.q-toggle:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Transiciones suaves */
.q-card-section {
  transition: all 0.2s ease;
}

/* Estilo para los chips de información */
.text-grey-7 {
  line-height: 1.5;
}
</style>
