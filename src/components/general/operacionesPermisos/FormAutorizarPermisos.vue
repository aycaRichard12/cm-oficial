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
        <div class="col-12">
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
            label="Usuario para asignar permisos"
            @update:model-value="alCambiarUsuario"
            class="bg-grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Operaciones -->
      <div v-show="tipoPermiso === 'operacion'" class="q-mt-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-weight-bold text-primary">Operaciones de Sistema</div>
          <q-spinner-dots v-if="cargandoPermisosActuales" color="primary" size="1em" class="q-ml-sm" />
          <q-badge v-else-if="form.usuarioSeleccionado" color="primary" label="Autorizado" outline class="q-ml-sm">
            {{ cantidadOperacionesAsignadas }} activos
          </q-badge>
        </div>

        <q-list bordered separator class="rounded-borders bg-white">
          <q-item v-for="opt in operacionesOpciones" :key="opt.value" tag="label" v-ripple class="q-py-sm">
            <q-item-section avatar>
              <q-checkbox v-model="form.operacionesSeleccionadas" :val="opt.value" color="primary" />
            </q-item-section>
            <q-item-section avatar>
              <q-icon :name="opt.icon || 'settings'" color="grey-7" size="sm" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium text-grey-9">{{ opt.label }}</q-item-label>
              <q-item-label caption>Permiso para acceder a esta funcionalidad</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-if="tipoPermiso === 'operacion' && form.operacionesSeleccionadas.length === 0 && form.usuarioSeleccionado" class="text-negative text-caption q-mt-sm">
          Falta seleccionar al menos una operación.
        </div>
      </div>

      <!-- Graficos -->
      <div v-show="tipoPermiso === 'graficos'" class="q-mt-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-weight-bold text-primary">Visualizaciones del Dashboard</div>
          <q-spinner-dots v-if="cargandoPermisosActuales" color="primary" size="1em" class="q-ml-sm" />
          <q-badge v-else-if="form.usuarioSeleccionado" color="primary" label="Autorizado" outline class="q-ml-sm">
            {{ cantidadGraficosAsignados }} activos
          </q-badge>
        </div>

        <q-list bordered separator class="rounded-borders bg-white">
          <q-item v-for="opt in graficosOpciones" :key="opt.value" tag="label" v-ripple class="q-py-sm">
            <q-item-section avatar>
              <q-checkbox v-model="form.graficosSeleccionados" :val="opt.value" color="primary" />
            </q-item-section>
            <q-item-section avatar>
              <q-icon :name="opt.icon || 'insert_chart'" color="grey-7" size="sm" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium text-grey-9">{{ opt.label }}</q-item-label>
              <q-item-label caption>Mostrar este gráfico en el panel principal</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-if="tipoPermiso === 'graficos' && form.graficosSeleccionados.length === 0 && form.usuarioSeleccionado" class="text-negative text-caption q-mt-sm">
          Falta seleccionar al menos un gráfico.
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <div class="row justify-between items-center q-pb-sm">
        <q-btn flat icon="refresh" label="Limpiar Selección" color="grey-7" @click="resetForm" class="rounded-borders" />
        <q-btn
          label="Guardar Permisos"
          type="submit"
          color="primary"
          :loading="loading || cargandoPermisosActuales"
          icon="save"
          unelevated
          class="q-px-lg rounded-borders"
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
  operacionesOpciones,
  menusReferencia,
  cargandoPermisosActuales,
  cantidadGraficosAsignados,
  cantidadOperacionesAsignadas,
  loadUsuarios,
  alCambiarUsuario,
  submitForm,
  resetForm,
  filterUsuarios,
  allMenus
} = useAutorizarPermisos(emit)


onMounted(() => {
  const mappedMenus = menusReferencia.map((menu) => ({ label: menu.titulo, value: menu.codigo }))
  allMenus.value = mappedMenus
  menuOptions.value = mappedMenus
  loadUsuarios()
})
</script>
