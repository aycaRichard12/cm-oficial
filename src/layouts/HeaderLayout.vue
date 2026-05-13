<template>
  <q-header class="bg-primary text-white">
    <q-toolbar class="row no-wrap items-center">
      <div class="col-auto">
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="$emit('toggle-left-drawer')"
          aria-label="Menu"
        />
      </div>

      <div class="col row items-center q-px-sm" style="min-width: 0">
        <AppBreadcrumbs />
      </div>

      <div class="col-auto row items-center no-wrap q-gutter-x-sm">
        <ComandoVoz class="gt-xs" />
        <q-btn icon="help_outline" color="white" flat round dense @click="$emit('iniciar-guia')">
          <q-tooltip>Ayuda</q-tooltip>
        </q-btn>

        <notificacion-layout v-if="permitidoNotificaciones" />

        <q-btn
          flat
          dense
          icon="exit_to_app"
          text-color="white"
          label="Salir"
          class="gt-xs"
          @click="$emit('irdashboard')"
        />
        <q-btn
          flat
          dense
          icon="exit_to_app"
          text-color="white"
          class="lt-sm"
          @click="$emit('irdashboard')"
        />
      </div>
    </q-toolbar>

    <transition name="slide-down">
      <q-tabs
        align="left"
        v-model="internalCurrentTab"
        v-show="tabsVisible"
        style="background-color: #eeebe2"
        active-color="primary"
        indicator-color="transparent"
        dense
      >
        <q-tab
          v-for="tab in activeTabs"
          :key="tab.codigo + '-' + tab.permiso"
          :name="tab.codigo"
          @click="$emit('navigate-to-tab', tab)"
          :class="['tab-styled q-ma-xs', { 'active-orange': internalCurrentTab === tab.codigo }]"
        >
          <div class="row items-center no-wrap">
            <q-icon :name="tab.icono" size="18px" class="q-mr-xs" />
            <span class="text-caption text-weight-bold">{{ tab.titulo.split('-')[2] }}</span>
          </div>
        </q-tab>

        <q-btn-dropdown
          v-if="activeTabsReportes.length > 0"
          flat
          no-caps
          label="Reportes"
          icon="bar_chart"
          :class="['tab-styled q-ma-xs text-white', { 'active-yellow': isReportActive }]"
          style="min-height: 36px"
        >
          <q-list style="min-width: 200px">
            <q-item
              v-for="tab in activeTabsReportes"
              :key="tab.codigo"
              clickable
              v-close-popup
              @click="$emit('navigate-to-tab', tab)"
              :active="internalCurrentTab === tab.codigo"
              active-class="bg-yellow-1 text-yellow-9 text-weight-bold"
            >
              <q-item-section avatar>
                <q-icon :name="tab.icono" />
              </q-item-section>
              <q-item-section>{{ tab.titulo.split('-')[2] }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-tabs>
    </transition>
  </q-header>
</template>

<script setup>
import { computed } from 'vue'
//import logo from 'src/assets/IMAGOTIPO-02.png'
import NotificacionLayout from './NotificacionLayout.vue'
import ComandoVoz from './ComandoVoz.vue'
import AppBreadcrumbs from 'src/components/general/AppBreadcrumbs.vue'

const props = defineProps({
  currentTab: String,
  tabsVisible: Boolean,
  activeTabs: {
    type: Array,
    default: () => [],
  },
  activeTabsReportes: {
    type: Array,
    default: () => [],
  },
  permitidoNotificaciones: Boolean,
})

const emit = defineEmits([
  'toggle-left-drawer',
  'iniciar-guia',
  'irdashboard',
  'navigate-to-tab',
  'update:currentTab',
])

const internalCurrentTab = computed({
  get: () => props.currentTab,
  set: (val) => emit('update:currentTab', val),
})

const isReportActive = computed(() => {
  return props.activeTabsReportes.some((tab) => tab.codigo === internalCurrentTab.value)
})
</script>

<style lang="scss" scoped>
.tab-styled {
  background: linear-gradient(to right, #219286, #044e49);
  border-radius: 8px;
  color: white;
  min-height: 40px;
  text-transform: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  &.active-orange {
    color: #f2c037 !important;
  }
}

/* Ensure toolbar doesn't grow vertically */
.q-toolbar {
  min-height: 56px;
  overflow: hidden;
}
</style>
