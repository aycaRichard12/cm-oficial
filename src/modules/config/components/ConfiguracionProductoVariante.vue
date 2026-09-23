<template>
  <q-card class="config-card">
    <!-- Header -->
    <q-card-section class="bg-primary text-white q-pa-md">
      <div class="row items-center">
        <q-icon name="category" size="24px" class="q-mr-md" />
        <div>
          <div class="text-h6">Configuración de Producto Variante</div>
          <div class="text-subtitle2 text-primary-light">Control de uso de variantes</div>
        </div>
      </div>
    </q-card-section>

    <!-- Contenido principal -->
    <q-card-section class="q-pa-lg">
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <div class="text-h6 text-weight-medium q-mb-xs">Modo de producto variante</div>
          <div class="text-body2 text-grey-7">
            {{
              usarVariante
                ? '✓ Se permite crear productos con variantes'
                : '✓ No se permite usar variantes en productos'
            }}
          </div>
        </div>

        <div class="col-auto">
          <div class="text-caption text-grey-6 q-mb-xs text-center">
            {{ usarVariante ? 'Activado' : 'Desactivado' }}
          </div>
          <q-toggle
            :model-value="usarVariante"
            :color="usarVariante ? 'primary' : 'grey-7'"
            :icon="usarVariante ? 'toggle_on' : 'toggle_off'"
            size="xl"
            :disable="loading"
            class="toggle-custom"
            @update:model-value="toggleProductoVariante"
          >
            <q-tooltip :delay="500">
              <div class="text-center">
                <div class="text-weight-bold q-mb-xs">
                  {{ usarVariante ? 'Desactivar' : 'Activar' }}
                </div>
                <div class="text-caption">
                  {{
                    usarVariante
                      ? 'Se deshabilitará el uso de variantes'
                      : 'Se habilitará el uso de variantes'
                  }}
                </div>
              </div>
            </q-tooltip>
          </q-toggle>
        </div>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Estado visual -->
      <div class="row justify-center">
        <div class="col-12 col-md-8">
          <q-card flat :class="['status-card', usarVariante ? 'status-on' : 'status-off']" bordered>
            <q-card-section class="q-pa-md text-center">
              <div class="row items-center justify-center q-gutter-sm">
                <q-icon :name="usarVariante ? 'check_circle' : 'block'" size="32px" />
                <div>
                  <div class="text-subtitle1 text-weight-bold">
                    {{ usarVariante ? 'Variantes habilitadas' : 'Variantes deshabilitadas' }}
                  </div>
                  <div class="text-caption q-mt-xs">
                    {{
                      usarVariante
                        ? 'Los productos podrán tener múltiples variantes.'
                        : 'Los productos no podrán tener variantes.'
                    }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading" color="primary" class="rounded-borders">
      <div class="flex column items-center">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-caption q-mt-sm text-grey-7">Actualizando configuración...</div>
      </div>
    </q-inner-loading>
  </q-card>

  <!-- Diálogo de notificaciones -->
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
import { useProductoVarianteConfig } from '../composables/useProductoVarianteConfig'

const props = defineProps({
  md5: {
    type: String,
    required: true,
  },
})

const {
  usarVariante,
  loading,
  showDialog,
  dialogType,
  dialogTitle,
  dialogMessage,
  toggleProductoVariante,
} = useProductoVarianteConfig(props.md5)
</script>

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

.toggle-custom {
  transition: transform 0.2s ease;
}

.toggle-custom:hover {
  transform: scale(1.05);
}

.status-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.status-on {
  border-left: 4px solid #4caf50;
  background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
}

.status-off {
  border-left: 4px solid #f44336;
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
}

.q-inner-loading {
  backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

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

.q-toggle:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  border-radius: 4px;
}

.q-card-section {
  transition: all 0.2s ease;
}

.text-grey-7 {
  line-height: 1.5;
}
</style>
