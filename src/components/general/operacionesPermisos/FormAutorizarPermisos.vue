<template>
  <q-card flat bordered class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-avatar color="primary" text-color="white" icon="admin_panel_settings" />
      <div class="text-h6 text-weight-bold text-grey-8 q-ml-sm">
        Gestionar Permiso
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="tipoPermiso"
      dense
      inline-label
      class="text-grey-7"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="operacion" label="Operaciones" icon="settings" />
      <q-tab name="graficos" label="Gráficos" icon="insert_chart" />
    </q-tabs>

    <q-separator class="q-my-md" />

    <!-- Form -->
    <q-form @submit="submitForm" class="q-gutter-md q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- Usuario -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="form.usuarioSeleccionado"
            :options="usuarios"
            outlined
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterUsuarios"
            :rules="[(val) => !!val || 'Seleccione un usuario']"
            label="Usuario"
            @update:model-value="alCambiarUsuario"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Operaciones -->
        <div v-show="tipoPermiso === 'operacion'" class="col-12 col-md-6">
          <q-select
            v-model="form.menuSeleccionado"
            :options="menuOptions"
            outlined
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterMenus"
            :rules="[val => tipoPermiso === 'graficos' || !!val || 'Seleccione una operación']"
            label="Operación"
          >
            <template v-slot:prepend>
              <q-icon name="settings" color="primary" />
            </template>
          </q-select>
          
          <q-banner v-if="estadoOperacionPrevia" dense class="bg-amber-1 text-amber-9 rounded-borders q-mt-sm">
            <template v-slot:avatar>
              <q-icon name="warning" size="xs" />
            </template>
            <span v-if="estadoOperacionPrevia === 'activo'" class="text-caption">Esta operación ya está autorizada.</span>
            <span v-else class="text-caption">Esta operación ya existe pero está desactivada.</span>
          </q-banner>
        </div>
      </div>

      <!-- Graficos -->
      <div v-show="tipoPermiso === 'graficos'" class="q-mt-sm">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-grey-7">Visualizaciones del Dashboard</div>
          <q-spinner-dots v-if="cargandoPermisosActuales" color="primary" size="1em" class="q-ml-sm" />
          <q-badge v-else-if="form.usuarioSeleccionado" color="grey-3" text-color="grey-9" class="q-ml-sm">
            {{ cantidadGraficosAsignados }} activos
          </q-badge>
        </div>

        <q-option-group
          v-model="form.graficosSeleccionados"
          :options="graficosOpciones"
          type="checkbox"
          color="primary"
          inline
        />
        
        <div v-if="tipoPermiso === 'graficos' && form.graficosSeleccionados.length === 0" class="text-negative text-caption q-mt-sm">
          Falta seleccionar al menos un gráfico.
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="row justify-between items-center">
        <q-btn flat icon="refresh" label="Limpiar" color="grey-7" @click="resetForm" />
        <q-btn
          :label="form.id ? 'Actualizar' : 'Asignar'"
          type="submit"
          color="primary"
          :loading="loading || cargandoPermisosActuales"
          :icon="form.id ? 'edit' : 'add'"
          unelevated
          :disable="tipoPermiso === 'operacion' && !!estadoOperacionPrevia"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAutorizarPermisos } from 'src/composables/useAutorizarPermisos'

defineProps(['loading'])
const emit = defineEmits(['on-submit'])

// Aplicación de Principios SOLID mediante Composables
const {
  form,
  tipoPermiso,
  usuarios,
  menuOptions,
  graficosOpciones,
  menusReferencia,
  cargandoPermisosActuales,
  estadoOperacionPrevia,
  cantidadGraficosAsignados,
  loadUsuarios,
  alCambiarUsuario,
  submitForm,
  resetForm,
  filterUsuarios,
  filterMenus,
  allMenus
} = useAutorizarPermisos(emit)

onMounted(() => {
  const mappedMenus = menusReferencia.map((menu) => ({ label: menu.titulo, value: menu.codigo }))
  allMenus.value = mappedMenus
  menuOptions.value = mappedMenus
  loadUsuarios()
})
</script>
