<template>
  <q-layout view="lHh lpr lff">
    <q-header class="bg-primary text-white">
      <q-toolbar class="row flex justify-between">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <div class="col-1 col-md-4">
          <q-toolbar-title>
            <q-avatar
              v-if="typeof logo === 'string'"
              style="width: 150px; height: 30px; border-radius: 0"
            >
              <img :src="logo" alt="icon" />
            </q-avatar>
          </q-toolbar-title>
        </div>

        <q-toolbar-title class="q-gutter-sm flex justify-end items-center" clearable>
          <ComandoVoz />
          <q-btn icon="help_outline" color="blue" flat @click="IniciarGuia" />

          <notificacion-layout v-if="permitidoNotificaciones" />
          <!-- <q-btn
            flat
            dense
            icon="exit_to_app"
            text-color="white"
            label="Salir123"
            @click="irdashboard"
          /> -->
          <q-btn
            flat
            dense
            icon="exit_to_app"
            text-color="white"
            label="Salir"
            @click="
              () => {
                LocalStorage.remove('puedeIniciarsesion')
                $router.push('/login')
              }
            "
          />
        </q-toolbar-title>
      </q-toolbar>

      <transition>
        <q-tabs
          align="left"
          v-model="currentTab"
          v-show="tabsVisible"
          style="background-color: #eeebe2"
        >
          <q-tab
            v-for="tab in activeTabs"
            :key="tab.codigo + '-' + tab.permiso"
            :name="tab.codigo"
            :id="tab.codigo"
            @click="navigateToTab(tab)"
            :class="{ 'text-weight-bold': currentTab === tab.codigo }"
            style="background: linear-gradient(to right, #219286, #044e49); border-radius: 10px"
            class="btn-res q-ma-sm texto-normal"
          >
            <q-icon :name="tab.icono" class="icono q-mt-lg" />
            <span class="texto q-mt-lg">{{ tab.titulo.split('-')[2] }}</span>
          </q-tab>
          <q-tab
            v-if="activeTabsReportes.length > 0"
            class="q-ma-sm"
            style="
              background: linear-gradient(to right, #219286, #044e49);
              border: 1px solid #ccc;
              border-radius: 8px;
              min-width: 180px;
            "
          >
            <div class="row items-center justify-between q-px-sm">
              <span class="text-white text-subtitle2">Reportes</span>
              <q-icon name="arrow_drop_down" class="text-white" size="30px" />
            </div>

            <q-menu
              anchor="bottom left"
              self="top left"
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list style="min-width: 200px; max-height: 250px; overflow-y: auto">
                <q-item
                  v-for="tab in activeTabsReportes"
                  :key="tab.codigo"
                  clickable
                  v-ripple
                  @click="navigateToTab(tab)"
                  :class="{ 'text-weight-bold bg-grey-2': currentTab === tab.codigo }"
                >
                  <q-item-section avatar>
                    <q-icon :name="tab.icono" />
                  </q-item-section>
                  <q-item-section>
                    {{ tab.titulo.split('-')[2] }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-tab>
        </q-tabs>
      </transition>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-white" style="position: fixed">
      <div>
        <router-link to="/" @click="ocultarTabs">
          <q-img class="absolute-top" src="../assets/fondou.jpg" style="height: 150px">
            <div class="absolute-bottom bg-transparent">
              <q-avatar size="56px" class="q-mb-sm">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
              <div class="text-weight-bold">{{ nombreUsuario }}</div>
              <div>{{ cargo }}</div>
            </div>
          </q-img>
        </router-link>
      </div>
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
      >
        <div class="row flex justify-between">
          <q-btn
            label="Inicio"
            icon="home"
            to="/"
            flat
            unelevated
            color="primary"
            class="menu-header"
            expand-icon-class="text-grey-6"
            header-class="text-weight-medium text-grey-9"
            @click="ocultarTabs"
          />
        </div>
        <q-list padding="">
          <div
            v-for="menu in items.filter((i) => i.codigo !== 'opcionesocultas')"
            :key="menu.codigo"
            class="q-pa-none menu-item"
          >
            <q-expansion-item
              :label="menu.titulo"
              :icon="iconos[menu.codigo] || 'help_outline'"
              header-class="text-weight-bold text-grey-9"
              expand-icon-class="text-grey-6"
              class="menu-header bg-white-1"
              v-model="expandedMenu[menu.codigo]"
              @update:model-value="updateExpandedMenu(menu.codigo, $event)"
              style=""
            >
              <q-list class="submenu-list q-pl-lg" id="menulayout">
                <q-item
                  v-for="submenu in menu.submenu"
                  :key="submenu.codigo + '_' + submenu.permiso"
                  clickable
                  v-ripple
                  class="submenu-item"
                  :class="{
                    'submenu-activo': subMenuSeleccionado === submenu.codigo.split('-')[0],
                  }"
                  active-class="my-menu-link"
                  @click="selectSubmenu(submenu)"
                >
                  <q-item-section avatar>
                    <q-icon color="blue" :name="iconos[submenu.codigo.split('-')[0]]" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-grey-8 text-body2">
                    {{ submenu.titulo }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container style="height: calc(100vh - 50px)">
      <router-view style="background-color: #eeebe2; overflow-y: auto; height: 100%" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import emitter from 'src/event-bus'
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { PAGINAS, PAGINAS_ICONS, PAGINAS_SELECT } from 'src/stores/paginas'
import { useMenuStore } from 'src/stores/permitidos'
import logo from 'src/assets/IMAGOTIPO-02.png'
import NotificacionLayout from './NotificacionLayout.vue'
import { permisoNotificaciones } from 'src/composables/FuncionesG'
import { guiarInicio } from 'src/utils/guiasDriver'
import ComandoVoz from './ComandoVoz.vue'
//import { usePusher } from 'src/composables/usePusher'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'

import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'

import { LocalStorage } from 'quasar'

const permisosStore = useOperacionesPermitidas()
const idusuario = idusuario_md5()
const ocultarTabs = () => {
  tabsVisible.value = false
}
// const irdashboard = () => {
//   window.location.href = '/app/dashboard'
// }
const router = useRouter()
const menuStore = useMenuStore()

const leftDrawerOpen = ref(false)
const tabsVisible = ref(false) // New reactive variable for tabs visibility
const nombreUsuario = ref('Usuario')
const cargo = ref('Sin cargo')
const items = ref([])
const activeTabs = ref([])
const activeTabsReportes = ref([])
const currentTab = ref('')
/// ================================================
const permitidoNotificaciones = permisoNotificaciones()
const expandedMenu = reactive({})
const subMenuSeleccionado = ref(null)

const updateExpandedMenu = (currentMenuCode, isExpanded) => {
  for (const menuCode in expandedMenu) {
    if (menuCode !== currentMenuCode) {
      expandedMenu[menuCode] = false
    }
  }
  expandedMenu[currentMenuCode] = isExpanded
  // const primerPaginaMenu = menuStore.obtenerPrimerSubmenu(currentMenuCode)
  // emitter.emit('abrir-submenu', primerPaginaMenu)
}

// --- Drawer auto-open/close logic ---

// --- Tabs auto-open/close logic ---
let tabsTimeout = null
const TABS_TIMEOUT_MS = 10000 // 15 seconds, same as drawer

const startTabsTimeout = () => {
  clearTabsTimeout() // Clear any existing timeout
  tabsTimeout = setTimeout(() => {
    if (tabsVisible.value) {
      tabsVisible.value = true
    }
  }, TABS_TIMEOUT_MS)
}

const clearTabsTimeout = () => {
  if (tabsTimeout) {
    clearTimeout(tabsTimeout)
    tabsTimeout = null
  }
}

const IniciarGuia = () => {
  guiarInicio(currentTab.value, currentTab.value)
}
// --- End of auto-open/close logic for both drawer and tabs ---  crearcampanas

const iconos = ref({
  configuraciones: 'settings',
  administracion: 'admin_panel_settings',
  compras: 'shopping_cart',
  ventas: 'point_of_sale',
  reportes: 'bar_chart',
  dashboard: 'dashboard',
  productos: 'inventory_2',
  clientes: 'people',
  proveedores: 'local_shipping',
  configuraciongeneral: 'tune',
  configuracionproducto: 'inventory',
  configuracioncliente: 'manage_accounts',
  leyendasdefacturas: 'description',
  metodosdepagodefacturas: 'payments',
  administracioncreacion: 'create',
  administracionasignacion: 'assignment_turned_in',
  administracionprecios: 'attach_money',
  registrarclienteoproveedor: 'sync_alt',
  registrarproveedor: 'local_shipping',
  crearcampanas: 'campaign',
  registrarcompra: 'shopping_basket',
  movimientos: 'swap_vert',
  registrarventa: 'point_of_sale',
  contingencias: 'warning',
  cuentasporcobrar: 'credit_score',
  inventarioexterno: 'store',
  reporteproductoscomprados: 'assignment_returned',
  reportestockdeproductosindividual: 'inventory',
  reportestockdeproductosglobal: 'warehouse',
  reportedeindicederotacion: 'refresh',
  reportedeventasporcampanas: 'campaign',
  reportedecaducidaddeproductos: 'event_busy',
  reporteproductosvendidosglobal: 'assessment',
  configuracionfactura: 'settings',
  admautorizaciones: 'verified_user',
  cierrecaja: 'request_quote',
  generartokensapis: 'api',
  notascreditodebito: 'undo',
  pedidos: 'assignment',
  gestioncompra: 'shopping_basket',
  ingresocredito: 'request_quote',
  gestioncampanas: 'campaign',
  reporteinventarioexterior: 'report',
  actualizacionescomercial: 'update',
})

const loadTabsForSubmenu = (submenuCodigo) => {
  console.log(submenuCodigo)
  const paginasSubmenu = PAGINAS[submenuCodigo] || []
  const paginas_reporte = PAGINAS_SELECT[submenuCodigo] || []
  const usuario = menuStore.obtenerUsuario

  activeTabsReportes.value = paginas_reporte
    .map((paginaCodigo) => {
      const codigoCompleto = `${paginaCodigo}-${usuario}`
      const pagina = menuStore.obtenerPagina(codigoCompleto)
      if (!pagina || !pagina.permiso) return null
      return {
        codigo: paginaCodigo,
        titulo: pagina.titulo,
        icono: PAGINAS_ICONS[paginaCodigo] || 'help_outline',
        permiso: pagina.permiso,
      }
    })
    .filter(Boolean)

  activeTabs.value = paginasSubmenu
    .map((paginaCodigo) => {
      const codigoCompleto = `${paginaCodigo}-${usuario}`
      const pagina = menuStore.obtenerPagina(codigoCompleto)
      if (!pagina || !pagina.permiso) return null

      return {
        codigo: paginaCodigo,
        titulo: pagina.titulo || paginaCodigo,
        icono: PAGINAS_ICONS[paginaCodigo] || 'help_outline',
        permiso: pagina.permiso,
      }
    })
    .filter(Boolean)
}

const selectSubmenu = async (submenu) => {
  const submenuCode = submenu.codigo.split('-')[0]
  subMenuSeleccionado.value = submenuCode
  loadTabsForSubmenu(submenuCode)
  tabsVisible.value = true
  // Si el submenú tiene tabs, navegar al primer tab.
  if (activeTabs.value.length > 0) {
    const firstTab = activeTabs.value[0]
    await navigateToTab(firstTab)
  } else if (activeTabsReportes.value.length > 0) {
    const firstTab = activeTabsReportes.value[0]
    await navigateToTab(firstTab)
  } else if (submenu != null) {
    router.push(`/${submenuCode}`) // o router.push(`/ruta/${submenuCode}`)
  }
}

const navigateToTab = (tab) => {
  router.push(`/${tab.codigo}`)
  startTabsTimeout()
  currentTab.value = tab.codigo // Asegura que el tab actual se actualice
}

const cargarPaginasSubMenu = (submenuCodigo) => {
  console.log(submenuCodigo)
  const paginasSubmenu = PAGINAS[submenuCodigo] || []
  const usuario = menuStore.obtenerUsuario
  return paginasSubmenu.map((paginaCodigo) => {
    const codigoCompleto = `${paginaCodigo}-${usuario}`
    const pagina = menuStore.obtenerPagina(codigoCompleto)
    if (!pagina || !pagina.permiso) return null

    return {
      codigo: paginaCodigo,
      titulo: pagina.titulo || paginaCodigo,
      icono: PAGINAS_ICONS[paginaCodigo] || 'help_outline',
      permiso: pagina.permiso,
    }
  })
}

function llevarPrimeraPAgina(submenu) {
  console.log(submenu)
  const submenuCode = submenu.codigo.split('-')[0]
  const tabs = cargarPaginasSubMenu(submenuCode).filter((item) => item != null)
  if (tabs.length > 0) {
    const firstTab = tabs[0]
    console.log(firstTab)
    return firstTab.codigo
  } else {
    return submenu.codigo.split('-')[0]
  }
}

onMounted(async () => {
  const loadData = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const userData = loadData('yofinanciero')
  if (userData[0]) {
    nombreUsuario.value = userData[0].nombre || 'Usuario'
    cargo.value = userData[0].cargo || 'Sin cargo'
  }
  const menuPrincipal = menuStore.obtenerMenuPrincipal
  items.value = menuPrincipal

  items.value.forEach((item) => {
    if (item.codigo !== 'opcionesocultas') {
      expandedMenu[item.codigo] = false
    }
  })

  emitter.on('abrir-submenu', (submenu) => {
    selectSubmenu(submenu) // Tu lógica normal console
    const ruta = '/' + llevarPrimeraPAgina(submenu)
    router.push(ruta)
  })
  console.log(idusuario)
  //initPusher(idusuario)
  // pusherActions = usePusher()
  // setTimeout(() => {
  //   console.log('Iniciando Pusher en segundo plano...')
  //   if (pusherActions) {
  //     pusherActions.initPusher(idusuario)
  //   }
  // }, 1000)

  await permisosStore.cargarPermisos()
  console.log('Permisos cargados en MainLayout.vue:', permisosStore.permisos)
  // const tempInitPusher = (id) => console.log('ID en modo local:', id)

  // const idusuario = idusuario_md5() // Verifica si esto falla solo

  // setTimeout(() => {
  //   tempInitPusher(idusuario)
  // }, 1000)
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style lang="scss">
.my-menu-link {
  color: white;
  background: #f2c037;
}
.q-tab--active {
  color: var(--q-warning) !important;
  font-weight: bold;
}
.submenu-activo {
  background-color: #f2c037;
  color: #1976d2;
  font-weight: bold;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
