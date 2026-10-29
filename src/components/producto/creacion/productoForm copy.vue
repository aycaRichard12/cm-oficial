<template>
  <q-form @submit.prevent="handleSubmit" class="product-form">
    <q-card flat bordered class="form-card">
      <!-- Header con título -->
      <q-card-section class="bg-grey-2 q-pb-md">
        <div class="text-h6 text-primary">{{ $t('ui.datos-del-producto-4dd018') }}</div>
        <div class="text-caption text-grey-7">{{ $t('ui.complete-la-informacion-del-producto-1bef6f') }}</div>
      </q-card-section>

      <!-- Separador -->
      <q-separator />

      <!-- Campos principales -->
      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-md">
          <!-- Código Producto -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('ui.codigo-producto-24251e') }}</label>
              <q-input
                v-model="localData.codigo"
                dense
                outlined
                :placeholder="$t('ui.ingrese-codigo-737eab')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Nombre Producto -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('ui.nombre-del-producto-3eb9f6') }}</label>
              <q-input
                v-model="localData.nombre"
                dense
                outlined
                :placeholder="$t('ui.ingrese-nombre-260147')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Descripción -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('configuracion.servicios.table.descripcion') }}</label>
              <q-input
                v-model="localData.descripcion"
                dense
                outlined
                :placeholder="$t('ui.ingrese-descripcion-5dd4f0')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Código de Barras -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label">{{ $t('ui.codigo-de-barras-edc5fc') }}</label>
              <q-input
                v-model="localData.codigobarras"
                dense
                outlined
                :placeholder="$t('ui.opcional-7a5984')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Categorías -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('configProducto.categoriaProducto.table.title') }}</label>
              <q-select
                v-model="localData.categoria"
                :options="categorias"
                dense
                outlined
                emit-value
                map-options
                :placeholder="$t('ui.seleccione-categoria-f7c1fd')"
                hide-bottom-space
                @update:model-value="
                  (val) => {
                    console.log('Categoría seleccionada:', val)
                    console.log(localData)
                    emit('categoria-changed', val)
                  }
                "
              />
            </div>
          </div>

          <!-- Sub Categorías -->
          <div class="col-12 col-md-4" v-if="subcategorias.length > 0">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('configProducto.categoriaProducto.table.subcategoria') }}</label>
              <q-select
                v-model="localData.subcategoria"
                :options="subcategorias"
                dense
                outlined
                emit-value
                map-options
                :placeholder="$t('ui.seleccione-subcategoria-19633d')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Estados del Producto -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('ui.estados-del-producto-39d741') }}</label>
              <q-select
                v-model="localData.estadoproductos"
                :options="estados"
                dense
                outlined
                emit-value
                map-options
                :placeholder="$t('ui.seleccione-estado-eea911')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Unidad -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('configProducto.unidadProducto.table.nombre') }}</label>
              <q-select
                v-model="localData.unidad"
                :options="unidades"
                dense
                outlined
                emit-value
                map-options
                :placeholder="$t('ui.seleccione-unidad-f82681')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Característica -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label required">{{ $t('configProducto.caracteristicaProducto.table.nombre') }}</label>
              <q-select
                v-model="localData.medida"
                :options="medidas"
                dense
                outlined
                emit-value
                map-options
                :placeholder="$t('ui.seleccione-caracteristica-8d1d93')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Otras Características -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label">{{ $t('ui.otras-caracteristicas-832f7d') }}</label>
              <q-input
                v-model="localData.otraCaracteristica"
                dense
                outlined
                :placeholder="$t('ui.especificaciones-adicionales-cf6240')"
                hide-bottom-space
              />
            </div>
          </div>

          <!-- Imagen del producto -->
          <div class="col-12 col-md-4">
            <div class="field-wrapper">
              <label class="field-label">{{ $t('ui.imagen-del-producto-79f5a9') }}</label>
              <q-file
                v-model="localData.imagen"
                dense
                outlined
                :label="$t('ui.seleccionar-archivo-58ed72')"
                accept="image/*"
                hide-bottom-space
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" />
                </template>
              </q-file>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Vista previa de imagen -->
      <q-card-section v-if="typeof localData.imagen === 'string'" class="q-pt-none">
        <div class="image-preview-container">
          <div class="preview-header">
            <q-icon name="image" size="sm" class="text-grey-7" />
            <span class="text-caption text-grey-7">{{ $t('ui.vista-previa-432932') }}</span>
          </div>
          <div class="image-wrapper">
            <q-img
              :src="localData.imagen"
              class="preview-image"
              :alt="`Imagen actual: ${localData.imagen.split('/').pop()}`"
              fit="contain"
            />
            <div class="image-info">
              <q-icon name="info" size="xs" class="text-grey-6" />
              <span class="text-caption text-grey-6">
                {{ localData.imagen.split('/').pop() }}
              </span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Botones de acción -->
      <q-card-actions class="q-pa-md" align="left">
        <q-btn
          :label="$t('common.save')"
          type="submit"
          color="primary"
          unelevated
          icon="save"
          class="action-btn"
        />
        <q-btn
          :label="$t('common.cancel')"
          flat
          color="negative"
          @click="$emit('cancel')"
          icon="close"
          class="action-btn"
        />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<style scoped>
.product-form {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.form-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--cm-text);
  letter-spacing: 0.01em;
}

.field-label.required::after {
  content: '*';
  color: #e74c3c;
  margin-left: 4px;
}

.image-preview-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--cm-border);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--cm-border);
}

.image-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.preview-image {
  max-height: 60px;
  width: auto;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-info {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--cm-surface);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--cm-border);
}

.action-btn {
  min-width: 100px;
  transition: transform 0.1s ease;
}

.action-btn:active {
  transform: scale(0.98);
}

/* Mejoras visuales para inputs */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #1976d2;
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .action-btn {
    min-width: 80px;
  }

  .image-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
  categorias: {
    type: Array,
    default: () => [],
  },
  estados: {
    type: Array,
    default: () => [],
  },
  subcategorias: {
    type: Array,
    default: () => [],
  },
  unidades: {
    type: Array,
    default: () => [],
  },
  medidas: {
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
