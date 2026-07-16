<template>
  <q-card class="filter-card" flat bordered>
    <!-- Encabezado con gradiente -->
    <q-card-section class="bg-gradient text-white q-pa-sm">
      <div class="row items-center">
        <q-icon name="filter_alt" size="md" class="q-mr-md" />
        <div>
          <div class="text-subtitle2 text-white text-opacity-7">
            Seleccione los parámetros para generar el reporte.
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Formulario -->
    <q-card-section class="q-pa-lg">
      <q-form @submit.prevent="$emit('submit')">
        <!-- Sección: Fechas -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <label for="">Fecha inicio</label>
            <q-input
              :model-value="form.fecha_inicio"
              @update:model-value="(val) => updateField('fecha_inicio', val)"
              type="date"
              outlined
              dense
              clearable
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <label for="">Fecha fin</label>
            <q-input
              :model-value="form.fecha_fin"
              @update:model-value="(val) => updateField('fecha_fin', val)"
              type="date"
              outlined
              dense
              clearable
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event_available" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator spaced="lg" />

        <!-- Sección: Filtros -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <label for="almacen">Almacén</label>
            <q-select
              :model-value="form.almacen_id"
              @update:model-value="(val) => updateField('almacen_id', val)"
              :options="listaAlmacenes"
              option-label="label"
              option-value="value"
              id="almacen"
              emit-value
              map-options
              clearable
              outlined
              dense
              :loading="loadingAlmacenes"
            >
              <template v-slot:prepend>
                <q-icon name="warehouse" />
              </template>
            </q-select>
          </div>

          <!-- Select de categoría padre (sin emit-value para obtener el objeto completo) -->
          <div class="col-12 col-sm-6 col-md-4">
            <label for="catP">Categoría de producto</label>

            <q-select
              v-model="categoriaPadre"
              :options="listaCategoriaProductos"
              option-label="label"
              id="catP"
              clearable
              outlined
              dense
              :loading="loadingCategoriaProducto"
            >
              <template v-slot:prepend>
                <q-icon name="warehouse" />
              </template>
            </q-select>
          </div>

          <!-- Select de subcategoría (hijo) - solo aparece si la categoría padre tiene hijos -->
          <div
            class="col-12 col-sm-6 col-md-4"
            v-if="categoriaPadre && categoriaPadre.children && categoriaPadre.children.length > 0"
          >
            <label for="catsP">Subcategoría</label>

            <q-select
              :model-value="form.categoriaProd"
              @update:model-value="(val) => updateField('categoriaProd', val)"
              :options="subcategorias"
              option-label="label"
              option-value="value"
              id="catsP"
              emit-value
              map-options
              clearable
              outlined
              dense
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <label for="cliente">Cliente</label>

            <q-select
              :model-value="form.cliente_id"
              @update:model-value="(val) => updateField('cliente_id', val)"
              :options="listaClientes"
              option-label="label"
              option-value="value"
              id="cliente"
              emit-value
              map-options
              clearable
              outlined
              dense
              :loading="loadingClientes"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <label for="campana">Campaña</label>
            <q-select
              :model-value="form.campana_id"
              @update:model-value="(val) => updateField('campana_id', val)"
              :options="listaCampanas"
              option-label="label"
              option-value="value"
              id="campana"
              emit-value
              map-options
              clearable
              outlined
              dense
              :loading="loadingCampanas"
            >
              <template v-slot:prepend>
                <q-icon name="campaign" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4" v-if="mostrarGranularidad">
            <q-select
              :model-value="form.granularidad"
              @update:model-value="(val) => updateField('granularidad', val)"
              :options="['dia', 'semana', 'mes']"
              label="Agrupar por"
              emit-value
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="insights" />
              </template>
            </q-select>
          </div>
        </div>

        <q-separator spaced="lg" />

        <!-- Sección: Acciones -->
        <div class="row items-center justify-end q-col-gutter-md">
          <div class="col-12 col-sm-auto">
            <q-btn
              label="Limpiar filtros"
              icon="restart_alt"
              color="grey-7"
              flat
              class="full-width"
              no-caps
              @click="limpiarFiltros"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              type="submit"
              color="primary"
              icon="analytics"
              label="Generar reporte"
              size="md"
              :loading="loadingReporte"
              class="full-width rounded-btn"
              no-caps
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  listaAlmacenes: { type: Array, default: () => [] },
  loadingAlmacenes: { type: Boolean, default: false },
  listaClientes: { type: Array, default: () => [] },
  loadingClientes: { type: Boolean, default: false },
  listaCampanas: { type: Array, default: () => [] },
  loadingCampanas: { type: Boolean, default: false },
  listaCategoriaProductos: { type: Array, default: () => [] },
  loadingCategoriaProducto: { type: Boolean, default: false },
  mostrarGranularidad: { type: Boolean, default: false },
  loadingReporte: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'update:form', 'limpiar'])

// Estado local para la categoría padre seleccionada (objeto completo)
const categoriaPadre = ref(null)

// Opciones para el select de subcategorías
const subcategorias = computed(() => {
  if (categoriaPadre.value && categoriaPadre.value.children) {
    return categoriaPadre.value.children.map((child) => ({
      label: child.nombre,
      value: child.id,
    }))
  }
  return []
})

// Cuando cambia la categoría padre, sincronizar con form.categoriaProd
watch(categoriaPadre, (nuevaCat) => {
  if (!nuevaCat) {
    // Si se limpió la selección, limpiar también el form
    updateField('categoriaProd', null)
    return
  }

  if (nuevaCat.children && nuevaCat.children.length > 0) {
    // Tiene hijos: resetear form.categoriaProd para forzar selección de subcategoría
    if (props.form.categoriaProd !== null) {
      updateField('categoriaProd', null)
    }
  } else {
    // No tiene hijos: usar directamente el value de la categoría padre
    updateField('categoriaProd', nuevaCat.value)
  }
})

// Sincronización externa: si form.categoriaProd se vuelve null/undefined (limpieza externa),
// restablecer también categoriaPadre
watch(
  () => props.form.categoriaProd,
  (val) => {
    if (val === null || val === undefined) {
      categoriaPadre.value = null
    }
  },
)

const updateField = (key, value) => {
  emit('update:form', {
    ...props.form,
    [key]: value,
  })
}

const limpiarFiltros = () => {
  categoriaPadre.value = null
  emit('limpiar')
}
</script>

<style scoped>
/* Tarjeta contenedora */
.filter-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Fondo degradado del encabezado */
.bg-gradient {
  background: linear-gradient(135deg, #004d40, #26a69a);
}

/* Botón "Generar reporte" con bordes más redondeados */
.rounded-btn {
  border-radius: 12px;
}

/* Mejora visual en los campos al pasar el ratón */
:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #004d40;
}
</style>
