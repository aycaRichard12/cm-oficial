<template>
  <q-header class="bg-primary text-white">
    <q-toolbar class="row no-wrap items-center justify-between">
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

      <div class="col row items-center q-px-sm gt-xs" style="min-width: 0">
        <AppBreadcrumbs @ocultartabs="emit('acultarTabs')" />
      </div>

      <div class="col-auto row items-center no-wrap q-gutter-x-sm">
        <ComandoVoz class="gt-xs" />
        <q-btn icon="help_outline" color="white" flat round dense @click="$emit('iniciar-guia')">
          <q-tooltip>Ayuda</q-tooltip>
        </q-btn>

        <notificacion-layout v-if="permitidoNotificaciones" />

        <q-btn flat no-caps class="profile-btn">
          <div class="row items-center no-wrap">
            <!-- Avatar -->
            <q-avatar :size="$q.screen.lt.sm ? '34px' : '38px'" class="user-avatar">
              <span class="avatar-initial">
                {{ userInitial }}
              </span>
            </q-avatar>

            <!-- Info usuario -->
            <div v-if="$q.screen.gt.xs" class="column items-start text-left q-ml-sm">
              <span
                :class="['text-body2 text-weight-bold ellipsis', 'text-grey-1']"
                style="max-width: 140px; line-height: 1.1"
              >
                {{ authStore?.nombre || 'Usuario' }}
              </span>
            </div>

            <!-- Flecha -->
            <q-icon
              v-if="$q.screen.gt.xs"
              name="keyboard_arrow_down"
              size="18px"
              class="q-ml-sm profile-arrow"
            />
          </div>

          <!-- Menu -->
          <q-menu
            anchor="bottom right"
            self="top right"
            transition-show="jump-down"
            transition-hide="jump-up"
            class="profile-menu"
          >
            <div class="profile-menu-content">
              <!-- Header -->
              <div class="profile-header">
                <q-avatar size="52px" class="menu-avatar">
                  <span class="avatar-initial">
                    {{ userInitial }}
                  </span>
                </q-avatar>

                <div class="q-ml-md">
                  <div class="text-subtitle2 text-weight-bold">
                    {{ authStore?.nombre || 'Usuario' }}
                  </div>

                  <div class="text-caption text-orange">
                    {{ authStore?.cargo || 'Administrador' }}
                  </div>
                  <div class="text-caption text-blue">
                    {{ authStore?.empresa?.nombre || '' }}
                  </div>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <!-- Opciones -->
              <q-list padding dense>
                <q-item clickable v-close-popup class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="person_outline" size="18px" />
                  </q-item-section>

                  <q-item-section> Mi Perfil </q-item-section>
                </q-item>

                <q-item clickable v-close-popup class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="settings" size="18px" />
                  </q-item-section>

                  <q-item-section> Configuración </q-item-section>
                </q-item>

                <q-separator class="q-my-sm" />

                <q-item
                  clickable
                  v-close-popup
                  @click="$emit('irdashboard')"
                  class="menu-item logout-item"
                >
                  <q-item-section avatar>
                    <q-icon name="logout" size="18px" color="negative" />
                  </q-item-section>

                  <q-item-section class="text-negative text-weight-medium">
                    Cerrar Sesión
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-menu>
        </q-btn>
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
          class="btn-res"
        >
          <div class="row items-center justify-center no-wrap">
            <q-icon :name="tab.icono" size="18px" class="q-mr-xs icono q-mt-md" />
            <q-icon
              v-if="!tab.icono.startsWith('../')"
              :name="tab.icono"
              size="18px"
              class="q-mr-xs icono q-mt-md"
            />
            <img v-else :src="tab.icono" width="18" height="18" class="q-mr-xs q-mt-md" />
            <span class="text-caption text-weight-bold texto q-mt-md">{{
              tab.titulo.split('-')[2]
            }}</span>
          </div>
        </q-tab>

        <q-btn-dropdown
          v-if="activeTabsReportes.length > 0"
          flat
          no-caps
          label="Reportes"
          icon="bar_chart"
          :class="['tab-styled q-ma-xs text-white ', { 'active-yellow': isReportActive }]"
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
import { computed, onMounted, ref } from 'vue'
//import logo from 'src/assets/IMAGOTIPO-02.png'
import NotificacionLayout from './NotificacionLayout.vue'
import ComandoVoz from './ComandoVoz.vue'
import AppBreadcrumbs from 'src/components/general/AppBreadcrumbs.vue'

const authStore = ref(null)

const userInitial = computed(() => authStore.value?.nombre?.charAt(0).toUpperCase() || 'U')
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
  'acultarTabs',
])

const internalCurrentTab = computed({
  get: () => props.currentTab,
  set: (val) => emit('update:currentTab', val),
})

const isReportActive = computed(() => {
  return props.activeTabsReportes.some((tab) => tab.codigo === internalCurrentTab.value)
})

onMounted(async () => {
  const loadData = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch {
      return defaultValue
    }
  }

  authStore.value = loadData('mistersofts-cm')[0]
  console.log('Auth Store:', authStore.value)
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
  padding: 0 8px; /* Controla el espacio lateral */

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

.profile-btn {
  border-radius: 14px;
  padding: 20px 8px;
  transition: all 0.25s ease;
  min-height: auto;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  max-width: 100%;

  &:hover {
    background: rgba(255, 152, 0, 0.08);
  }

  .row {
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .column {
    overflow: hidden;
    min-width: 0;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.user-avatar,
.menu-avatar {
  background: linear-gradient(135deg, #1ef106, #0b5f86);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.25);
}

.avatar-initial {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.profile-arrow {
  color: #ffffff;
  transition: transform 0.2s ease;
}

.profile-btn:hover .profile-arrow {
  transform: rotate(180deg);
}

.profile-menu {
  border-radius: 18px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.profile-menu-content {
  min-width: 260px;
  padding: 10px;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.menu-item {
  border-radius: 12px;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background: rgba(255, 152, 0, 0.08);
    color: #ff9800;
  }
}

.logout-item:hover {
  background: rgba(206, 215, 206, 0.08);
}
</style>
