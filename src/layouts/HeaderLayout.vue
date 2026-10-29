<template >
  <q-header style="box-shadow: none; background-color: var(--cm-header); color: var(--cm-on-primary); margin-right: 10px; " >
    <q-toolbar class="bg-primary q-pl-md q-pr-md row no-wrap items-center justify-between" style="border-radius: 15px; margin: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2);">
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
        <LanguageSwitcher color="white" />
        <ThemeToggle />
        <q-btn icon="help_outline" color="white" flat round dense @click="$emit('iniciar-guia')">
          <q-tooltip>{{ $t('layouts.help') }}</q-tooltip>
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
                {{ authStore?.nombre || $t('layouts.user') }}
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
                    {{ authStore?.nombre || $t('layouts.user') }}
                  </div>

                  <div class="text-caption text-orange">
                    {{ authStore?.cargo || $t('layouts.administrator') }}
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

                  <q-item-section> {{ $t('layouts.myProfile') }} </q-item-section>
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
      <div v-show="tabsVisible" class="sub-nav-tabs-wrapper">
        <q-tabs
          align="left"
          v-model="internalCurrentTab"
          style="background-color: var(--cm-header)"
          active-color="primary"
          indicator-color="transparent"
          dense
          inline-label
          mobile-arrows
          outside-arrows
          class="sub-nav-tabs"
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
            <q-icon
              v-if="!tab.icono.includes('.svg')"
              :name="tab.icono"
              size="18px"
              class="q-mr-xs icono q-mt-md"
            />
            <img v-else :src="tab.icono" width="18" height="18" class="q-mr-xs q-mt-md" />
            <span class="text-caption text-weight-bold texto q-mt-md">{{ tabTitle(tab) }}</span>
          </div>
        </q-tab>

        <q-btn-dropdown
          v-if="activeTabsReportes.length > 0"
          flat
          no-caps
          :label="activeTabsReportesdetalle.label"
          :icon="activeTabsReportesdetalle.icono"
          :class="['tab-styled q-ma-xs', { 'active-yellow': isReportActive }]"
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
                <!-- <q-icon :name="tab.icono" /> -->
                <q-icon
                  v-if="!tab.icono.includes('.svg')"
                  :name="tab.icono"
                  size="18px"
                  class="q-mr-xs icono q-mt-md"
                />
                <img v-else :src="tab.icono" width="35" height="35" class="q-mr-xs q-mt-md" />
              </q-item-section>
              <q-item-section>{{ tabTitle(tab) }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        </q-tabs>
      </div>
    </transition>
  </q-header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
//import logo from 'src/assets/IMAGOTIPO-02.png'
import NotificacionLayout from './NotificacionLayout.vue'
import ComandoVoz from './ComandoVoz.vue'
import ThemeToggle from 'src/components/ThemeToggle.vue'
import AppBreadcrumbs from 'src/components/general/AppBreadcrumbs.vue'
import LanguageSwitcher from 'src/components/general/LanguageSwitcher.vue'

const authStore = ref(null)
const { t } = useI18n()

const TAB_TRANSLATION_KEYS = {
  tipodealmacen: 'configGeneral.tabs.tipodealmacen',
  divisas: 'configGeneral.tabs.divisas',
  leyendaproforma: 'configGeneral.tabs.leyendaproforma',
  tipokardex: 'configGeneral.tabs.tipokardex',
  categoriadeproducto: 'configProducto.tabs.categoriadeproducto',
  estadodeproducto: 'configProducto.tabs.estadodeproducto',
  unidaddeproducto: 'configProducto.tabs.unidaddeproducto',
  caracteristicadeproducto: 'configProducto.tabs.caracteristicadeproducto',
  parametrosdeobsolescencia: 'configProducto.tabs.parametrosdeobsolescencia',
  configuracionproductounico: 'configProducto.tabs.configuracionproductounico',
  configuracionproductovariante: 'configProducto.tabs.configuracionproductovariante',
}

const tabTitle = (tab) => {
  const key = TAB_TRANSLATION_KEYS[tab.codigo]
  return key ? t(key) : tab.titulo
}

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
  activeTabsReportesdetalle: {
    type: Object,
    default: () => ({}),
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
  color: white; /* theme-allow */
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
  color: white; /* theme-allow */
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.25);
}

.avatar-initial {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.profile-arrow {
  color: var(--cm-on-primary);
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
