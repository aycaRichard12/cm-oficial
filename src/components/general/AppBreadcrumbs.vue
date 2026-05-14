<template>
  <div class="breadcrumb-wrapper">
    <div class="breadcrumb-scroller" ref="scrollContainer">
      <q-breadcrumbs class="text-white" gutter="xs">
        <template v-slot:separator>
          <q-icon size="1em" name="chevron_right" color="white" class="separator-icon" />
        </template>

        <q-breadcrumbs-el
          label="Inicio"
          icon="home"
          class="bc-link cursor-pointer"
          @click="goToHome"
        />

        <q-breadcrumbs-el
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          :label="crumb.label"
          :to="crumb.to"
          :class="['bc-link', { 'bc-active': crumb.active }]"
        />
      </q-breadcrumbs>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from 'src/stores/permitidos'
import { PAGINAS, PAGINAS_SELECT, PAGINAS_ICONS } from 'src/stores/paginas'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()
const scrollContainer = ref(null)

const emit = defineEmits(['ocultartabs'])

const MENU_ICONS = {
  configuraciones: 'settings',
  administracion: 'admin_panel_settings',
  compras: 'shopping_cart',
  ventas: 'point_of_sale',
  reportes: 'bar_chart',
  dashboard: 'dashboard',
  productos: 'inventory_2',
  clientes: 'people',
  proveedores: 'local_shipping',
  pedidos: 'assignment',
}
const goToHome = () => {
  // 1. Emitir tu evento
  console.log('Emitiendo evento ocultartabs')
  emit('ocultartabs')

  // 2. Navegar programáticamente
  router.push('/')
}

const breadcrumbs = computed(() => {
  const path = route.path.replace(/^\//, '')
  if (!path) return []

  const segments = []

  // Find category and submenu
  let groupCode = null
  for (const [key, value] of Object.entries(PAGINAS)) {
    if (value.includes(path)) {
      groupCode = key
      break
    }
  }

  if (!groupCode) {
    for (const [key, value] of Object.entries(PAGINAS_SELECT)) {
      if (value.includes(path)) {
        groupCode = key
        break
      }
    }
  }

  if (groupCode) {
    for (const menu of menuStore.menuPrincipal) {
      const submenu = menu.submenu.find((s) => s.codigo.startsWith(groupCode))
      if (submenu) {
        // Menu segment
        segments.push({
          label: menu.titulo,
          icon: MENU_ICONS[menu.codigo] || 'folder',
          to: null, // Root menu items usually don't have a direct route
        })

        // Submenu segment
        segments.push({
          label: submenu.titulo,
          icon: 'folder_open',
          to: `/${submenu.codigo.split('-')[0]}`,
        })
        break
      }
    }
  }

  // Current page
  const matchingPage =
    menuStore.todos.find((p) => p.codigo.startsWith(path)) ||
    menuStore.permitidos.find((p) => p.codigo.startsWith(path))

  const pageLabel = route.meta?.title || (matchingPage ? matchingPage.titulo : path)

  segments.push({
    label:
      typeof pageLabel === 'string' && pageLabel.includes('-')
        ? pageLabel.split('-')[2] || pageLabel.split('-').pop().trim()
        : pageLabel,
    icon: PAGINAS_ICONS[path] || 'description',
    to: route.path,
    active: true,
  })

  return segments
})

// Scroll to end when path changes (like WinExplorer)
const scrollToActive = () => {
  if (scrollContainer.value) {
    setTimeout(() => {
      scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
    }, 100)
  }
}

watch(() => route.path, scrollToActive)
onMounted(scrollToActive)
</script>

<style lang="scss" scoped>
.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.breadcrumb-scroller {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar but keep functionality */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

.bc-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap; // Crucial for scrolling
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  &.bc-active {
    color: #f2c037;
    font-weight: 700;
    background: rgba(255, 152, 0, 0.1);
    pointer-events: none;
  }
}

.separator-icon {
  opacity: 0.5;
}
</style>
