<template>
  <q-card flat bordered class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-avatar color="primary" text-color="white" icon="admin_panel_settings" />
      <div class="text-h6 text-weight-bold cm-text-muted q-ml-sm">{{ $t('ui.gestionar-permiso-f93489') }}</div>
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
      <q-tab name="operacion" :label="$t('ui.operaciones-5d75e5')" icon="settings" />
      <q-tab name="graficos" :label="$t('ui.graficos-9522a3')" icon="insert_chart" />
    </q-tabs>

    <q-separator class="q-my-md" />

    <!-- Form -->
    <q-form @submit="submitForm" class="q-gutter-md">
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
            clearable
            @filter="filterUsuarios"
            :rules="[(val) => !!val || $t('ui.seleccione-un-usuario-6d0bc4')]"
            :label="$t('ui.usuario-para-asignar-permisos-65a78d')"
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
          <div class="text-subtitle2 text-weight-bold text-primary">{{ $t('ui.operaciones-de-sistema-271ee3') }}</div>
          <q-spinner-dots
            v-if="cargandoPermisosActuales"
            color="primary"
            size="1em"
            class="q-ml-sm"
          />
          <q-badge
            v-else-if="form.usuarioSeleccionado"
            color="primary"
            :label="$t('ui.autorizado-b4fb49')"
            outline
            class="q-ml-sm"
          >
            {{ cantidadOperacionesAsignadas }} {{ $t('ui.activos-6986b7') }}
          </q-badge>
        </div>

        <q-list bordered separator class="rounded-borders cm-surface">
          <q-item
            v-for="opt in operacionesOpciones"
            :key="opt.value"
            tag="label"
            v-ripple
            class="q-py-sm"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="form.operacionesSeleccionadas"
                :val="opt.value"
                color="primary"
              />
            </q-item-section>
            <q-item-section avatar>
              <q-icon :name="opt.icon || 'settings'" color="grey-7" size="sm" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium cm-text">{{ opt.label }}</q-item-label>
              <q-item-label caption>{{ $t('ui.permiso-para-acceder-a-esta-funcionalidad-878a60') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div
          v-if="
            tipoPermiso === 'operacion' &&
            form.operacionesSeleccionadas.length === 0 &&
            form.usuarioSeleccionado
          "
          class="text-negative text-caption q-mt-sm"
        >
          {{ $t('ui.falta-seleccionar-al-menos-una-operacion-72a854') }}
        </div>
      </div>

      <!-- Graficos -->
      <div v-show="tipoPermiso === 'graficos'" class="q-mt-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-weight-bold text-primary">
            {{ $t('ui.visualizaciones-del-dashboard-60ded3') }}
          </div>
          <q-spinner-dots
            v-if="cargandoPermisosActuales"
            color="primary"
            size="1em"
            class="q-ml-sm"
          />
          <q-badge
            v-else-if="form.usuarioSeleccionado"
            color="primary"
            :label="$t('ui.autorizado-b4fb49')"
            outline
            class="q-ml-sm"
          >
            {{ cantidadGraficosAsignados }} {{ $t('ui.activos-6986b7') }}
          </q-badge>
        </div>

        <q-list bordered separator class="rounded-borders cm-surface">
          <q-item
            v-for="opt in graficosOpciones"
            :key="opt.value"
            tag="label"
            v-ripple
            class="q-py-sm"
          >
            <q-item-section avatar>
              <q-checkbox v-model="form.graficosSeleccionados" :val="opt.value" color="primary" />
            </q-item-section>
            <q-item-section avatar>
              <q-icon :name="opt.icon || 'insert_chart'" color="grey-7" size="sm" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium cm-text">{{ opt.label }}</q-item-label>
              <q-item-label caption>{{ $t('ui.mostrar-este-grafico-en-el-panel-principal-533bc6') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div
          v-if="
            tipoPermiso === 'graficos' &&
            form.graficosSeleccionados.length === 0 &&
            form.usuarioSeleccionado
          "
          class="text-negative text-caption q-mt-sm"
        >
          {{ $t('ui.falta-seleccionar-al-menos-un-grafico-bb2b56') }}
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <div class="row justify-between items-center">
        <q-btn
          flat
          icon="refresh"
          :label="$t('ui.limpiar-seleccion-21713c')"
          color="grey-7"
          @click="resetForm"
          class="rounded-borders"
        />
        <q-btn
          :label="$t('ui.guardar-permisos-e1d1b3')"
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
import { onMounted, watch } from 'vue'
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
  allMenus,
} = useAutorizarPermisos(emit)

// Emitir el cambio de tipo para filtrar la tabla en el padre
watch(tipoPermiso, (nuevoTipo) => {
  emit('tipo-cambiado', nuevoTipo)
})

// Emitir el cambio de usuario para filtrar la tabla en el padre
watch(
  () => form.value.usuarioSeleccionado,
  (nuevoUsuario) => {
    emit('usuario-cambiado', nuevoUsuario)
  },
)

onMounted(() => {
  const mappedMenus = menusReferencia.map((menu) => ({ label: menu.titulo, value: menu.codigo }))
  allMenus.value = mappedMenus
  menuOptions.value = mappedMenus
  loadUsuarios()
  // Emitir el tipo inicial
  emit('tipo-cambiado', tipoPermiso.value)
})
</script>
